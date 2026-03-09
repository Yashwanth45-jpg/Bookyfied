'use server';
import mongoose from "mongoose";
import { connectToDatabase } from "@/DataBase/mongoose";
import { CreateBook } from "@/types";
import {escapeRegex, generateSlug, serializeData, splitIntoSegments} from "@/lib/utils";
import Book from "@/DataBase/models/book.model";
import { BookSegment } from "@/DataBase/models";
import { revalidatePath } from "next/cache";
import { getUserSubscriptionPlan } from "../subscription.server";


export const getAllBooks = async(clerkId: string, query?: string) => {
    try {
        await connectToDatabase();
        const filter: Record<string, unknown> = { clerkId };
        if (query) {
            filter.$or = [
                { title: { $regex: escapeRegex(query), $options: 'i' } },
                { author: { $regex: escapeRegex(query), $options: 'i' } },
            ];
        }
        const books = await Book.find(filter).sort({ createdAt: -1 }).lean();

        return {
            success: true,
            data: serializeData(books),
        }

    }
    catch (error) {
        console.error('Error fetching books:', error);
        return {
            success: false,
            message: 'Failed to fetch books',
        }
    }
}

export const checkBookExists = async (title: string) => {
    try {   
        await connectToDatabase();
        const slug = generateSlug(title);
        const existingBook = await Book.findOne({ slug }).lean();
        if (existingBook) {     
            return {
                success: true,
                exists: true,
                book: serializeData(existingBook),
                data: serializeData(existingBook),                  
                message: 'A book with the same title already exists.',
            }
        }
        return {
            success: true,
            exists: false,
            book: null,
            data: null,
            message: 'No book with the same title exists.',
        }
    }
    catch (error) {
        console.error('Error checking book existence:', error);
        return {
            success: false,
            exists: false,
            book: null,
            data: null,
            message: 'Failed to check book existence',
        }
    }   
};

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title);
        const existingBook = await Book.findOne({ slug });
        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
                message: 'A book with the same title already exists. Please choose a different title.',
            }
        } 

        // Check subscription limits
        const userPlan = await getUserSubscriptionPlan();
        const userBookCount = await Book.countDocuments({ clerkId: data.clerkId });
        
        if (userBookCount >= userPlan.maxBooks) {
            return {
                success: false,
                error: `You've reached your plan limit of ${userPlan.maxBooks} book${userPlan.maxBooks !== 1 ? 's' : ''}. Please upgrade your plan to add more books.`,
                isBillingError: true,
            }
        }

        const newBook = new Book({
            ...data,
            slug,
            totalSegments: 0,
        });
        await newBook.save();
        revalidatePath('/');
        
        return {
            success: true,
            data: serializeData(newBook),
            message: 'Book created successfully',
        };
    }
    catch (error) {
        console.error('Error creating book:', error);
        return {
            success: false,
            error: 'Failed to create book',
            isBillingError: false,
        }
    }   
};

/**
 * Fetches the PDF from Vercel Blob server-side, extracts text, and saves
 * segments to MongoDB. This avoids passing large payloads through server actions.
 */
export const processAndSaveSegments = async (bookId: string, clerkId: string, pdfUrl: string) => {
    try {
        await connectToDatabase();

        // Fetch PDF from Vercel Blob (server-to-server, no size limit issues)
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        // Use pdfjs-dist legacy build for Node.js (text extraction only, no canvas)
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        } as Parameters<typeof pdfjsLib.getDocument>[0]);
        const pdfDoc = await loadingTask.promise;

        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageText = (content.items as Array<{ str?: string }>)
                .filter((item) => item.str !== undefined)
                .map((item) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }
        await pdfDoc.destroy();

        const segments = splitIntoSegments(fullText);

        if (segments.length === 0) {
            await Book.findByIdAndDelete(bookId);
            return { success: false, message: 'No text content found in PDF' };
        }

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
            bookId,
            clerkId,
        }));

        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });
        revalidatePath('/');

        return { success: true, totalSegments: segments.length };
    } catch (error) {
        console.error('Error processing segments:', error);
        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        return { success: false, message: 'Failed to process book segments' };
    }
};

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const book = await Book.findOne({ slug }).lean();
        
        if (!book) {
            return {
                success: false,
                message: 'Book not found',
            };
        }

        return {
            success: true,
            data: serializeData(book),
        };
    } catch (error) {
        console.error('Error fetching book by slug:', error);
        return {
            success: false,
            message: 'Failed to fetch book',
        };
    }
};


export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};
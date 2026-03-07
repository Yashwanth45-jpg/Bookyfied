'use server';
import { connectToDatabase } from "@/DataBase/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "@/lib/utils";
import Book from "@/DataBase/models/book.model";
import { BookSegment } from "@/DataBase/models";

export const getAllBooks = async() => {
    try {
        await connectToDatabase();
        const books = await Book.find().sort({ createdAt: -1 }).lean();

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
                data: serializeData(existingBook),                  
                message: 'A book with the same title already exists.',
            }
        }
        return {
            success: true,
            data: null,
            message: 'No book with the same title exists.',
        }
    }
    catch (error) {
        console.error('Error checking book existence:', error);

        return {
            success: false,
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

        //check subscription limits here
        const newBook = new Book({
            ...data,
            slug,
            totalSegments: 0, // Initialize totalSegments to 0 when creating a new book
        });
        await newBook.save();
        
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
            message: 'Failed to create book',
        }
    }   
};

export const saveBookSegments = async (bookId: string, clerkId:string, segments:TextSegment[]) => {
    try {
        await connectToDatabase();
        console.log('Saving segments for bookId:', bookId, 'clerkId:', clerkId, 'number of segments:', segments.length);
        const SegmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
            bookId,
            clerkId,
        }));
        await BookSegment.insertMany(SegmentsToInsert);
        await Book.findByIdAndUpdate(bookId, { $inc: { totalSegments: segments.length } });
        const book = await Book.findById(bookId);
        await book.save();
        return {
            success: true,
            data:{ totalSegments: book.totalSegments },
            message: 'Book segments saved successfully',
        }
    }
    catch (error) {
        console.error('Error saving book segments:', error);
        await BookSegment.deleteMany({ bookId}); // Rollback any saved segments for this book and clerk
        await Book.findByIdAndDelete(bookId); // Rollback the created book
        return {
            success: false,
            message: 'Failed to save book segments',
        }
    }
};
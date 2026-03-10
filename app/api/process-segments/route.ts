import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/DataBase/mongoose';
import { BookSegment } from '@/DataBase/models';
import Book from '@/DataBase/models/book.model';
import { splitIntoSegments } from '@/lib/utils';
import pdfParse from 'pdf-parse';

export const maxDuration = 60;

/** Attempt text extraction with pdfjs-dist (better codec support).
 *  Returns null if it crashes in the serverless environment so we can fall back. */
async function tryPdfjsExtraction(arrayBuffer: ArrayBuffer): Promise<string | null> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';

        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            disableFontFace: true,
            useSystemFonts: false,
            isEvalSupported: false,
            verbosity: 0,
        });

        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items
                .filter((item) => 'str' in item)
                .map((item) => (item as { str: string }).str)
                .join(' ');
            fullText += pageText + '\n';
        }

        await pdf.destroy();
        return fullText;
    } catch (err) {
        // pdfjs-dist may not be available or may crash in serverless — fall back to pdf-parse
        console.warn('pdfjs-dist extraction failed, falling back to pdf-parse:', err);
        return null;
    }
}

/** Extract text from a PDF buffer using both engines with fallback. */
async function extractText(arrayBuffer: ArrayBuffer): Promise<string> {
    // Primary: pdfjs-dist (handles more font encodings)
    const pdfjsText = await tryPdfjsExtraction(arrayBuffer);
    if (pdfjsText !== null && pdfjsText.trim().length > 50) {
        return pdfjsText;
    }

    // Fallback: pdf-parse (pure Node.js, always works in serverless)
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text ?? '';
}

export async function POST(request: Request): Promise<NextResponse> {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    let bookId: string | undefined;
    try {
        const { bookId: id, pdfUrl } = (await request.json()) as { bookId: string; pdfUrl: string };
        bookId = id;

        if (!bookId || !pdfUrl) {
            return NextResponse.json({ success: false, message: 'Missing bookId or pdfUrl' }, { status: 400 });
        }

        await connectToDatabase();

        // Fetch PDF from Vercel Blob (server-to-server, no body-size limit)
        const pdfRes = await fetch(pdfUrl);
        if (!pdfRes.ok) throw new Error(`Failed to fetch PDF: ${pdfRes.status}`);
        const arrayBuffer = await pdfRes.arrayBuffer();

        // Extract text — tries pdfjs-dist first, falls back to pdf-parse
        const fullText = await extractText(arrayBuffer);

        const segments = splitIntoSegments(fullText.trim());

        if (segments.length === 0) {
            await Book.findByIdAndDelete(bookId);
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'No text could be extracted from this PDF. It may be a scanned or image-based PDF. Please use a text-based (searchable) PDF and try again.',
                },
                { status: 422 },
            );
        }

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
            bookId,
            clerkId: userId,
        }));

        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        return NextResponse.json({ success: true, totalSegments: segments.length });
    } catch (error) {
        console.error('Error processing segments:', error);
        if (bookId) {
            await connectToDatabase().catch(() => {});
            await BookSegment.deleteMany({ bookId }).catch(() => {});
            await Book.findByIdAndDelete(bookId).catch(() => {});
        }
        return NextResponse.json({ success: false, message: 'Failed to process book segments' }, { status: 500 });
    }
}

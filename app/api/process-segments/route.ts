import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/DataBase/mongoose';
import { BookSegment } from '@/DataBase/models';
import Book from '@/DataBase/models/book.model';
import { splitIntoSegments } from '@/lib/utils';
import pdfParse from 'pdf-parse';

export const maxDuration = 60;

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

        // pdf-parse: pure Node.js PDF text extraction, no canvas/worker needed
        const data = await pdfParse(Buffer.from(arrayBuffer));
        const fullText = data.text;

        const segments = splitIntoSegments(fullText);

        if (segments.length === 0) {
            await Book.findByIdAndDelete(bookId);
            return NextResponse.json({ success: false, message: 'No text found in PDF' }, { status: 422 });
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

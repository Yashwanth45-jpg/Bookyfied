import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/DataBase/mongoose';
import { BookSegment } from '@/DataBase/models';
import Book from '@/DataBase/models/book.model';
import { splitIntoSegments } from '@/lib/utils';

export const maxDuration = 60; // seconds — Vercel Pro allows up to 300

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

        // Dynamic import keeps pdfjs-dist out of the bundle graph —
        // static top-level imports of .mjs files crash Vercel's bundler at deploy.
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs' as string);
        const getDocument = pdfjsLib.getDocument ?? (pdfjsLib as any).default?.getDocument;

        const loadingTask = getDocument({
            data: new Uint8Array(arrayBuffer),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        } as Parameters<typeof getDocument>[0]);
        const pdfDoc = await loadingTask.promise;

        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageText = (content.items as Array<{ str?: string }>)
                .filter((item) => item.str !== undefined)
                .map((item) => item.str!)
                .join(' ');
            fullText += pageText + '\n';
        }
        await pdfDoc.destroy();

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

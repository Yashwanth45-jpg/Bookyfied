import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/DataBase/mongoose';
import { BookSegment } from '@/DataBase/models';
import Book from '@/DataBase/models/book.model';
import { splitIntoSegments } from '@/lib/utils';

export const maxDuration = 60;

async function extractTextWithPdfjs(arrayBuffer: ArrayBuffer): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    // Disable browser worker — pdfjs falls back to in-thread execution in Node.js
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

        // Use pdfjs-dist for robust text extraction — handles more PDF formats than pdf-parse
        const fullText = await extractTextWithPdfjs(arrayBuffer);

        const segments = splitIntoSegments(fullText.trim());

        if (segments.length === 0) {
            await Book.findByIdAndDelete(bookId);
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'No text could be extracted from this PDF. It may be a scanned/image-based PDF. Please use a text-based PDF and try again.',
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

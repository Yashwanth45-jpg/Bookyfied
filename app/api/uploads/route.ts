import { MAX_FILE_SIZE } from "@/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN is not configured');
        return NextResponse.json({
            success: false,
            message: 'Blob storage token not configured'
        }, { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({
            success: false,
            message: 'User not authenticated'
        }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname) => {
                return {
                    allowedContentTypes: [
                        'application/pdf',
                        'image/jpeg',
                        'image/jpg',
                        'image/png',
                        'image/webp',
                    ],
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({ userId }),
                };
            },
            onUploadCompleted: async ({ blob }) => {
                console.log('File uploaded to Blob:', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (e) {
        console.error('Error handling upload:', e);
        return NextResponse.json({
            success: false,
            message: 'Failed to handle upload'
        }, { status: 400 });
    }
}

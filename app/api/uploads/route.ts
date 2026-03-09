import { MAX_FILE_SIZE } from "@/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname) => {
                // Auth check only runs for token-generation requests (user → server)
                if (!process.env.BLOB_READ_WRITE_TOKEN) {
                    throw new Error('Blob storage token not configured');
                }
                const { userId } = await auth();
                if (!userId) {
                    throw new Error('User not authenticated');
                }
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
                // Called by Vercel Blob server-to-server — no user session here.
                // Signature is verified automatically by handleUpload.
                console.log('File uploaded to Blob:', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (e) {
        console.error('Error handling upload:', e);
        return NextResponse.json({
            success: false,
            message: e instanceof Error ? e.message : 'Failed to handle upload',
        }, { status: 400 });
    }
}

import { MAX_FILE_SIZE } from "@/constants";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) : Promise<NextResponse> {
    // Verify token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN is not configured');
        return NextResponse.json({ 
            success: false, 
            message: 'Blob storage token not configured' 
        }, { status: 500 });
    }

    // Check authentication
    const {userId} = await auth();
    if(!userId) {
        return NextResponse.json({ 
            success: false, 
            message: 'User not authenticated' 
        }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const filename = formData.get('filename') as string;

        if (!file) {
            return NextResponse.json({ 
                success: false, 
                message: 'No file provided' 
            }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ 
                success: false, 
                message: 'File size exceeds maximum allowed size' 
            }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(filename || file.name, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN!,
        });

        console.log('File uploaded to Blob:', blob.url);

        return NextResponse.json({ 
            success: true, 
            url: blob.url,
            pathname: blob.pathname,
            downloadUrl: blob.downloadUrl 
        }, { status: 200 });
    }
    catch(e) {
        console.error('Error handling upload:', e);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to handle upload' 
        }, { status: 500 });
    }
}

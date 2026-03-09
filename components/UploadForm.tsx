'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ImageIcon } from 'lucide-react';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import FileUploader from './FileUploader';
import VoiceSelector from './VoiceSelector';
import LoadingOverlay from './LoadingOverlay';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { checkBookExists, createBook, processAndSaveSegments } from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { parsePDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            persona: '',
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error('Please login to upload books');
        }

        setIsSubmitting(true);

        try {
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                toast.info('A book with the same title already exists.');
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;

            // Parse PDF client-side ONLY for cover image generation + empty-PDF guard.
            // Text extraction is done server-side in processAndSaveSegments so we never
            // pass a large payload through a Next.js server action (would hit ~4.5 MB limit).
            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error('Failed to parse PDF. Please try again with a different file.');
                return;
            }

            // Upload PDF directly to Vercel Blob (bypasses Next.js body size limit)
            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/uploads',
                contentType: 'application/pdf',
            });

            let coverUrl: string;

            if (data.coverImage) {
                const uploadedCoverBlob = await upload(`${fileTitle}_cover`, data.coverImage, {
                    access: 'public',
                    handleUploadUrl: '/api/uploads',
                    contentType: data.coverImage.type,
                });
                coverUrl = uploadedCoverBlob.url;
            } else {
                // Auto-generate cover from first PDF page (canvas rendered client-side)
                const response = await fetch(parsedPDF.cover);
                const blob = await response.blob();
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/uploads',
                    contentType: 'image/png',
                });
                coverUrl = uploadedCoverBlob.url;
            }

            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });

            if (!book.success) {
                toast.error((book as { error?: string }).error ?? 'Failed to create book');
                if ((book as { isBillingError?: boolean }).isBillingError) {
                    router.push('/subscriptions');
                }
                return;
            }

            if (book.alreadyExists) {
                toast.info('A book with the same title already exists.');
                form.reset();
                router.push(`/books/${book.data.slug}`);
                return;
            }

            // Server fetches PDF from Blob URL and extracts/saves segments — no huge payload
            const segments = await processAndSaveSegments(
                book.data._id,
                userId,
                uploadedPdfBlob.url,
            );

            if (!segments.success) {
                toast.error('Failed to save book segments. Please try again.');
                return;
            }

            form.reset();
            router.push('/');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload book. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay message="Processing your book..." />}

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* 1. PDF File Upload */}
                        <FileUploader
                            control={form.control}
                            name="pdfFile"
                            label="Book PDF File"
                            acceptTypes={ACCEPTED_PDF_TYPES}
                            icon={Upload}
                            placeholder="Click to upload PDF"
                            hint="PDF file (max 50MB)"
                            disabled={isSubmitting}
                        />

                        {/* 2. Cover Image Upload */}
                        <FileUploader
                            control={form.control}
                            name="coverImage"
                            label="Cover Image (Optional)"
                            acceptTypes={ACCEPTED_IMAGE_TYPES}
                            icon={ImageIcon}
                            placeholder="Click to upload cover image"
                            hint="Leave empty to auto-generate from PDF"
                            disabled={isSubmitting}
                        />

                        {/* 3. Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Rich Dad Poor Dad"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 4. Author */}
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Author Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Robert Kiyosaki"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 5. Voice */}
                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 6. Submit */}
                        <Button type="submit" className="form-btn" disabled={isSubmitting}>
                            Begin Synthesis
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;

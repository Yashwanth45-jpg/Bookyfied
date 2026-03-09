import { z } from 'zod';
import { MAX_FILE_SIZE, ACCEPTED_PDF_TYPES, MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from './constants';

export const UploadSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    author: z
        .string()
        .min(1, 'Author name is required')
        .max(100, 'Author name must be less than 100 characters'),
    persona: z.string().min(1, 'Please select a voice'),
    pdfFile: z
        .instanceof(File)
        .refine((f) => f.size <= MAX_FILE_SIZE, 'PDF must be less than 50MB')
        .refine((f) => ACCEPTED_PDF_TYPES.includes(f.type), 'Only PDF files are accepted'),
    coverImage: z
        .instanceof(File)
        .refine((f) => f.size <= MAX_IMAGE_SIZE, 'Image must be less than 10MB')
        .refine(
            (f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
            'Only JPEG, PNG, or WebP images are accepted',
        )
        .optional(),
});

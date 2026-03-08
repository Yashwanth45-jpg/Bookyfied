'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import LoadingOverlay from '@/components/LoadingOverlay';
import { voiceOptions, MAX_FILE_SIZE, ACCEPTED_PDF_TYPES, MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/constants';
import { useAuth } from '@clerk/nextjs';
import {toast} from 'sonner';
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { parsePDFFile } from '@/lib/utils';

// Form validation schema
const formSchema = z.object({
  pdfFile: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'PDF file must be less than 50MB')
    .refine(
      (file) => ACCEPTED_PDF_TYPES.includes(file.type),
      'Only PDF files are accepted'
    ),
  coverImage: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Image must be less than 10MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPEG, JPG, PNG, or WebP images are accepted'
    )
    .optional()
    .nullable(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  author: z.string().min(1, 'Author name is required').max(100, 'Author name must be less than 100 characters'),
  voice: z.enum(['dave', 'daniel', 'chris', 'rachel', 'sarah'], 'Please select an assistant voice'),
});

type FormData = z.infer<typeof formSchema>;

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const {userId} = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      voice: 'rachel',
      pdfFile: undefined,
      coverImage: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    if(!userId) {
        return toast.error('You must be logged in to upload a book');
    }

    setIsSubmitting(true);

    try {
        const existsCheck = await checkBookExists(data.title);
        if(existsCheck.success && existsCheck.data) {
            toast.info('A book with the same title already exists. Please choose a different title.');
            form.reset();
            router.push(`/books/${existsCheck.data.slug}`);
            return;
        }

        const fileTitle = data.title.replace( /\s+/g, '_').toLowerCase();
        const pdfFile = data.pdfFile;
        const parsedPDF = await parsePDFFile(pdfFile);

        if(parsedPDF.content.length === 0) {
            toast.error('The uploaded PDF appears to be empty or could not be parsed. Please check the file and try again.');
            return;
        }

        // Upload PDF file
        const pdfFormData = new FormData();
        pdfFormData.append('file', pdfFile);
        pdfFormData.append('filename', `${fileTitle}.pdf`);

        const pdfUploadResponse = await fetch('/api/uploads', {
            method: 'POST',
            body: pdfFormData,
        });

        if (!pdfUploadResponse.ok) {
            const error = await pdfUploadResponse.json();
            toast.error(error.message || 'Failed to upload PDF');
            return;
        }

        const uploadedPdfData = await pdfUploadResponse.json();

        let coverURL: string;

        if(data.coverImage && data.coverImage.size > 0) {
            // Upload custom cover image
            const coverFormData = new FormData();
            coverFormData.append('file', data.coverImage);
            coverFormData.append('filename', `${fileTitle}_cover${data.coverImage.name.substring(data.coverImage.name.lastIndexOf('.'))}`);

            const coverUploadResponse = await fetch('/api/uploads', {
                method: 'POST',
                body: coverFormData,
            });

            if (!coverUploadResponse.ok) {
                const error = await coverUploadResponse.json();
                toast.error(error.message || 'Failed to upload cover image');
                return;
            }

            const uploadedCoverData = await coverUploadResponse.json();
            coverURL = uploadedCoverData.url;
        } else {
            // Upload auto-generated cover from PDF first page
            const response = await fetch(parsedPDF.cover);
            const blob = await response.blob();
            
            const coverFormData = new FormData();
            coverFormData.append('file', blob);
            coverFormData.append('filename', `${fileTitle}_cover.png`);

            const coverUploadResponse = await fetch('/api/uploads', {
                method: 'POST',
                body: coverFormData,
            });

            if (!coverUploadResponse.ok) {
                const error = await coverUploadResponse.json();
                toast.error(error.message || 'Failed to upload cover image');
                return;
            }

            const uploadedCoverData = await coverUploadResponse.json();
            coverURL = uploadedCoverData.url;
        }
        
        const book = await createBook({
            clerkId: userId,
            title: data.title,
            author: data.author,
            persona: data.voice,
            fileURL: uploadedPdfData.url,
            fileBlobKey: uploadedPdfData.pathname,
            coverURL: coverURL,
            fileSize: pdfFile.size,
        });

        if(!book.success) {
            toast.error(book.message || 'Failed to create book. Please try again.');
            return;
        }
        if(book.alreadyExists) {
            toast.info('A book with the same title already exists. Redirecting to the existing book.');
            form.reset();
            router.push(`/books/${book.data.slug}`);
            return;
        }

        const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);
        if(!segments.success) {
            toast.error('Failed to save book segments. Please try again.');
            return;
        }

        form.reset();
        router.push('/');
    }
    catch (error) {
        console.error('Error uploading book:', error);
        toast.error('An error occurred while uploading your book. Please try again.');
    }
    finally {
        setIsSubmitting(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('pdfFile', file);
      setPdfFileName(file.name);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('coverImage', file);
      setCoverFileName(file.name);
    }
  };

  const removePdf = () => {
    form.setValue('pdfFile', undefined as any);
    setPdfFileName(null);
  };

  const removeCover = () => {
    form.setValue('coverImage', null);
    setCoverFileName(null);
  };

  return (
    <>
      {isSubmitting && <LoadingOverlay message="Processing your book..." />}
      
      <div className="new-book-wrapper">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* PDF File Upload */}
            <FormField
              control={form.control}
              name="pdfFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Book PDF File</FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className={`upload-dropzone border-2 border-dashed border-gray-300 ${
                          pdfFileName ? 'upload-dropzone-uploaded' : ''
                        }`}
                      >
                        {pdfFileName ? (
                          <div className="flex items-center justify-between w-full px-4">
                            <div className="flex items-center gap-3">
                              <Upload className="w-6 h-6 text-[#663820]" />
                              <span className="upload-dropzone-text">{pdfFileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removePdf();
                              }}
                              className="upload-dropzone-remove"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="upload-dropzone-icon" />
                            <p className="upload-dropzone-text">Click to upload PDF</p>
                            <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image Upload */}
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                  <FormControl>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className={`upload-dropzone border-2 border-dashed border-gray-300 ${
                          coverFileName ? 'upload-dropzone-uploaded' : ''
                        }`}
                      >
                        {coverFileName ? (
                          <div className="flex items-center justify-between w-full px-4">
                            <div className="flex items-center gap-3">
                              <ImageIcon className="w-6 h-6 text-[#663820]" />
                              <span className="upload-dropzone-text">{coverFileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeCover();
                              }}
                              className="upload-dropzone-remove"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="upload-dropzone-icon" />
                            <p className="upload-dropzone-text">Click to upload cover image</p>
                            <p className="upload-dropzone-hint">Leave empty to auto-generate from PDF</p>
                          </>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Title</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="ex: Rich Dad Poor Dad"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author Input */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Author Name</FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="ex: Robert Kiyosaki"
                      className="form-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Voice Selector */}
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-6"
                    >
                      {/* Male Voices */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-black">Male Voices</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {Object.entries(voiceOptions)
                            .filter(([key]) => ['dave', 'daniel', 'chris'].includes(key))
                            .map(([key, voice]) => (
                              <div key={key} className="relative">
                                <Label
                                  htmlFor={key}
                                  className={`voice-selector-option ${
                                    field.value === key
                                      ? 'voice-selector-option-selected'
                                      : 'voice-selector-option-default'
                                  } cursor-pointer flex-row items-center text-left h-24 gap-3 p-4`}
                                >
                                  <RadioGroupItem
                                    value={key}
                                    id={key}
                                    className="shrink-0"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <div className="font-bold text-base text-black leading-tight">
                                      {voice.name}
                                    </div>
                                    <div className="text-sm text-gray-500 leading-snug">
                                      {voice.description}
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Female Voices */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-black">Female Voices</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(voiceOptions)
                            .filter(([key]) => ['rachel', 'sarah'].includes(key))
                            .map(([key, voice]) => (
                              <div key={key} className="relative">
                                <Label
                                  htmlFor={key}
                                  className={`voice-selector-option ${
                                    field.value === key
                                      ? 'voice-selector-option-selected'
                                      : 'voice-selector-option-default'
                                  } cursor-pointer flex-row items-center text-left h-24 gap-3 p-4`}
                                >
                                  <RadioGroupItem
                                    value={key}
                                    id={key}
                                    className="shrink-0"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <div className="font-bold text-base text-black leading-tight">
                                      {voice.name}
                                    </div>
                                    <div className="text-sm text-gray-500 leading-snug">
                                      {voice.description}
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <button type="submit" className="form-btn" disabled={isSubmitting}>
              Begin Synthesis
            </button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default UploadForm;
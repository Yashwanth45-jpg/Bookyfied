'use client';

import React, { useRef, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    acceptTypes: string[];
    icon: LucideIcon;
    placeholder: string;
    hint?: string;
    disabled?: boolean;
}

const FileUploader = <T extends FieldValues>({
    control,
    name,
    label,
    acceptTypes,
    icon: Icon,
    placeholder,
    hint,
    disabled,
}: FileUploaderProps<T>) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="form-label">{label}</FormLabel>
                    <FormControl>
                        <div>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={acceptTypes.join(',')}
                                className="hidden"
                                disabled={disabled}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        field.onChange(file);
                                        setFileName(file.name);
                                    }
                                }}
                            />
                            <div
                                onClick={() => !disabled && inputRef.current?.click()}
                                className={cn(
                                    'upload-dropzone border-2 border-dashed border-gray-300 cursor-pointer',
                                    fileName && 'upload-dropzone-uploaded',
                                    disabled && 'opacity-50 cursor-not-allowed',
                                )}
                            >
                                {fileName ? (
                                    <div className="flex items-center justify-between w-full px-4">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-6 h-6 text-[#663820]" />
                                            <span className="upload-dropzone-text">{fileName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                field.onChange(undefined);
                                                setFileName(null);
                                                if (inputRef.current) inputRef.current.value = '';
                                            }}
                                            className="upload-dropzone-remove"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Icon className="upload-dropzone-icon" />
                                        <p className="upload-dropzone-text">{placeholder}</p>
                                        {hint && <p className="upload-dropzone-hint">{hint}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FileUploader;

'use client';
import React from 'react';
import Image from 'next/image';
import { Mic, MicOff } from "lucide-react";
import useVapi from '@/app/hooks/useVapi';
import { IBook } from '@/types';
import Transcript from './Transcript';

const VapiControls = ({ book }: { book: IBook }) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration, limitError,
        start, stop, clearError } = useVapi(book);
    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header card */}
                <div className="vapi-header-card">
                    {/* Book cover with mic button */}
                    <div className="vapi-cover-wrapper">
                        <Image
                            src={book.coverURL}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="w-30 h-45 rounded-lg object-cover"
                            style={{ boxShadow: '0px 10px 30px 0px rgba(0, 0, 0, 0.1)' }}
                        />

                        {/* Circular mic button overlapping bottom-right corner */}
                        <div className="absolute -bottom-2 -right-2">
                            {/* Pulsating ring when AI is speaking/thinking */}
                            {(status === 'speaking' || status === 'thinking') && (
                                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                            )}
                            <button onClick={isActive ? stop : start} disabled={status === 'connecting'}
                                className="vapi-mic-btn opacity-100 relative"
                                aria-label="Toggle microphone"
                            >
                                {isActive ? (
                                    <Mic className="size-5 text-black" />
                                ) : (
                                    <MicOff className="size-5 text-black" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Book info and badges */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) font-serif">
                                {book.title}
                            </h1>
                            <p className="text-base text-(--text-secondary) mt-1">
                                by {book.author}
                            </p>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status indicator */}
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-dot vapi-status-dot-ready" />
                                <span className="vapi-status-text">Ready</span>
                            </div>

                            {/* Voice label */}
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona}</span>
                            </div>

                            {/* Timer */}
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">0:00/15:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript */}
                <Transcript
                    messages={messages}
                    currentMessage={currentMessage}
                    currentUserMessage={currentUserMessage}
                />
            </div>
        </>
    )
}

export default VapiControls;
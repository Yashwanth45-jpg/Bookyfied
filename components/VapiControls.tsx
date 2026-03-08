'use client';
import React from 'react';
import Image from 'next/image';
import { Mic, MicOff } from "lucide-react";
import useVapi, { CallStatus } from '@/app/hooks/useVapi';
import { IBook } from '@/types';
import Transcript from './Transcript';

const STATUS_LABELS: Record<CallStatus, string> = {
    idle: 'Ready',
    connecting: 'Connecting…',
    starting: 'Starting…',
    listening: 'Listening…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
};

const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const VapiControls = ({ book }: { book: IBook }) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration,
        maxDurationSeconds, limitError, start, stop, clearError } = useVapi(book);

    const statusLabel = STATUS_LABELS[status] ?? 'Ready';
    const statusDotClass = `vapi-status-dot vapi-status-dot-${status === 'idle' ? 'ready' : status}`;

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Limit error banner */}
                {limitError && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        <span>{limitError}</span>
                        <button onClick={clearError} className="ml-4 font-semibold underline">
                            Dismiss
                        </button>
                    </div>
                )}

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
                    <div className="flex-1 flex flex-col gap-4 items-center text-center sm:items-start sm:text-left">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary) font-serif">
                                {book.title}
                            </h1>
                            <p className="text-base text-(--text-secondary) mt-1">
                                by {book.author}
                            </p>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            {/* Dynamic status indicator */}
                            <div className="vapi-status-indicator">
                                <span className={statusDotClass} />
                                <span className="vapi-status-text">{statusLabel}</span>
                            </div>

                            {/* Voice label */}
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {book.persona}</span>
                            </div>

                            {/* Live timer */}
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">
                                    {formatTime(duration)} / {formatTime(maxDurationSeconds)}
                                </span>
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
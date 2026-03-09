'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { voiceOptions } from '@/lib/constants';

interface VoiceSelectorProps {
    value?: string;
    onChange: (key: string) => void;
    disabled?: boolean;
}

const VoiceSelector = ({ value, onChange, disabled }: VoiceSelectorProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(voiceOptions).map(([key, voice]) => (
                <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(key)}
                    className={cn(
                        'text-left p-3 rounded-lg border-2 transition-colors',
                        value === key
                            ? 'border-[#663820] bg-[#663820]/10'
                            : 'border-gray-200 hover:border-gray-300',
                        disabled && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    <p className="font-semibold text-sm">{voice.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{voice.description}</p>
                </button>
            ))}
        </div>
    );
};

export default VoiceSelector;

'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  progress?: { step: string; completed: boolean }[];
}

const LoadingOverlay = ({ message = 'Processing...', progress }: LoadingOverlayProps) => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white">
        <div className="loading-shadow">
          <Loader2 className="loading-animation w-16 h-16 text-(--color-brand)" />
          <h3 className="loading-title">{message}</h3>
          {progress && progress.length > 0 && (
            <div className="loading-progress">
              {progress.map((item, index) => (
                <div key={index} className="loading-progress-item">
                  {item.completed && (
                    <div className="loading-progress-status" />
                  )}
                  <span className="text-(--text-secondary)">{item.step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;

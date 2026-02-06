'use client';

import { useState } from 'react';

export type SigningStatus =
  | 'idle'
  | 'uploading'
  | 'triggering'
  | 'signing'
  | 'completed'
  | 'failed';

interface ProgressDisplayProps {
  status: SigningStatus;
  error?: string;
  downloadUrl?: string;
  onReset?: () => void;
}

// Icon components
const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const steps = [
  { id: 'uploading', label: 'Uploading files securely', activeLabel: 'Uploading files...' },
  { id: 'triggering', label: 'Starting GitHub Actions', activeLabel: 'Starting workflow...' },
  { id: 'signing', label: 'Signing your AAB', activeLabel: 'Signing in progress...' },
  { id: 'completed', label: 'Ready for download', activeLabel: 'Complete!' },
];

export function ProgressDisplay({ status, error, downloadUrl, onReset }: ProgressDisplayProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setDownloadError(null);
    setIsDownloading(true);

    try {
      const response = await fetch(downloadUrl);

      // Check if response is JSON (error) or binary (success)
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        // This is an error response
        const data = await response.json();
        setDownloadError(data.error || 'Download failed. Please sign your AAB again.');
        return;
      }

      if (!response.ok) {
        setDownloadError('Download failed. The file may have expired. Please sign your AAB again.');
        return;
      }

      // Success - trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'signed-aab.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setDownloadError('Download failed. Please try again or sign your AAB again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (status === 'idle') {
    return null;
  }

  const getStepStatus = (stepId: string) => {
    const statusOrder = ['uploading', 'triggering', 'signing', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    // When overall status is 'completed', all steps should show as completed
    if (status === 'completed') {
      return 'completed';
    }

    if (status === 'failed') {
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'failed';
      return 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const isInProgress = status === 'uploading' || status === 'triggering' || status === 'signing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        {status === 'completed' && !downloadError ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-500/20 flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-lime-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Your AAB is Ready!</h3>
            <p className="text-zinc-400 text-sm">Signed successfully and ready for Google Play</p>
          </>
        ) : status === 'failed' || downloadError ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <XIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Signing Failed</h3>
            <p className="text-zinc-400 text-sm">Something went wrong during the process</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <div className="relative">
                <ShieldCheckIcon className="w-8 h-8 text-lime-400" />
                <div className="absolute inset-0 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Signing Your App Bundle</h3>
            <p className="text-zinc-400 text-sm">This usually takes 2-3 minutes</p>
          </>
        )}
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                stepStatus === 'current'
                  ? 'bg-zinc-800/80'
                  : stepStatus === 'completed'
                  ? 'bg-lime-500/5'
                  : stepStatus === 'failed'
                  ? 'bg-red-500/10'
                  : 'bg-transparent'
              }`}
            >
              {/* Step Indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  stepStatus === 'completed'
                    ? 'bg-lime-500 text-black'
                    : stepStatus === 'current'
                    ? 'bg-zinc-700'
                    : stepStatus === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                {stepStatus === 'completed' ? (
                  <CheckIcon className="w-4 h-4" />
                ) : stepStatus === 'current' ? (
                  <svg className="w-4 h-4 animate-spin text-lime-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : stepStatus === 'failed' ? (
                  <XIcon className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-sm font-medium transition-colors ${
                  stepStatus === 'completed'
                    ? 'text-lime-400'
                    : stepStatus === 'current'
                    ? 'text-white'
                    : stepStatus === 'failed'
                    ? 'text-red-400'
                    : 'text-zinc-600'
                }`}
              >
                {stepStatus === 'current' ? step.activeLabel : step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {(status === 'failed' || downloadError) && (error || downloadError) && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
          <p className="text-red-300 text-sm mb-3">{downloadError || error}</p>
          <div className="flex items-center gap-2 text-xs text-red-400/70">
            <MailIcon className="w-4 h-4" />
            <span>Need help? Contact us at </span>
            <a
              href="mailto:support@testerscommunity.com"
              className="text-red-300 hover:text-red-200 underline underline-offset-2"
            >
              support@testerscommunity.com
            </a>
          </div>
        </div>
      )}

      {/* Success & Download */}
      {status === 'completed' && downloadUrl && !downloadError && (
        <div className="space-y-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-6 btn-primary rounded-xl text-black font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5" />
                Download Signed AAB
              </>
            )}
          </button>

          <p className="text-xs text-zinc-500 text-center">
            Available for download for 24 hours
          </p>
        </div>
      )}

      {/* Reset Button */}
      {(status === 'completed' || status === 'failed') && onReset && (
        <button
          onClick={onReset}
          className="w-full py-3 px-4 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
        >
          <RefreshIcon className="w-4 h-4" />
          Sign Another AAB
        </button>
      )}

      {/* Security Note - during processing */}
      {isInProgress && (
        <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
          <svg className="w-4 h-4 text-lime-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-zinc-400 text-xs">
            Your files are processed securely and deleted immediately after signing.
          </span>
        </div>
      )}

      {/* Watch on GitHub Link */}
      {isInProgress && (
        <a
          href="https://github.com/Testers-Community/android-aab-signer/actions"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-lime-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          Watch live on GitHub
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

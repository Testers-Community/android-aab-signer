'use client';

import { useState, useCallback, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { UploadForm } from '@/components/upload-form';
import { ProgressDisplay, SigningStatus } from '@/components/progress-display';

// Icons as components for cleaner code
const ShieldCheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UploadCloudIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const LockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CogIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DownloadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CodeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const TrashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const GitHubIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const MailIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const REPO_URL = 'https://github.com/Testers-Community/android-aab-signer';

// FAQ Data
const faqData = [
  {
    question: "Is this really free?",
    answer: "Yes, completely free. GitHub Actions provides free compute for public repositories, and we pass that savings to you. There are no hidden fees, no premium tiers, and no rate limits."
  },
  {
    question: "Is it safe to upload my keystore?",
    answer: "Your keystore is uploaded securely via HTTPS, used only during the signing process, and deleted immediately after. The workflow runs in an isolated GitHub Actions environment that is destroyed after each job. You can verify this in our open-source code."
  },
  {
    question: "Why do I need to sign my AAB?",
    answer: "Google Play requires all apps to be signed with your private key. If you're using a build system that produces unsigned bundles, or if you need to re-sign an AAB, you'll need to sign it before uploading to Play Console."
  },
  {
    question: "What tools do you use for signing?",
    answer: "We use jarsigner from the official Java SDK with SHA256withRSA signature algorithm - the same process Google recommends for signing Android App Bundles."
  },
  {
    question: "Can I use this for production apps?",
    answer: "Absolutely. This tool produces production-ready signed bundles suitable for Google Play release, signed with jarsigner exactly as Google recommends."
  },
  {
    question: "Where can I get a keystore?",
    answer: "You can generate one using Android Studio (Build > Generate Signed Bundle/APK) or the keytool command line utility. If you've previously published to Google Play, use the same keystore to maintain update compatibility."
  }
];

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: 'rgba(26,22,21,0.08)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <span
          className="font-semibold text-[15px] transition-colors group-hover:text-[#054ada]"
          style={{ color: '#1a1615' }}
        >
          {question}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] leading-[1.7] pr-8" style={{ color: '#5a6272' }}>{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState<SigningStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();
  const [runId, setRunId] = useState<number | null>(null);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

  // Cleanup blob files
  const cleanupBlobs = useCallback(async (urls: string[]) => {
    if (urls.length === 0) return;
    try {
      await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  }, []);

  // Poll for workflow status
  useEffect(() => {
    if (status !== 'signing' || !runId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${runId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          // Cleanup blobs after completion
          cleanupBlobs(blobUrls);
          setBlobUrls([]);

          if (data.conclusion === 'success' && data.artifactUrl) {
            setDownloadUrl(data.artifactUrl);
            setStatus('completed');
          } else {
            setError(data.error || 'Signing failed. Please check your keystore credentials and try again.');
            setStatus('failed');
          }
          clearInterval(pollInterval);
        } else if (data.status === 'failed' || data.conclusion === 'failure') {
          // Cleanup blobs on failure too
          cleanupBlobs(blobUrls);
          setBlobUrls([]);

          setError(data.error || 'Signing failed. Please check your keystore credentials and try again.');
          setStatus('failed');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [status, runId, blobUrls, cleanupBlobs]);

  const handleSubmit = useCallback(async (data: {
    aabFile: File;
    keystoreFile: File;
    keystorePassword: string;
    keyAlias: string;
    keyPassword: string;
  }) => {
    setStatus('uploading');
    setError(undefined);
    setDownloadUrl(undefined);
    setShowSigningModal(true);

    try {
      // Step 1: Upload files to Vercel Blob (supports large files)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const prefix = `sign-${timestamp}-${randomId}`;

      // Upload AAB file
      const aabBlob = await upload(`${prefix}/${data.aabFile.name}`, data.aabFile, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      });

      // Upload keystore file
      const keystoreBlob = await upload(`${prefix}/${data.keystoreFile.name}`, data.keystoreFile, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      });

      // Store blob URLs for cleanup later
      setBlobUrls([aabBlob.url, keystoreBlob.url]);

      setStatus('triggering');

      // Step 2: Trigger signing workflow with blob URLs
      const signResponse = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aabUrl: aabBlob.url,
          keystoreUrl: keystoreBlob.url,
          aabFileName: data.aabFile.name,
          keystoreFileName: data.keystoreFile.name,
          keystorePassword: data.keystorePassword,
          keyAlias: data.keyAlias,
          keyPassword: data.keyPassword,
        }),
      });

      const signResult = await signResponse.json();

      if (!signResult.success) {
        throw new Error(signResult.error || 'Failed to start signing');
      }

      // Step 3: Start polling for status
      setStatus('signing');
      setRunId(signResult.runId);

      if (!signResult.runId) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (err) {
      console.error('Signing process error:', err);
      // Cleanup blobs on error
      if (blobUrls.length > 0) {
        cleanupBlobs(blobUrls);
        setBlobUrls([]);
      }
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setStatus('failed');
    }
  }, [blobUrls, cleanupBlobs]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
    setDownloadUrl(undefined);
    setRunId(null);
    setShowSigningModal(false);
    setBlobUrls([]);
  }, []);

  const isProcessing = status !== 'idle' && status !== 'completed' && status !== 'failed';

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.96)',
          borderColor: 'rgba(26,22,21,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="https://testerscommunity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <img
              src="/tc-icon.webp"
              alt="Testers Community"
              width={34}
              height={34}
              className="rounded-[9px]"
            />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold" style={{ color: '#1a1615', letterSpacing: '-0.2px' }}>
                AAB Signer
              </span>
              <span className="text-[12px] mt-1" style={{ color: '#94a3b8' }}>
                by Testers Community
              </span>
            </span>
          </a>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
            style={{
              background: 'rgba(5,74,218,0.07)',
              border: '1px solid rgba(5,74,218,0.15)',
              color: '#054ada',
            }}
          >
            <GitHubIcon className="w-4 h-4" />
            <span className="hidden sm:inline">View source</span>
          </a>
        </div>
      </header>

      <main>
        {/* Hero - the solid brand band used across the guides */}
        <section
          className="flex w-full flex-col items-center px-5 pt-16 pb-36 sm:pt-20 sm:pb-40"
          style={{ background: '#054ada' }}
        >
          <div className="flex w-full max-w-[720px] flex-col items-center text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium mb-6"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <CodeIcon className="h-3.5 w-3.5" />
              Free and open source
            </span>

            <h1 className="font-bold text-white mb-5 text-[34px] leading-[1.12] tracking-[-1px] min-[600px]:text-[48px] min-[600px]:tracking-[-1.6px]">
              Sign your Android App Bundle in seconds
            </h1>

            <p className="max-w-[520px] text-[17px] leading-[1.7]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Upload your unsigned AAB and keystore, and get a signed bundle ready for Google Play.
              No Android Studio, no command line.
            </p>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {[
                { icon: <CheckIcon className="w-3.5 h-3.5" />, text: "No sign-up" },
                { icon: <LockIcon className="w-3.5 h-3.5" />, text: "Keys never stored" },
                { icon: <CodeIcon className="w-3.5 h-3.5" />, text: "Auditable workflow" },
                { icon: <GitHubIcon className="w-3.5 h-3.5" />, text: "Runs on GitHub Actions" },
              ].map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.16)',
                  }}
                >
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Everything below the hero sits on the tinted canvas */}
        <div className="relative flow-root tc-canvas">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 tc-dots" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full blur-[120px]"
              style={{ background: 'rgba(5,74,218,0.06)' }}
            />
          </div>

          {/* Form card, lifted over the blue band */}
          <section className="relative z-10 mx-auto max-w-[620px] px-5 -mt-28">
            <div className="tc-card p-6 sm:p-8" style={{ background: '#ffffff' }}>
              <div className="flex items-center gap-2.5 mb-6">
                <span style={{ color: '#054ada' }}><ShieldCheckIcon className="w-5 h-5" /></span>
                <h2 className="text-[19px] font-bold" style={{ color: '#1a1615', letterSpacing: '-0.3px' }}>
                  Sign your AAB
                </h2>
              </div>

              <UploadForm
                onSubmit={handleSubmit}
                disabled={isProcessing}
              />

              {/* Security note */}
              <div
                className="mt-6 flex items-start gap-3 rounded-2xl p-4"
                style={{ background: 'rgba(5,74,218,0.05)', border: '1px solid rgba(5,74,218,0.12)' }}
              >
                <span className="flex-shrink-0 mt-0.5" style={{ color: '#054ada' }}>
                  <LockIcon className="w-[18px] h-[18px]" />
                </span>
                <p className="text-[13.5px] leading-[1.6]" style={{ color: '#5a6272' }}>
                  Your keystore and passwords are used only during signing and are deleted immediately after.
                  We never store your credentials.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="relative z-10 mx-auto max-w-5xl px-5 pt-20 pb-6 sm:pt-28">
            <div className="text-center mb-12">
              <h2 className="text-[28px] sm:text-[34px] font-bold mb-3" style={{ color: '#1a1615', letterSpacing: '-1px' }}>
                How it works
              </h2>
              <p className="text-[16px]" style={{ color: '#5a6272' }}>
                Four steps, about thirty seconds, nothing installed.
              </p>
            </div>

            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <UploadCloudIcon className="w-5 h-5" />,
                  title: "Upload your files",
                  description: "Drop your unsigned AAB and keystore file. Everything stays in your browser until you submit."
                },
                {
                  icon: <LockIcon className="w-5 h-5" />,
                  title: "Secure transfer",
                  description: "Files are held just long enough to trigger a GitHub Actions run, then deleted."
                },
                {
                  icon: <CogIcon className="w-5 h-5" />,
                  title: "Automated signing",
                  description: "GitHub Actions runs jarsigner to sign your bundle, the same tool Google recommends."
                },
                {
                  icon: <DownloadIcon className="w-5 h-5" />,
                  title: "Download and publish",
                  description: "Get your signed AAB back, ready to upload straight to Play Console."
                }
              ].map((step, index) => (
                <li key={index} className="tc-card tc-card-hover relative p-6 pt-7">
                  {/* Ghosted step numeral, no tinted icon tile */}
                  <span
                    className="absolute right-5 top-4 text-[40px] font-bold leading-none select-none"
                    style={{ color: 'rgba(5,74,218,0.08)' }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: '#054ada' }}>{step.icon}</span>
                  <h3 className="mt-4 mb-2 text-[16px] font-bold" style={{ color: '#1a1615', letterSpacing: '-0.2px' }}>
                    {step.title}
                  </h3>
                  <p className="text-[14px] leading-[1.65]" style={{ color: '#5a6272' }}>
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Testers Community promo */}
          <section className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:py-20">
            <div
              className="relative overflow-hidden rounded-[24px] px-7 py-9 sm:px-12 sm:py-12"
              style={{ background: '#054ada' }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full blur-[90px]"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <a
                    href="https://testerscommunity.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium mb-5 transition-colors"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.92)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <img src="/tc-icon.webp" alt="" width={18} height={18} className="rounded" />
                    From the makers of Testers Community
                  </a>

                  <h3 className="text-white font-bold mb-3 text-[26px] sm:text-[32px] leading-[1.15] tracking-[-0.8px]">
                    Need testers for Google Play?
                  </h3>
                  <p className="max-w-xl text-[16px] leading-[1.7] mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Production access requires 12 testers opted in for 14 consecutive days.
                    Finding reliable testers is the hard part. We handle it.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-w-xl">
                    {[
                      "15 professional testers in 6 hours",
                      "16 days of testing",
                      "Production access guarantee",
                      "99.9% success rate"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-[14px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        <CheckIcon className="w-4 h-4 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:text-center lg:pl-8 flex-shrink-0">
                  <div className="mb-4">
                    <span className="text-[40px] font-bold text-white leading-none">$15</span>
                    <span className="ml-2 text-[15px]" style={{ color: 'rgba(255,255,255,0.7)' }}>one-time</span>
                  </div>
                  <a
                    href="https://testerscommunity.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
                    style={{ background: '#ffffff', color: '#054ada' }}
                  >
                    Get testers
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://testerscommunity.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3.5 text-[13px] transition-opacity hover:opacity-100"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Learn about the requirements
                    <ExternalLinkIcon className="inline w-3 h-3 ml-1.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Why trust us */}
          <section className="relative z-10 mx-auto max-w-5xl px-5 pb-6">
            <div className="text-center mb-12">
              <h2 className="text-[28px] sm:text-[34px] font-bold mb-3" style={{ color: '#1a1615', letterSpacing: '-1px' }}>
                Open source, end to end
              </h2>
              <p className="text-[16px]" style={{ color: '#5a6272' }}>
                See exactly what happens to your files.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <CodeIcon className="w-5 h-5" />,
                  title: "Inspect our code",
                  description: "Every line is public. Read the GitHub Actions workflow to see exactly what runs on your files. No secrets, no hidden logic.",
                  action: {
                    text: "View source code",
                    href: REPO_URL
                  },
                  secondaryAction: {
                    text: "See the workflow",
                    href: `${REPO_URL}/blob/main/.github/workflows/sign.yml`
                  }
                },
                {
                  icon: <TrashIcon className="w-5 h-5" />,
                  title: "No data storage",
                  description: "Files are processed in ephemeral GitHub VMs and deleted immediately. We do not store your AAB, your keystore, or any credentials."
                },
                {
                  icon: <UsersIcon className="w-5 h-5" />,
                  title: "Community built",
                  description: "Part of the Testers Community toolkit, alongside the closed testing service behind 10,000+ apps published."
                }
              ].map((card, index) => (
                <div key={index} className="tc-card tc-card-hover p-6 flex flex-col">
                  <span style={{ color: '#054ada' }}>{card.icon}</span>
                  <h3 className="mt-4 mb-2 text-[16px] font-bold" style={{ color: '#1a1615', letterSpacing: '-0.2px' }}>
                    {card.title}
                  </h3>
                  <p className="text-[14px] leading-[1.65] mb-4 flex-1" style={{ color: '#5a6272' }}>
                    {card.description}
                  </p>
                  {(card.action || card.secondaryAction) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {card.action && (
                        <a
                          href={card.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold hover:underline underline-offset-2"
                          style={{ color: '#054ada' }}
                        >
                          {card.action.text}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      )}
                      {card.secondaryAction && (
                        <a
                          href={card.secondaryAction.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13.5px] hover:underline underline-offset-2"
                          style={{ color: '#5a6272' }}
                        >
                          {card.secondaryAction.text}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Live workflow visualisation */}
          <section className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:py-20">
            <div className="tc-card overflow-hidden">
              <div className="p-6 sm:p-8 border-b" style={{ borderColor: 'rgba(26,22,21,0.08)' }}>
                <h2 className="text-[21px] font-bold mb-2" style={{ color: '#1a1615', letterSpacing: '-0.4px' }}>
                  Watch it happen
                </h2>
                <p className="text-[14.5px] leading-[1.7]" style={{ color: '#5a6272' }}>
                  Every workflow run is public.{' '}
                  <span style={{ color: '#1a1615', fontWeight: 600 }}>
                    You can see exactly what code runs on your files.
                  </span>
                </p>
              </div>

              <div className="p-5 sm:p-7">
                <div className="tc-code p-5 sm:p-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <span style={{ color: '#4ade80' }}>&#10003;</span>
                      <span style={{ color: 'rgba(245,245,244,0.85)' }}>Uploading files securely...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: '#4ade80' }}>&#10003;</span>
                      <span style={{ color: 'rgba(245,245,244,0.85)' }}>Triggering GitHub Actions workflow...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="animate-pulse" style={{ color: '#7aa5f7' }}>&#9679;</span>
                      <span style={{ color: 'rgba(245,245,244,0.85)' }}>Running jarsigner...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'rgba(245,245,244,0.3)' }}>&#9675;</span>
                      <span style={{ color: 'rgba(245,245,244,0.4)' }}>Verifying signature...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'rgba(245,245,244,0.3)' }}>&#9675;</span>
                      <span style={{ color: 'rgba(245,245,244,0.4)' }}>Ready for download</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="px-6 py-4 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: 'rgba(26,22,21,0.08)', background: 'rgba(248,250,252,0.7)' }}
              >
                <p className="text-[12.5px]" style={{ color: '#94a3b8' }}>
                  Do not take our word for it. Check the workflow yourself.
                </p>
                <a
                  href={`${REPO_URL}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold hover:underline underline-offset-2"
                  style={{ color: '#054ada' }}
                >
                  <GitHubIcon className="w-4 h-4" />
                  View live workflow runs
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="relative z-10 mx-auto max-w-3xl px-5 pb-20 sm:pb-28">
            <div className="text-center mb-12">
              <h2 className="text-[28px] sm:text-[34px] font-bold mb-3" style={{ color: '#1a1615', letterSpacing: '-1px' }}>
                Frequently asked questions
              </h2>
              <p className="text-[16px]" style={{ color: '#5a6272' }}>
                Everything you need to know about AAB signing.
              </p>
            </div>

            <div className="tc-card px-6 py-2 sm:px-8">
              {faqData.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-[14.5px] mb-2" style={{ color: '#5a6272' }}>
                Still have questions, or running into something odd?
              </p>
              <a
                href="mailto:support@testerscommunity.com"
                className="inline-flex items-center gap-2 text-[14.5px] font-semibold hover:underline underline-offset-2"
                style={{ color: '#054ada' }}
              >
                <MailIcon className="w-4 h-4" />
                support@testerscommunity.com
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Signing progress modal */}
      {showSigningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,22,21,0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-md rounded-[20px] p-6 sm:p-8 animate-fade-in"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(26,22,21,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            }}
          >
            <ProgressDisplay
              status={status}
              error={error}
              downloadUrl={downloadUrl}
              onReset={handleReset}
            />
          </div>
        </div>
      )}

      {/* Footer - plain text and air, one accent, no chrome */}
      <footer className="border-t" style={{ borderColor: 'rgba(26,22,21,0.08)', background: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <a
              href="https://testerscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition-opacity hover:opacity-70"
            >
              <img
                src="/tc-icon.webp"
                alt="Testers Community"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="flex flex-col leading-none">
                <span className="text-[14px] font-semibold" style={{ color: '#1a1615' }}>AAB Signer</span>
                <span className="text-[12.5px] mt-1" style={{ color: '#94a3b8' }}>
                  A free tool by Testers Community
                </span>
              </span>
            </a>

            <nav className="flex flex-wrap gap-x-7 gap-y-3 text-[13.5px]">
              <a
                href="https://testerscommunity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#1a1615]"
                style={{ color: '#5a6272' }}
              >
                Testers Community
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#1a1615]"
                style={{ color: '#5a6272' }}
              >
                GitHub repository
              </a>
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#1a1615]"
                style={{ color: '#5a6272' }}
              >
                Report an issue
              </a>
              <a
                href="mailto:support@testerscommunity.com"
                className="transition-colors hover:text-[#1a1615]"
                style={{ color: '#5a6272' }}
              >
                Contact
              </a>
            </nav>
          </div>

          <div
            className="mt-10 pt-7 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[12.5px]"
            style={{ borderColor: 'rgba(26,22,21,0.08)', color: '#94a3b8' }}
          >
            <p>Made with care for Android developers</p>
            <p>&copy; {new Date().getFullYear()} Testers Community. Open source.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

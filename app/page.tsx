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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
    answer: "Absolutely! This tool produces production-ready signed bundles suitable for Google Play release. Thousands of developers use this tool for their production apps."
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
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-lime-400 transition-colors group"
      >
        <span className="font-medium text-white group-hover:text-lime-400 transition-colors pr-4">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-zinc-400 leading-relaxed">{answer}</p>
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
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 radial-gradient pointer-events-none" />
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <a
              href="https://testerscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/tc-icon.webp"
                alt="Testers Community"
                width={44}
                height={44}
                className="rounded-xl"
              />
              <div>
                <h1 className="text-lg font-bold">AAB Signer</h1>
                <p className="text-xs text-zinc-500">by Testers Community</p>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Testers-Community/android-aab-signer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors text-sm text-zinc-300 hover:text-white"
              >
                <GitHubIcon className="w-4 h-4" />
                <span className="hidden sm:inline">View Source</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-8 sm:pt-24 sm:pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 text-lime-400 text-sm font-medium border border-lime-500/20">
                <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                100% Free & Open Source
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 leading-tight">
              Sign Your Android App Bundle
              <br />
              <span className="gradient-text">in Seconds</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-zinc-400 text-center max-w-2xl mx-auto mb-8">
              Upload your unsigned AAB, provide your keystore, and get a signed bundle
              ready for Google Play. Powered by GitHub Actions.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                { icon: <CheckIcon className="w-4 h-4" />, text: "No Sign-up Required" },
                { icon: <LockIcon className="w-4 h-4" />, text: "Your Keys Stay Private" },
                { icon: <CodeIcon className="w-4 h-4" />, text: "Open Source" },
                { icon: <GitHubIcon className="w-4 h-4" />, text: "GitHub Actions Powered" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300"
                >
                  <span className="text-zinc-500">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {/* Main Form Card */}
            <div className="max-w-xl mx-auto">
              <div className="glass-card gradient-border rounded-2xl p-6 sm:p-8 glow">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-lime-400" />
                  Sign Your AAB
                </h2>

                <UploadForm
                  onSubmit={handleSubmit}
                  disabled={isProcessing}
                />

                {/* Security Note */}
                <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                  <LockIcon className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-400">
                    Your keystore and passwords are used only during signing and are immediately deleted.
                    We never store your credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signing Progress Modal */}
        {showSigningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full animate-fade-in">
              <ProgressDisplay
                status={status}
                error={error}
                downloadUrl={downloadUrl}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-zinc-400 text-lg">Simple, transparent, and secure signing process</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <UploadCloudIcon className="w-7 h-7" />,
                  title: "Upload Your Files",
                  description: "Drop your unsigned AAB and keystore file. Everything stays secure until submission."
                },
                {
                  icon: <LockIcon className="w-7 h-7" />,
                  title: "Secure Processing",
                  description: "Files are temporarily uploaded to trigger a GitHub Actions workflow. Deleted immediately after."
                },
                {
                  icon: <CogIcon className="w-7 h-7" />,
                  title: "Automated Signing",
                  description: "GitHub Actions runs jarsigner to properly sign your bundle - the same tools Google recommends."
                },
                {
                  icon: <DownloadIcon className="w-7 h-7" />,
                  title: "Download & Publish",
                  description: "Get your signed AAB ready to upload directly to Google Play Console. That's it!"
                }
              ].map((step, index) => (
                <div key={index} className="group">
                  <div className="h-full p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 mb-4 rounded-xl bg-zinc-800 flex items-center justify-center text-lime-400 group-hover:bg-lime-500/10 transition-colors">
                      {step.icon}
                    </div>
                    <div className="text-xs text-lime-400 font-medium mb-2">Step {index + 1}</div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testers Community Promo Banner */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50">
              {/* Accent glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex-1">
                    <a
                      href="https://testerscommunity.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-500/10 text-lime-400 text-xs font-medium mb-4 hover:bg-lime-500/20 transition-colors cursor-pointer"
                    >
                      <img
                        src="/tc-icon.webp"
                        alt="Testers Community"
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      From the makers of Testers Community
                    </a>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">Need Testers for Google Play?</h3>
                    <p className="text-zinc-400 text-lg mb-6 max-w-xl">
                      Getting production access on Google Play requires 12 testers for 14 consecutive days.
                      Finding reliable testers is hard - we make it easy.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        "25 Professional Testers in 6 hours",
                        "16 Days of Testing",
                        "Production Access Guarantee",
                        "99% Success Rate"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                          <CheckIcon className="w-4 h-4 text-lime-400 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:text-center">
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">$15</span>
                      <span className="text-zinc-400 ml-2">one-time</span>
                    </div>
                    <a
                      href="https://testerscommunity.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-xl text-black font-semibold"
                    >
                      Get Testers Now
                      <ArrowRightIcon className="w-4 h-4" />
                    </a>
                    <a
                      href="https://testerscommunity.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 text-sm text-zinc-400 hover:text-lime-400 transition-colors"
                    >
                      Learn more about testing requirements
                      <ExternalLinkIcon className="inline w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Trust Us Section */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fully Open Source & Transparent</h2>
              <p className="text-zinc-400 text-lg">See exactly what happens to your files</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <CodeIcon className="w-7 h-7" />,
                  title: "Inspect Our Code",
                  description: "Every line of code is public. Check the GitHub Actions workflow file to see exactly what runs on your files - no secrets, no hidden logic.",
                  action: {
                    text: "View Source Code",
                    href: "https://github.com/Testers-Community/android-aab-signer"
                  },
                  secondaryAction: {
                    text: "See the Workflow",
                    href: "https://github.com/Testers-Community/android-aab-signer/blob/main/.github/workflows/sign.yml"
                  }
                },
                {
                  icon: <TrashIcon className="w-7 h-7" />,
                  title: "No Data Storage",
                  description: "Files are processed in ephemeral GitHub VMs and deleted immediately. We don't store your AAB, keystore, or any credentials. Ever."
                },
                {
                  icon: <UsersIcon className="w-7 h-7" />,
                  title: "Community Trusted",
                  description: "Used by thousands of Android developers. Part of the Testers Community ecosystem trusted by 15,000+ developers."
                }
              ].map((card, index) => (
                <div key={index} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-zinc-800 flex items-center justify-center text-lime-400">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">{card.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {card.action && (
                      <a
                        href={card.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors"
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
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                      >
                        {card.secondaryAction.text}
                        <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Workflow Visualization */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-zinc-800">
                <h2 className="text-2xl font-bold mb-2">Watch It Happen</h2>
                <p className="text-zinc-400">
                  Real-time visibility into the signing process. Every workflow run is public -
                  <span className="text-white"> you can see exactly what code runs on your files.</span>
                </p>
              </div>

              <div className="p-6 sm:p-8 bg-zinc-950/50 font-mono text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lime-400">&#10003;</span>
                    <span className="text-zinc-300">Uploading files securely...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lime-400">&#10003;</span>
                    <span className="text-zinc-300">Triggering GitHub Actions workflow...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 animate-pulse">&#9679;</span>
                    <span className="text-zinc-300">Running jarsigner...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600">&#9675;</span>
                    <span className="text-zinc-500">Verifying signature...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600">&#9675;</span>
                    <span className="text-zinc-500">Ready for download</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  Don't trust us? Check the workflow yourself - it's all open source.
                </p>
                <a
                  href="https://github.com/Testers-Community/android-aab-signer/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-lime-400 hover:text-lime-300 transition-colors font-medium"
                >
                  <GitHubIcon className="w-4 h-4" />
                  View Live Workflow Runs
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-zinc-400 text-lg">Everything you need to know about AAB signing</p>
            </div>

            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8">
              {faqData.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            {/* Support Contact */}
            <div className="mt-8 text-center p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
              <p className="text-zinc-400 mb-2">Still have questions or running into issues?</p>
              <a
                href="mailto:support@testerscommunity.com"
                className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@testerscommunity.com
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Tagline */}
            <a
              href="https://testerscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/tc-icon.webp"
                alt="Testers Community"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div>
                <span className="font-semibold">AAB Signer</span>
                <span className="text-zinc-500 text-sm ml-2">A free tool by Testers Community</span>
              </div>
            </a>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://testerscommunity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Testers Community
              </a>
              <a
                href="https://github.com/Testers-Community/android-aab-signer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                GitHub Repository
              </a>
              <a
                href="https://github.com/Testers-Community/android-aab-signer/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Report an Issue
              </a>
              <a
                href="mailto:support@testerscommunity.com"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>Made with care for Android Developers</p>
            <p>&copy; {new Date().getFullYear()} Testers Community. Open source.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

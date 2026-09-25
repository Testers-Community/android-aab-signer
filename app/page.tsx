'use client';

import { useState, useCallback, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { UploadForm } from '@/components/upload-form';
import { ProgressDisplay, SigningStatus } from '@/components/progress-display';

const REPO_URL = 'https://github.com/Testers-Community/android-aab-signer';

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const faqData = [
  {
    question: "Is it safe to upload my keystore?",
    answer: "It travels over HTTPS, is used for one signing job, and is deleted as soon as that job ends. The job runs on a GitHub-hosted machine that is destroyed afterwards. The workflow file is public, so you can read exactly what touches it."
  },
  {
    question: "What does the signing?",
    answer: "jarsigner from the official Java SDK, using SHA256withRSA. The same tool and algorithm Google documents for App Bundles."
  },
  {
    question: "Can I use this for a production release?",
    answer: "Yes. The output is a production-ready signed bundle, suitable for a Play Store release."
  },
  {
    question: "Where do I get a keystore?",
    answer: "Android Studio generates one under Build, then Generate Signed Bundle or APK. The keytool utility does the same. If your app is already on Google Play, reuse the keystore you published with, or updates will be rejected."
  },
  {
    question: "Is this really free?",
    answer: "Yes. GitHub Actions gives public repositories free compute, and that is what runs the signing. No accounts, no tiers, no rate limits."
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--rule-soft)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-6 py-4 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>{question}</span>
        <ChevronDownIcon className={`mt-1 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p style={{ margin: 0, maxWidth: '68ch', fontSize: 14.5, lineHeight: 1.7, color: 'var(--body)' }}>{answer}</p>
        </div>
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
    <div className="min-h-screen">
      <header style={{ borderBottom: '1px solid var(--rule-soft)' }}>
        <div className="wrap flex h-[64px] items-center justify-between">
          <a href="https://testerscommunity.com" target="_blank" rel="noopener noreferrer" className="group flex items-baseline gap-2.5">
            <span className="text-[16px] font-bold tracking-[-0.02em] transition-opacity group-hover:opacity-60" style={{ color: 'var(--ink)', fontFamily: 'var(--font-jakarta)' }}>
              AAB Signer
            </span>
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Testers Community</span>
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-medium transition-opacity hover:opacity-60" style={{ color: 'var(--ink)' }}>
            Source
          </a>
        </div>
      </header>

      {/* ── The tool. Instructions, then the form, nothing above either. ── */}
      <main className="wrap" style={{ paddingTop: 44, paddingBottom: 72 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
            fontSize: 'clamp(28px, 3.4vw, 40px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: 'var(--ink)',
          }}
        >
          Sign your Android App Bundle
        </h1>

        <p style={{ margin: '14px 0 0', maxWidth: '74ch', fontSize: 16, lineHeight: 1.6, color: 'var(--body)' }}>
          Upload the unsigned <span className="mono" style={{ fontSize: 14.5 }}>.aab</span> and the keystore you
          built it with, add the alias and passwords, and you get a signed bundle back in about
          thirty seconds. Your keystore is used once and deleted when the job ends.
        </p>

        <div style={{ marginTop: 34 }}>
          <UploadForm onSubmit={handleSubmit} disabled={isProcessing} />
        </div>

        {/* One quiet line of provenance under the form, not a section. */}
        <p style={{ marginTop: 26, fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>
          Signing runs as a public GitHub Actions job using{' '}
          <span className="mono" style={{ fontSize: 12.5 }}>jarsigner</span>{' '}
          with SHA256withRSA, then the machine and both uploads are destroyed.{' '}
          <a href={`${REPO_URL}/blob/main/.github/workflows/sign.yml`} target="_blank" rel="noopener noreferrer" className="textlink" style={{ fontSize: 13.5 }}>
            Read the workflow
          </a>
        </p>
      </main>

      {/* ── Everything else is reference, kept below the fold and compact ── */}
      <section className="warm" style={{ borderTop: '1px solid var(--rule-soft)' }}>
        <div className="wrap" style={{ paddingTop: 52, paddingBottom: 52 }}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-16">
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                color: 'var(--ink)',
              }}
            >
              Questions
            </h2>
            <div style={{ borderTop: '1px solid var(--rule)' }}>
              {faqData.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
              <p style={{ paddingTop: 18, fontSize: 13.5, color: 'var(--muted)' }}>
                Something not working?{' '}
                <a href="mailto:support@testerscommunity.com" className="textlink" style={{ fontSize: 13.5 }}>
                  support@testerscommunity.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="wrap" style={{ paddingTop: 26, paddingBottom: 26 }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ fontSize: 13, color: 'var(--muted)' }}>
            <p style={{ margin: 0 }}>
              A free tool by{' '}
              <a href="https://testerscommunity.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                Testers Community
              </a>
              , who run Google Play closed tests. Open source, AGPL-3.0.
            </p>
            <nav className="flex flex-wrap gap-x-6 gap-y-1">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--ink)]">Repository</a>
              <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--ink)]">Report an issue</a>
            </nav>
          </div>
        </div>
      </footer>

      {showSigningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(20,18,15,0.5)' }} role="dialog" aria-modal="true">
          <div className="animate-fade-in w-full max-w-md" style={{ background: 'var(--paper)', borderRadius: 12, padding: 28, boxShadow: '0 30px 70px -20px rgba(20,18,15,0.4)' }}>
            <ProgressDisplay status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
          </div>
        </div>
      )}
    </div>
  );
}

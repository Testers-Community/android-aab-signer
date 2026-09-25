'use client';

import { useState, useCallback, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { UploadForm } from '@/components/upload-form';
import { ProgressDisplay, SigningStatus } from '@/components/progress-display';

const REPO_URL = 'https://github.com/Testers-Community/android-aab-signer';

/* --------------------------------------------------------------- Icons ---
 * Line icons at a single stroke weight. They label things; they are never
 * placed inside a tinted tile as decoration.
 * ------------------------------------------------------------------------ */

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const GitHubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

/* ------------------------------------------------------------------ Data */

const faqData = [
  {
    question: "Is this really free?",
    answer: "Yes. GitHub Actions gives public repositories free compute, and that is what runs the signing. There are no paid tiers, no accounts, and no rate limits."
  },
  {
    question: "Is it safe to upload my keystore?",
    answer: "Your keystore travels over HTTPS, is used for one signing job, and is deleted as soon as that job ends. The job runs on a GitHub-hosted machine that is destroyed afterwards. Every line of that process is in the public workflow file, so you can read it rather than trust it."
  },
  {
    question: "Why does an AAB need signing at all?",
    answer: "Google Play will only accept a bundle signed with your own private key. If your build pipeline produces an unsigned bundle, or you need to re-sign one, it has to be signed before Play Console will take it."
  },
  {
    question: "What does the signing?",
    answer: "jarsigner from the official Java SDK, using SHA256withRSA. That is the same tool and algorithm Google documents for App Bundles."
  },
  {
    question: "Can I use this for a production release?",
    answer: "Yes. The output is a production-ready signed bundle, suitable for a Play Store release."
  },
  {
    question: "Where do I get a keystore?",
    answer: "Android Studio can generate one under Build, then Generate Signed Bundle or APK. The keytool command line utility does the same. If your app is already on Google Play, reuse the keystore you published with, or updates will be rejected."
  }
];

/* -------------------------------------------------------------- Fragments */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: 'var(--rule)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-6 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
          {question}
        </span>
        <ChevronDownIcon
          className={`mt-1 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="max-w-[62ch] text-[15px] leading-[1.7]" style={{ color: 'var(--muted)' }}>
            {answer}
          </p>
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
      {/* Masthead: a wordmark and one link. No pills, no chrome. */}
      <header className="relative z-20">
        <div className="mx-auto flex h-[72px] max-w-[1140px] items-center justify-between px-6">
          <a
            href="https://testerscommunity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-baseline gap-2.5"
          >
            <span
              className="text-[17px] font-bold tracking-[-0.03em] transition-opacity group-hover:opacity-60"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-jakarta)' }}
            >
              AAB Signer
            </span>
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
              Testers Community
            </span>
          </a>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-medium transition-opacity hover:opacity-60"
            style={{ color: 'var(--ink)' }}
          >
            <GitHubIcon className="w-[15px] h-[15px]" />
            Source
          </a>
        </div>
      </header>

      {/* ---------------------------------------------------------- Hero ---
          The tool is the hero. Copy on the left, the working surface on the
          right, both above the fold. The wash is short and dissolves into
          paper so nothing has to be read on a saturated field. */}
      <section className="hero-wash relative -mt-[72px] pt-[72px]">
        <div className="mx-auto max-w-[1140px] px-6 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            {/* Left: what this is */}
            <div className="lg:pt-1">
              <h1 style={{ color: 'var(--ink)' }}>
                Sign an Android
                <br />
                App Bundle.
              </h1>

              <p
                className="mt-6 max-w-[46ch] text-[17px] leading-[1.7]"
                style={{ color: 'var(--ink-2)' }}
              >
                Drop in your unsigned <span className="mono text-[15px]">.aab</span> and your keystore.
                You get back a signed bundle Play Console will accept. No Android Studio,
                no Java install, no command line.
              </p>

              <p
                className="mt-6 max-w-[46ch] text-[15px] leading-[1.7]"
                style={{ color: 'var(--muted)' }}
              >
                No sign-up. Your keystore is used for one signing job and deleted
                the moment it finishes.
              </p>

              <div className="mt-8 flex items-center gap-2.5 text-[14px]" style={{ color: 'var(--muted)' }}>
                <GitHubIcon className="w-4 h-4" />
                <span>
                  Signing runs on GitHub Actions, in the open.{' '}
                  <a
                    href={`${REPO_URL}/blob/main/.github/workflows/sign.yml`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-[3px] decoration-[1.5px]"
                    style={{ color: 'var(--live)', textDecorationColor: 'rgba(5,74,218,0.32)' }}
                  >
                    Read the workflow
                  </a>
                </span>
              </div>
            </div>

            {/* Right: the one raised surface on the page */}
            <div className="surface p-6 sm:p-7">
              <UploadForm onSubmit={handleSubmit} disabled={isProcessing} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Mechanism ---
          A real sequence, so it is numbered. Kept as one horizontal run
          rather than four cards. */}
      <section className="rule-top">
        <div className="mx-auto max-w-[1140px] px-6 py-16 lg:py-20">
          <h2 className="max-w-[20ch]">What happens to your files</h2>

          <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '1',
                t: 'You upload',
                d: 'The bundle and keystore are held only long enough to start a signing job.',
              },
              {
                n: '2',
                t: 'A job starts',
                d: 'A GitHub-hosted machine picks them up. The run is public, with a URL you can open.',
              },
              {
                n: '3',
                t: 'jarsigner runs',
                d: 'SHA256withRSA, the tool and algorithm Google documents for App Bundles.',
              },
              {
                n: '4',
                t: 'Everything is destroyed',
                d: 'The machine is torn down, the uploads are deleted, and the signed bundle is yours.',
              },
            ].map((s) => (
              <li key={s.n}>
                <div
                  className="mono pb-3 text-[13px] font-medium"
                  style={{ color: 'var(--live)' }}
                >
                  {s.n}
                </div>
                <div className="border-t pt-4" style={{ borderColor: 'var(--rule-2)' }}>
                  <h3 style={{ color: 'var(--ink)' }}>{s.t}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------- Verifiability */}
      <section className="rule-top">
        <div className="mx-auto max-w-[1140px] px-6 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-20">
            <div>
              <h2 className="max-w-[19ch]">You do not have to trust us</h2>
              <p
                className="mt-5 max-w-[46ch] text-[15.5px] leading-[1.7]"
                style={{ color: 'var(--muted)' }}
              >
                Every signing job is a public GitHub Actions run. You can read the
                workflow before you upload anything, and watch your own job while it
                executes.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[14.5px] font-medium">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-[3px] decoration-[1.5px]"
                  style={{ color: 'var(--live)', textDecorationColor: 'rgba(5,74,218,0.32)' }}
                >
                  Source code
                </a>
                <a
                  href={`${REPO_URL}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-[3px] decoration-[1.5px]"
                  style={{ color: 'var(--live)', textDecorationColor: 'rgba(5,74,218,0.32)' }}
                >
                  Live signing runs
                </a>
              </div>
            </div>

            {/* The mechanism, shown rather than described. */}
            <div className="tc-code p-5 sm:p-6">
              <div className="flex items-center gap-2.5 pb-4 text-[12px]" style={{ color: 'rgba(242,239,234,0.44)' }}>
                <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: 'rgba(242,239,234,0.3)' }} />
                .github/workflows/sign.yml
              </div>
              <pre className="whitespace-pre" style={{ color: 'rgba(242,239,234,0.9)' }}>
{`- name: Sign bundle
  run: |
    jarsigner \\
      -sigalg SHA256withRSA \\
      -digestalg SHA-256 \\
      -keystore "$KEYSTORE" \\
      app.aab "$KEY_ALIAS"

- name: Shred inputs
  if: always()
  run: rm -f "$KEYSTORE" app.aab`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section className="rule-top">
        <div className="mx-auto max-w-[1140px] px-6 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-20">
            <h2 className="max-w-[14ch]">Questions</h2>
            <div className="border-t" style={{ borderColor: 'var(--rule)' }}>
              {faqData.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
              <p className="pt-6 text-[14.5px]" style={{ color: 'var(--muted)' }}>
                Something not working?{' '}
                <a
                  href="mailto:support@testerscommunity.com"
                  className="font-medium underline underline-offset-[3px] decoration-[1.5px]"
                  style={{ color: 'var(--live)', textDecorationColor: 'rgba(5,74,218,0.32)' }}
                >
                  support@testerscommunity.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Closed testing ---
          The sibling product, stated plainly on the sand tone rather than as
          another coloured slab. */}
      <section
        className="rule-top"
        style={{ background: 'color-mix(in srgb, var(--sand) 38%, var(--paper))' }}
      >
        <div className="mx-auto max-w-[1140px] px-6 py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] lg:gap-20">
            <div>
              <h2 className="max-w-[20ch]">Signed the bundle. Now you need testers.</h2>
              <p
                className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.7]"
                style={{ color: 'var(--ink-2)' }}
              >
                Google Play will not grant production access until 12 testers have
                opted in and stayed for 14 consecutive days. Testers Community runs
                that closed test for you. 10,000+ apps have been published
                through it.
              </p>

              <dl className="mt-8 grid max-w-[34rem] grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                {[
                  ['15', 'testers, in 6 hours'],
                  ['16', 'days of testing'],
                  ['99.9%', 'success rate'],
                  ['$15', 'one-time'],
                ].map(([v, l]) => (
                  <div key={l} className="border-t pt-3" style={{ borderColor: 'var(--rule-2)' }}>
                    <dt
                      className="text-[22px] font-bold tracking-[-0.03em]"
                      style={{ color: 'var(--ink)', fontFamily: 'var(--font-jakarta)' }}
                    >
                      {v}
                    </dt>
                    <dd className="mt-0.5 text-[13.5px] leading-snug" style={{ color: 'var(--muted)' }}>
                      {l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:justify-self-end">
              <a
                href="https://testerscommunity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Get testers
              </a>
              <p className="mt-3 text-[13.5px]" style={{ color: 'var(--muted)' }}>
                Production access approved, or your money back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Footer */}
      <footer className="rule-top">
        <div className="mx-auto max-w-[1140px] px-6 py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13.5px]" style={{ color: 'var(--muted)' }}>
              A free tool by{' '}
              <a
                href="https://testerscommunity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline underline-offset-[3px]"
                style={{ color: 'var(--ink)' }}
              >
                Testers Community
              </a>
              . Open source, AGPL-3.0.
            </p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-[3px]" style={{ color: 'var(--muted)' }}>
                Repository
              </a>
              <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-[3px]" style={{ color: 'var(--muted)' }}>
                Report an issue
              </a>
              <a href="mailto:support@testerscommunity.com" className="hover:underline underline-offset-[3px]" style={{ color: 'var(--muted)' }}>
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------ Result ---
          The one animated moment on the page. */}
      {showSigningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,22,21,0.42)', backdropFilter: 'blur(3px)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-fade-in w-full max-w-md rounded-[18px] p-6 sm:p-7" style={{ background: 'var(--paper-2)', boxShadow: '0 24px 64px -12px rgba(26,22,21,0.3)' }}>
            <ProgressDisplay
              status={status}
              error={error}
              downloadUrl={downloadUrl}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
    </div>
  );
}

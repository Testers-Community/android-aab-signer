'use client';

import { useState, useCallback, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { UploadForm } from '@/components/upload-form';
import { ProgressDisplay, SigningStatus } from '@/components/progress-display';

const REPO_URL = 'https://github.com/Testers-Community/android-aab-signer';

const Arrow = (
  <svg viewBox="0 0 20 20" fill="none" width="15" height="15" aria-hidden="true">
    <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const FIGURES = [
  ['100 MB', 'largest bundle accepted'],
  ['~30 s', 'typical signing time'],
  ['0 bytes', 'kept after the job ends'],
  ['AGPL-3.0', 'every line readable'],
];

const faqData = [
  {
    question: "Is this really free?",
    answer: "Yes. GitHub Actions gives public repositories free compute, and that is what runs the signing. There are no paid tiers, no accounts, and no rate limits."
  },
  {
    question: "Is it safe to upload my keystore?",
    answer: "Your keystore travels over HTTPS, is used for one signing job, and is deleted as soon as that job ends. The job runs on a GitHub-hosted machine that is destroyed afterwards. Every line of that process sits in the public workflow file, so you can read it rather than trust it."
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--rule-soft)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-8 py-6 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="h3">{question}</span>
        <ChevronDownIcon className={`mt-1 w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr] pb-7' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden"><p className="prose">{answer}</p></div>
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
    <div>
      {/* Masthead: a wordmark and one link. */}
      <header className="relative z-20">
        <div className="wrap flex h-[76px] items-center justify-between">
          <a href="https://testerscommunity.com" target="_blank" rel="noopener noreferrer" className="group flex items-baseline gap-2.5">
            <span className="h3 transition-opacity group-hover:opacity-60" style={{ fontWeight: 700 }}>AAB Signer</span>
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Testers Community</span>
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium transition-opacity hover:opacity-60" style={{ color: 'var(--ink)' }}>
            Source
          </a>
        </div>
      </header>

      {/* ═══ 01 Hero ═══ */}
      <section style={{ padding: '92px 0 0' }}>
        <div className="wrap">
          <p className="kicker">Free and open source</p>
          <h1 className="h1">
            Sign an Android
            <br />
            App Bundle.
          </h1>

          <div style={{ marginTop: 44, paddingBottom: 72 }}>
            <p className="lede">
              <b>
                AAB Signer signs an unsigned Android App Bundle with your own keystore,
                in the browser, so Google Play will accept it.
              </b>{' '}
              No Android Studio, no Java install, no command line. Your keystore is used
              for one signing job and deleted the moment it finishes.
            </p>
            <div className="acts">
              <a href="#sign" className="btn">Sign a bundle{Arrow}</a>
              <a href={`${REPO_URL}/blob/main/.github/workflows/sign.yml`} target="_blank" rel="noopener noreferrer" className="textlink">
                Read the workflow
              </a>
            </div>
          </div>
        </div>

        <div className="wrap">
          <dl className="figures">
            {FIGURES.map(([v, l]) => (
              <div key={l} className="figure">
                <dt className="figure__value">{v}</dt>
                <dd className="figure__label">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══ 02 The tool ═══ */}
      <section id="sign" className="warm section">
        <div className="wrap">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-20">
            <div>
              <p className="kicker">Sign</p>
              <h2 className="h2">Two files,<br />four fields.</h2>
              <p className="prose" style={{ marginTop: 22 }}>
                Drop in the bundle and the keystore it was built against, then the alias
                and passwords that unlock it. Nothing leaves your browser until you submit.
              </p>
            </div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 14, padding: 30 }}>
              <UploadForm onSubmit={handleSubmit} disabled={isProcessing} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 03 The flat ink spread ═══ */}
      <section className="spread">
        <div className="wrap">
          <p className="kicker">Verifiable</p>
          <h2 className="h2">You do not have<br />to trust us.</h2>
          <p className="lede" style={{ marginTop: 22, color: 'rgba(255,255,255,0.72)' }}>
            Signing runs as a public GitHub Actions job. You can read exactly what touches
            your keystore before you upload it, and watch your own job while it runs.
          </p>

          <div className="cols-2" style={{ marginTop: 64, paddingTop: 46, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
            <div>
              <div className="code p-5">
                <div className="pb-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>.github/workflows/sign.yml</div>
                <pre className="whitespace-pre">
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

            <div className="ruled" style={{ borderTopColor: 'rgba(255,255,255,0.14)' }}>
              {[
                ['Uploaded', 'The bundle and keystore are held only long enough to start a job.'],
                ['Signed', 'jarsigner runs on a GitHub-hosted machine, with SHA256withRSA.'],
                ['Shredded', 'The machine is destroyed and the uploads are deleted, pass or fail.'],
              ].map(([t, d]) => (
                <div key={t} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                  <h3 className="h3">{t}</h3>
                  <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.62)' }}>{d}</p>
                </div>
              ))}
              <div style={{ borderBottom: 'none' }}>
                <a href={`${REPO_URL}/actions`} target="_blank" rel="noopener noreferrer" className="textlink">
                  Watch live signing runs
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 04 Questions ═══ */}
      <section className="section">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-20">
            <div>
              <p className="kicker">Questions</p>
              <h2 className="h2">Before you<br />upload.</h2>
            </div>
            <div style={{ borderTop: '1px solid var(--rule)' }}>
              {faqData.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
              <p className="note" style={{ paddingTop: 26 }}>
                Something not working?{' '}
                <a href="mailto:support@testerscommunity.com" className="textlink" style={{ fontSize: 13.5 }}>
                  support@testerscommunity.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 05 The other half of shipping ═══ */}
      <section className="warm section">
        <div className="wrap">
          <p className="kicker">Testers Community</p>
          <h2 className="h2">Signed the bundle.<br />Now you need testers.</h2>
          <p className="lede" style={{ marginTop: 22 }}>
            Google Play will not grant production access until 12 testers have opted in
            and stayed for 14 consecutive days. We run that closed test for you.
          </p>

          <dl className="figures" style={{ marginTop: 56 }}>
            {[
              ['10,000+', 'apps published'],
              ['15', 'testers, assigned in 6 hours'],
              ['16', 'days of testing'],
              ['99.9%', 'success rate'],
            ].map(([v, l]) => (
              <div key={l} className="figure">
                <dt className="figure__value">{v}</dt>
                <dd className="figure__label">{l}</dd>
              </div>
            ))}
          </dl>

          <div className="acts">
            <a href="https://testerscommunity.com" target="_blank" rel="noopener noreferrer" className="btn">
              See the plans{Arrow}
            </a>
            <span className="note">Production access approved, or your money back.</span>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="note">
              A free tool by{' '}
              <a href="https://testerscommunity.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                Testers Community
              </a>
              . Open source, AGPL-3.0.
            </p>
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[13.5px]" style={{ color: 'var(--muted)' }}>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--ink)]">Repository</a>
              <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--ink)]">Report an issue</a>
              <a href="mailto:support@testerscommunity.com" className="hover:text-[color:var(--ink)]">Contact</a>
            </nav>
          </div>
        </div>
      </footer>

      {showSigningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(20,18,15,0.5)' }} role="dialog" aria-modal="true">
          <div className="animate-fade-in w-full max-w-md" style={{ background: 'var(--paper)', borderRadius: 14, padding: 30, boxShadow: '0 30px 70px -20px rgba(20,18,15,0.4)' }}>
            <ProgressDisplay status={status} error={error} downloadUrl={downloadUrl} onReset={handleReset} />
          </div>
        </div>
      )}
    </div>
  );
}

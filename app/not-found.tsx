import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist. Return to AAB Signer to sign your Android App Bundles.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="tc-canvas relative flex min-h-screen items-center justify-center overflow-hidden">
      <div aria-hidden="true" className="tc-dots pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: 'rgba(5,74,218,0.06)' }}
      />

      <div className="relative z-10 max-w-md px-6 text-center">
        <span
          className="inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium"
          style={{
            background: 'rgba(5,74,218,0.07)',
            border: '1px solid rgba(5,74,218,0.15)',
            color: '#054ada',
          }}
        >
          404
        </span>

        <h1
          className="mt-6 mb-4 text-[30px] font-bold leading-[1.15] sm:text-[36px]"
          style={{ color: '#1a1615', letterSpacing: '-1px' }}
        >
          Page not found
        </h1>

        <p className="mb-8 text-[16px] leading-[1.7]" style={{ color: '#5a6272' }}>
          The page you are looking for does not exist or has moved.
          Let us get you back to signing AAB files.
        </p>

        <Link href="/" className="btn-primary px-6 py-3.5 text-[15px]">
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to AAB Signer
        </Link>

        <div className="mt-10 border-t pt-8" style={{ borderColor: 'rgba(26,22,21,0.08)' }}>
          <p className="mb-4 text-[13px]" style={{ color: '#94a3b8' }}>Or head to one of these:</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13.5px]">
            <a
              href="https://github.com/Testers-Community/android-aab-signer"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:underline underline-offset-2"
              style={{ color: '#5a6272' }}
            >
              GitHub repo
            </a>
            <a
              href="https://testerscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:underline underline-offset-2"
              style={{ color: '#5a6272' }}
            >
              Testers Community
            </a>
            <a
              href="mailto:support@testerscommunity.com"
              className="transition-colors hover:underline underline-offset-2"
              style={{ color: '#5a6272' }}
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

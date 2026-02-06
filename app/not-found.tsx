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
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 radial-gradient pointer-events-none" />
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md px-6">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl font-bold bg-gradient-to-r from-lime-400 to-lime-500 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-zinc-400 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to signing AAB files.
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-xl transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to AAB Signer
        </Link>

        {/* Helpful links */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-sm text-zinc-500 mb-4">Or check out these resources:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="https://github.com/Testers-Community/android-aab-signer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-lime-400 transition-colors"
            >
              GitHub Repo
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="https://testerscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-lime-400 transition-colors"
            >
              Testers Community
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="mailto:support@testerscommunity.com"
              className="text-zinc-400 hover:text-lime-400 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

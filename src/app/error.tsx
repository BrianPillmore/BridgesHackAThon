"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-200">
          Unexpected error
        </p>
        <h1 className="mt-4 text-4xl font-bold text-white">The demo hit a recoverable problem.</h1>
        <p className="mt-4 leading-7 text-slate-400">
          Retry once. If it fails again, use the documented fallback flow rather than debugging
          live.
        </p>
        <button
          className="mt-7 min-h-11 rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

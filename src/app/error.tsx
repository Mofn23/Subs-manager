"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-4">
      <h2 className="text-xl font-semibold text-apple-text">Something went wrong</h2>
      <p className="text-xs text-apple-secondary">An unexpected error occurred in Subs Manager.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition"
      >
        Try Again
      </button>
    </div>
  );
}

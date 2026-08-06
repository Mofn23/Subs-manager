"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[#FAFAF9] font-sans">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1C1C1E]">Global Application Error</h2>
          <p className="text-xs text-[#6E6E73]">A critical error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-[#1C1C1E] text-white text-xs font-medium"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}

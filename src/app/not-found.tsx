import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h2 className="text-2xl font-semibold text-apple-text">Page Not Found</h2>
      <p className="text-xs text-apple-secondary">The requested page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

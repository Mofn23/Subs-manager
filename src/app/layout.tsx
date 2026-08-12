import { Providers } from "@/components/common/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { MonaiBottomNav } from "@/components/ui/MonaiBottomNav";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subs Manager - Calm, Apple-inspired Subscription Tracker",
  description:
    "Ultraminimal personal & family subscription management. Direct renewal timeline, cost annualization, trial tracking, leak detection, and cancellation workflow.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-apple-bg text-apple-text antialiased selection:bg-blue-100 selection:text-blue-900 touch-manipulation">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-24">
            {children}
          </main>
          <MonaiBottomNav />
          <footer className="border-t border-apple-border py-6 text-center text-xs text-apple-tertiary">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Subs Manager • Designed with Apple HIG minimalism</span>
              <span>100% Private • Local Data Sovereignty</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { clearAllNotifications, markNotificationAsRead } from "@/app/actions/notifications";
import { MonaiBottomNav } from "@/components/ui/MonaiBottomNav";
import { MonaiDropdown, MonaiDropdownItem } from "@/components/ui/MonaiDropdown";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date | string;
}

export function Navbar({ notifications = [] }: { notifications?: NotificationItem[] }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [notifList, setNotifList] = useState(notifications);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifList(notifications);
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationAsRead(id);
  };

  const handleClearAll = async () => {
    setNotifList([]);
    await clearAllNotifications();
  };

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const periodMenuItems: MonaiDropdownItem[] = [
    {
      label: "Month ✓",
      onClick: () => setSelectedPeriod("Month"),
    },
    {
      label: "Year",
      onClick: () => setSelectedPeriod("Year"),
    },
    {
      label: "All time",
      onClick: () => setSelectedPeriod("All time"),
    },
    {
      label: "Custom range",
      onClick: () => setSelectedPeriod("Custom range"),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--bg-app)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] transition-all pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* TopBar MonAI: Pill izquierda ‹Periodo/Mes› ⌄ (56px alto, r28, borde sutil) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group" aria-label="SubsManager Home">
              <div className="w-11 h-11 rounded-2xl bg-[var(--coral)] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
            </Link>

            {session?.user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                  className="h-12 px-4 rounded-[24px] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-black text-[var(--text-primary)] backdrop-blur-md transition-all duration-150 flex items-center gap-2 monai-press active:scale-95 shadow-sm"
                  aria-label="Period selector"
                >
                  <span>{selectedPeriod}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                      showPeriodMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <MonaiDropdown
                  isOpen={showPeriodMenu}
                  onClose={() => setShowPeriodMenu(false)}
                  items={periodMenuItems}
                  align="left"
                />
              </div>
            )}
          </div>

          {/* TopBar MonAI: Botones circulares 56px derecha */}
          {session?.user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Settings Link Button (56px circle) */}
              <Link
                href="/settings"
                className={`w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm ${
                  pathname === "/settings" ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border-white/20" : ""
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5 stroke-[2]" />
              </Link>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm"
                aria-label="Toggle Dark/Light theme"
                title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-[var(--amber)]" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[var(--coral)] ring-2 ring-[var(--bg-app)] animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown Sheet */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[var(--surface)] rounded-[24px] shadow-2xl border border-[var(--border)] p-4 z-50 animate-menu-scale-in text-[var(--text-primary)] backdrop-blur-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--coral)] text-white font-black">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {notifList.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifList.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-secondary)] text-xs font-bold">
                          No notifications. Everything is calm!
                        </div>
                      ) : (
                        notifList.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 rounded-2xl transition-all border text-xs ${
                              notif.read
                                ? "bg-[var(--tag)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                                : "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-primary)] font-bold"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-black text-sm mb-0.5">{notif.title}</p>
                                <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">{notif.message}</p>
                              </div>
                              {!notif.read && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkRead(notif.id)}
                                  className="p-1 text-[var(--green)] hover:bg-white/10 rounded-lg transition"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--coral)] hover:bg-[var(--coral)]/10 transition flex items-center justify-center monai-press active:scale-90 shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-[var(--coral)] text-white text-xs font-black hover:opacity-90 transition shadow-lg monai-press"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Floating MonAI Bottom Navigation Bar */}
      {session?.user && <MonaiBottomNav />}
    </>
  );
}

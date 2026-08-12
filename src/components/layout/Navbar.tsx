"use client";

import { MonaiDropdown, MonaiDropdownItem } from "@/components/ui/MonaiDropdown";
import {
  clearAllLocalNotifications,
  getLocalNotifications,
  getLocalSubscriptions,
  LocalNotificationItem,
  markLocalNotificationAsRead,
} from "@/lib/storage";
import {
  Bell,
  Check,
  ChevronDown,
  Moon,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Navbar({ notifications = [] }: { notifications?: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [notifList, setNotifList] = useState<LocalNotificationItem[]>([]);
  const [toCancelCount, setToCancelCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);

  const refreshNavbarState = () => {
    const localNotifs = getLocalNotifications();
    setNotifList(localNotifs);

    const subs = getLocalSubscriptions();
    const count = subs.filter((s) => s.status === "TO_CANCEL" || s.status === "TRIAL").length;
    setToCancelCount(count);
  };

  useEffect(() => {
    refreshNavbarState();

    const handleStorageUpdate = () => refreshNavbarState();
    window.addEventListener("storage_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

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

  const handleMarkRead = (id: string) => {
    markLocalNotificationAsRead(id);
    refreshNavbarState();
  };

  const handleClearAll = () => {
    clearAllLocalNotifications();
    refreshNavbarState();
  };

  const { resolvedTheme, setTheme } = useTheme();
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
    <header className="sticky top-0 z-40 bg-[var(--bg-app)]/90 backdrop-blur-2xl border-b border-[var(--border-subtle)] transition-all pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Left Bar: MonAI Logo + Period Selector Pill */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center group" aria-label="SubsManager Home">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--coral)] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="h-10 sm:h-12 px-3.5 sm:px-4 rounded-[24px] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs sm:text-sm font-black text-[var(--text-primary)] backdrop-blur-md transition-all duration-150 flex items-center gap-2 monai-press active:scale-95 shadow-sm"
              aria-label="Period selector"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
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
        </div>

        {/* Right Bar: Action Icons ALWAYS Visible (No Sign-in required) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cancellation Center Link with Badge */}
          <Link
            href="/cancellation"
            className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--coral)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm ${
              pathname === "/cancellation" ? "bg-[var(--surface-elevated)] text-[var(--coral)] border-[var(--coral)]/40" : ""
            }`}
            title="Cancellation Center"
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            {toCancelCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[var(--coral)] text-white ring-2 ring-[var(--bg-app)]">
                {toCancelCount}
              </span>
            )}
          </Link>

          {/* Settings Link Button */}
          <Link
            href="/settings"
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm ${
              pathname === "/settings" ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border-white/20" : ""
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm"
            aria-label="Toggle Dark/Light theme"
            title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--amber)]" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition flex items-center justify-center monai-press active:scale-90 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--coral)] ring-2 ring-[var(--bg-app)] animate-pulse" />
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
                            <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">
                              {notif.message}
                            </p>
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
        </div>
      </div>
    </header>
  );
}

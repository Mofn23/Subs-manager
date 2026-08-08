"use client";

import { clearAllNotifications, markNotificationAsRead } from "@/app/actions/notifications";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  LogOut,
  Moon,
  PieChart,
  Settings,
  ShieldAlert,
  Sparkles,
  Sun,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifList(notifications);
  }, [notifications]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
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

  const navLinks = [
    { label: "Dashboard", href: "/", icon: CreditCard },
    { label: "Timeline", href: "/timeline", icon: Calendar },
    { label: "Insights", href: "/insights", icon: PieChart },
    { label: "Cancellation", href: "/cancellation", icon: ShieldAlert },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLink = navLinks.find((link) => link.href === pathname) || navLinks[0];
  const ActiveIcon = activeLink.icon;

  return (
    <header className="sticky top-0 z-40 bg-apple-bg/80 dark:bg-[#0C0C0E]/80 backdrop-blur-xl border-b border-apple-border dark:border-white/10 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo - Logo Icon Only */}
        <Link href="/" className="flex items-center group" aria-label="SubsManager Home">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
        </Link>

        {/* Minimal Single-Button Glassmorphism Menu Selector */}
        {session?.user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-apple-border dark:border-white/10 text-xs font-semibold text-apple-text dark:text-white backdrop-blur-md transition-all shadow-sm active:scale-95"
              aria-label="Toggle navigation menu"
            >
              <ActiveIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-apple-text dark:text-white">{activeLink.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-apple-secondary dark:text-neutral-400 transition-transform duration-200 ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Apple Glassmorphism Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-neutral-900/90 dark:bg-[#16161A]/95 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                <div className="space-y-0.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? "bg-white/15 text-white font-semibold"
                            : "text-white/70 hover:bg-white/10 hover:text-white font-normal"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-white/60"}`} />
                          <span>{link.label}</span>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-blue-400" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Actions */}
        {session?.user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-transparent"
              aria-label="Toggle Dark/Light theme"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-transparent"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-apple-bg dark:ring-[#0C0C0E] animate-pulse" />
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-apple-modal border border-apple-border p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-apple-border mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-apple-text text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-apple-accent-soft text-apple-accent font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifList.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-[11px] text-apple-tertiary hover:text-apple-secondary transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifList.length === 0 ? (
                      <div className="text-center py-8 text-apple-tertiary text-xs">
                        No notifications. Everything is calm!
                      </div>
                    ) : (
                      notifList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl transition-all border text-xs ${
                            notif.read
                              ? "bg-apple-bg/50 border-apple-border text-apple-secondary"
                              : "bg-apple-accent-soft/40 border-blue-100 text-apple-text font-medium"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-apple-text mb-0.5">{notif.title}</p>
                              <p className="text-apple-secondary font-normal leading-relaxed">{notif.message}</p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="p-1 text-apple-accent hover:bg-blue-100 rounded-lg transition"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
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
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl text-apple-secondary hover:text-apple-danger hover:bg-apple-danger-soft transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

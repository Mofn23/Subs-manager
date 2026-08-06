"use client";

import { clearAllNotifications, markNotificationAsRead } from "@/app/actions/notifications";
import { Bell, Calendar, Check, CreditCard, LogOut, PieChart, ShieldAlert, Sparkles, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [notifList, setNotifList] = useState(notifications);

  useEffect(() => {
    setNotifList(notifications);
  }, [notifications]);

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

  return (
    <header className="sticky top-0 z-40 bg-apple-bg/80 backdrop-blur-md border-b border-apple-border transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-apple-text tracking-tight text-lg">
            Subs<span className="font-normal text-apple-secondary">Manager</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        {session?.user && (
          <nav className="hidden md:flex items-center gap-1 bg-black/5 p-1 rounded-2xl border border-apple-border">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-apple-text shadow-apple"
                      : "text-apple-secondary hover:text-apple-text hover:bg-white/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        {session?.user ? (
          <div className="flex items-center gap-3">
            {/* Currency indicator */}
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-xl bg-apple-accent-soft text-apple-accent text-xs font-medium border border-blue-100">
              {session.user.currency} Base Currency
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-apple-secondary hover:text-apple-text hover:bg-white/80 transition-all border border-transparent hover:border-apple-border"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-apple-bg animate-pulse" />
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

      {/* Mobile Nav Bar */}
      {session?.user && (
        <div className="md:hidden flex items-center justify-around border-t border-apple-border bg-white px-2 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl transition-all ${
                  isActive ? "text-apple-accent font-semibold" : "text-apple-secondary hover:text-apple-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

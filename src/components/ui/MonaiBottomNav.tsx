"use client";

import { Calendar, CreditCard, PieChart, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MonaiBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: CreditCard },
    { label: "Timeline", href: "/timeline", icon: Calendar },
    { label: "Insights", href: "/insights", icon: PieChart },
    { label: "Cancelar", href: "/cancellation", icon: ShieldAlert },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] sm:max-w-none">
      <nav className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-full bg-[var(--surface-elevated)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-black transition-all duration-150 monai-press active:scale-95 shrink-0 ${
                isActive
                  ? "bg-white text-black shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-black stroke-[2.5]" : "text-[var(--text-secondary)]"}`} />
              <span className="text-[11px] sm:text-xs font-black whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

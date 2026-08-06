"use client";

import { formatCurrency, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { AlertTriangle, Calendar, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface AttentionSectionProps {
  subscriptions: SubscriptionItem[];
  currency: string;
}

export function AttentionSection({ subscriptions, currency }: AttentionSectionProps) {
  const referenceDate = new Date();

  // Expiring trials (within 7 days)
  const expiringTrials = subscriptions.filter((s) => {
    if (s.status !== "TRIAL" || !s.trialEndDate) return false;
    const days = getDaysUntil(s.trialEndDate, referenceDate);
    return days >= 0 && days <= 7;
  });

  // Upcoming renewals within 7 days
  const upcomingRenewals = subscriptions.filter((s) => {
    if (s.status !== "ACTIVE" && s.status !== "TO_CANCEL") return false;
    const days = getDaysUntil(s.nextRenewalDate, referenceDate);
    return days >= 0 && days <= 7;
  });

  if (expiringTrials.length === 0 && upcomingRenewals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary px-1">
        Requires Attention
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Expiring Trials Card */}
        {expiringTrials.map((trial) => {
          const daysLeft = getDaysUntil(trial.trialEndDate!, referenceDate);
          return (
            <div
              key={trial.id}
              className="p-4 rounded-2xl bg-apple-warning-soft/80 border border-amber-200/60 flex items-start justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-apple-text text-sm">{trial.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-800 font-medium">
                      Trial
                    </span>
                  </div>
                  <p className="text-xs text-apple-secondary mt-0.5">
                    Expires in <strong className="text-amber-800 font-semibold">{daysLeft === 0 ? "Today" : `${daysLeft} day(s)`}</strong>. Will convert to {formatCurrency(trial.price, currency)}/{trial.billingCycle.toLowerCase()}.
                  </p>
                </div>
              </div>

              <Link
                href="/cancellation"
                className="px-3 py-1.5 rounded-xl bg-white text-amber-900 border border-amber-200 text-xs font-medium hover:bg-amber-50 transition shrink-0"
              >
                Manage
              </Link>
            </div>
          );
        })}

        {/* Immediate Upcoming Renewals */}
        {upcomingRenewals.map((sub) => {
          const daysLeft = getDaysUntil(sub.nextRenewalDate, referenceDate);
          return (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-white border border-apple-border flex items-start justify-between gap-4 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-apple-accent mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-apple-text text-sm">{sub.name}</span>
                    <span className="text-xs font-semibold text-apple-text">
                      {formatCurrency(sub.price, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-apple-secondary mt-0.5">
                    Renews on {new Date(sub.nextRenewalDate).toLocaleDateString()} (
                    {daysLeft === 0 ? "Today" : `in ${daysLeft} days`})
                  </p>
                </div>
              </div>

              {sub.cancelUrl && (
                <a
                  href={sub.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-apple-secondary hover:text-apple-text hover:bg-apple-bg transition shrink-0"
                  title="Direct cancellation link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { formatCurrency, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { ExternalLink } from "lucide-react";

interface AttentionSectionProps {
  subscriptions: SubscriptionItem[];
  currency: string;
}

export function AttentionSection({ subscriptions, currency }: AttentionSectionProps) {
  const referenceDate = new Date();

  // Filter trials & upcoming renewals within 7 days
  const attentionItems = subscriptions
    .map((s) => {
      const isTrial = s.status === "TRIAL" && s.trialEndDate;
      const targetDate = isTrial ? s.trialEndDate! : s.nextRenewalDate;
      const daysLeft = getDaysUntil(targetDate, referenceDate);
      return { sub: s, isTrial, daysLeft };
    })
    .filter(({ sub, isTrial, daysLeft }) => {
      if (isTrial) return daysLeft >= 0 && daysLeft <= 7;
      if (sub.status === "ACTIVE" || sub.status === "TO_CANCEL") return daysLeft >= 0 && daysLeft <= 7;
      return false;
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (attentionItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary px-1">
        Requires Attention
      </h3>

      <div className="space-y-2">
        {attentionItems.map(({ sub, daysLeft }) => {
          const daysText = daysLeft === 0 ? "Today" : `In ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
          const formattedPrice = formatCurrency(sub.price, currency);

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-apple-border shadow-sm text-xs font-medium text-apple-text transition-all hover:border-blue-200"
            >
              {/* Ultra-minimal single line: Datos Mama $35,000 (In 2 days) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-apple-text">{sub.name}</span>
                <span className="text-apple-secondary font-medium">{formattedPrice}</span>
                <span className="text-apple-tertiary">({daysText})</span>
              </div>

              {sub.cancelUrl && (
                <a
                  href={sub.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-apple-accent hover:underline text-xs flex items-center gap-1 shrink-0 ml-2"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

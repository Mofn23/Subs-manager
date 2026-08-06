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
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary px-1">
        Requires Attention
      </h3>

      <div className="space-y-2.5">
        {attentionItems.map(({ sub, daysLeft }) => {
          const daysText = daysLeft === 0 ? "Today" : `In ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
          const formattedPrice = formatCurrency(sub.price, currency);

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between px-5 py-3.5 rounded-full bg-white border border-amber-300/80 shadow-[0_2px_10px_rgba(251,191,36,0.12)] hover:shadow-[0_4px_14px_rgba(251,191,36,0.22)] transition-all text-xs font-medium text-apple-text"
            >
              {/* Ultra-minimal single line with delicate subtle yellow relief pill border */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-semibold text-apple-text text-sm">{sub.name}</span>
                <span className="text-apple-secondary font-medium">{formattedPrice}</span>
                <span className="text-apple-tertiary font-normal">({daysText})</span>
              </div>

              {sub.cancelUrl && (
                <a
                  href={sub.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-apple-accent hover:underline text-xs flex items-center gap-1 shrink-0 ml-2 font-medium"
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

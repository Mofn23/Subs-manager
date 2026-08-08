"use client";

import { markSubscriptionAsPaid } from "@/app/actions/subscriptions";
import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { formatCurrency, getAutoEmoji, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface AttentionSectionProps {
  subscriptions: SubscriptionItem[];
  currency: string;
}

export function AttentionSection({ subscriptions, currency }: AttentionSectionProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const referenceDate = new Date();

  const handleMarkPaid = async (id: string) => {
    setLoadingId(id);
    await markSubscriptionAsPaid(id);
    setLoadingId(null);
  };

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
      {/* Clean subtle section header (NO pill, NO group total) */}
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--amber)] px-1">
        ⚡ Requires Attention ({attentionItems.length})
      </h3>

      {/* List Rows */}
      <div className="space-y-2.5">
        {attentionItems.map(({ sub, isTrial, daysLeft }) => {
          const daysText = daysLeft === 0 ? "Renews Today" : `Renews in ${daysLeft}d`;
          const formattedPrice = formatCurrency(sub.price, currency);
          const icon = sub.icon || getAutoEmoji(sub.name, sub.category);

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 rounded-[24px] bg-[var(--surface)] border border-[var(--amber)]/40 shadow-lg hover:border-[var(--amber)] transition-all gap-3"
            >
              {/* Left: MonAI Avatar & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <MonaiAvatar emoji={icon} size="md" isRecurring={true} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-[var(--text-primary)] truncate">
                      {sub.name}
                    </span>
                    <span className="text-xs font-bold text-[var(--coral)]">
                      • {isTrial ? "Trial Ending" : daysText}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] truncate mt-0.5">
                    {sub.provider} • {sub.category}
                  </p>
                </div>
              </div>

              {/* Right: Price & 1-Tap Circular Mark Paid Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-[var(--text-primary)]">
                    {formattedPrice}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-secondary)]">
                    {sub.billingCycle.toLowerCase()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleMarkPaid(sub.id)}
                  disabled={loadingId === sub.id}
                  className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--green)] hover:bg-[var(--green)]/20 transition flex items-center justify-center monai-press active:scale-90 disabled:opacity-50"
                  title="Marcar como pagada"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </button>

                {sub.cancelUrl && (
                  <a
                    href={sub.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                    title="Manage / Cancel"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

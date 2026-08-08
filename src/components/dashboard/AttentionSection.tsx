"use client";

import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiPill } from "@/components/ui/MonaiPill";
import { markSubscriptionAsPaid } from "@/app/actions/subscriptions";
import { calculateMonthlyEquivalent, formatCurrency, getAutoEmoji, getDaysUntil, SubscriptionItem } from "@/lib/financials";
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

  const groupTotal = attentionItems.reduce((acc, item) => acc + item.sub.price, 0);

  return (
    <div className="space-y-3">
      {/* MonAI ListGroup Header Pill */}
      <div className="flex items-center justify-between px-1">
        <MonaiPill variant="amber" className="text-xs font-black">
          ⚡ Requires Attention ({attentionItems.length})
        </MonaiPill>

        <MonaiPill variant="tag" className="text-xs font-bold">
          7 Days Total: {formatCurrency(groupTotal, currency)}
        </MonaiPill>
      </div>

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
              {/* Left: MonAI Avatar & Subscription Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <MonaiAvatar emoji={icon} size="md" isRecurring={true} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[17px] font-black text-[var(--text-primary)] truncate">
                      {sub.name}
                    </span>
                    <MonaiPill variant="coral" className="text-[11px] py-0.5 px-2">
                      {isTrial ? "Trial Ending" : daysText}
                    </MonaiPill>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5 truncate">
                    {sub.provider} • {sub.category}
                  </p>
                </div>
              </div>

              {/* Right: Price & 1-Tap [✓ Pagado] Pill Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-base font-black text-[var(--text-primary)]">
                    {formattedPrice}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                    {sub.billingCycle.toLowerCase()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleMarkPaid(sub.id)}
                  disabled={loadingId === sub.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--pill-light)] text-[var(--pill-light-text)] text-xs font-extrabold shadow-sm hover:opacity-90 transition-all monai-press active:scale-95 disabled:opacity-50"
                  title="Marcar como pagada y reiniciar ciclo"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--green)] stroke-[2.5]" />
                  <span>{loadingId === sub.id ? "Saving..." : "⊕ Pagado"}</span>
                </button>

                {sub.cancelUrl && (
                  <a
                    href={sub.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[var(--tag)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
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

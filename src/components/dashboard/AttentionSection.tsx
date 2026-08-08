"use client";

import { markSubscriptionAsPaid } from "@/app/actions/subscriptions";
import { formatCurrency, getDaysUntil, SubscriptionItem } from "@/lib/financials";
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary dark:text-neutral-400 px-1">
        Requires Attention
      </h3>

      <div className="space-y-2.5">
        {attentionItems.map(({ sub, daysLeft }) => {
          const daysText = daysLeft === 0 ? "Today" : `In ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
          const formattedPrice = formatCurrency(sub.price, currency);

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between px-5 py-3 rounded-full bg-white dark:bg-[#16161A] border border-amber-300/80 dark:border-amber-400/50 shadow-[0_2px_10px_rgba(251,191,36,0.12)] hover:shadow-[0_4px_14px_rgba(251,191,36,0.22)] transition-all text-xs font-medium text-apple-text dark:text-white"
            >
              {/* Ultra-minimal single line with delicate subtle yellow relief pill border */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-semibold text-apple-text dark:text-white text-sm">{sub.name}</span>
                <span className="text-apple-secondary dark:text-neutral-400 font-medium">{formattedPrice}</span>
                <span className="text-apple-tertiary dark:text-neutral-500 font-normal">({daysText})</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleMarkPaid(sub.id)}
                  disabled={loadingId === sub.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
                  title="Marcar como pagada y reiniciar ciclo de cobro"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loadingId === sub.id ? "Guardando..." : "Pagado"}</span>
                </button>

                {sub.cancelUrl && (
                  <a
                    href={sub.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-apple-accent hover:underline text-xs flex items-center gap-1 font-medium ml-1"
                  >
                    Manage <ExternalLink className="w-3 h-3" />
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

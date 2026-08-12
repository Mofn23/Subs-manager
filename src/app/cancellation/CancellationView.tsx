"use client";

import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiButton } from "@/components/ui/MonaiButton";
import { calculateMonthlyEquivalent, formatCurrency } from "@/lib/financials";
import { getLocalSubscriptions, getLocalUserPrefs, updateLocalSubscriptionStatus } from "@/lib/storage";
import { CheckCircle2, ExternalLink, ShieldAlert, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function CancellationView({ subscriptions: initialSubs = [] }: { subscriptions?: any[] }) {
  const [subsList, setSubsList] = useState(initialSubs);
  const [userPrefs, setUserPrefs] = useState({ currency: "COP" });

  useEffect(() => {
    setSubsList(getLocalSubscriptions());
    setUserPrefs(getLocalUserPrefs());
  }, []);

  const refreshSubs = () => {
    setSubsList(getLocalSubscriptions());
  };

  const currency = userPrefs.currency || "COP";
  const subscriptions = subsList.length > 0 ? subsList : initialSubs;

  const handleUpdateStatus = (id: string, status: string) => {
    updateLocalSubscriptionStatus(id, status);
    refreshSubs();
  };

  // Filter subscriptions in cancellation lifecycle
  const toCancelSubs = useMemo(() => {
    return subscriptions.filter((s) => s.status === "TO_CANCEL" || s.status === "TRIAL");
  }, [subscriptions]);

  const cancelledSubs = useMemo(() => {
    return subscriptions.filter(
      (s) => s.status === "CANCELLED" || s.status === "VERIFIED_CANCELLED"
    );
  }, [subscriptions]);

  // Saved monthly money
  const savedMonthlyTotal = useMemo(() => {
    return cancelledSubs.reduce((acc, sub) => {
      return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
    }, 0);
  }, [cancelledSubs]);

  const handleVerifyCancel = async (id: string) => {
    updateLocalSubscriptionStatus(id, "VERIFIED_CANCELLED");
    refreshSubs();
  };

  const handleReactivate = async (id: string) => {
    updateLocalSubscriptionStatus(id, "ACTIVE");
    refreshSubs();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header MonAI Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[var(--surface)] rounded-[32px] p-8 border border-[var(--border)] shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
            <ShieldAlert className="w-4 h-4 text-[var(--coral)] stroke-[2.5]" />
            Cancellation Center
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Cancellation Workflow</h1>
          <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
            Step-by-step guides, direct cancel links, and verified confirmations.
          </p>
        </div>

        {/* Total Saved Badge */}
        <div className="p-5 rounded-[24px] bg-[var(--green)]/10 border border-[var(--green)]/30 text-right self-start sm:self-auto shrink-0">
          <div className="text-[11px] font-black text-[var(--green)] uppercase tracking-wider">
            Total Saved
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
            {formatCurrency(savedMonthlyTotal, currency)}/mo
          </div>
          <div className="text-[11px] font-bold text-[var(--text-secondary)]">
            ({formatCurrency(savedMonthlyTotal * 12, currency)}/year recovered)
          </div>
        </div>
      </div>

      {/* MonAI ListGroup: Ready for Cancellation */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--coral)] opacity-80 px-1">
          ✂️ Ready for Cancellation ({toCancelSubs.length})
        </h3>

        {toCancelSubs.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] rounded-[32px] border border-[var(--border)] p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl mx-auto shadow-sm">
              ✨
            </div>
            <h3 className="font-black text-[var(--text-primary)] text-base">No pending cancellations!</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] max-w-sm mx-auto">
              All your active subscriptions are intentionally kept.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {toCancelSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-[var(--surface)] rounded-[24px] p-5 sm:p-6 border border-[var(--border)] shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <MonaiAvatar emoji="✂️" size="md" isRecurring={true} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-black text-[var(--text-primary)] truncate">{sub.name}</h4>
                        <span className="text-xs font-bold text-[var(--coral)]">
                          • To Cancel
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                        {sub.provider} • {formatCurrency(sub.price, currency)}/{sub.billingCycle.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {sub.cancelUrl && (
                      <a
                        href={sub.cancelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-[var(--pill-light)] text-[var(--pill-light-text)] text-xs font-black flex items-center gap-1.5 shadow-sm hover:opacity-95 transition monai-press active:scale-95"
                      >
                        <span>Abrir URL</span>
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleVerifyCancel(sub.id)}
                      className="px-4 py-2 rounded-full bg-[var(--green)] text-black text-xs font-black flex items-center gap-1.5 shadow-lg hover:opacity-90 transition monai-press active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Confirm Canceled</span>
                    </button>
                  </div>
                </div>

                {/* Steps or Instructions */}
                {sub.cancelSteps && (
                  <div className="p-3.5 rounded-[18px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1 text-xs">
                    <div className="font-black text-[var(--text-primary)] text-[11px] uppercase tracking-wider">
                      Cancellation Steps:
                    </div>
                    <p className="text-[var(--text-secondary)] font-semibold whitespace-pre-line leading-relaxed">
                      {sub.cancelSteps}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Canceled History */}
      <div className="space-y-2.5 pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 px-1">
          Verified Canceled History ({cancelledSubs.length})
        </h3>

        {cancelledSubs.length > 0 && (
          <div className="space-y-2.5">
            {cancelledSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-[var(--surface)] rounded-[20px] p-4 border border-[var(--border-subtle)] flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <MonaiAvatar emoji="📦" size="sm" isRecurring={false} />
                  <div className="min-w-0">
                    <span className="font-black text-[var(--text-primary)] text-sm line-through block truncate">
                      {sub.name}
                    </span>
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)] truncate">
                      Verified canceled • Saved {formatCurrency(sub.price, currency)}/{sub.billingCycle.toLowerCase()}
                    </p>
                  </div>
                </div>

                <MonaiButton
                  variant="surface"
                  size="sm"
                  onClick={() => handleReactivate(sub.id)}
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Reactivate
                </MonaiButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

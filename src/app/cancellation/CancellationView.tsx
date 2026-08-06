"use client";

import { updateSubscriptionStatus } from "@/app/actions/subscriptions";
import { calculateMonthlyEquivalent, formatCurrency } from "@/lib/financials";
import { CheckCircle2, ExternalLink, ShieldAlert, Sparkles, Trash2, Undo2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function CancellationView({ subscriptions }: { subscriptions: any[] }) {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "$";

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
    await updateSubscriptionStatus(id, "VERIFIED_CANCELLED");
  };

  const handleReactivate = async (id: string) => {
    await updateSubscriptionStatus(id, "ACTIVE");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary dark:text-neutral-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-apple-tertiary dark:text-neutral-500" />
            Cancellation Workflow
          </div>
          <h1 className="text-2xl font-semibold text-apple-text dark:text-white tracking-tight">Cancellation Center</h1>
          <p className="text-xs text-apple-secondary dark:text-neutral-400 mt-0.5">
            Step-by-step guides, direct links, and verified confirmation to stop unwanted renewals.
          </p>
        </div>

        {/* Money Recovered Hero Badge */}
        <div className="px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 text-right self-start sm:self-auto">
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Total Money Saved
          </div>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
            {formatCurrency(savedMonthlyTotal, currency)}/mo
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
            ({formatCurrency(savedMonthlyTotal * 12, currency)}/year recovered)
          </div>
        </div>
      </div>

      {/* Pending Cancellations Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary dark:text-neutral-400 px-2">
          Subscriptions Ready for Cancellation ({toCancelSubs.length})
        </h3>

        {toCancelSubs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-[#16161A] rounded-3xl border border-apple-border dark:border-white/10 p-6 text-xs text-apple-secondary dark:text-neutral-400 space-y-2">
            <Sparkles className="w-5 h-5 text-blue-500 mx-auto" />
            <p>No pending cancellations! All active subscriptions are intentionally kept.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {toCancelSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-[#16161A] rounded-2xl p-5 border border-apple-border dark:border-white/10 shadow-apple space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-apple-text dark:text-white text-base">{sub.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-semibold">
                        To Cancel
                      </span>
                    </div>
                    <p className="text-xs text-apple-secondary dark:text-neutral-400 mt-0.5">
                      {sub.provider} • {formatCurrency(sub.price, currency)}/{sub.billingCycle.toLowerCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.cancelUrl && (
                      <a
                        href={sub.cancelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-apple-accent dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/30 transition flex items-center gap-1.5"
                      >
                        Official Cancel Page
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleVerifyCancel(sub.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Canceled
                    </button>
                  </div>
                </div>

                {/* Steps or Notes */}
                {sub.cancelSteps && (
                  <div className="p-3.5 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs space-y-1">
                    <div className="font-semibold text-apple-text dark:text-white text-[11px]">Cancellation Instructions:</div>
                    <p className="text-apple-secondary dark:text-neutral-400 whitespace-pre-line leading-relaxed">{sub.cancelSteps}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History of Successfully Canceled Subscriptions */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary dark:text-neutral-400 px-2">
          Verified Canceled History ({cancelledSubs.length})
        </h3>

        {cancelledSubs.length > 0 && (
          <div className="space-y-2">
            {cancelledSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white/80 dark:bg-[#16161A]/80 rounded-2xl p-4 border border-apple-border dark:border-white/10 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-apple-text dark:text-white line-through">{sub.name}</span>
                    <p className="text-[11px] text-apple-tertiary dark:text-neutral-400">
                      Verified canceled • Saved {formatCurrency(sub.price, currency)}/{sub.billingCycle.toLowerCase()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReactivate(sub.id)}
                  className="px-3 py-1 rounded-xl bg-apple-bg dark:bg-neutral-800 text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 transition text-[11px] font-medium flex items-center gap-1"
                >
                  <Undo2 className="w-3 h-3" />
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { calculateMonthlyEquivalent, detectSubscriptionLeaks, formatCurrency } from "@/lib/financials";
import { AlertCircle, ArrowDownRight, PieChart, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";

export function InsightsView({ subscriptions }: { subscriptions: any[] }) {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "$";

  const activeSubs = useMemo(() => {
    return subscriptions.filter(
      (s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL"
    );
  }, [subscriptions]);

  const leaks = useMemo(() => {
    return detectSubscriptionLeaks(subscriptions);
  }, [subscriptions]);

  // Total monthly spend across active
  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce((acc, sub) => {
      return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
    }, 0);
  }, [activeSubs]);

  // Top 5 most expensive subscriptions
  const top5Subscriptions = useMemo(() => {
    return [...activeSubs]
      .map((s) => ({
        ...s,
        monthlyPrice: calculateMonthlyEquivalent(s.price, s.billingCycle, s.customIntervalMonths),
      }))
      .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
      .slice(0, 5);
  }, [activeSubs]);

  // Category Spend Distribution
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubs.forEach((sub) => {
      const monthlyCost = calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
      const cat = sub.category || "Other";
      map[cat] = (map[cat] || 0) + monthlyCost;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalMonthlySpend > 0 ? (amount / totalMonthlySpend) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubs, totalMonthlySpend]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary mb-1">
          <PieChart className="w-3.5 h-3.5 text-apple-tertiary" />
          Financial Intelligence
        </div>
        <h1 className="text-2xl font-semibold text-apple-text tracking-tight">Subscription Insights</h1>
        <p className="text-xs text-apple-secondary mt-0.5">
          Deep visibility into expense distribution, top costs, and potential monthly savings.
        </p>
      </div>

      {/* Optimization & Leak Detection Highlight Card */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-3xl p-6 border border-blue-100/80 shadow-apple space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-apple-text text-base">Subscription Leak Detector</h3>
              <p className="text-xs text-apple-secondary">
                Identify underutilized or trial subscriptions draining your budget.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-apple-secondary">Potential Monthly Savings</div>
            <div className="text-xl font-bold text-apple-accent">
              {formatCurrency(leaks.potentialMonthlySavings, currency)}/mo
            </div>
            <div className="text-[10px] text-apple-tertiary font-medium">
              ({formatCurrency(leaks.potentialAnnualSavings, currency)}/yr)
            </div>
          </div>
        </div>

        {leaks.lowUsageSubs.length === 0 && leaks.expiringTrials.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/80 border border-blue-100 text-xs text-apple-secondary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            Your portfolio is optimized! No low-usage subscriptions or expiring trials detected.
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {leaks.lowUsageSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl bg-white border border-blue-100 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-semibold text-apple-text">{sub.name}</span>
                  <span className="text-apple-secondary ml-2">Flagged as low usage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-apple-text">
                    {formatCurrency(
                      calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths),
                      currency
                    )}
                    /mo
                  </span>
                  <Link
                    href="/cancellation"
                    className="px-3 py-1 rounded-xl bg-apple-accent-soft text-apple-accent text-[11px] font-medium hover:bg-blue-100 transition"
                  >
                    Cancel & Save
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Top 5 Expensive + Category Spend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Most Expensive */}
        <div className="bg-white rounded-3xl p-6 border border-apple-border shadow-apple space-y-4">
          <h3 className="font-semibold text-apple-text text-sm">Top 5 Most Expensive</h3>

          <div className="space-y-3">
            {top5Subscriptions.map((sub, idx) => (
              <div key={sub.id} className="flex items-center justify-between text-xs pb-2.5 border-b border-apple-border last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-apple-bg flex items-center justify-center font-bold text-[10px] text-apple-tertiary">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-apple-text">{sub.name}</div>
                    <div className="text-[11px] text-apple-tertiary">{sub.category}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-apple-text">
                    {formatCurrency(sub.monthlyPrice, currency)}/mo
                  </div>
                  {sub.billingCycle !== "MONTHLY" && (
                    <div className="text-[10px] text-apple-tertiary">
                      {formatCurrency(sub.price, currency)} ({sub.billingCycle.toLowerCase()})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Spend Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-apple-border shadow-apple space-y-4">
          <h3 className="font-semibold text-apple-text text-sm">Spend by Category</h3>

          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-apple-text">{cat.category}</span>
                  <span className="text-apple-secondary">
                    {formatCurrency(cat.amount, currency)}/mo ({Math.round(cat.percentage)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-apple-bg overflow-hidden border border-apple-border">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

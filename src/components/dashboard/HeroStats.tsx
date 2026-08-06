"use client";

import { formatCurrency } from "@/lib/financials";
import { ArrowUpRight, TrendingDown } from "lucide-react";
import Link from "next/link";

interface HeroStatsProps {
  monthlyTotal: number;
  annualTotal: number;
  currency: string;
  monthlyBudget?: number | null;
  potentialMonthlySavings?: number;
  activeCount: number;
}

export function HeroStats({
  monthlyTotal,
  annualTotal,
  currency,
  monthlyBudget,
  potentialMonthlySavings = 0,
}: HeroStatsProps) {
  const hasBudget = Boolean(monthlyBudget && monthlyBudget > 0);
  const budgetRatio = hasBudget ? (monthlyTotal / (monthlyBudget as number)) * 100 : 0;
  const isOverBudget = hasBudget ? monthlyTotal > (monthlyBudget as number) : false;

  const currencyCode = currency && currency.trim() ? currency.trim().toUpperCase() : "COP";

  return (
    <div className="space-y-4">
      {/* Main Ultra-Minimal Centered Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple transition-all flex flex-col items-center justify-center text-center">
        {/* Small Centered Gray Title */}
        <div className="text-xs font-medium uppercase tracking-wider text-apple-tertiary mb-1">
          Total Monthly Spend
        </div>

        {/* Predominant Big Bold Main Value + Subtle COP */}
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-apple-text tracking-tight">
            {formatCurrency(monthlyTotal, currency)}
          </h1>
          <span className="text-base sm:text-lg font-light text-apple-tertiary tracking-normal">
            {currencyCode}
          </span>
        </div>

        {/* Small Annual Value directly underneath */}
        <div className="flex items-baseline justify-center gap-1 text-xs sm:text-sm font-medium text-apple-tertiary mt-0.5">
          <span>{formatCurrency(annualTotal, currency)}</span>
          <span className="font-light">Annual</span>
        </div>

        {/* Conditional Bottom Bar: Only renders budget if budget is set, and/or potential savings */}
        {(hasBudget || potentialMonthlySavings > 0) && (
          <div
            className={`w-full pt-6 border-t border-apple-border mt-6 grid grid-cols-1 ${
              hasBudget ? "md:grid-cols-2" : "grid-cols-1"
            } gap-6 text-left`}
          >
            {/* Monthly Budget Tracker (Hidden completely if budget is empty/null/0) */}
            {hasBudget && (
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-2">
                  <span className="text-apple-secondary">Monthly Budget</span>
                  <span className={isOverBudget ? "text-apple-danger font-semibold" : "text-apple-text"}>
                    {formatCurrency(monthlyTotal, currency)} of {formatCurrency(monthlyBudget as number, currency)} (
                    {Math.round(budgetRatio)}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-apple-bg overflow-hidden p-0.5 border border-apple-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? "bg-apple-danger"
                        : budgetRatio > 80
                        ? "bg-apple-warning"
                        : "bg-apple-accent"
                    }`}
                    style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Savings Optimization Pill */}
            {potentialMonthlySavings > 0 && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-apple-accent-soft/60 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-apple-accent flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-apple-text">Potential Savings</div>
                    <div className="text-xs text-apple-secondary">
                      Save up to {formatCurrency(potentialMonthlySavings, currency)}/mo
                    </div>
                  </div>
                </div>

                <Link
                  href="/insights"
                  className="flex items-center gap-1 text-xs font-medium text-apple-accent hover:text-apple-accent-hover transition-colors"
                >
                  Review
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

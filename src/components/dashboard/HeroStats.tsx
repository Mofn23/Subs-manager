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

  const cleanCurrencyCode = (rawCurrency: string) => {
    if (!rawCurrency) return "COP";
    const lettersOnly = rawCurrency.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();
    return lettersOnly || "COP";
  };

  const currencyCode = cleanCurrencyCode(currency);

  const formatNumberOnly = (amount: number) => {
    const num = Number(amount || 0);
    const isInteger = num % 1 === 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Ultra-Minimal Centered Hero Card */}
      <div className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple transition-all flex flex-col items-center justify-center text-center">
        {/* Small Centered Gray Title */}
        <div className="text-xs font-medium uppercase tracking-wider text-apple-tertiary dark:text-neutral-400 mb-1">
          Total Monthly Spend
        </div>

        {/* Predominant Big Bold Main Value + Subtle COP (No $ symbol) */}
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-apple-text dark:text-white tracking-tight">
            {formatNumberOnly(monthlyTotal)}
          </h1>
          <span className="text-base sm:text-lg font-light text-apple-tertiary dark:text-neutral-400 tracking-normal">
            {currencyCode}
          </span>
        </div>

        {/* Small Annual Value directly underneath */}
        <div className="flex items-baseline justify-center gap-1 text-xs sm:text-sm font-medium text-apple-tertiary dark:text-neutral-400 mt-0.5">
          <span>{formatNumberOnly(annualTotal)}</span>
          <span className="font-light">Annual</span>
        </div>

        {/* Conditional Bottom Bar: Only renders budget if budget is set, and/or potential savings */}
        {(hasBudget || potentialMonthlySavings > 0) && (
          <div
            className={`w-full pt-6 border-t border-apple-border dark:border-white/10 mt-6 grid grid-cols-1 ${
              hasBudget ? "md:grid-cols-2" : "grid-cols-1"
            } gap-6 text-left`}
          >
            {/* Monthly Budget Tracker (Hidden completely if budget is empty/null/0) */}
            {hasBudget && (
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-2">
                  <span className="text-apple-secondary dark:text-neutral-400">Monthly Budget</span>
                  <span className={isOverBudget ? "text-apple-danger font-semibold" : "text-apple-text dark:text-white"}>
                    {formatCurrency(monthlyTotal, currency)} of {formatCurrency(monthlyBudget as number, currency)} (
                    {Math.round(budgetRatio)}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-apple-bg dark:bg-neutral-800 overflow-hidden p-0.5 border border-apple-border dark:border-white/10">
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-apple-accent-soft/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-apple-accent dark:text-blue-400 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-apple-text dark:text-white">Potential Savings</div>
                    <div className="text-xs text-apple-secondary dark:text-neutral-400">
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

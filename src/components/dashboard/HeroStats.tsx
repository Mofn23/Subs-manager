"use client";

import { formatCurrency } from "@/lib/financials";
import { AlertCircle, ArrowUpRight, CheckCircle2, TrendingDown, Wallet } from "lucide-react";
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
  activeCount,
}: HeroStatsProps) {
  const budgetRatio = monthlyBudget && monthlyBudget > 0 ? (monthlyTotal / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget ? monthlyTotal > monthlyBudget : false;

  return (
    <div className="space-y-4">
      {/* Main Glass/White Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-apple-border">
          {/* Monthly Spend */}
          <div>
            <div className="flex items-center gap-2 text-apple-secondary text-xs font-medium uppercase tracking-wider mb-1">
              <Wallet className="w-3.5 h-3.5 text-apple-tertiary" />
              Total Monthly Spend
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-semibold text-apple-text tracking-tight">
                {formatCurrency(monthlyTotal, currency)}
              </h1>
              <span className="text-xs text-apple-tertiary font-normal">/ month across {activeCount} subs</span>
            </div>
          </div>

          {/* Annualized Projection */}
          <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-apple-border">
            <div className="text-apple-secondary text-xs font-medium uppercase tracking-wider mb-1">
              Projected Annual Cost
            </div>
            <div className="text-xl sm:text-2xl font-medium text-apple-text tracking-tight">
              {formatCurrency(annualTotal, currency)}
            </div>
          </div>
        </div>

        {/* Budget Progress & Optimization Opportunity Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Budget Tracker */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span className="text-apple-secondary">Monthly Budget</span>
              {monthlyBudget ? (
                <span className={isOverBudget ? "text-apple-danger font-semibold" : "text-apple-text"}>
                  {formatCurrency(monthlyTotal, currency)} of {formatCurrency(monthlyBudget, currency)} (
                  {Math.round(budgetRatio)}%)
                </span>
              ) : (
                <Link href="/settings" className="text-apple-accent hover:underline">
                  Set target budget
                </Link>
              )}
            </div>

            {monthlyBudget ? (
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
            ) : (
              <p className="text-xs text-apple-tertiary">
                Define a budget in Settings to enable quiet overspend alerts.
              </p>
            )}
          </div>

          {/* Savings Optimization Pill */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-apple-accent-soft/60 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-apple-accent flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-apple-text">Potential Savings</div>
                <div className="text-xs text-apple-secondary">
                  {potentialMonthlySavings > 0
                    ? `Save up to ${formatCurrency(potentialMonthlySavings, currency)}/mo`
                    : "No low-usage leaks detected"}
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
        </div>
      </div>
    </div>
  );
}

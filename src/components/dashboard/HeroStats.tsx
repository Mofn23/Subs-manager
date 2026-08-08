"use client";

import { MonaiPill } from "@/components/ui/MonaiPill";
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
      {/* MonAI Ultra-Minimal TotalBlock Hero */}
      <div className="bg-[var(--surface)] rounded-[32px] p-8 sm:p-10 border border-[var(--border)] shadow-2xl flex flex-col items-center justify-center text-center transition-all">
        {/* Label Gris Centrado */}
        <div className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
          Monthly Spend
        </div>

        {/* MonAI TotalBlock: Badge circular (32px) + Número Gigante (w900) + Sufijo Gris */}
        <div className="flex items-center justify-center gap-3 my-2 flex-wrap">
          {/* Badge circular 32px coral ⊖ */}
          <div className="w-9 h-9 rounded-full bg-[var(--coral)]/20 text-[var(--coral)] border border-[var(--coral)]/40 flex items-center justify-center text-xl font-black shrink-0">
            ⊖
          </div>

          <h1 className="text-[56px] sm:text-[68px] font-black text-[var(--text-primary)] tracking-tight leading-none">
            {formatNumberOnly(monthlyTotal)}
          </h1>

          <span className="text-lg sm:text-xl font-black text-[var(--text-secondary)] self-end pb-1.5">
            {currencyCode}
          </span>
        </div>

        {/* Secundario: Anualizado */}
        <div className="text-sm font-bold text-[var(--text-secondary)] mt-1">
          <span>{formatNumberOnly(annualTotal)} {currencyCode}</span>
          <span className="font-semibold text-[var(--text-placeholder)] ml-1">Annual</span>
        </div>

        {/* SegmentedPill Presupuesto vs Gasto */}
        {hasBudget && (
          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] w-full max-w-md">
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-full bg-[var(--tag)] border border-[var(--border)]">
              <div className={`flex-1 py-1.5 px-3 rounded-full text-xs font-black transition-all ${isOverBudget ? "bg-[var(--coral)] text-white" : "bg-[var(--surface-elevated)] text-[var(--text-primary)]"}`}>
                ⊖ {formatCurrency(monthlyTotal, currency)} spent
              </div>
              <div className="flex-1 py-1.5 px-3 rounded-full text-xs font-bold text-[var(--text-secondary)] text-right">
                🎯 {formatCurrency(monthlyBudget as number, currency)} budget
              </div>
            </div>

            {/* Budget Progress Indicator */}
            <div className="w-full h-2 rounded-full bg-[var(--surface-elevated)] overflow-hidden mt-3 p-0.5 border border-[var(--border-subtle)]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? "bg-[var(--coral)]"
                    : budgetRatio > 80
                    ? "bg-[var(--amber)]"
                    : "bg-[var(--green)]"
                }`}
                style={{ width: `${Math.min(budgetRatio, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Savings Optimization Pill */}
        {potentialMonthlySavings > 0 && (
          <div className="mt-4 w-full max-w-md flex items-center justify-between p-3.5 rounded-2xl bg-[var(--coral)]/10 border border-[var(--coral)]/20 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--coral)] text-white flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-xs font-black text-[var(--text-primary)]">Subscription Leaks Detected</div>
                <div className="text-xs font-bold text-[var(--text-secondary)]">
                  Potential savings {formatCurrency(potentialMonthlySavings, currency)}/mo
                </div>
              </div>
            </div>

            <Link
              href="/insights"
              className="flex items-center gap-1 text-xs font-extrabold text-[var(--coral)] hover:underline"
            >
              Review
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

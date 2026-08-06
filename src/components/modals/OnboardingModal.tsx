"use client";

import { completeOnboarding } from "@/app/actions/auth";
import { onboardingSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { update } = useSession();
  const [errorMsg, setErrorMsg] = useState("");

  const currencies = [
    { label: "USD ($)", value: "$" },
    { label: "EUR (€)", value: "€" },
    { label: "GBP (£)", value: "£" },
    { label: "COP ($)", value: "COP $" },
    { label: "MXN ($)", value: "MXN $" },
    { label: "CAD ($)", value: "CAD $" },
  ];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      currency: "$",
      monthlyBudget: 150,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setErrorMsg("");
    const res = await completeOnboarding(data);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      await update({ currency: data.currency, monthlyBudget: data.monthlyBudget, onboarded: true });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#16161A] text-apple-text dark:text-white w-full max-w-md rounded-3xl shadow-apple-modal border border-apple-border dark:border-white/15 p-6 sm:p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-apple-text dark:text-white tracking-tight">Welcome to Subs Manager</h2>
          <p className="text-xs text-apple-secondary dark:text-neutral-400 mt-1 leading-relaxed">
            Calm, effortless control over all your digital subscriptions and recurring expenses. Let's set up your preferred preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-apple-danger-soft dark:bg-rose-500/20 text-apple-danger dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-500/30">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Base Currency</label>
            <select
              {...register("currency")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white font-medium"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Target Monthly Budget (Optional)</label>
            <input
              type="number"
              step="0.01"
              {...register("monthlyBudget")}
              placeholder="e.g. 150.00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white font-semibold placeholder:text-apple-tertiary dark:placeholder:text-neutral-500"
            />
            <p className="text-[11px] text-apple-tertiary dark:text-neutral-400 mt-1">
              You will receive gentle in-app alerts if your recurring subscriptions approach this threshold.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-2xl bg-apple-text dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Saving Preferences..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}

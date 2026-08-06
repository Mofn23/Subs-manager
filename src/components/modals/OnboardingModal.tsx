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
      <div className="bg-white w-full max-w-md rounded-3xl shadow-apple-modal border border-apple-border p-6 sm:p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-apple-text tracking-tight">Welcome to Subs Manager</h2>
          <p className="text-xs text-apple-secondary mt-1 leading-relaxed">
            Calm, effortless control over all your digital subscriptions and recurring expenses. Let's set up your preferred preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-apple-danger-soft text-apple-danger text-xs font-medium border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-apple-secondary mb-1">Base Currency</label>
            <select
              {...register("currency")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text font-medium"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-apple-secondary mb-1">Target Monthly Budget (Optional)</label>
            <input
              type="number"
              step="0.01"
              {...register("monthlyBudget")}
              placeholder="e.g. 150.00"
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text font-semibold"
            />
            <p className="text-[11px] text-apple-tertiary mt-1">
              You will receive gentle in-app alerts if your recurring subscriptions approach this threshold.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Saving..." : "Start Managing Subscriptions"}
          </button>
        </form>
      </div>
    </div>
  );
}

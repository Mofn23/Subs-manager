"use client";

import { deleteAccount, exportUserData, updateUserSettings } from "@/app/actions/auth";
import { userSettingsSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileJson, FileSpreadsheet, Laptop, Moon, Settings, ShieldAlert, Sparkles, Sun, Trash2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function SettingsView({ initialUser }: { initialUser: any }) {
  const { update } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: initialUser.name || "",
      currency: initialUser.currency || "$",
      monthlyBudget: initialUser.monthlyBudget || 150,
    },
  });

  const onSubmit = async (data: any) => {
    setSuccessMsg("");
    setErrorMsg("");
    const res = await updateUserSettings(data);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      await update({ currency: data.currency, monthlyBudget: data.monthlyBudget });
      setSuccessMsg("Settings updated successfully.");
    }
  };

  const handleExportJSON = async () => {
    const res = await exportUserData();
    if (res.success && res.data) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `subs-manager-export-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const handleExportCSV = async () => {
    const res = await exportUserData();
    if (res.success && res.data?.subscriptions) {
      const subs = res.data.subscriptions;
      if (subs.length === 0) {
        alert("No subscriptions to export.");
        return;
      }

      const headers = ["ID", "Name", "Provider", "Category", "Price", "BillingCycle", "NextRenewalDate", "Status"];
      const rows = subs.map((s: any) => [
        s.id,
        `"${s.name}"`,
        `"${s.provider}"`,
        `"${s.category}"`,
        s.price,
        s.billingCycle,
        s.nextRenewalDate,
        s.status,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `subs-manager-export-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("CRITICAL WARNING: Are you sure you want to delete your account and all associated subscriptions permanently? This action CANNOT be undone.")) {
      await deleteAccount();
      signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary dark:text-neutral-400 mb-1">
          <Settings className="w-3.5 h-3.5 text-apple-tertiary dark:text-neutral-500" />
          Preferences & Data Sovereignty
        </div>
        <h1 className="text-2xl font-semibold text-apple-text dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-apple-secondary dark:text-neutral-400 mt-0.5">
          Manage theme preferences, currency standards, target monthly budget limit, and full data privacy.
        </p>
      </div>

      {/* Theme Preference Cards Section */}
      <div className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple space-y-4">
        <h3 className="font-semibold text-apple-text dark:text-white text-sm pb-2 border-b border-apple-border dark:border-white/10">
          Appearance & Theme Mode
        </h3>
        <p className="text-xs text-apple-secondary dark:text-neutral-400">
          Choose your preferred visual theme style across all devices.
        </p>

        {mounted && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                theme === "light"
                  ? "bg-blue-50/80 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-500/30"
                  : "bg-apple-bg dark:bg-neutral-800 border-apple-border dark:border-white/10 text-apple-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs">Light Mode ☀️</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                theme === "dark"
                  ? "bg-blue-50/80 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-500/30"
                  : "bg-apple-bg dark:bg-neutral-800 border-apple-border dark:border-white/10 text-apple-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs">Dark Mode 🌙</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                theme === "system"
                  ? "bg-blue-50/80 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-500/30"
                  : "bg-apple-bg dark:bg-neutral-800 border-apple-border dark:border-white/10 text-apple-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Laptop className="w-5 h-5 text-apple-tertiary dark:text-neutral-400" />
              <span className="text-xs">System 💻</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple space-y-6">
        <h3 className="font-semibold text-apple-text dark:text-white text-sm pb-2 border-b border-apple-border dark:border-white/10">General Preferences</h3>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-apple-success-soft dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-500/30">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-apple-danger-soft dark:bg-rose-500/20 text-apple-danger dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-500/30">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Full Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
            />
            {errors.name && <p className="text-[10px] text-apple-danger mt-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Base Currency Symbol</label>
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
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Target Monthly Budget Limit</label>
              <input
                type="number"
                step="0.01"
                {...register("monthlyBudget")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-2xl bg-apple-text dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </button>
      </form>

      {/* Data Sovereignty & Export Section */}
      <div className="bg-white dark:bg-[#16161A] rounded-3xl p-6 sm:p-8 border border-apple-border dark:border-white/10 shadow-apple space-y-4">
        <h3 className="font-semibold text-apple-text dark:text-white text-sm pb-2 border-b border-apple-border dark:border-white/10">
          Privacy & Data Sovereignty
        </h3>
        <p className="text-xs text-apple-secondary dark:text-neutral-400 leading-relaxed">
          You own your data completely. Download a raw backup copy of all your subscriptions, notifications, and settings at any time in standard JSON or CSV format.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-apple-text dark:text-white text-xs font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <FileJson className="w-4 h-4 text-blue-500" />
            Export Data as JSON
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-apple-text dark:text-white text-xs font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Data as CSV
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-3xl p-6 sm:p-8 border border-rose-200/60 dark:border-rose-500/20 shadow-apple space-y-4">
        <h3 className="font-semibold text-rose-950 dark:text-rose-200 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          Danger Zone
        </h3>
        <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
          Permanently delete your account, saved preferences, and all subscription tracking records from our database.
        </p>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition shadow-sm flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account & Purge Data
        </button>
      </div>
    </div>
  );
}

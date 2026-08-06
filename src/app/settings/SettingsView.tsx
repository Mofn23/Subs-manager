"use client";

import { deleteAccount, exportUserData, updateUserSettings } from "@/app/actions/auth";
import { userSettingsSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileJson, FileSpreadsheet, ShieldAlert, Sparkles, Trash2, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SettingsView({ initialUser }: { initialUser: any }) {
  const { update } = useSession();
  const [successMsg, setSuccessMsg] = useState("");
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary mb-1">
          <Settings className="w-3.5 h-3.5 text-apple-tertiary" />
          Preferences & Data Sovereignty
        </div>
        <h1 className="text-2xl font-semibold text-apple-text tracking-tight">Account Settings</h1>
        <p className="text-xs text-apple-secondary mt-0.5">
          Manage currency standards, target monthly budget limit, and full data export/deletion privacy control.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple space-y-6">
        <h3 className="font-semibold text-apple-text text-sm pb-2 border-b border-apple-border">General Preferences</h3>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-apple-success-soft text-emerald-800 text-xs font-medium border border-emerald-200">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-apple-danger-soft text-apple-danger text-xs font-medium border border-rose-200">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-apple-secondary mb-1">Full Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
            />
            {errors.name && <p className="text-[10px] text-apple-danger mt-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Base Currency Symbol</label>
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
              <label className="block text-xs font-medium text-apple-secondary mb-1">Target Monthly Budget Limit</label>
              <input
                type="number"
                step="0.01"
                {...register("monthlyBudget")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-2xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </button>
      </form>

      {/* Data Sovereignty & Export Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-apple-border shadow-apple space-y-4">
        <h3 className="font-semibold text-apple-text text-sm pb-2 border-b border-apple-border">
          Privacy & Data Sovereignty
        </h3>
        <p className="text-xs text-apple-secondary leading-relaxed">
          You own your data completely. Download a raw backup copy of all your subscriptions, notifications, and settings at any time in standard JSON or CSV format.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-apple-bg border border-apple-border text-apple-text text-xs font-medium hover:bg-gray-100 transition flex items-center gap-2"
          >
            <FileJson className="w-4 h-4 text-blue-500" />
            Export Data as JSON
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-apple-bg border border-apple-border text-apple-text text-xs font-medium hover:bg-gray-100 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Data as CSV
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-apple space-y-4">
        <h3 className="font-semibold text-rose-950 text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Danger Zone
        </h3>
        <p className="text-xs text-rose-800 leading-relaxed">
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

"use client";

import { deleteAccount, exportUserData, updateUserSettings } from "@/app/actions/auth";
import { MonaiButton } from "@/components/ui/MonaiButton";
import { MonaiPill } from "@/components/ui/MonaiPill";
import { MonaiToggle } from "@/components/ui/MonaiToggle";
import { userSettingsSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileJson, FileSpreadsheet, Laptop, Moon, Settings, ShieldAlert, Sun, Trash2 } from "lucide-react";
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

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      await update({ currency: data.currency, monthlyBudget: data.monthlyBudget });
      setSuccessMsg("Preferences updated successfully.");
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
    if (confirm("CRITICAL WARNING: Are you sure you want to delete your account permanently? This action CANNOT be undone.")) {
      await deleteAccount();
      signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-24">
      {/* Header MonAI Card */}
      <div className="bg-[var(--surface)] rounded-[32px] p-8 border border-[var(--border)] shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
          <Settings className="w-4 h-4 text-[var(--coral)] stroke-[2.5]" />
          Account & Preferences
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
          Manage currency, theme, monthly budget, notifications, and data sovereignty.
        </p>
      </div>

      {/* MonAI SettingsRows Group: General Preferences & Theme */}
      <div className="bg-[var(--surface)] rounded-[32px] p-6 sm:p-8 border border-[var(--border)] shadow-2xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
          Appearance & Themes
        </h3>

        {/* MonAI SettingsRow: Theme Selector */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--tag)] text-2xl flex items-center justify-center shrink-0 border border-[var(--border)]">
              🎨
            </div>
            <div>
              <h4 className="text-[17px] font-black text-[var(--text-primary)]">Visual Theme</h4>
              <p className="text-xs font-bold text-[var(--text-secondary)]">Choose dark or soft light theme</p>
            </div>
          </div>

          {mounted && (
            <div className="flex items-center gap-1.5 p-1 bg-[var(--tag)] rounded-full border border-[var(--border)] w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                  theme === "dark" ? "bg-[var(--surface-elevated)] text-white shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                🌙 Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                  theme === "light" ? "bg-white text-black shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                  theme === "system" ? "bg-[var(--surface-elevated)] text-white shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                💻 Auto
              </button>
            </div>
          )}
        </div>

        {/* MonAI SettingsRow: Notifications Toggle */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--tag)] text-2xl flex items-center justify-center shrink-0 border border-[var(--border)]">
              🔔
            </div>
            <div>
              <h4 className="text-[17px] font-black text-[var(--text-primary)]">Renewal Alerts</h4>
              <p className="text-xs font-bold text-[var(--text-secondary)]">In-app notifications before charges</p>
            </div>
          </div>

          <MonaiToggle
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--surface)] rounded-[32px] p-6 sm:p-8 border border-[var(--border)] shadow-2xl space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
          Preferences & Budget
        </h3>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-[var(--green)]/15 text-[var(--green)] text-xs font-black border border-[var(--green)]/30">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-[var(--coral)]/15 text-[var(--coral)] text-xs font-black border border-[var(--coral)]/30">
            {errorMsg}
          </div>
        )}

        {/* MonAI SettingsRow: Name */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--tag)] text-2xl flex items-center justify-center shrink-0 border border-[var(--border)]">
              👤
            </div>
            <div>
              <h4 className="text-[17px] font-black text-[var(--text-primary)]">Display Name</h4>
              <p className="text-xs font-bold text-[var(--text-secondary)]">Your account profile title</p>
            </div>
          </div>

          <input
            type="text"
            {...register("name")}
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-sm font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* MonAI SettingsRow: Currency & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--tag)] text-xl flex items-center justify-center shrink-0 border border-[var(--border)]">
                💵
              </div>
              <div>
                <h4 className="text-base font-black text-[var(--text-primary)]">Base Currency</h4>
                <p className="text-[11px] font-bold text-[var(--text-secondary)]">Default symbol</p>
              </div>
            </div>

            <select
              {...register("currency")}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] focus:outline-none"
            >
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--tag)] text-xl flex items-center justify-center shrink-0 border border-[var(--border)]">
                🎯
              </div>
              <div>
                <h4 className="text-base font-black text-[var(--text-primary)]">Monthly Budget</h4>
                <p className="text-[11px] font-bold text-[var(--text-secondary)]">Limit tracker</p>
              </div>
            </div>

            <input
              type="number"
              step="0.01"
              {...register("monthlyBudget")}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        <MonaiButton
          type="submit"
          variant="coral"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "✓ Save Preferences"}
        </MonaiButton>
      </form>

      {/* Data Sovereignty & Export Section */}
      <div className="bg-[var(--surface)] rounded-[32px] p-6 sm:p-8 border border-[var(--border)] shadow-2xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
          Data Sovereignty & Export
        </h3>
        <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
          Download a raw backup copy of all your subscriptions, notifications, and settings at any time.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <MonaiButton
            type="button"
            variant="surface"
            onClick={handleExportJSON}
          >
            <FileJson className="w-4 h-4 text-[var(--coral)]" />
            Export JSON
          </MonaiButton>

          <MonaiButton
            type="button"
            variant="surface"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="w-4 h-4 text-[var(--green)]" />
            Export CSV
          </MonaiButton>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-[var(--coral)]/10 rounded-[32px] p-6 sm:p-8 border border-[var(--coral)]/30 shadow-2xl space-y-4">
        <h3 className="font-black text-[var(--coral)] text-base flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
          Danger Zone
        </h3>
        <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
          Permanently delete your account, saved preferences, and all subscription tracking records.
        </p>

        <MonaiButton
          type="button"
          variant="coral"
          onClick={handleDeleteAccount}
        >
          <Trash2 className="w-4 h-4" />
          Delete Account & Purge Data
        </MonaiButton>
      </div>
    </div>
  );
}

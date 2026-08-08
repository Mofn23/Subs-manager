"use client";

import { createSubscription, markSubscriptionAsPaid, updateSubscription } from "@/app/actions/subscriptions";
import { MonaiButton } from "@/components/ui/MonaiButton";
import { MonaiPill } from "@/components/ui/MonaiPill";
import { MonaiSheet } from "@/components/ui/MonaiSheet";
import { getAutoEmoji, SubscriptionItem } from "@/lib/financials";
import { subscriptionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: SubscriptionItem | null;
  currency: string;
}

const PRESET_EMOJIS = [
  "🍿", "🎬", "🎵", "🎧", "📺", "🎮", "🕹️",
  "🤖", "💻", "📱", "☁️", "⚡", "🛡️", "🏋️‍♂️",
  "🚴‍♂️", "☕", "🍕", "🚗", "📚", "💳", "💰",
  "💼", "📊", "💧", "🔑", "🎨", "📦", "🔊"
];

export function SubscriptionModal({ isOpen, onClose, subscriptionToEdit, currency }: SubscriptionModalProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("🍿");
  const [hasCustomIcon, setHasCustomIcon] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const handleQuickMarkPaid = async () => {
    if (!subscriptionToEdit) return;
    setIsMarkingPaid(true);
    await markSubscriptionAsPaid(subscriptionToEdit.id);
    setIsMarkingPaid(false);
    onClose();
  };

  const categories = [
    { name: "Streaming", emoji: "🍿" },
    { name: "AI & Tech", emoji: "🤖" },
    { name: "Productivity", emoji: "💻" },
    { name: "Fitness", emoji: "🏋️‍♂️" },
    { name: "Gaming", emoji: "🎮" },
    { name: "Software", emoji: "⚡" },
    { name: "Utilities", emoji: "💧" },
    { name: "Other", emoji: "📦" },
  ];

  const defaultValues = {
    name: "",
    provider: "",
    category: "Streaming",
    price: 9.99,
    billingCycle: "MONTHLY" as "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM",
    customIntervalMonths: 1,
    nextRenewalDate: format(new Date(), "yyyy-MM-dd"),
    trialEndDate: "",
    autoRenew: true,
    status: "ACTIVE" as "ACTIVE" | "PAUSED" | "TO_CANCEL" | "CANCELLED" | "VERIFIED_CANCELLED" | "TRIAL" | "EXPIRED",
    notes: "",
    icon: "🍿",
    cancelUrl: "",
    cancelSteps: "",
    reminderDays: 3,
    flaggedLowUsage: false,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues,
  });

  const watchCycle = watch("billingCycle");
  const watchStatus = watch("status");
  const watchName = watch("name");
  const watchCategory = watch("category");

  useEffect(() => {
    if (subscriptionToEdit) {
      const initialIcon = subscriptionToEdit.icon || getAutoEmoji(subscriptionToEdit.name, subscriptionToEdit.category);
      setSelectedIcon(initialIcon);
      setHasCustomIcon(Boolean(subscriptionToEdit.icon));

      reset({
        name: subscriptionToEdit.name,
        provider: subscriptionToEdit.provider,
        category: subscriptionToEdit.category || "Other",
        price: subscriptionToEdit.price,
        billingCycle: (subscriptionToEdit.billingCycle as any) || "MONTHLY",
        customIntervalMonths: subscriptionToEdit.customIntervalMonths || 1,
        nextRenewalDate: subscriptionToEdit.nextRenewalDate
          ? format(new Date(subscriptionToEdit.nextRenewalDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        trialEndDate: subscriptionToEdit.trialEndDate
          ? format(new Date(subscriptionToEdit.trialEndDate), "yyyy-MM-dd")
          : "",
        autoRenew: subscriptionToEdit.autoRenew,
        status: (subscriptionToEdit.status as any) || "ACTIVE",
        notes: (subscriptionToEdit as any).notes || "",
        icon: initialIcon,
        cancelUrl: (subscriptionToEdit as any).cancelUrl || "",
        cancelSteps: (subscriptionToEdit as any).cancelSteps || "",
        reminderDays: (subscriptionToEdit as any).reminderDays || 3,
        flaggedLowUsage: subscriptionToEdit.flaggedLowUsage,
      });
    } else {
      reset(defaultValues);
      setSelectedIcon("🍿");
      setHasCustomIcon(false);
    }
  }, [subscriptionToEdit, isOpen]);

  // Auto-suggest emoji based on typing subscription name
  useEffect(() => {
    if (!hasCustomIcon && !subscriptionToEdit) {
      const auto = getAutoEmoji(watchName, watchCategory);
      setValue("icon", auto);
      setSelectedIcon(auto);
    }
  }, [watchName, watchCategory, hasCustomIcon, subscriptionToEdit, setValue]);

  const router = useRouter();

  const onSubmit = async (data: any) => {
    setErrorMsg("");
    try {
      let res;
      if (subscriptionToEdit) {
        res = await updateSubscription(subscriptionToEdit.id, data);
      } else {
        res = await createSubscription(data);
      }

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.refresh();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <MonaiSheet
      isOpen={isOpen}
      onClose={onClose}
      title={subscriptionToEdit ? "Edit Subscription" : "Add Subscription"}
      subtitle="Manage recurring charges, renewal dates, and billing cycles."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-[var(--coral)]/15 text-[var(--coral)] text-xs font-black border border-[var(--coral)]/30">
            {errorMsg}
          </div>
        )}

        {/* MonAI Avatar Emoji Selector with Squircle Grid */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-20 h-20 rounded-[22%] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-md flex items-center justify-center text-4xl transition-transform monai-press active:scale-90 relative group"
            title="Choose Emoji Icon"
          >
            {selectedIcon || "📦"}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--coral)] text-white flex items-center justify-center text-xs shadow-md border border-[var(--bg-sheet)]">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </button>
          <span className="text-xs font-bold text-[var(--text-secondary)] mt-2">
            Tap squircle to choose avatar emoji
          </span>

          {/* MonAI Squircle Emoji Grid */}
          {showEmojiPicker && (
            <div className="w-full mt-4 p-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[28px] animate-menu-scale-in">
              <div className="flex items-center justify-between text-xs font-black text-[var(--text-primary)] mb-3 px-1">
                <span>Select Emoji Avatar</span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-none">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setValue("icon", emoji);
                      setSelectedIcon(emoji);
                      setHasCustomIcon(true);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-11 h-11 text-2xl rounded-[22%] flex items-center justify-center transition-all monai-press active:scale-90 ${
                      selectedIcon === emoji
                        ? "bg-[var(--coral)] text-white ring-2 ring-[var(--coral)]/50 scale-105"
                        : "bg-[var(--surface)] hover:bg-white/10"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MonAI Gigante Placeholders: Provider / Brand & Price */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Subscription Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Netflix, Spotify, ChatGPT"
              className="w-full px-5 py-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-base font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-[var(--text-placeholder)]"
            />
            {errors.name && <p className="text-xs font-extrabold text-[var(--coral)] mt-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Provider / Brand
              </label>
              <input
                {...register("provider")}
                placeholder="e.g. Netflix Inc."
                className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-[var(--text-placeholder)]"
              />
              {errors.provider && <p className="text-xs font-extrabold text-[var(--coral)] mt-1">{errors.provider.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="any"
                {...register("price")}
                placeholder="0.00"
                className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              {errors.price && <p className="text-xs font-extrabold text-[var(--coral)] mt-1">{errors.price.message as string}</p>}
            </div>
          </div>
        </div>

        {/* Categories as Horizontal Chips with Emoji */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Category
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = watchCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setValue("category", cat.name)}
                  className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-150 monai-press active:scale-95 flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-[var(--coral)] text-white border-[var(--coral)] shadow-md"
                      : "bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--border)] hover:bg-white/10"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chips for Billing Cycle & Next Renewal Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Billing Cycle ⌄
            </label>
            <select
              {...register("billingCycle")}
              className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="WEEKLY">✓ Weekly</option>
              <option value="MONTHLY">✓ Monthly</option>
              <option value="QUARTERLY">✓ Quarterly</option>
              <option value="YEARLY">✓ Yearly</option>
              <option value="CUSTOM">✓ Custom Interval</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Next Renewal Date 📅 ⌄
            </label>
            <input
              type="date"
              {...register("nextRenewalDate")}
              className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            {errors.nextRenewalDate && (
              <p className="text-xs font-extrabold text-[var(--coral)] mt-1">{errors.nextRenewalDate.message as string}</p>
            )}
          </div>
        </div>

        {/* Custom Interval Months (If CUSTOM) */}
        {watchCycle === "CUSTOM" && (
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Custom Interval (Months)
            </label>
            <input
              type="number"
              min="1"
              {...register("customIntervalMonths")}
              className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)]"
            />
          </div>
        )}

        {/* Status & Trial Expiry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Status ⌄
            </label>
            <select
              {...register("status")}
              className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="PAUSED">Paused</option>
              <option value="TO_CANCEL">To Cancel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              {watchStatus === "TRIAL" ? "Trial Expiry Date *" : "Trial Expiry (Optional)"}
            </label>
            <input
              type="date"
              {...register("trialEndDate")}
              className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-black text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* Direct Cancel URL */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Direct Cancel URL (Optional)
          </label>
          <input
            {...register("cancelUrl")}
            placeholder="https://..."
            className="w-full px-5 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        </div>

        {/* Big MonAI ✓ Save Button */}
        <div className="pt-4 flex items-center justify-between gap-3">
          {subscriptionToEdit && (
            <button
              type="button"
              onClick={handleQuickMarkPaid}
              disabled={isMarkingPaid}
              className="px-4 py-3.5 rounded-2xl text-xs font-black bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/40 flex items-center gap-1.5 transition monai-press active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isMarkingPaid ? "Saving..." : "Marcar Pagada"}</span>
            </button>
          )}

          <MonaiButton
            type="submit"
            variant="coral"
            size="lg"
            fullWidth={!subscriptionToEdit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : subscriptionToEdit ? "✓ Save Changes" : "✓ Save Subscription"}
          </MonaiButton>
        </div>
      </form>
    </MonaiSheet>
  );
}

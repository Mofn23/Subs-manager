"use client";

import { createSubscription, markSubscriptionAsPaid, updateSubscription } from "@/app/actions/subscriptions";
import { getAutoEmoji, SubscriptionItem } from "@/lib/financials";
import { subscriptionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle2, Sparkles, X } from "lucide-react";
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
    "Streaming",
    "AI & Tech",
    "Productivity",
    "Fitness",
    "Gaming",
    "Software",
    "Utilities",
    "Other",
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16161A] text-apple-text dark:text-white w-full max-w-lg rounded-3xl shadow-apple-modal border border-apple-border dark:border-white/15 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-border dark:border-white/10">
          <h3 className="font-semibold text-apple-text dark:text-white text-base">
            {subscriptionToEdit ? "Edit Subscription" : "Add Subscription"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-apple-tertiary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white hover:bg-apple-bg dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-apple-danger-soft dark:bg-rose-500/20 text-apple-danger dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-500/30">
              {errorMsg}
            </div>
          )}

          {/* Top Center Circular Avatar Emoji Picker */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-16 h-16 rounded-3xl bg-apple-bg dark:bg-neutral-800 hover:bg-apple-border/50 dark:hover:bg-neutral-700 border border-apple-border dark:border-white/10 shadow-sm flex items-center justify-center text-3xl transition-transform active:scale-95 relative group"
              title="Choose Emoji Icon"
            >
              {selectedIcon || "📦"}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm border border-white dark:border-[#16161A] group-hover:scale-110 transition-transform">
                <Sparkles className="w-3 h-3" />
              </div>
            </button>
            <span className="text-[11px] text-apple-tertiary dark:text-neutral-400 mt-1.5 font-medium">
              Tap circle to choose emoji
            </span>

            {/* Apple Style Emoji Selector Popup Grid */}
            {showEmojiPicker && (
              <div className="w-full mt-3 p-3 bg-apple-bg dark:bg-[#1C1C22] border border-apple-border dark:border-white/10 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-apple-secondary dark:text-neutral-300 mb-2 px-1">
                  <span>Select Apple Emoji</span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-apple-tertiary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white text-[11px]"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white dark:bg-[#16161A] rounded-xl border border-apple-border dark:border-white/10">
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
                      className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-90 ${
                        selectedIcon === emoji ? "bg-blue-100 dark:bg-blue-500/30 ring-2 ring-blue-500/40" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name & Provider */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Name</label>
              <input
                {...register("name")}
                placeholder="e.g. Netflix"
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white placeholder:text-apple-tertiary dark:placeholder:text-neutral-500"
              />
              {errors.name && <p className="text-[10px] text-apple-danger mt-1">{errors.name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Provider / Brand</label>
              <input
                {...register("provider")}
                placeholder="e.g. Netflix Inc."
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white placeholder:text-apple-tertiary dark:placeholder:text-neutral-500"
              />
              {errors.provider && <p className="text-[10px] text-apple-danger mt-1">{errors.provider.message as string}</p>}
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Category</label>
              <select
                {...register("category")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="PAUSED">Paused</option>
                <option value="TO_CANCEL">To Cancel</option>
              </select>
            </div>
          </div>

          {/* Price & Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Price ({currency})</label>
              <input
                type="number"
                step="any"
                {...register("price")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              />
              {errors.price && <p className="text-[10px] text-apple-danger mt-1">{errors.price.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Billing Cycle</label>
              <select
                {...register("billingCycle")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
                <option value="CUSTOM">Custom Interval</option>
              </select>
            </div>
          </div>

          {/* Custom Interval Months (Only if CUSTOM) */}
          {watchCycle === "CUSTOM" && (
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Interval (Months)</label>
              <input
                type="number"
                min="1"
                {...register("customIntervalMonths")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              />
            </div>
          )}

          {/* Renewal & Trial Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Next Renewal Date</label>
              <input
                type="date"
                {...register("nextRenewalDate")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              />
              {errors.nextRenewalDate && (
                <p className="text-[10px] text-apple-danger mt-1">{errors.nextRenewalDate.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">
                {watchStatus === "TRIAL" ? "Trial Expiry Date *" : "Trial Expiry Date (Optional)"}
              </label>
              <input
                type="date"
                {...register("trialEndDate")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white"
              />
            </div>
          </div>

          {/* Cancellation Portal Link */}
          <div>
            <label className="block text-xs font-medium text-apple-secondary dark:text-neutral-400 mb-1">Direct Cancel URL (Optional)</label>
            <input
              {...register("cancelUrl")}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 text-xs focus:bg-white dark:focus:bg-[#1C1C22] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white placeholder:text-apple-tertiary dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-between gap-2 border-t border-apple-border dark:border-white/10">
            {subscriptionToEdit ? (
              <button
                type="button"
                onClick={handleQuickMarkPaid}
                disabled={isMarkingPaid}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMarkingPaid ? "Reiniciando..." : "Marcar como Pagada"}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-apple-text dark:bg-white text-white dark:text-black hover:opacity-90 transition shadow-apple disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : subscriptionToEdit ? "Save Changes" : "Create Subscription"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

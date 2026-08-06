"use client";

import { createSubscription, updateSubscription } from "@/app/actions/subscriptions";
import { SubscriptionItem } from "@/lib/financials";
import { subscriptionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: SubscriptionItem | null;
  currency: string;
}

export function SubscriptionModal({ isOpen, onClose, subscriptionToEdit, currency }: SubscriptionModalProps) {
  const [errorMsg, setErrorMsg] = useState("");

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
    billingCycle: "MONTHLY" as const,
    customIntervalMonths: 1,
    nextRenewalDate: format(new Date(), "yyyy-MM-dd"),
    trialEndDate: "",
    autoRenew: true,
    status: "ACTIVE" as const,
    notes: "",
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

  useEffect(() => {
    if (subscriptionToEdit) {
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
        cancelUrl: (subscriptionToEdit as any).cancelUrl || "",
        cancelSteps: (subscriptionToEdit as any).cancelSteps || "",
        reminderDays: (subscriptionToEdit as any).reminderDays || 3,
        flaggedLowUsage: subscriptionToEdit.flaggedLowUsage,
      });
    } else {
      reset(defaultValues);
    }
  }, [subscriptionToEdit, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setErrorMsg("");
    let res;
    if (subscriptionToEdit) {
      res = await updateSubscription(subscriptionToEdit.id, data);
    } else {
      res = await createSubscription(data);
    }

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-apple-modal border border-apple-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-border">
          <h3 className="font-semibold text-apple-text text-base">
            {subscriptionToEdit ? "Edit Subscription" : "Add Subscription"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-apple-tertiary hover:text-apple-text hover:bg-apple-bg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-apple-danger-soft text-apple-danger text-xs font-medium border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Name & Provider */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Name</label>
              <input
                {...register("name")}
                placeholder="e.g. Netflix"
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {errors.name && <p className="text-[10px] text-apple-danger mt-1">{errors.name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Provider / Brand</label>
              <input
                {...register("provider")}
                placeholder="e.g. Netflix Inc."
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
              {errors.provider && <p className="text-[10px] text-apple-danger mt-1">{errors.provider.message as string}</p>}
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Category</label>
              <select
                {...register("category")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
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
              <label className="block text-xs font-medium text-apple-secondary mb-1">Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text font-semibold"
              />
              {errors.price && <p className="text-[10px] text-apple-danger mt-1">{errors.price.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Billing Cycle</label>
              <select
                {...register("billingCycle")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="QUARTERLY">Quarterly (3 mos)</option>
                <option value="CUSTOM">Custom Interval</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Next Renewal Date</label>
              <input
                type="date"
                {...register("nextRenewalDate")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-apple-secondary mb-1">Trial End Date (Optional)</label>
              <input
                type="date"
                {...register("trialEndDate")}
                className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
              />
            </div>
          </div>

          {/* Direct Cancel Link & Notes */}
          <div>
            <label className="block text-xs font-medium text-apple-secondary mb-1">Cancellation Link (URL)</label>
            <input
              type="url"
              {...register("cancelUrl")}
              placeholder="https://provider.com/account/cancel"
              className="w-full px-3.5 py-2 rounded-xl bg-apple-bg border border-apple-border text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text"
            />
          </div>

          {/* Low usage toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-apple-bg border border-apple-border">
            <div>
              <div className="text-xs font-medium text-apple-text">Flag for Review / Low Usage</div>
              <div className="text-[11px] text-apple-tertiary">Include in optimization & potential savings detector</div>
            </div>
            <input
              type="checkbox"
              {...register("flaggedLowUsage")}
              className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 border-gray-300"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-apple-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-apple-bg text-apple-secondary text-xs font-medium hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-apple-text text-white text-xs font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : subscriptionToEdit ? "Save Changes" : "Create Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { toggleLowUsageFlag, updateSubscriptionStatus } from "@/app/actions/subscriptions";
import { calculateMonthlyEquivalent, formatCurrency, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { AlertCircle, Calendar, ExternalLink, Flag, MoreVertical, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface SubscriptionCardProps {
  subscription: SubscriptionItem;
  currency: string;
  onEdit: (subscription: SubscriptionItem) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, currency, onEdit, onDelete }: SubscriptionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [flagged, setFlagged] = useState(subscription.flaggedLowUsage);

  const monthlyEquivalent = calculateMonthlyEquivalent(
    subscription.price,
    subscription.billingCycle,
    subscription.customIntervalMonths
  );

  const daysUntilRenewal = getDaysUntil(subscription.nextRenewalDate);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-apple-success-soft text-emerald-800 font-medium">Active</span>;
      case "TRIAL":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-apple-warning-soft text-amber-800 font-medium">Trial</span>;
      case "PAUSED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 font-medium">Paused</span>;
      case "TO_CANCEL":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-medium">To Cancel</span>;
      case "CANCELLED":
      case "VERIFIED_CANCELLED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500 font-medium line-through">Cancelled</span>;
      default:
        return null;
    }
  };

  const handleToggleFlag = async () => {
    const nextState = !flagged;
    setFlagged(nextState);
    await toggleLowUsageFlag(subscription.id, nextState);
  };

  const handleMarkToCancel = async () => {
    setShowMenu(false);
    await updateSubscriptionStatus(subscription.id, "TO_CANCEL");
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-apple-border shadow-apple hover:shadow-apple-hover transition-all group relative">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon & Name */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-apple-bg flex items-center justify-center font-bold text-apple-text text-sm border border-apple-border group-hover:scale-105 transition-transform shrink-0">
            {subscription.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-apple-text text-sm">{subscription.name}</h4>
              {getStatusBadge(subscription.status)}
            </div>
            <p className="text-xs text-apple-secondary mt-0.5">{subscription.provider}</p>
          </div>
        </div>

        {/* Right: Price & Options */}
        <div className="flex items-start gap-2">
          <div className="text-right">
            <div className="font-semibold text-apple-text text-sm">
              {formatCurrency(subscription.price, currency)}
            </div>
            <div className="text-[11px] text-apple-tertiary">
              {subscription.billingCycle === "MONTHLY"
                ? "/ month"
                : `${formatCurrency(monthlyEquivalent, currency)}/mo (${subscription.billingCycle.toLowerCase()})`}
            </div>
          </div>

          {/* Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-xl text-apple-tertiary hover:text-apple-text hover:bg-apple-bg transition"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Context Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-apple-modal border border-apple-border py-1.5 z-30 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(subscription);
                  }}
                  className="w-full text-left px-3.5 py-2 text-apple-text hover:bg-apple-bg flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-apple-secondary" />
                  Edit details
                </button>

                <button
                  onClick={handleToggleFlag}
                  className="w-full text-left px-3.5 py-2 text-apple-text hover:bg-apple-bg flex items-center gap-2"
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged ? "text-amber-500 fill-amber-500" : "text-apple-secondary"}`} />
                  {flagged ? "Unflag review" : "Flag as low usage"}
                </button>

                {subscription.status !== "TO_CANCEL" && (
                  <button
                    onClick={handleMarkToCancel}
                    className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Move to Cancel Center
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(subscription.id);
                  }}
                  className="w-full text-left px-3.5 py-2 text-apple-danger hover:bg-apple-danger-soft flex items-center gap-2 border-t border-apple-border mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete permanently
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meta Footer Row */}
      <div className="mt-4 pt-3 border-t border-apple-border flex items-center justify-between text-xs text-apple-secondary">
        {/* Left: Category & Low Usage Pill */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-apple-bg border border-apple-border text-[11px] font-medium text-apple-secondary">
            {subscription.category}
          </span>
          {flagged && (
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60 flex items-center gap-1">
              <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
              Low usage
            </span>
          )}
        </div>

        {/* Right: Next Renewal Date */}
        <div className="flex items-center gap-2 text-apple-tertiary text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {daysUntilRenewal < 0
              ? "Overdue"
              : daysUntilRenewal === 0
              ? "Renews Today"
              : `Renews in ${daysUntilRenewal}d`}
          </span>
          {(subscription as any).cancelUrl && (
            <a
              href={(subscription as any).cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-apple-text transition"
              title="Official Cancellation URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

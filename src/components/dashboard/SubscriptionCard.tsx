"use client";

import { markSubscriptionAsPaid, toggleLowUsageFlag, updateSubscriptionStatus } from "@/app/actions/subscriptions";
import { MonaiAmountPill } from "@/components/ui/MonaiAmountPill";
import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiDropdown, MonaiDropdownItem } from "@/components/ui/MonaiDropdown";
import { calculateMonthlyEquivalent, formatCurrency, getAutoEmoji, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { CheckCircle2, Edit2, Flag, MoreVertical, ShieldAlert, Trash2 } from "lucide-react";
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
  const [isPaidLoading, setIsPaidLoading] = useState(false);

  const monthlyEquivalent = calculateMonthlyEquivalent(
    subscription.price,
    subscription.billingCycle,
    subscription.customIntervalMonths
  );

  const daysUntilRenewal = getDaysUntil(subscription.nextRenewalDate);

  const handleMarkAsPaid = async () => {
    setShowMenu(false);
    setIsPaidLoading(true);
    await markSubscriptionAsPaid(subscription.id);
    setIsPaidLoading(false);
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

  const icon = subscription.icon || getAutoEmoji(subscription.name, subscription.category);
  const renewalText =
    daysUntilRenewal < 0
      ? "Overdue"
      : daysUntilRenewal === 0
      ? "Renews Today"
      : `Renews in ${daysUntilRenewal}d`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-[var(--green)]";
      case "TRIAL":
        return "text-[var(--amber)]";
      case "TO_CANCEL":
        return "text-[var(--coral)]";
      default:
        return "text-[var(--text-secondary)]";
    }
  };

  const menuItems: MonaiDropdownItem[] = [
    {
      label: isPaidLoading ? "Reiniciando..." : "Marcar como pagada",
      icon: <CheckCircle2 className="w-4 h-4 text-[var(--green)]" />,
      onClick: handleMarkAsPaid,
      variant: "success",
      divider: true,
    },
    {
      label: "Edit details",
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => onEdit(subscription),
    },
    {
      label: flagged ? "Unflag review" : "Flag as low usage",
      icon: <Flag className={`w-4 h-4 ${flagged ? "text-[var(--amber)] fill-[var(--amber)]" : ""}`} />,
      onClick: handleToggleFlag,
    },
    ...(subscription.status !== "TO_CANCEL"
      ? [
          {
            label: "Move to Cancel Center",
            icon: <ShieldAlert className="w-4 h-4 text-[var(--coral)]" />,
            onClick: handleMarkToCancel,
            variant: "warning" as const,
          },
        ]
      : []),
    {
      label: "Delete permanently",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete(subscription.id),
      variant: "danger",
      divider: true,
    },
  ];

  return (
    <div className="bg-[var(--surface)] rounded-[24px] p-4 sm:p-5 border border-[var(--border)] shadow-lg hover:border-white/20 transition-all duration-200 group relative flex items-center justify-between gap-3">
      {/* Left: MonAI Avatar 56px + Category & Status beside it + Name + Provider & Renewal date */}
      <div className="flex items-center gap-3.5 min-w-0">
        <MonaiAvatar emoji={icon} size="md" isRecurring={true} />

        <div className="min-w-0">
          {/* Category & Status beside each other */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
            <span>{subscription.category}</span>
            <span className={getStatusColor(subscription.status)}>
              • {subscription.status}
            </span>
            {flagged && (
              <span className="text-[var(--amber)]">
                • 👻 Low Usage
              </span>
            )}
          </div>

          {/* Subscription Name */}
          <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight truncate mt-0.5">
            {subscription.name}
          </h4>

          {/* Provider & Subtle Renewal Date underneath */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] truncate mt-0.5">
            <span className="truncate">{subscription.provider}</span>
            <span className="opacity-40">•</span>
            <span className={`text-[11px] font-bold ${daysUntilRenewal <= 0 ? "text-[var(--coral)]" : "opacity-75"}`}>
              📅 {renewalText}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions Column (3-dots menu + circular checkmark button under it) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <MonaiAmountPill
          amount={formatCurrency(subscription.price, currency)}
          prefix="⊖"
          subtitle={
            subscription.billingCycle === "MONTHLY"
              ? "/ month"
              : `${formatCurrency(monthlyEquivalent, currency)}/mo`
          }
        />

        <div className="flex flex-col items-center gap-1.5">
          {/* Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition flex items-center justify-center monai-press active:scale-90"
              aria-label="Options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            <MonaiDropdown
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              items={menuItems}
            />
          </div>

          {/* 1-Tap Circular Mark Paid Button directly under 3-dots menu */}
          <button
            type="button"
            onClick={handleMarkAsPaid}
            disabled={isPaidLoading}
            className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--green)] hover:bg-[var(--green)]/20 transition flex items-center justify-center monai-press active:scale-90 disabled:opacity-50"
            title="Marcar como pagada"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { markSubscriptionAsPaid, toggleLowUsageFlag, updateSubscriptionStatus } from "@/app/actions/subscriptions";
import { MonaiAmountPill } from "@/components/ui/MonaiAmountPill";
import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiDropdown, MonaiDropdownItem } from "@/components/ui/MonaiDropdown";
import { MonaiPill } from "@/components/ui/MonaiPill";
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

  const getStatusPillVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "TRIAL":
        return "amber";
      case "TO_CANCEL":
        return "coral";
      default:
        return "tag";
    }
  };

  const icon = subscription.icon || getAutoEmoji(subscription.name, subscription.category);
  const renewalText =
    daysUntilRenewal < 0
      ? "Overdue"
      : daysUntilRenewal === 0
      ? "Renews Today"
      : `Renews in ${daysUntilRenewal}d`;

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
    <div className="bg-[var(--surface)] rounded-[28px] p-5 sm:p-6 border border-[var(--border)] shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-200 group relative">
      <div className="flex items-start justify-between gap-4">
        {/* Left: MonAI Avatar 64px + Details */}
        <div className="flex items-start gap-4 min-w-0">
          <MonaiAvatar emoji={icon} size="lg" isRecurring={true} />

          <div className="min-w-0 pt-0.5">
            <span className="text-xs font-bold text-[var(--text-secondary)] block uppercase tracking-wider">
              {subscription.category}
            </span>

            <h4 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight truncate mt-0.5">
              {subscription.name}
            </h4>

            <p className="text-xs font-bold text-[var(--text-secondary)] truncate">
              {subscription.provider}
            </p>

            {/* Tag Pills Row (#categoría, #estado, #low_usage) */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              <MonaiPill variant={getStatusPillVariant(subscription.status)} className="text-[11px] py-0.5 px-2.5">
                {subscription.status}
              </MonaiPill>

              {flagged && (
                <MonaiPill variant="amber" className="text-[11px] py-0.5 px-2.5">
                  👻 Low Usage
                </MonaiPill>
              )}
            </div>
          </div>
        </div>

        {/* Right: MonAI AmountPill & Options */}
        <div className="flex items-start gap-2 shrink-0">
          <MonaiAmountPill
            amount={formatCurrency(subscription.price, currency)}
            prefix="⊖"
            subtitle={
              subscription.billingCycle === "MONTHLY"
                ? "/ month"
                : `${formatCurrency(monthlyEquivalent, currency)}/mo (${subscription.billingCycle.toLowerCase()})`
            }
          />

          {/* Context Menu Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition flex items-center justify-center monai-press active:scale-90"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* MonAI Dropdown */}
            <MonaiDropdown
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              items={menuItems}
            />
          </div>
        </div>
      </div>

      {/* Footer Row: Renewal countdown + 1-Tap [✓ Pagado] Pill */}
      <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="text-xs font-extrabold text-[var(--text-secondary)] flex items-center gap-1">
          <span>🗓</span>
          <span className={daysUntilRenewal <= 0 ? "text-[var(--coral)]" : ""}>{renewalText}</span>
        </div>

        <button
          type="button"
          onClick={handleMarkAsPaid}
          disabled={isPaidLoading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--pill-light)] text-[var(--pill-light-text)] text-xs font-black shadow-sm hover:opacity-90 transition-all monai-press active:scale-95 disabled:opacity-50"
          title="Marcar como pagada y reiniciar ciclo"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)] stroke-[2.5]" />
          <span>{isPaidLoading ? "..." : "⊕ Marcar Pagada"}</span>
        </button>
      </div>
    </div>
  );
}

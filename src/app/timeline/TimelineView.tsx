"use client";

import { MonaiAmountPill } from "@/components/ui/MonaiAmountPill";
import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiPill } from "@/components/ui/MonaiPill";
import { formatCurrency, getAutoEmoji, getDaysUntil } from "@/lib/financials";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

type TimeRange = "7d" | "30d" | "90d" | "1y";

export function TimelineView({ subscriptions }: { subscriptions: any[] }) {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "$";
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const referenceDate = new Date();

  // Filter subscriptions based on selected time window
  const filteredEvents = useMemo(() => {
    const maxDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;

    return subscriptions
      .filter((s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL")
      .map((s) => ({
        ...s,
        renewalDate: new Date(s.nextRenewalDate),
        daysUntil: getDaysUntil(s.nextRenewalDate, referenceDate),
      }))
      .filter((s) => s.daysUntil >= 0 && s.daysUntil <= maxDays)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [subscriptions, timeRange]);

  // Group events by Month
  const groupedEvents = useMemo(() => {
    const groups: { monthName: string; events: typeof filteredEvents; monthTotal: number }[] = [];

    filteredEvents.forEach((event) => {
      const monthName = format(event.renewalDate, "MMMM yyyy");
      const existing = groups.find((g) => g.monthName === monthName);
      if (existing) {
        existing.events.push(event);
        existing.monthTotal += event.price;
      } else {
        groups.push({ monthName, events: [event], monthTotal: event.price });
      }
    });

    return groups;
  }, [filteredEvents]);

  // Total spend in current timeline window
  const windowTotal = useMemo(() => {
    return filteredEvents.reduce((acc, curr) => acc + curr.price, 0);
  }, [filteredEvents]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header MonAI Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[var(--surface)] rounded-[32px] p-8 border border-[var(--border)] shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
            <CalendarIcon className="w-4 h-4 text-[var(--coral)] stroke-[2.5]" />
            Renewal Timeline
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Upcoming Charges</h1>
          <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
            Chronological foresight into future subscription renewals.
          </p>
        </div>

        {/* Time horizon segmented pill */}
        <div className="flex items-center gap-1.5 bg-[var(--tag)] p-1.5 rounded-full border border-[var(--border)] self-start sm:self-auto">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-150 monai-press active:scale-95 ${
                timeRange === range
                  ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-white/20 shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {range === "7d"
                ? "Next 7d"
                : range === "30d"
                ? "30d"
                : range === "90d"
                ? "90d"
                : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Month Strip MonAI Summary Pills */}
      {groupedEvents.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {groupedEvents.map((g) => (
            <MonaiPill key={g.monthName} active={true} className="text-xs font-black py-2 px-4 shrink-0">
              📅 {g.monthName}: {formatCurrency(g.monthTotal, currency)}
            </MonaiPill>
          ))}
        </div>
      )}

      {/* Timeline ListGroups */}
      {groupedEvents.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface)] rounded-[32px] border border-[var(--border)] p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl mx-auto shadow-sm">
            🗓️
          </div>
          <h3 className="font-black text-[var(--text-primary)] text-lg">No charges scheduled</h3>
          <p className="text-xs font-bold text-[var(--text-secondary)] max-w-sm mx-auto">
            You don't have any subscription renewals in the selected time window.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map((group) => (
            <div key={group.monthName} className="space-y-3">
              {/* ListGroup Month Header */}
              <div className="flex items-center justify-between px-2">
                <MonaiPill variant="default" className="text-xs font-black uppercase tracking-wider">
                  {group.monthName} ({group.events.length})
                </MonaiPill>

                <MonaiPill variant="tag" className="text-xs font-bold">
                  Total: {formatCurrency(group.monthTotal, currency)}
                </MonaiPill>
              </div>

              {/* Events inside Month */}
              <div className="space-y-3">
                {group.events.map((event) => {
                  const isTrial = event.status === "TRIAL";
                  const icon = event.icon || getAutoEmoji(event.name, event.category);

                  return (
                    <div
                      key={event.id}
                      className="bg-[var(--surface)] rounded-[28px] p-5 border border-[var(--border)] shadow-xl flex items-center justify-between gap-4 transition-all hover:border-white/20"
                    >
                      {/* Left: Date Box & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* MonAI Date Box */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border)] shrink-0 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                            {format(event.renewalDate, "MMM")}
                          </span>
                          <span className="text-xl font-black text-[var(--text-primary)] leading-none mt-0.5">
                            {format(event.renewalDate, "dd")}
                          </span>
                        </div>

                        <MonaiAvatar emoji={icon} size="md" isRecurring={true} />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                              {event.name}
                            </h4>
                            {isTrial && (
                              <MonaiPill variant="amber" className="text-[10px] py-0.5 px-2">
                                Trial Expiry
                              </MonaiPill>
                            )}
                          </div>
                          <p className="text-xs font-bold text-[var(--text-secondary)] mt-0.5 truncate">
                            {event.provider} • {event.category}
                          </p>
                        </div>
                      </div>

                      {/* Right: Days countdown & MonAI AmountPill */}
                      <div className="flex items-center gap-3 shrink-0">
                        <MonaiAmountPill
                          amount={formatCurrency(event.price, currency)}
                          prefix="⊖"
                          subtitle={
                            event.daysUntil === 0
                              ? "Renews Today"
                              : `in ${event.daysUntil} day${event.daysUntil > 1 ? "s" : ""}`
                          }
                        />

                        {event.cancelUrl && (
                          <a
                            href={event.cancelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition shrink-0 monai-press active:scale-90"
                            title="Direct cancellation URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

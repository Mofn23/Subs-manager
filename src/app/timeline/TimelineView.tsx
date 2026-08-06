"use client";

import { formatCurrency, getDaysUntil } from "@/lib/financials";
import { format, isSameMonth, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";
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
    const groups: { monthName: string; events: typeof filteredEvents }[] = [];

    filteredEvents.forEach((event) => {
      const monthName = format(event.renewalDate, "MMMM yyyy");
      const existing = groups.find((g) => g.monthName === monthName);
      if (existing) {
        existing.events.push(event);
      } else {
        groups.push({ monthName, events: [event] });
      }
    });

    return groups;
  }, [filteredEvents]);

  // Total spend in current timeline window
  const windowTotal = useMemo(() => {
    return filteredEvents.reduce((acc, curr) => acc + curr.price, 0);
  }, [filteredEvents]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#16161A] rounded-3xl p-6 border border-apple-border dark:border-white/10 shadow-apple">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary dark:text-neutral-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-apple-tertiary dark:text-neutral-500" />
            Renewal Timeline
          </div>
          <h1 className="text-2xl font-semibold text-apple-text dark:text-white tracking-tight">Upcoming Charges</h1>
          <p className="text-xs text-apple-secondary dark:text-neutral-400 mt-0.5">
            Calm, chronological foresight into future billing dates.
          </p>
        </div>

        {/* Time horizon segmented tab */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-apple-border dark:border-white/10 text-xs font-medium self-start sm:self-auto">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeRange === range
                  ? "bg-white dark:bg-[#16161A] text-apple-text dark:text-white shadow-apple font-semibold"
                  : "text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white"
              }`}
            >
              {range === "7d"
                ? "Next 7 Days"
                : range === "30d"
                ? "30 Days"
                : range === "90d"
                ? "90 Days"
                : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline total stats summary */}
      <div className="flex items-center justify-between px-4 text-xs font-medium text-apple-secondary dark:text-neutral-400">
        <span>Showing {filteredEvents.length} renewal events</span>
        <span>
          Total expected in window: <strong className="text-apple-text dark:text-white font-semibold">{formatCurrency(windowTotal, currency)}</strong>
        </span>
      </div>

      {/* Timeline Events List */}
      {groupedEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#16161A] rounded-3xl border border-apple-border dark:border-white/10 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-apple-bg dark:bg-neutral-800 flex items-center justify-center text-apple-tertiary dark:text-neutral-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-apple-text dark:text-white text-sm">No charges scheduled</h3>
          <p className="text-xs text-apple-secondary dark:text-neutral-400 max-w-sm mx-auto">
            You don't have any subscription renewals in the selected time window.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <div key={group.monthName} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary dark:text-neutral-400 px-2">
                {group.monthName}
              </h3>

              <div className="space-y-2.5">
                {group.events.map((event) => {
                  const isTrial = event.status === "TRIAL";
                  const isHighCost = event.price >= 50;

                  return (
                    <div
                      key={event.id}
                      className="bg-white dark:bg-[#16161A] rounded-2xl p-4 border border-apple-border dark:border-white/10 shadow-apple flex items-center justify-between gap-4 transition-all hover:border-blue-200"
                    >
                      {/* Left: Date pill & Name */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-apple-bg dark:bg-neutral-800 border border-apple-border dark:border-white/10 shrink-0">
                          <span className="text-[10px] font-medium uppercase text-apple-tertiary dark:text-neutral-400">
                            {format(event.renewalDate, "MMM")}
                          </span>
                          <span className="text-base font-bold text-apple-text dark:text-white">
                            {format(event.renewalDate, "dd")}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-apple-text text-sm">{event.name}</h4>
                            {isTrial && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Trial Expiry
                              </span>
                            )}
                            {isHighCost && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-medium">
                                High Value
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-apple-secondary mt-0.5">
                            {event.provider} • {event.category}
                          </p>
                        </div>
                      </div>

                      {/* Right: Days countdown & Price */}
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-apple-text text-sm">
                            {formatCurrency(event.price, currency)}
                          </div>
                          <div className="text-[11px] text-apple-tertiary">
                            {event.daysUntil === 0
                              ? "Renews Today"
                              : `in ${event.daysUntil} day${event.daysUntil > 1 ? "s" : ""}`}
                          </div>
                        </div>

                        {event.cancelUrl && (
                          <a
                            href={event.cancelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-apple-tertiary hover:text-apple-text hover:bg-apple-bg transition shrink-0"
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

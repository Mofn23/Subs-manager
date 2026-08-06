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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-apple-border shadow-apple">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-apple-secondary mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-apple-tertiary" />
            Renewal Timeline
          </div>
          <h1 className="text-2xl font-semibold text-apple-text tracking-tight">Upcoming Charges</h1>
          <p className="text-xs text-apple-secondary mt-0.5">
            Calm, chronological foresight into future billing dates.
          </p>
        </div>

        {/* Time horizon segmented tab */}
        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-2xl border border-apple-border text-xs font-medium self-start sm:self-auto">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeRange === range
                  ? "bg-white text-apple-text shadow-apple font-semibold"
                  : "text-apple-secondary hover:text-apple-text"
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
      <div className="flex items-center justify-between px-4 text-xs font-medium text-apple-secondary">
        <span>Showing {filteredEvents.length} renewal events</span>
        <span>
          Total expected in window: <strong className="text-apple-text font-semibold">{formatCurrency(windowTotal, currency)}</strong>
        </span>
      </div>

      {/* Timeline Events List */}
      {groupedEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-apple-border p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-apple-bg flex items-center justify-center text-apple-tertiary mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-apple-text text-sm">No charges scheduled</h3>
          <p className="text-xs text-apple-secondary max-w-sm mx-auto">
            You don't have any subscription renewals in the selected time window.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <div key={group.monthName} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-apple-secondary px-2">
                {group.monthName}
              </h3>

              <div className="space-y-2.5">
                {group.events.map((event) => {
                  const isTrial = event.status === "TRIAL";
                  const isHighCost = event.price >= 50;

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl p-4 border border-apple-border shadow-apple flex items-center justify-between gap-4 transition-all hover:border-blue-200"
                    >
                      {/* Left: Date pill & Name */}
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-apple-bg border border-apple-border shrink-0">
                          <span className="text-[10px] font-medium uppercase text-apple-tertiary">
                            {format(event.renewalDate, "MMM")}
                          </span>
                          <span className="text-base font-bold text-apple-text">
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

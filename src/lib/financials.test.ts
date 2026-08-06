import { describe, expect, it } from "vitest";
import {
  calculateAnnualEquivalent,
  calculateMonthlyEquivalent,
  calculateSpendSummary,
  detectSubscriptionLeaks,
  formatCurrency,
  getDaysUntil,
  SubscriptionItem,
} from "./financials";

describe("Financials Library", () => {
  it("normalizes billing cycles correctly to monthly cost", () => {
    expect(calculateMonthlyEquivalent(120, "YEARLY")).toBe(10);
    expect(calculateMonthlyEquivalent(30, "QUARTERLY")).toBe(10);
    expect(calculateMonthlyEquivalent(15, "MONTHLY")).toBe(15);
    expect(calculateMonthlyEquivalent(10, "WEEKLY")).toBeCloseTo(43.33, 1);
    expect(calculateMonthlyEquivalent(60, "CUSTOM", 6)).toBe(10);
  });

  it("calculates annual equivalents correctly", () => {
    expect(calculateAnnualEquivalent(10, "MONTHLY")).toBe(120);
    expect(calculateAnnualEquivalent(120, "YEARLY")).toBe(120);
  });

  it("formats currency accurately", () => {
    expect(formatCurrency(19.99, "$")).toBe("$19.99");
    expect(formatCurrency(1200, "€")).toBe("€1,200.00");
  });

  it("calculates spend summary for active subscriptions", () => {
    const mockSubs: SubscriptionItem[] = [
      {
        id: "1",
        name: "Netflix",
        provider: "Netflix Inc",
        category: "Streaming",
        price: 15,
        billingCycle: "MONTHLY",
        nextRenewalDate: new Date(),
        autoRenew: true,
        status: "ACTIVE",
        flaggedLowUsage: false,
      },
      {
        id: "2",
        name: "iCloud 2TB",
        provider: "Apple",
        category: "Utilities",
        price: 120,
        billingCycle: "YEARLY",
        nextRenewalDate: new Date(),
        autoRenew: true,
        status: "ACTIVE",
        flaggedLowUsage: false,
      },
      {
        id: "3",
        name: "Gym Pass",
        provider: "Gym",
        category: "Fitness",
        price: 50,
        billingCycle: "MONTHLY",
        nextRenewalDate: new Date(),
        autoRenew: true,
        status: "CANCELLED", // Should not count towards active total
        flaggedLowUsage: false,
      },
    ];

    const summary = calculateSpendSummary(mockSubs);
    // Netflix: $15/mo + iCloud: $10/mo = $25/mo
    expect(summary.monthlyTotal).toBe(25);
    expect(summary.annualTotal).toBe(300);
    expect(summary.activeCount).toBe(2);
  });

  it("detects leaks and low usage savings accurately", () => {
    const refDate = new Date("2026-08-01T00:00:00.000Z");
    const mockSubs: SubscriptionItem[] = [
      {
        id: "1",
        name: "ChatGPT Plus",
        provider: "OpenAI",
        category: "AI & Tech",
        price: 20,
        billingCycle: "MONTHLY",
        nextRenewalDate: "2026-08-15",
        autoRenew: true,
        status: "ACTIVE",
        flaggedLowUsage: true, // Flagged for review!
      },
      {
        id: "2",
        name: "Midjourney Trial",
        provider: "Midjourney",
        category: "AI & Tech",
        price: 30,
        billingCycle: "MONTHLY",
        trialEndDate: "2026-08-05", // 4 days away from reference date
        nextRenewalDate: "2026-08-05",
        autoRenew: true,
        status: "TRIAL",
        flaggedLowUsage: false,
      },
    ];

    const leaks = detectSubscriptionLeaks(mockSubs, refDate);
    expect(leaks.expiringTrials).toHaveLength(1);
    expect(leaks.expiringTrials[0].name).toBe("Midjourney Trial");
    expect(leaks.lowUsageSubs).toHaveLength(1);
    expect(leaks.potentialMonthlySavings).toBe(20);
    expect(leaks.potentialAnnualSavings).toBe(240);
  });
});

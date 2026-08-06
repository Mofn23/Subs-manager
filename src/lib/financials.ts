import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

export type BillingCycle = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM";

export interface SubscriptionItem {
  id: string;
  name: string;
  provider: string;
  category: string;
  price: number;
  billingCycle: string;
  customIntervalMonths?: number | null;
  nextRenewalDate: Date | string;
  trialEndDate?: Date | string | null;
  autoRenew: boolean;
  status: string;
  flaggedLowUsage: boolean;
  notes?: string | null;
  cancelUrl?: string | null;
  cancelSteps?: string | null;
  reminderDays?: number;
}

/**
 * Normalizes any billing cycle into an accurate monthly cost equivalent.
 */
export function calculateMonthlyEquivalent(
  price: number,
  billingCycle: string,
  customIntervalMonths?: number | null
): number {
  if (!price || price < 0) return 0;
  
  const cycle = (billingCycle || "MONTHLY").toUpperCase();
  switch (cycle) {
    case "WEEKLY":
      return (price * 52) / 12;
    case "MONTHLY":
      return price;
    case "QUARTERLY":
      return price / 3;
    case "YEARLY":
      return price / 12;
    case "CUSTOM":
      const interval = customIntervalMonths && customIntervalMonths > 0 ? customIntervalMonths : 1;
      return price / interval;
    default:
      return price;
  }
}

/**
 * Normalizes any billing cycle into an annual cost equivalent.
 */
export function calculateAnnualEquivalent(
  price: number,
  billingCycle: string,
  customIntervalMonths?: number | null
): number {
  return calculateMonthlyEquivalent(price, billingCycle, customIntervalMonths) * 12;
}

/**
 * Calculates calendar days until a target date.
 */
export function getDaysUntil(targetDate: Date | string, referenceDate: Date = new Date()): number {
  const target = typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
  return differenceInCalendarDays(startOfDay(target), startOfDay(referenceDate));
}

/**
 * Formats currency values cleanly in Apple HIG style.
 * Omits trailing .00 decimal clutter on integers and cleans currency symbols.
 */
export function formatCurrency(amount: number, currencySymbol: string = "$"): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "$0";
  }
  const num = Number(amount);
  const isInteger = num % 1 === 0;

  const formattedNumber = num.toLocaleString("en-US", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  });

  let symbol = "$";
  if (currencySymbol) {
    const clean = currencySymbol.trim().toUpperCase();
    if (clean === "EUR" || clean === "€") symbol = "€";
    else if (clean === "GBP" || clean === "£") symbol = "£";
    else symbol = "$";
  }

  return `${symbol}${formattedNumber}`;
}

/**
 * Total monthly and annual spend summary for active/trial subscriptions.
 */
export function calculateSpendSummary(subscriptions: SubscriptionItem[]) {
  const activeSubs = subscriptions.filter(
    (s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL"
  );

  const monthlyTotal = activeSubs.reduce((acc, sub) => {
    return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
  }, 0);

  const annualTotal = monthlyTotal * 12;

  return {
    monthlyTotal,
    annualTotal,
    activeCount: activeSubs.length,
  };
}

/**
 * Evaluates subscription leak opportunities (trials ending soon, low usage flags, high potential savings).
 */
export function detectSubscriptionLeaks(subscriptions: SubscriptionItem[], referenceDate: Date = new Date()) {
  const activeSubs = subscriptions.filter(
    (s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL"
  );

  // 1. Expiring trials within 7 days
  const expiringTrials = activeSubs.filter((s) => {
    if (s.status !== "TRIAL" || !s.trialEndDate) return false;
    const days = getDaysUntil(s.trialEndDate, referenceDate);
    return days >= 0 && days <= 7;
  });

  // 2. Low usage / review requested
  const lowUsageSubs = activeSubs.filter((s) => s.flaggedLowUsage);

  // 3. Potential monthly savings if low usage and expiring trials are canceled
  const potentialMonthlySavings = lowUsageSubs.reduce((acc, sub) => {
    return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
  }, 0);

  const potentialAnnualSavings = potentialMonthlySavings * 12;

  // 4. Category breakdown
  const categorySpendMap: Record<string, { monthly: number; count: number }> = {};

  activeSubs.forEach((sub) => {
    const monthlyCost = calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
    const cat = sub.category || "Other";
    if (!categorySpendMap[cat]) {
      categorySpendMap[cat] = { monthly: 0, count: 0 };
    }
    categorySpendMap[cat].monthly += monthlyCost;
    categorySpendMap[cat].count += 1;
  });

  return {
    expiringTrials,
    lowUsageSubs,
    potentialMonthlySavings,
    potentialAnnualSavings,
    categorySpendMap,
  };
}

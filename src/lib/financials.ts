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
  icon?: string | null;
  cancelUrl?: string | null;
  cancelSteps?: string | null;
  reminderDays?: number;
}

/**
 * Returns a smart matching Apple-style emoji based on subscription name or category.
 */
export function getAutoEmoji(name: string = "", category: string = ""): string {
  const query = `${name} ${category}`.toLowerCase();

  if (query.includes("netflix") || query.includes("prime") || query.includes("hbo") || query.includes("disney") || query.includes("movie") || query.includes("film")) return "🍿";
  if (query.includes("spotify") || query.includes("music") || query.includes("audio") || query.includes("tidal") || query.includes("deezer") || query.includes("song")) return "🎵";
  if (query.includes("youtube") || query.includes("video") || query.includes("tv")) return "📺";
  if (query.includes("chatgpt") || query.includes("openai") || query.includes("claude") || query.includes("midjourney") || query.includes("ai")) return "🤖";
  if (query.includes("cloud") || query.includes("drive") || query.includes("dropbox") || query.includes("storage")) return "☁️";
  if (query.includes("playstation") || query.includes("xbox") || query.includes("game") || query.includes("nintendo") || query.includes("steam")) return "🎮";
  if (query.includes("gym") || query.includes("fitness") || query.includes("workout") || query.includes("health") || query.includes("sport")) return "🏋️‍♂️";
  if (query.includes("movistar") || query.includes("claro") || query.includes("tigo") || query.includes("datos") || query.includes("phone") || query.includes("celular") || query.includes("mobile")) return "📱";
  if (query.includes("electric") || query.includes("luz") || query.includes("energy") || query.includes("power") || query.includes("servicio")) return "⚡";
  if (query.includes("agua") || query.includes("water")) return "💧";
  if (query.includes("github") || query.includes("adobe") || query.includes("figma") || query.includes("code") || query.includes("software")) return "💻";
  if (query.includes("car") || query.includes("uber") || query.includes("auto")) return "🚗";
  if (query.includes("book") || query.includes("kindle") || query.includes("read")) return "📚";
  if (query.includes("rappi") || query.includes("ubereats") || query.includes("food") || query.includes("comida")) return "🍕";
  if (query.includes("bank") || query.includes("tarjeta") || query.includes("card")) return "💳";

  const cat = (category || "").toLowerCase();
  if (cat.includes("stream")) return "🍿";
  if (cat.includes("ai") || cat.includes("tech")) return "🤖";
  if (cat.includes("product")) return "💻";
  if (cat.includes("fit")) return "🏋️‍♂️";
  if (cat.includes("game")) return "🎮";
  if (cat.includes("util")) return "⚡";

  return "📦";
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

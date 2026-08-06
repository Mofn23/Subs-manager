const { differenceInCalendarDays, parseISO, startOfDay } = require("date-fns");

function calculateMonthlyEquivalent(price, billingCycle, customIntervalMonths) {
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

function calculateAnnualEquivalent(price, billingCycle, customIntervalMonths) {
  return calculateMonthlyEquivalent(price, billingCycle, customIntervalMonths) * 12;
}

function getDaysUntil(targetDate, referenceDate = new Date()) {
  const target = typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
  return differenceInCalendarDays(startOfDay(target), startOfDay(referenceDate));
}

function formatCurrency(amount, currencySymbol = "$") {
  const formatted = (amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatted}`;
}

function calculateSpendSummary(subscriptions) {
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

function detectSubscriptionLeaks(subscriptions, referenceDate = new Date()) {
  const activeSubs = subscriptions.filter(
    (s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL"
  );

  const expiringTrials = activeSubs.filter((s) => {
    if (s.status !== "TRIAL" || !s.trialEndDate) return false;
    const days = getDaysUntil(s.trialEndDate, referenceDate);
    return days >= 0 && days <= 7;
  });

  const lowUsageSubs = activeSubs.filter((s) => s.flaggedLowUsage);

  const potentialMonthlySavings = lowUsageSubs.reduce((acc, sub) => {
    return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
  }, 0);

  const potentialAnnualSavings = potentialMonthlySavings * 12;

  const categorySpendMap = {};

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

module.exports = {
  calculateMonthlyEquivalent,
  calculateAnnualEquivalent,
  getDaysUntil,
  formatCurrency,
  calculateSpendSummary,
  detectSubscriptionLeaks,
};

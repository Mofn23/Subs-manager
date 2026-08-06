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
    const clean = String(currencySymbol).trim().toUpperCase();
    if (clean === "EUR" || clean === "€") symbol = "€";
    else if (clean === "GBP" || clean === "£") symbol = "£";
    else symbol = "$";
  }

  return `${symbol}${formattedNumber}`;
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

  const unusedCount = activeSubs.filter((s) => s.flaggedLowUsage).length;
  const unusedMonthlySavings = activeSubs
    .filter((s) => s.flaggedLowUsage)
    .reduce((acc, sub) => acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths), 0);

  const trialLeaks = activeSubs.filter((s) => {
    if (s.status !== "TRIAL" || !s.trialEndDate) return false;
    const daysLeft = getDaysUntil(s.trialEndDate, referenceDate);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  return {
    unusedCount,
    unusedMonthlySavings,
    unusedAnnualSavings: unusedMonthlySavings * 12,
    trialLeaks,
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

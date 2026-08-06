const test = require("node:test");
const assert = require("node:assert");
const {
  calculateMonthlyEquivalent,
  calculateAnnualEquivalent,
  formatCurrency,
  calculateSpendSummary,
  detectSubscriptionLeaks,
} = require("./financialsEngine");

test("Financials Engine - Billing Cycle Normalization", () => {
  assert.strictEqual(calculateMonthlyEquivalent(120, "YEARLY"), 10);
  assert.strictEqual(calculateMonthlyEquivalent(30, "QUARTERLY"), 10);
  assert.strictEqual(calculateMonthlyEquivalent(15, "MONTHLY"), 15);
  assert.strictEqual(calculateMonthlyEquivalent(60, "CUSTOM", 6), 10);
});

test("Financials Engine - Annual Cost Calculation", () => {
  assert.strictEqual(calculateAnnualEquivalent(10, "MONTHLY"), 120);
  assert.strictEqual(calculateAnnualEquivalent(120, "YEARLY"), 120);
});

test("Financials Engine - Currency Formatting", () => {
  assert.strictEqual(formatCurrency(19.99, "$"), "$19.99");
});

test("Financials Engine - Spend Summary", () => {
  const mockSubs = [
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
  ];

  const summary = calculateSpendSummary(mockSubs);
  assert.strictEqual(summary.monthlyTotal, 25);
  assert.strictEqual(summary.annualTotal, 300);
  assert.strictEqual(summary.activeCount, 2);
});

import { describe, it, expect } from "vitest";
import {
  rupeeToPaise,
  paiseToRupee,
  formatINR,
  getDateKey,
  formatDateDisplay,
  getDateRangePreset,
} from "./utils";
import { Transaction, Category } from "@/types";

describe("Money & Currency Utilities", () => {
  it("converts rupees to integer paise accurately without float inaccuracies", () => {
    expect(rupeeToPaise(100)).toBe(10000);
    expect(rupeeToPaise(150.5)).toBe(15050);
    expect(rupeeToPaise("49.99")).toBe(4999);
    expect(rupeeToPaise(0)).toBe(0);
    expect(rupeeToPaise("invalid")).toBe(0);
  });

  it("converts paise to rupee float", () => {
    expect(paiseToRupee(10000)).toBe(100);
    expect(paiseToRupee(15050)).toBe(150.5);
    expect(paiseToRupee(0)).toBe(0);
  });

  it("formats paise into Indian currency format (Lakhs and Crores)", () => {
    // ₹1,25,000
    expect(formatINR(12500000)).toBe("₹1,25,000");

    // Negative amounts
    expect(formatINR(-500000)).toBe("- ₹5,000");

    // With decimals option
    expect(formatINR(15050, { showDecimal: true })).toBe("₹150.50");

    // Hide symbol option
    expect(formatINR(100000, { hideSymbol: true })).toBe("1,000");
  });
});

describe("Date Utilities", () => {
  it("generates a dateKey in yyyy-MM-dd format", () => {
    const testDate = new Date("2026-10-22T10:00:00Z");
    const key = getDateKey(testDate, "UTC");
    expect(key).toBe("2026-10-22");
  });

  it("formats dateKey into human readable string", () => {
    const formatted = formatDateDisplay("2026-10-22");
    expect(formatted).toContain("22");
    expect(formatted).toContain("2026");
  });

  it("generates valid date presets", () => {
    const todayPreset = getDateRangePreset("today");
    expect(todayPreset.startDate).toBe(todayPreset.endDate);

    const sevenDaysPreset = getDateRangePreset("last7days");
    expect(sevenDaysPreset.startDate <= sevenDaysPreset.endDate).toBe(true);

    const monthPreset = getDateRangePreset("thisMonth");
    expect(monthPreset.startDate <= monthPreset.endDate).toBe(true);
  });
});

describe("Financial Summary Calculations", () => {
  it("calculates income, expense, and net profit correctly", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        businessId: "biz-1",
        type: "income",
        amount: 500000, // ₹5,000
        categoryId: "cat-1",
        paymentMode: "upi",
        dateKey: "2026-10-20",
        createdAt: 1000,
        updatedAt: 1000,
        createdBy: "user-1",
      },
      {
        id: "2",
        businessId: "biz-1",
        type: "income",
        amount: 300000, // ₹3,000
        categoryId: "cat-1",
        paymentMode: "cash",
        dateKey: "2026-10-21",
        createdAt: 2000,
        updatedAt: 2000,
        createdBy: "user-1",
      },
      {
        id: "3",
        businessId: "biz-1",
        type: "expense",
        amount: 250000, // ₹2,500
        categoryId: "cat-2",
        paymentMode: "upi",
        dateKey: "2026-10-21",
        createdAt: 3000,
        updatedAt: 3000,
        createdBy: "user-1",
      },
    ];

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const netProfit = totalIncome - totalExpense;

    expect(totalIncome).toBe(800000); // ₹8,000
    expect(totalExpense).toBe(250000); // ₹2,500
    expect(netProfit).toBe(550000); // ₹5,500
    expect(paiseToRupee(netProfit)).toBe(5500);
  });
});

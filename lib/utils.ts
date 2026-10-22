import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a rupee amount (e.g. 150.50) into integer paise (15050).
 * Prevents floating point issues via Math.round.
 */
export function rupeeToPaise(rupees: number | string): number {
  const numeric = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(numeric)) return 0;
  return Math.round(numeric * 100);
}

/**
 * Converts integer paise into rupees float (e.g. 15050 -> 150.5).
 */
export function paiseToRupee(paise: number): number {
  if (!paise || isNaN(paise)) return 0;
  return paise / 100;
}

/**
 * Formats integer paise into Indian currency format:
 * e.g. 12500000 paise -> ₹1,25,000.00 or ₹1,25,000
 */
export function formatINR(paise: number, options?: { showDecimal?: boolean; hideSymbol?: boolean }): string {
  const rupees = paiseToRupee(paise);
  const showDecimal = options?.showDecimal ?? false;
  const hideSymbol = options?.hideSymbol ?? false;

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  }).format(Math.abs(rupees));

  const prefix = rupees < 0 ? "- " : "";
  const symbol = hideSymbol ? "" : "₹";
  return `${prefix}${symbol}${formatted}`;
}

/**
 * Formats a Date object or ISO string to yyyy-MM-dd in specified timezone.
 * Defaults to "Asia/Kolkata".
 */
export function getDateKey(date: Date = new Date(), timeZone = "Asia/Kolkata"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // Outputs yyyy-mm-dd
  } catch {
    // Fallback if timezone not supported
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

/**
 * Formats dateKey ("yyyy-MM-dd") into human-friendly format: e.g. "22 Oct 2026"
 */
export function formatDateDisplay(dateKeyOrIso: string): string {
  if (!dateKeyOrIso) return "";
  const parts = dateKeyOrIso.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return dateKeyOrIso;
}

/**
 * Get date ranges for presets:
 * today, yesterday, last7days, thisMonth, last3months, thisYear
 */
export function getDateRangePreset(preset: "today" | "yesterday" | "last7days" | "thisMonth" | "last3months" | "thisYear"): {
  startDate: string;
  endDate: string;
  label: string;
} {
  const now = new Date();
  const todayKey = getDateKey(now);

  switch (preset) {
    case "today":
      return { startDate: todayKey, endDate: todayKey, label: "Today" };

    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yKey = getDateKey(y);
      return { startDate: yKey, endDate: yKey, label: "Yesterday" };
    }

    case "last7days": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { startDate: getDateKey(s), endDate: todayKey, label: "Last 7 Days" };
    }

    case "thisMonth": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: getDateKey(s), endDate: todayKey, label: "This Month" };
    }

    case "last3months": {
      const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { startDate: getDateKey(s), endDate: todayKey, label: "Last 3 Months" };
    }

    case "thisYear": {
      const s = new Date(now.getFullYear(), 0, 1);
      return { startDate: getDateKey(s), endDate: todayKey, label: "This Year" };
    }
  }
}

export type BusinessType = "restaurant" | "mart" | "shoe_shop" | "other";

export type UserRole = "owner" | "staff";

export type TransactionType = "income" | "expense";

export type PaymentMode = "cash" | "upi" | "card" | "netbanking";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  ownerUid: string;
  currency: string; // e.g. "INR"
  timezone: string; // e.g. "Asia/Kolkata"
  createdAt: number;
  updatedAt: number;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  joinedAt: number;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  kind: TransactionType;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  businessId: string;
  type: TransactionType;
  amount: number; // Integer in paise (₹100 = 10000 paise)
  categoryId: string;
  note?: string;
  partyName?: string; // Customer or Supplier name
  paymentMode: PaymentMode;
  dateKey: string; // "yyyy-MM-dd"
  createdAt: number;
  updatedAt: number;
  createdBy: string; // UID of creator
}

export interface TransactionFilter {
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  type?: TransactionType | "all";
  categoryId?: string;
  paymentMode?: PaymentMode | "all";
  searchQuery?: string;
  partyName?: string;
}

export interface FinancialSummary {
  totalIncome: number; // paise
  totalExpense: number; // paise
  netProfit: number; // paise (income - expense)
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number; // paise
    percentage: number;
    kind: TransactionType;
    color?: string;
  }[];
  dailyTrend: {
    dateKey: string;
    income: number; // paise
    expense: number; // paise
    net: number; // paise
  }[];
}

export interface PeriodicComparison {
  currentPeriod: {
    label: string;
    income: number;
    expense: number;
    net: number;
  };
  previousPeriod: {
    label: string;
    income: number;
    expense: number;
    net: number;
  };
  growth: {
    incomePercent: number;
    expensePercent: number;
    netPercent: number;
  };
}

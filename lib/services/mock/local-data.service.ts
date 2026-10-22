import { DataService } from "../interfaces";
import {
  Business,
  BusinessMember,
  Category,
  Transaction,
  TransactionFilter,
  FinancialSummary,
  BusinessType,
  UserRole,
} from "@/types";
import { getDateKey } from "@/lib/utils";

const BIZ_STORAGE_KEY = "hisaabkitab_businesses";
const TX_STORAGE_KEY = "hisaabkitab_transactions";
const CAT_STORAGE_KEY = "hisaabkitab_categories";
const MEM_STORAGE_KEY = "hisaabkitab_members";

export const DEFAULT_CATEGORIES: Record<
  BusinessType,
  { name: string; kind: "income" | "expense"; icon?: string; color?: string }[]
> = {
  restaurant: [
    { name: "Dine-in Sales", kind: "income", color: "#10b981" },
    { name: "Delivery (Zomato/Swiggy)", kind: "income", color: "#059669" },
    { name: "Catering / Bulk Orders", kind: "income", color: "#34d399" },
    { name: "Raw Ingredients & Veggies", kind: "expense", color: "#f59e0b" },
    { name: "Dairy & Milk", kind: "expense", color: "#d97706" },
    { name: "Commercial Gas / Fuel", kind: "expense", color: "#ef4444" },
    { name: "Staff Salary", kind: "expense", color: "#8b5cf6" },
    { name: "Shop Rent", kind: "expense", color: "#ec4899" },
    { name: "Chai-Paani & Refreshments", kind: "expense", color: "#06b6d4" },
    { name: "Electricity & Water Bills", kind: "expense", color: "#64748b" },
  ],
  mart: [
    { name: "Grocery & Counter Sales", kind: "income", color: "#10b981" },
    { name: "FMCG Wholesale", kind: "income", color: "#059669" },
    { name: "Home Delivery Sales", kind: "income", color: "#34d399" },
    { name: "Stock / Inventory Purchase", kind: "expense", color: "#f59e0b" },
    { name: "Packaging & Carry Bags", kind: "expense", color: "#d97706" },
    { name: "Shop Rent", kind: "expense", color: "#ec4899" },
    { name: "Staff Salary", kind: "expense", color: "#8b5cf6" },
    { name: "Electricity & AC Bills", kind: "expense", color: "#ef4444" },
    { name: "Chai-Paani & Miscellaneous", kind: "expense", color: "#06b6d4" },
  ],
  shoe_shop: [
    { name: "Footwear Counter Sales", kind: "income", color: "#10b981" },
    { name: "Accessories & Socks Sales", kind: "income", color: "#059669" },
    { name: "Wholesale Order", kind: "income", color: "#34d399" },
    { name: "Bulk Shoes Inventory", kind: "expense", color: "#f59e0b" },
    { name: "Showroom Rent", kind: "expense", color: "#ec4899" },
    { name: "Staff Commission & Salary", kind: "expense", color: "#8b5cf6" },
    { name: "Marketing & Posters", kind: "expense", color: "#3b82f6" },
    { name: "Electricity Bill", kind: "expense", color: "#ef4444" },
    { name: "Chai-Paani", kind: "expense", color: "#06b6d4" },
  ],
  other: [
    { name: "Direct Sales", kind: "income", color: "#10b981" },
    { name: "Services & Repair", kind: "income", color: "#059669" },
    { name: "Stock Purchase", kind: "expense", color: "#f59e0b" },
    { name: "Rent & Utilities", kind: "expense", color: "#ec4899" },
    { name: "Staff Wages", kind: "expense", color: "#8b5cf6" },
    { name: "Chai-Paani", kind: "expense", color: "#06b6d4" },
  ],
};

export class LocalDataService implements DataService {
  private businesses: Business[] = [];
  private categories: Category[] = [];
  private transactions: Transaction[] = [];
  private members: BusinessMember[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const b = localStorage.getItem(BIZ_STORAGE_KEY);
      this.businesses = b ? JSON.parse(b) : [];

      const c = localStorage.getItem(CAT_STORAGE_KEY);
      this.categories = c ? JSON.parse(c) : [];

      const t = localStorage.getItem(TX_STORAGE_KEY);
      this.transactions = t ? JSON.parse(t) : [];

      const m = localStorage.getItem(MEM_STORAGE_KEY);
      this.members = m ? JSON.parse(m) : [];

      // If storage is completely empty, initialize default seed demo data
      if (this.businesses.length === 0) {
        this.seedInitialDemoData();
      }
    } catch (e) {
      console.error("Failed to load local data: ", e);
      this.seedInitialDemoData();
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    localStorage.setItem(BIZ_STORAGE_KEY, JSON.stringify(this.businesses));
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(this.categories));
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(this.transactions));
    localStorage.setItem(MEM_STORAGE_KEY, JSON.stringify(this.members));
  }

  private seedInitialDemoData() {
    const now = Date.now();
    const demoBizId = "demo-biz-sharma-1";
    const demoOwnerUid = "mock-user-rajesh-101";

    // 1. Business
    const demoBiz: Business = {
      id: demoBizId,
      name: "Sharma Pure Veg Restaurant",
      type: "restaurant",
      ownerUid: demoOwnerUid,
      currency: "INR",
      timezone: "Asia/Kolkata",
      createdAt: now - 30 * 86400000,
      updatedAt: now,
    };
    this.businesses = [demoBiz];

    // 2. Members
    this.members = [
      {
        id: "mem-1",
        businessId: demoBizId,
        uid: demoOwnerUid,
        email: "rajesh.sharma@example.com",
        displayName: "Rajesh Sharma",
        role: "owner",
        joinedAt: now - 30 * 86400000,
      },
      {
        id: "mem-2",
        businessId: demoBizId,
        uid: "staff-vikas-1",
        email: "vikas.cashier@sharmarestaurant.com",
        displayName: "Vikas (Cashier)",
        role: "staff",
        joinedAt: now - 10 * 86400000,
      },
    ];

    // 3. Categories for restaurant
    const catDefs = DEFAULT_CATEGORIES.restaurant;
    this.categories = catDefs.map((def, idx) => ({
      id: `cat-${demoBizId}-${idx + 1}`,
      businessId: demoBizId,
      name: def.name,
      kind: def.kind,
      color: def.color,
      isDefault: true,
    }));

    // 4. Prepopulate realistic transactions for the last 14 days
    const txList: Transaction[] = [];
    const catDineIn = this.categories.find((c) => c.name.includes("Dine-in"))?.id || this.categories[0].id;
    const catDelivery = this.categories.find((c) => c.name.includes("Delivery"))?.id || this.categories[1].id;
    const catIngredients = this.categories.find((c) => c.name.includes("Ingredients"))?.id || this.categories[3].id;
    const catGas = this.categories.find((c) => c.name.includes("Gas"))?.id || this.categories[5].id;
    const catChai = this.categories.find((c) => c.name.includes("Chai"))?.id || this.categories[8].id;
    const catRent = this.categories.find((c) => c.name.includes("Rent"))?.id || this.categories[7].id;

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const d = new Date(now - dayOffset * 86400000);
      const dateKey = getDateKey(d);

      // Lunch Dine-in
      txList.push({
        id: `tx-lunch-${dayOffset}`,
        businessId: demoBizId,
        type: "income",
        amount: (14500 + (dayOffset % 5) * 1800) * 100, // in paise
        categoryId: catDineIn,
        partyName: "Lunch Table Rush",
        paymentMode: "upi",
        note: "Daily lunch counter collection",
        dateKey,
        createdAt: d.getTime() + 14 * 3600000,
        updatedAt: d.getTime() + 14 * 3600000,
        createdBy: demoOwnerUid,
      });

      // Evening Delivery
      txList.push({
        id: `tx-del-${dayOffset}`,
        businessId: demoBizId,
        type: "income",
        amount: (8200 + (dayOffset % 4) * 1100) * 100,
        categoryId: catDelivery,
        partyName: "Swiggy / Zomato",
        paymentMode: "card",
        note: "Dinner delivery orders batch",
        dateKey,
        createdAt: d.getTime() + 21 * 3600000,
        updatedAt: d.getTime() + 21 * 3600000,
        createdBy: demoOwnerUid,
      });

      // Daily Fresh Ingredients Expense
      txList.push({
        id: `tx-ing-${dayOffset}`,
        businessId: demoBizId,
        type: "expense",
        amount: (5200 + (dayOffset % 3) * 650) * 100,
        categoryId: catIngredients,
        partyName: "Subzi Mandi Traders",
        paymentMode: "cash",
        note: "Fresh vegetables, paneer & spices",
        dateKey,
        createdAt: d.getTime() + 8 * 3600000,
        updatedAt: d.getTime() + 8 * 3600000,
        createdBy: demoOwnerUid,
      });

      // Chai-Paani for kitchen team
      txList.push({
        id: `tx-chai-${dayOffset}`,
        businessId: demoBizId,
        type: "expense",
        amount: 250 * 100,
        categoryId: catChai,
        partyName: "Raju Tea Stall",
        paymentMode: "cash",
        note: "Evening tea and snacks for staff",
        dateKey,
        createdAt: d.getTime() + 17 * 3600000,
        updatedAt: d.getTime() + 17 * 3600000,
        createdBy: demoOwnerUid,
      });
    }

    // Commercial Gas Cylinder (1 time last week)
    const gasDate = new Date(now - 6 * 86400000);
    txList.push({
      id: "tx-gas-cyl",
      businessId: demoBizId,
      type: "expense",
      amount: 4200 * 100,
      categoryId: catGas,
      partyName: "Indane Gas Agency",
      paymentMode: "upi",
      note: "2 Commercial 19kg gas cylinders",
      dateKey: getDateKey(gasDate),
      createdAt: gasDate.getTime(),
      updatedAt: gasDate.getTime(),
      createdBy: demoOwnerUid,
    });

    // Rent expense 10 days ago
    const rentDate = new Date(now - 10 * 86400000);
    txList.push({
      id: "tx-rent-monthly",
      businessId: demoBizId,
      type: "expense",
      amount: 25000 * 100,
      categoryId: catRent,
      partyName: "Sharma Bhavan Landlord",
      paymentMode: "netbanking",
      note: "Shop Monthly Lease Advance",
      dateKey: getDateKey(rentDate),
      createdAt: rentDate.getTime(),
      updatedAt: rentDate.getTime(),
      createdBy: demoOwnerUid,
    });

    this.transactions = txList;
    this.saveToStorage();
  }

  // Business CRUD
  async getBusinessesForUser(uid: string): Promise<Business[]> {
    const memberBizIds = this.members.filter((m) => m.uid === uid).map((m) => m.businessId);
    return this.businesses.filter((b) => b.ownerUid === uid || memberBizIds.includes(b.id));
  }

  async getBusiness(businessId: string): Promise<Business | null> {
    return this.businesses.find((b) => b.id === businessId) || null;
  }

  async createBusiness(data: Omit<Business, "id" | "createdAt" | "updatedAt">): Promise<Business> {
    const id = `biz-${Date.now()}`;
    const newBiz: Business = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.businesses.push(newBiz);

    // Add owner as a member
    this.members.push({
      id: `mem-${Date.now()}`,
      businessId: id,
      uid: data.ownerUid,
      email: "",
      role: "owner",
      joinedAt: Date.now(),
    });

    // Auto-seed default categories based on business type
    const categoryTemplates = DEFAULT_CATEGORIES[data.type] || DEFAULT_CATEGORIES.other;
    categoryTemplates.forEach((def, index) => {
      this.categories.push({
        id: `cat-${id}-${index + 1}`,
        businessId: id,
        name: def.name,
        kind: def.kind,
        color: def.color,
        isDefault: true,
      });
    });

    this.saveToStorage();
    return newBiz;
  }

  async updateBusiness(businessId: string, data: Partial<Business>): Promise<Business> {
    const idx = this.businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) throw new Error("Business not found");
    this.businesses[idx] = {
      ...this.businesses[idx],
      ...data,
      updatedAt: Date.now(),
    };
    this.saveToStorage();
    return this.businesses[idx];
  }

  // Categories CRUD
  async getCategories(businessId: string): Promise<Category[]> {
    return this.categories.filter((c) => c.businessId === businessId);
  }

  async createCategory(
    businessId: string,
    data: Omit<Category, "id" | "businessId">
  ): Promise<Category> {
    const id = `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      businessId,
      ...data,
    };
    this.categories.push(newCat);
    this.saveToStorage();
    return newCat;
  }

  async deleteCategory(businessId: string, categoryId: string): Promise<void> {
    this.categories = this.categories.filter(
      (c) => !(c.businessId === businessId && c.id === categoryId)
    );
    this.saveToStorage();
  }

  // Transactions CRUD
  async getTransactions(businessId: string, filter?: TransactionFilter): Promise<Transaction[]> {
    let list = this.transactions.filter((t) => t.businessId === businessId);

    if (filter) {
      if (filter.startDate) {
        list = list.filter((t) => t.dateKey >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((t) => t.dateKey <= filter.endDate!);
      }
      if (filter.type && filter.type !== "all") {
        list = list.filter((t) => t.type === filter.type);
      }
      if (filter.categoryId && filter.categoryId !== "all") {
        list = list.filter((t) => t.categoryId === filter.categoryId);
      }
      if (filter.paymentMode && filter.paymentMode !== "all") {
        list = list.filter((t) => t.paymentMode === filter.paymentMode);
      }
      if (filter.partyName) {
        const query = filter.partyName.toLowerCase();
        list = list.filter((t) => t.partyName?.toLowerCase().includes(query));
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        list = list.filter(
          (t) =>
            t.note?.toLowerCase().includes(query) ||
            t.partyName?.toLowerCase().includes(query) ||
            t.amount.toString().includes(query)
        );
      }
    }

    // Sort descending by dateKey and createdAt
    return list.sort((a, b) => {
      if (a.dateKey !== b.dateKey) {
        return b.dateKey.localeCompare(a.dateKey);
      }
      return b.createdAt - a.createdAt;
    });
  }

  async getTransaction(businessId: string, id: string): Promise<Transaction | null> {
    return (
      this.transactions.find((t) => t.businessId === businessId && t.id === id) || null
    );
  }

  async createTransaction(
    businessId: string,
    data: Omit<Transaction, "id" | "businessId" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    const id = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...data,
      id,
      businessId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.transactions.unshift(newTx);
    this.saveToStorage();
    return newTx;
  }

  async updateTransaction(
    businessId: string,
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    const idx = this.transactions.findIndex(
      (t) => t.businessId === businessId && t.id === id
    );
    if (idx === -1) throw new Error("Transaction not found");
    this.transactions[idx] = {
      ...this.transactions[idx],
      ...data,
      updatedAt: Date.now(),
    };
    this.saveToStorage();
    return this.transactions[idx];
  }

  async deleteTransaction(businessId: string, id: string): Promise<void> {
    this.transactions = this.transactions.filter(
      (t) => !(t.businessId === businessId && t.id === id)
    );
    this.saveToStorage();
  }

  // Financial Summary Calculation
  async getFinancialSummary(
    businessId: string,
    filter?: TransactionFilter
  ): Promise<FinancialSummary> {
    const txs = await this.getTransactions(businessId, filter);
    const categories = await this.getCategories(businessId);
    const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const catTotals: Record<string, { amount: number; kind: "income" | "expense" }> = {};
    const dateMap: Record<string, { income: number; expense: number; net: number }> = {};

    for (const tx of txs) {
      if (tx.type === "income") {
        totalIncome += tx.amount;
        incomeCount++;
      } else {
        totalExpense += tx.amount;
        expenseCount++;
      }

      // Category breakdown
      if (!catTotals[tx.categoryId]) {
        catTotals[tx.categoryId] = { amount: 0, kind: tx.type };
      }
      catTotals[tx.categoryId].amount += tx.amount;

      // Daily trend
      if (!dateMap[tx.dateKey]) {
        dateMap[tx.dateKey] = { income: 0, expense: 0, net: 0 };
      }
      if (tx.type === "income") {
        dateMap[tx.dateKey].income += tx.amount;
      } else {
        dateMap[tx.dateKey].expense += tx.amount;
      }
      dateMap[tx.dateKey].net = dateMap[tx.dateKey].income - dateMap[tx.dateKey].expense;
    }

    const netProfit = totalIncome - totalExpense;

    // Convert category breakdown to array with percentage
    const categoryBreakdown = Object.entries(catTotals).map(([catId, info]) => {
      const cat = catMap.get(catId);
      const totalForKind = info.kind === "income" ? totalIncome : totalExpense;
      const percentage = totalForKind > 0 ? Math.round((info.amount / totalForKind) * 100) : 0;
      return {
        categoryId: catId,
        categoryName: cat?.name || "Uncategorized",
        amount: info.amount,
        percentage,
        kind: info.kind,
        color: cat?.color || "#10b981",
      };
    });

    // Sort categories by highest amount
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    // Convert dateMap to sorted chronological array
    const dailyTrend = Object.entries(dateMap)
      .map(([dateKey, values]) => ({
        dateKey,
        income: values.income,
        expense: values.expense,
        net: values.net,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return {
      totalIncome,
      totalExpense,
      netProfit,
      transactionCount: txs.length,
      incomeCount,
      expenseCount,
      categoryBreakdown,
      dailyTrend,
    };
  }

  // Members
  async getMembers(businessId: string): Promise<BusinessMember[]> {
    return this.members.filter((m) => m.businessId === businessId);
  }

  async addMember(
    businessId: string,
    email: string,
    role: UserRole,
    displayName?: string
  ): Promise<BusinessMember> {
    const id = `mem-${Date.now()}`;
    const newMember: BusinessMember = {
      id,
      businessId,
      uid: `staff-${Date.now()}`,
      email,
      displayName: displayName || email.split("@")[0],
      role,
      joinedAt: Date.now(),
    };
    this.members.push(newMember);
    this.saveToStorage();
    return newMember;
  }

  async updateMemberRole(
    businessId: string,
    memberId: string,
    role: UserRole
  ): Promise<BusinessMember> {
    const idx = this.members.findIndex(
      (m) => m.businessId === businessId && m.id === memberId
    );
    if (idx === -1) throw new Error("Member not found");
    this.members[idx].role = role;
    this.saveToStorage();
    return this.members[idx];
  }

  async removeMember(businessId: string, memberId: string): Promise<void> {
    this.members = this.members.filter(
      (m) => !(m.businessId === businessId && m.id === memberId)
    );
    this.saveToStorage();
  }

  async getUserMembership(businessId: string, uid: string): Promise<BusinessMember | null> {
    return (
      this.members.find((m) => m.businessId === businessId && m.uid === uid) || null
    );
  }
}

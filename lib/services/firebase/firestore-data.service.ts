import { DataService } from "../interfaces";
import {
  Business,
  BusinessMember,
  Category,
  Transaction,
  TransactionFilter,
  FinancialSummary,
  UserRole,
} from "@/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { DEFAULT_CATEGORIES } from "../mock/local-data.service";

export class FirestoreDataService implements DataService {
  private ensureConfigured() {
    if (!isFirebaseConfigured()) {
      throw new Error(
        "Firestore is not configured. Please fill in your Firebase keys in .env.local as described in FIREBASE_SETUP.md."
      );
    }
  }

  // Business CRUD
  async getBusinessesForUser(uid: string): Promise<Business[]> {
    this.ensureConfigured();
    const db = getFirebaseDb();

    // Query businesses owned by this user
    const qOwned = query(collection(db, "businesses"), where("ownerUid", "==", uid));
    const snap = await getDocs(qOwned);

    const businesses: Business[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      businesses.push({
        id: docSnap.id,
        name: data.name,
        type: data.type,
        ownerUid: data.ownerUid,
        currency: data.currency || "INR",
        timezone: data.timezone || "Asia/Kolkata",
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
      });
    });

    return businesses;
  }

  async getBusiness(businessId: string): Promise<Business | null> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const docRef = doc(db, "businesses", businessId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name,
      type: data.type,
      ownerUid: data.ownerUid,
      currency: data.currency || "INR",
      timezone: data.timezone || "Asia/Kolkata",
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
    };
  }

  async createBusiness(data: Omit<Business, "id" | "createdAt" | "updatedAt">): Promise<Business> {
    this.ensureConfigured();
    const db = getFirebaseDb();

    const bizDocRef = await addDoc(collection(db, "businesses"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const bizId = bizDocRef.id;

    // Add owner as a member
    await setDoc(doc(db, "businesses", bizId, "members", data.ownerUid), {
      businessId: bizId,
      uid: data.ownerUid,
      email: "",
      role: "owner",
      joinedAt: Date.now(),
    });

    // Auto-seed default categories in Firestore
    const catDefs = DEFAULT_CATEGORIES[data.type] || DEFAULT_CATEGORIES.other;
    const catCol = collection(db, "businesses", bizId, "categories");
    for (const def of catDefs) {
      await addDoc(catCol, {
        businessId: bizId,
        name: def.name,
        kind: def.kind,
        color: def.color,
        isDefault: true,
      });
    }

    return {
      ...data,
      id: bizId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  async updateBusiness(businessId: string, data: Partial<Business>): Promise<Business> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const docRef = doc(db, "businesses", businessId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    const updated = await this.getBusiness(businessId);
    if (!updated) throw new Error("Failed to retrieve updated business");
    return updated;
  }

  // Categories CRUD
  async getCategories(businessId: string): Promise<Category[]> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const catCol = collection(db, "businesses", businessId, "categories");
    const snap = await getDocs(catCol);

    const categories: Category[] = [];
    snap.forEach((d) => {
      const data = d.data();
      categories.push({
        id: d.id,
        businessId,
        name: data.name,
        kind: data.kind,
        color: data.color,
        isDefault: !!data.isDefault,
      });
    });

    return categories;
  }

  async createCategory(
    businessId: string,
    data: Omit<Category, "id" | "businessId">
  ): Promise<Category> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const catCol = collection(db, "businesses", businessId, "categories");
    const payload: Record<string, unknown> = {
      businessId,
      name: data.name,
      kind: data.kind,
      color: data.color || "#10b981",
      isDefault: !!data.isDefault,
    };
    if (data.icon) payload.icon = data.icon;

    const docRef = await addDoc(catCol, payload);
    return {
      id: docRef.id,
      businessId,
      ...data,
    };
  }

  async deleteCategory(businessId: string, categoryId: string): Promise<void> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "businesses", businessId, "categories", categoryId));
  }

  // Transactions CRUD
  async getTransactions(businessId: string, filter?: TransactionFilter): Promise<Transaction[]> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const txCol = collection(db, "businesses", businessId, "transactions");
    const snap = await getDocs(txCol);

    let list: Transaction[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        businessId,
        type: data.type,
        amount: data.amount,
        categoryId: data.categoryId,
        note: data.note,
        partyName: data.partyName,
        paymentMode: data.paymentMode,
        dateKey: data.dateKey,
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
        createdBy: data.createdBy,
      });
    });

    // In-memory filters for range, category, payment mode, and query
    if (filter) {
      if (filter.startDate) list = list.filter((t) => t.dateKey >= filter.startDate!);
      if (filter.endDate) list = list.filter((t) => t.dateKey <= filter.endDate!);
      if (filter.type && filter.type !== "all") list = list.filter((t) => t.type === filter.type);
      if (filter.categoryId && filter.categoryId !== "all") {
        list = list.filter((t) => t.categoryId === filter.categoryId);
      }
      if (filter.paymentMode && filter.paymentMode !== "all") {
        list = list.filter((t) => t.paymentMode === filter.paymentMode);
      }
      if (filter.partyName) {
        const q = filter.partyName.toLowerCase();
        list = list.filter((t) => t.partyName?.toLowerCase().includes(q));
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        list = list.filter(
          (t) =>
            t.note?.toLowerCase().includes(q) ||
            t.partyName?.toLowerCase().includes(q) ||
            t.amount.toString().includes(q)
        );
      }
    }

    // Sort descending by dateKey and createdAt
    return list.sort((a, b) => {
      if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
      return b.createdAt - a.createdAt;
    });
  }

  async getTransaction(businessId: string, id: string): Promise<Transaction | null> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, "businesses", businessId, "transactions", id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      businessId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      note: data.note,
      partyName: data.partyName,
      paymentMode: data.paymentMode,
      dateKey: data.dateKey,
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
      createdBy: data.createdBy,
    };
  }

  async createTransaction(
    businessId: string,
    data: Omit<Transaction, "id" | "businessId" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const txCol = collection(db, "businesses", businessId, "transactions");

    const payload: Record<string, unknown> = {
      businessId,
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId,
      paymentMode: data.paymentMode,
      dateKey: data.dateKey,
      partyName: data.partyName || "",
      note: data.note || "",
      createdBy: data.createdBy || "anonymous",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(txCol, payload);

    return {
      ...data,
      id: docRef.id,
      businessId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  async updateTransaction(
    businessId: string,
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const docRef = doc(db, "businesses", businessId, "transactions", id);

    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.type !== undefined) payload.type = data.type;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
    if (data.paymentMode !== undefined) payload.paymentMode = data.paymentMode;
    if (data.dateKey !== undefined) payload.dateKey = data.dateKey;
    if (data.partyName !== undefined) payload.partyName = data.partyName || "";
    if (data.note !== undefined) payload.note = data.note || "";

    await updateDoc(docRef, payload);
    const updated = await this.getTransaction(businessId, id);
    if (!updated) throw new Error("Transaction not found");
    return updated;
  }

  async deleteTransaction(businessId: string, id: string): Promise<void> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "businesses", businessId, "transactions", id));
  }

  // Financial Summary Aggregation
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

      if (!catTotals[tx.categoryId]) {
        catTotals[tx.categoryId] = { amount: 0, kind: tx.type };
      }
      catTotals[tx.categoryId].amount += tx.amount;

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

    categoryBreakdown.sort((a, b) => b.amount - a.amount);

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
    this.ensureConfigured();
    const db = getFirebaseDb();
    const snap = await getDocs(collection(db, "businesses", businessId, "members"));
    const members: BusinessMember[] = [];
    snap.forEach((d) => {
      const data = d.data();
      members.push({
        id: d.id,
        businessId,
        uid: data.uid || d.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        joinedAt: data.joinedAt || Date.now(),
      });
    });
    return members;
  }

  async addMember(
    businessId: string,
    email: string,
    role: UserRole,
    displayName?: string
  ): Promise<BusinessMember> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, "businesses", businessId, "members"), {
      businessId,
      email,
      role,
      displayName: displayName || email.split("@")[0],
      joinedAt: Date.now(),
    });
    return {
      id: docRef.id,
      businessId,
      uid: docRef.id,
      email,
      displayName,
      role,
      joinedAt: Date.now(),
    };
  }

  async updateMemberRole(
    businessId: string,
    memberId: string,
    role: UserRole
  ): Promise<BusinessMember> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const docRef = doc(db, "businesses", businessId, "members", memberId);
    await updateDoc(docRef, { role });
    const snap = await getDoc(docRef);
    const data = snap.data()!;
    return {
      id: snap.id,
      businessId,
      uid: data.uid || snap.id,
      email: data.email,
      displayName: data.displayName,
      role,
      joinedAt: data.joinedAt,
    };
  }

  async removeMember(businessId: string, memberId: string): Promise<void> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    await deleteDoc(doc(db, "businesses", businessId, "members", memberId));
  }

  async getUserMembership(businessId: string, uid: string): Promise<BusinessMember | null> {
    this.ensureConfigured();
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, "businesses", businessId, "members", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      businessId,
      uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      joinedAt: data.joinedAt,
    };
  }
}

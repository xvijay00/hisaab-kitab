import {
  UserProfile,
  Business,
  BusinessMember,
  Category,
  Transaction,
  TransactionFilter,
  FinancialSummary,
  UserRole,
} from "@/types";

export interface AuthService {
  signInWithGoogle(chosenProfile?: Partial<UserProfile>): Promise<UserProfile>;
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserProfile>;
  signInWithEmail(email: string, password: string): Promise<UserProfile>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
  getCurrentUser(): UserProfile | null;
}

export interface DataService {
  // Business CRUD
  getBusinessesForUser(uid: string): Promise<Business[]>;
  getBusiness(businessId: string): Promise<Business | null>;
  createBusiness(data: Omit<Business, "id" | "createdAt" | "updatedAt">): Promise<Business>;
  updateBusiness(businessId: string, data: Partial<Business>): Promise<Business>;

  // Categories CRUD
  getCategories(businessId: string): Promise<Category[]>;
  createCategory(businessId: string, data: Omit<Category, "id" | "businessId">): Promise<Category>;
  deleteCategory(businessId: string, categoryId: string): Promise<void>;

  // Transactions CRUD
  getTransactions(businessId: string, filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(businessId: string, id: string): Promise<Transaction | null>;
  createTransaction(
    businessId: string,
    data: Omit<Transaction, "id" | "businessId" | "createdAt" | "updatedAt">
  ): Promise<Transaction>;
  updateTransaction(
    businessId: string,
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction>;
  deleteTransaction(businessId: string, id: string): Promise<void>;

  // Aggregated Summary
  getFinancialSummary(businessId: string, filter?: TransactionFilter): Promise<FinancialSummary>;

  // Multi-user & Staff Members
  getMembers(businessId: string): Promise<BusinessMember[]>;
  addMember(businessId: string, email: string, role: UserRole, displayName?: string): Promise<BusinessMember>;
  updateMemberRole(businessId: string, memberId: string, role: UserRole): Promise<BusinessMember>;
  removeMember(businessId: string, memberId: string): Promise<void>;
  getUserMembership(businessId: string, uid: string): Promise<BusinessMember | null>;
}

# HisaabKitab (हिसाब-किताब)
### Smart Daily Business Records & Financial Ledger SaaS

HisaabKitab is a production-quality, mobile-first, multi-tenant SaaS web application built for small businesses such as **restaurants, marts, shoe stores, and retail shops**.

It gives shop owners and cashiers a fast, 3-tap interface to record daily sales and operational expenses, track cash vs. UPI vs. card collections, visualize net profits, export branded PDF/Excel statements, and share ledgers directly over WhatsApp.

---

## 🚀 Key Features

### 1. Ultra-Fast Daily Records (Under 3 Taps)
- **Rapid Quick Entry Modal**: 1-tap quick amount buttons (+50, +100, +500, +2000, +5000).
- **Industry Seeded Categories**: Auto-seeds tailored categories based on business type (Restaurant, Mart, Shoe store, etc.).
- **Payment Modes**: Instant tagging for Cash, UPI (PhonePe/GPay), Card, and Net Banking.
- **Accurate Currency**: Stored strictly as **integer paise** (never floating-point numbers) with Indian formatting (e.g. ₹1,25,000.00).

### 2. Multi-Tenant Business Isolation
- Separate records, categories, and staff for each business.
- Instant business switching from the top navigation bar.
- Onboarding wizard for new businesses with automatic category generation.

### 3. Role-Based Access Control (Owner vs. Staff)
- **Owner**: Full access to financial metrics, net profit/loss, historical editing, record deletion, and staff invitations.
- **Staff (Cashier)**: Restricted access—can add daily income and expense transactions, but cannot view net profit summaries or modify/delete past records.
- Enforced at both the client UI layer and the Firestore security rules layer (`firestore.rules`).

### 4. Interactive Analytics & Recharts Trends
- **Cashflow Velocity Trend**: Area chart showing daily Income vs. Expense trajectory.
- **Expense Breakdown**: Donut chart with category distribution and percentage metrics.
- **Daily Net Balance**: Bar chart tracking daily net cashflow.
- **Date Presets**: 1-tap switching between Today, Yesterday, Last 7 Days, This Month, Last 3 Months, This Year, and Custom range.

### 5. Instant Export & WhatsApp Sharing
- **Branded PDF Statement**: Formatted with company header, date range, table rows, and net totals using `jsPDF` + `jspdf-autotable`.
- **Excel Spreadsheet**: Structured `.xlsx` ledger export with SheetJS.
- **WhatsApp Share**: Pre-formatted daily hisaab summary and customer/supplier ledger messaging via `https://wa.me` & Web Share API.

### 6. PWA & Offline Support
- Manifest (`manifest.json`), responsive SVG icon, service worker caching shell assets, and an install prompt banner with iOS Safari instructions.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Emerald Modern Theme + `next-themes` (Dark/Light mode)
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **Exports**: `jsPDF` + `jspdf-autotable` (PDF) & `xlsx` SheetJS (Excel)
- **Testing**: Vitest (100% pass on money, date, and summary logic)
- **Icons**: Lucide React

---

## 🔌 Dual Backend Architecture (Mock vs. Firebase)

HisaabKitab features a decoupled Service Layer:
- `AuthService` (`interfaces.ts`)
- `DataService` (`interfaces.ts`)

### Zero-Config Mock Backend (Active by default)
`NEXT_PUBLIC_BACKEND=mock` enables `MockAuthService` and `LocalDataService` (persisted in browser storage). It includes:
- An authentic **Google Account Chooser modal** with pre-seeded demo personas:
  - **Rajesh Sharma**: Sharma Pure Veg Restaurant (preloaded with 14 days of realistic restaurant transactions)
  - **Priya Patel**: Patel Daily Mart
  - **Amit Verma**: StepWell Footwear
  - Custom Google account option
- Email/password login and simulated password recovery.

### Switching to Firebase Later
Switching to Cloud Firestore requires **NO code modifications to the UI**:
1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_BACKEND=firebase`
3. Add your Firebase keys
4. Follow the step-by-step instructions in [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx             # Root layout with Theme, Toast, Auth & Business Providers
│   ├── page.tsx               # Main Dashboard with Stat Cards, Charts & Recent Entries
│   ├── transactions/page.tsx  # Searchable & filterable ledger with export modals
│   ├── reports/page.tsx       # Periodic comparisons (Daily, Monthly, Quarterly, Yearly)
│   ├── categories/page.tsx    # Category & color tag management
│   ├── staff/page.tsx         # Multi-user staff invitation & role assignment
│   ├── login/page.tsx         # Login with Google account modal & 1-tap demo profiles
│   ├── signup/page.tsx        # Registration with validation
│   └── forgot-password/       # Password reset flow
├── components/
│   ├── auth/                  # AuthProvider, AuthGuard, GoogleAccountModal
│   ├── business/              # BusinessProvider, OnboardingWizard
│   ├── dashboard/             # StatCards, AnalyticsCharts, DatePresets
│   ├── transactions/          # QuickEntryModal, EditTransactionModal, TransactionList
│   ├── export/                # ExportModal (PDF, Excel, WhatsApp)
│   ├── staff/                 # StaffManagement
│   ├── categories/            # CategoryManagement
│   ├── layout/                # Sidebar, Navbar, BottomNav, AppShell
│   └── pwa/                   # InstallPwaBanner
├── lib/
│   ├── services/
│   │   ├── interfaces.ts      # AuthService & DataService strict contracts
│   │   ├── index.ts           # Service Factory resolving mock or firebase
│   │   ├── mock/              # MockAuthService & LocalDataService
│   │   └── firebase/          # FirebaseAuthService & FirestoreDataService stubs
│   ├── utils/
│   │   └── export-helpers.ts  # jsPDF, SheetJS xlsx, and WhatsApp formatters
│   ├── utils.ts               # Indian currency format (₹), paise math, date keys
│   └── utils.test.ts          # Vitest unit test suite
├── firestore.rules            # Production security rules enforcing multi-tenancy & roles
├── FIREBASE_SETUP.md          # Comprehensive step-by-step Firebase deployment guide
└── .env.example               # Environment variables template
```

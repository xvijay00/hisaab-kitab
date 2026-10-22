# Firebase Production Setup Guide for HisaabKitab

This document provides a step-by-step walkthrough for connecting HisaabKitab to Google Firebase.

HisaabKitab was architected with a decoupled Service Layer (`AuthService` and `DataService`). Switching to Firebase requires **zero changes to the UI codebase**—you only need to fill in your Firebase configuration keys and set `NEXT_PUBLIC_BACKEND=firebase`.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `hisaab-kitab-saas`).
4. Enable or disable Google Analytics according to your preference, then click **Create project**.

---

## 2. Register Your Web Application

1. In the Project Overview page, click the Web icon (`</>`) to add a Web App.
2. Enter an app nickname (e.g., `HisaabKitab Web`).
3. (Optional) Check "Also set up Firebase Hosting for this app".
4. Click **Register app**.
5. Firebase will display your SDK configuration object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "hisaab-kitab-saas.firebaseapp.com",
     projectId: "hisaab-kitab-saas",
     storageBucket: "hisaab-kitab-saas.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```

---

## 3. Configure Environment Variables

1. Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and paste your keys:
   ```env
   NEXT_PUBLIC_BACKEND=firebase

   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hisaab-kitab-saas.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=hisaab-kitab-saas
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hisaab-kitab-saas.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
   ```

---

## 4. Enable Authentication Providers

1. In the Firebase Console left sidebar, click **Build > Authentication**, then click **Get Started**.
2. Under the **Sign-in method** tab:
   - **Email/Password**: Click Email/Password, toggle **Enable**, and click **Save**.
   - **Google**: Click Google, toggle **Enable**, select your project support email, and click **Save**.
3. Under the **Settings > Authorized domains** tab:
   - Ensure `localhost` is listed for local development.
   - Add your production domain (e.g., `yourbusiness.vercel.app`).

---

## 5. Create Cloud Firestore Database

1. In the Firebase Console, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location closest to your users (e.g., `asia-south1` for Mumbai / India).
4. Select **Start in production mode** (we will deploy our custom rules next).
5. Click **Create**.

---

## 6. Deploy Security Rules

HisaabKitab includes production security rules in `firestore.rules` that enforce strict multi-tenant isolation, role checks (`owner` vs. `staff`), and integer paise validation.

### Option A: Using Firebase CLI (Recommended)
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase init firestore
   ```
   (Select your project and use existing `firestore.rules`)
3. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Using Firebase Console Web Interface
1. In Firebase Console, go to **Firestore Database > Rules**.
2. Replace all existing text with the exact contents of [`firestore.rules`](./firestore.rules).
3. Click **Publish**.

---

## 7. Data Structure Reference

```
users/{uid}
businesses/{bizId}
  ├── members/{memberUid}    -> { role: "owner" | "staff", joinedAt: timestamp }
  ├── categories/{catId}     -> { name: string, kind: "income" | "expense", color: string }
  └── transactions/{txId}    -> { type, amount: int (paise), categoryId, paymentMode, dateKey, note, partyName, createdBy }
```

---

## 8. Verifying the Switch

1. Install the official Firebase SDK:
   ```bash
   npm install firebase
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser. All authentication and database operations now stream directly to Cloud Firestore.

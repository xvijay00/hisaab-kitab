import { AuthService, DataService } from "./interfaces";
import { MockAuthService } from "./mock/mock-auth.service";
import { LocalDataService } from "./mock/local-data.service";
import { FirebaseAuthService } from "./firebase/firebase-auth.service";
import { FirestoreDataService } from "./firebase/firestore-data.service";

let authServiceInstance: AuthService | null = null;
let dataServiceInstance: DataService | null = null;

const BACKEND_TYPE = process.env.NEXT_PUBLIC_BACKEND || "mock";

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    if (BACKEND_TYPE === "firebase") {
      authServiceInstance = new FirebaseAuthService();
    } else {
      authServiceInstance = new MockAuthService();
    }
  }
  return authServiceInstance;
}

export function getDataService(): DataService {
  if (!dataServiceInstance) {
    if (BACKEND_TYPE === "firebase") {
      dataServiceInstance = new FirestoreDataService();
    } else {
      dataServiceInstance = new LocalDataService();
    }
  }
  return dataServiceInstance;
}

export * from "./interfaces";

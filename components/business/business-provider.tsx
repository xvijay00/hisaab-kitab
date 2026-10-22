"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Business, BusinessMember, Category, BusinessType, UserRole } from "@/types";
import { getDataService } from "@/lib/services";
import { useAuth } from "../auth/auth-provider";

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (biz: Business) => void;
  categories: Category[];
  members: BusinessMember[];
  membership: BusinessMember | null;
  isOwner: boolean;
  loading: boolean;
  reloadBusinesses: () => Promise<void>;
  reloadCategories: () => Promise<void>;
  reloadMembers: () => Promise<void>;
  createNewBusiness: (params: {
    name: string;
    type: BusinessType;
    currency?: string;
    timezone?: string;
  }) => Promise<Business>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const CURRENT_BIZ_KEY = "hisaabkitab_active_biz_id";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [membership, setMembership] = useState<BusinessMember | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusinessState(null);
      setCategories([]);
      setMembers([]);
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const dataService = getDataService();
      const userBizList = await dataService.getBusinessesForUser(user.uid);
      setBusinesses(userBizList);

      if (userBizList.length > 0) {
        const savedBizId = typeof window !== "undefined" ? localStorage.getItem(CURRENT_BIZ_KEY) : null;
        const matched = userBizList.find((b) => b.id === savedBizId) || userBizList[0];
        setCurrentBusinessState(matched);
      } else {
        setCurrentBusinessState(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const reloadCategories = useCallback(async () => {
    if (!currentBusiness) {
      setCategories([]);
      return;
    }
    const dataService = getDataService();
    const cats = await dataService.getCategories(currentBusiness.id);
    setCategories(cats);
  }, [currentBusiness]);

  const reloadMembers = useCallback(async () => {
    if (!currentBusiness || !user) {
      setMembers([]);
      setMembership(null);
      return;
    }
    const dataService = getDataService();
    const memList = await dataService.getMembers(currentBusiness.id);
    setMembers(memList);

    const myMembership = await dataService.getUserMembership(currentBusiness.id, user.uid);
    setMembership(myMembership);
  }, [currentBusiness, user]);

  useEffect(() => {
    reloadBusinesses();
  }, [reloadBusinesses]);

  useEffect(() => {
    if (currentBusiness) {
      reloadCategories();
      reloadMembers();
      if (typeof window !== "undefined") {
        localStorage.setItem(CURRENT_BIZ_KEY, currentBusiness.id);
      }
    }
  }, [currentBusiness, reloadCategories, reloadMembers]);

  const setCurrentBusiness = (biz: Business) => {
    setCurrentBusinessState(biz);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_BIZ_KEY, biz.id);
    }
  };

  const createNewBusiness = async (params: {
    name: string;
    type: BusinessType;
    currency?: string;
    timezone?: string;
  }): Promise<Business> => {
    if (!user) throw new Error("Must be logged in to create a business.");
    const dataService = getDataService();
    const newBiz = await dataService.createBusiness({
      name: params.name,
      type: params.type,
      ownerUid: user.uid,
      currency: params.currency || "INR",
      timezone: params.timezone || "Asia/Kolkata",
    });

    await reloadBusinesses();
    setCurrentBusiness(newBiz);
    return newBiz;
  };

  const isOwner =
    !currentBusiness ||
    currentBusiness.ownerUid === user?.uid ||
    membership?.role === "owner" ||
    !membership; // default to owner if newly created

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        categories,
        members,
        membership,
        isOwner,
        loading,
        reloadBusinesses,
        reloadCategories,
        reloadMembers,
        createNewBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}

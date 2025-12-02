"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BasicsFormData = {
  companyName: string;
  industry: string;
  cpvCodes: string[];
  employeeCount: string;
  location: string;
  revenueTier: number;
  contactName: string;
  contactEmail: string;
  website?: string;
  isAvpq: boolean;
};

export type ReferenceEntry = {
  id: string;
  name: string;
  year: number;
  budget: string;
  keywords: string[];
  client: string;
};

export type ReferencesFormData = {
  documents: { id: string; name: string; size: number }[];
  references: ReferenceEntry[];
  certificates: string[];
};

export type PreferencesFormData = {
  alertEmail: boolean;
  alertSlack: boolean;
  alertFrequency: "Täglich" | "Wöchentlich";
  minMatchScore: number;
  budgetRange: [number, number];
  regions: string[];
  consent: boolean;
};

type ProfileState = {
  currentStep: number;
  basics: BasicsFormData;
  references: ReferencesFormData;
  preferences: PreferencesFormData;
  setStep: (step: number) => void;
  setBasics: (data: BasicsFormData) => void;
  setReferences: (data: ReferencesFormData) => void;
  setPreferences: (data: PreferencesFormData) => void;
  reset: () => void;
};

const fallbackStorage: Storage = {
  length: 0,
  clear: () => { },
  getItem: () => null,
  key: (index: number) => {
    void index;
    return null;
  },
  removeItem: () => { },
  setItem: () => { },
};

const defaultState: Omit<
  ProfileState,
  "setStep" | "setBasics" | "setReferences" | "setPreferences" | "reset"
> = {
  currentStep: 0,
  basics: {
    companyName: "",
    industry: "",
    cpvCodes: [],
    employeeCount: "",
    location: "",
    revenueTier: 1,
    contactName: "",
    contactEmail: "",
    website: "",
    isAvpq: false,
  },
  references: {
    documents: [],
    references: [],
    certificates: [],
  },
  preferences: {
    alertEmail: true,
    alertSlack: false,
    alertFrequency: "Täglich",
    minMatchScore: 70,
    budgetRange: [50000, 500000],
    regions: [],
    consent: false,
  },
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...defaultState,
      setStep: (step) => set({ currentStep: step }),
      setBasics: (data) => set({ basics: data }),
      setReferences: (data) => set({ references: data }),
      setPreferences: (data) => set({ preferences: data }),
      reset: () => set({ ...defaultState }),
    }),
    {
      name: "tender-profile-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : fallbackStorage
      ),
      version: 2, // Incremented version due to schema changes
      partialize: (state) => ({
        currentStep: state.currentStep,
        basics: state.basics,
        references: state.references,
        preferences: state.preferences,
      }),
    }
  )
);

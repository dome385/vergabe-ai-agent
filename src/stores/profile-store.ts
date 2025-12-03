"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BasicsFormData = {
  companyName: string;
  legalForm: string;
  taxId: string;
  industry: string;
  cpvCodes: string[];
  employeeCount: string;
  addressStreet: string;
  addressZip: string;
  addressCity: string;
  addressCountry: string;
  serviceRadius: number;
  revenueTier: number;
  foundingYear: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  isAvpq: boolean;
  profileSummary: string;
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
    legalForm: "",
    taxId: "",
    industry: "",
    cpvCodes: [],
    employeeCount: "",
    addressStreet: "",
    addressZip: "",
    addressCity: "",
    addressCountry: "DE",
    serviceRadius: 100,
    revenueTier: 1,
    foundingYear: new Date().getFullYear(),
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    isAvpq: false,
    profileSummary: "",
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

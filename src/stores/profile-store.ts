"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BasicsFormData = {
  companyName: string;
  industry: string;
  location: string;
  revenueTier: number;
  contactName: string;
  contactEmail: string;
};

export type ReferenceEntry = {
  id: string;
  name: string;
  year: number;
  budget: string;
  keywords: string[];
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
  clear: () => {},
  getItem: () => null,
  key: (index: number) => {
    void index;
    return null;
  },
  removeItem: () => {},
  setItem: () => {},
};

const defaultState: Omit<ProfileState, "setStep" | "setBasics" | "setReferences" | "setPreferences" | "reset"> =
  {
    currentStep: 0,
    basics: {
      companyName: "Beispiel GmbH",
      industry: "IT-Dienste",
      location: "München, 80331",
      revenueTier: 1,
      contactName: "Max Mustermann",
      contactEmail: "max@beispiel.de",
    },
    references: {
      documents: [],
      references: [
        {
          id: "ref-1",
          name: "Projekt A",
          year: 2024,
          budget: "50k",
          keywords: ["KNX"],
        },
        {
          id: "ref-2",
          name: "Projekt B",
          year: 2023,
          budget: "100k",
          keywords: ["IT"],
        },
      ],
      certificates: ["ISO 27001"],
    },
    preferences: {
      alertEmail: true,
      alertSlack: false,
      alertFrequency: "Täglich",
      minMatchScore: 70,
      budgetRange: [50000, 500000],
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
      version: 1,
      partialize: (state) => ({
        currentStep: state.currentStep,
        basics: state.basics,
        references: state.references,
        preferences: state.preferences,
      }),
    }
  )
);

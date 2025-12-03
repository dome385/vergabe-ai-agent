"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

const BUILD_STORAGE_KEY = "vergabe-agent-build-id";

type AuthResetterProps = {
  buildId: string;
};

/**
 * Clears persisted auth/session state only when the dev server (and thus the build id) changes.
 */
export function AuthResetter({ buildId }: AuthResetterProps) {
  useEffect(() => {
    if (!buildId || typeof window === "undefined") {
      return;
    }

    const lastBuildId = window.localStorage.getItem(BUILD_STORAGE_KEY);
    if (lastBuildId === buildId) {
      return;
    }

    const supabase = createClient();
    supabase.auth.signOut().catch((error) => {
      console.error("Failed to sign out after build change", error);
    });

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage", error);
    }

    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error("Failed to clear sessionStorage", error);
    }

    try {
      window.localStorage.setItem(BUILD_STORAGE_KEY, buildId);
    } catch (error) {
      console.error("Failed to store build marker", error);
    }
  }, [buildId]);

  return null;
}

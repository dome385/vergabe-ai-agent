import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

type CompanyRecord = {
  id: string;
  onboarding_completed: boolean | null;
};

type CompanyStatusResult = {
  company: CompanyRecord | null;
  hasCompany: boolean;
  error: PostgrestError | null;
};

/**
 * Looks up whether the given Supabase user already has a company record.
 */
export async function fetchCompanyStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<CompanyStatusResult> {
  const { data, error } = await supabase
    .from<CompanyRecord>("companies")
    .select("id, onboarding_completed")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return {
      company: null,
      hasCompany: false,
      error,
    };
  }

  return {
    company: data ?? null,
    hasCompany: Boolean(data),
    error: null,
  };
}

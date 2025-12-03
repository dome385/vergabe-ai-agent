"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Bell, Settings } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { AnimatePresence, motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { createClient } from "@/lib/supabase";
import { fetchCompanyStatus } from "@/lib/company";

import { Steps } from "@/components/ui/steps";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useProfileStore,
  BasicsFormData,
  ReferencesFormData,
  PreferencesFormData,
} from "@/stores/profile-store";
import { BasicsStep } from "@/components/onboarding/steps/BasicsStep";
import { ReferencesStep } from "@/components/onboarding/steps/ReferencesStep";
import { PreferencesStep } from "@/components/onboarding/steps/PreferencesStep";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const wizardSteps = [
  {
    label: "Setup",
    helper: "Firmen-Basics",
    title: "Willkommen! Baue dein Profil für perfekte Matches auf.",
  },
  {
    label: "Referenzen",
    helper: "Uploads & Nachweise",
    title: "Lade deine Erfolge hoch - Boost Matches um 40%.",
  },
  {
    label: "Feintuning",
    helper: "Preferences",
    title: "Passe an & starte die Tender-Jagd!",
  },
] as const;

type SubmitRegistry = (step: number, handler: () => void) => void;

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    setStep,
    basics,
    references,
    preferences,
    setBasics,
    setReferences,
    setPreferences,
  } = useProfileStore();
  const [direction, setDirection] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const submitRef = useRef<Record<number, () => void>>({});
  const totalSteps = wizardSteps.length;

  const supabase = createClient();

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { hasCompany, error } = await fetchCompanyStatus(supabase, session.user.id);
      if (error) {
        toast.error("Profilstatus konnte nicht geladen werden. Bitte versuche es erneut.");
        return;
      }

      if (hasCompany) {
        router.replace("/dashboard");
      }
    };
    checkSessionAndProfile();
  }, [router, supabase]);

  const submitProfile = async (profileData: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Nicht eingeloggt!");
      return false;
    }

    try {
      const response = await fetch("/api/v1/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Speichern");
      }
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const registerSubmit = useCallback<SubmitRegistry>((stepIndex, handler) => {
    submitRef.current[stepIndex] = handler;
  }, []);

  const triggerSubmit = useCallback((stepIndex: number) => {
    submitRef.current[stepIndex]?.();
  }, []);

  const goToStep = (index: number, dir: number) => {
    setDirection(dir);
    setStep(Math.max(0, Math.min(totalSteps - 1, index)));
  };

  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStep < totalSteps - 1) {
        triggerSubmit(currentStep);
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0) {
        goToStep(currentStep - 1, -1);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleBasicsNext = (values: BasicsFormData) => {
    setBasics(values);
    toast.success("Firmenprofil gespeichert!");
    goToStep(1, 1);
  };

  const handleReferencesNext = (values: ReferencesFormData) => {
    setReferences(values);
    toast.success("Referenzen analysiert!");
    goToStep(2, 1);
  };

  const handleFinish = async (values: PreferencesFormData) => {
    setPreferences(values);
    const finalProfile = {
      basics,
      references,
      preferences: values,
    };

    const success = await submitProfile(finalProfile);
    if (!success) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "tender-profile-ready",
        JSON.stringify({ ...finalProfile, readyAt: new Date().toISOString() })
      );
    }
    toast.success("Profil ready!");
    setShowConfetti(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1800);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 lg:pl-72">
        <WizardSidebar />
        <main className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
          <section className="rounded-2xl bg-white/90 p-4 shadow-lg ring-1 ring-blue-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <Steps
                  steps={wizardSteps.map((step) => ({
                    label: step.label,
                    helper: step.helper,
                  }))}
                  currentStep={currentStep}
                />
              </div>
              <div className="text-sm font-semibold text-slate-600">
                Schritt {currentStep + 1} / {totalSteps}
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progressValue} />
            </div>
          </section>

          <p className="text-center text-xs text-slate-500 md:hidden">
            Swipe nach links für „Weiter“, rechts für „Zurück“.
          </p>

          <div {...swipeHandlers} className="relative flex justify-center">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-2xl"
              >
                {currentStep === 0 && (
                  <BasicsStep
                    initialValues={basics}
                    registerSubmit={registerSubmit}
                    onNext={handleBasicsNext}
                  />
                )}
                {currentStep === 1 && (
                  <ReferencesStep
                    initialValues={references}
                    onNext={handleReferencesNext}
                    onBack={() => goToStep(0, -1)}
                    registerSubmit={registerSubmit}
                  />
                )}
                {currentStep === 2 && (
                  <PreferencesStep
                    initialValues={preferences}
                    onBack={() => goToStep(1, -1)}
                    onFinish={handleFinish}
                    registerSubmit={registerSubmit}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        {showConfetti && windowSize.width > 0 && windowSize.height > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={320}
            recycle={false}
          />
        )}
        <Toaster richColors closeButton />
      </div>
    </TooltipProvider>
  );
}

const WizardSidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Opportunity Feed" },
    { icon: FileText, label: "Meine Bewerbungen" },
    { icon: Bell, label: "Benachrichtigungen" },
    { icon: Settings, label: "Einstellungen" },
  ];
  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-blue-900/30 bg-[#0B1437] text-white shadow-2xl lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold">
            TA
          </div>
          <div>
            <p className="text-lg font-semibold">Tender AI</p>
            <p className="text-xs text-blue-100">Onboarding Wizard</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 opacity-50"
            >
              <item.icon className="h-5 w-5 text-blue-200" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <span className="text-xs text-blue-100">Gesperrt</span>
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/5 px-6 py-4 text-xs text-blue-100">
          <Badge className="border-amber-200 bg-[#FBBF24]/30 text-amber-200">
            Wizard aktiv
          </Badge>
          <p className="mt-2">Navigation bis Abschluss deaktiviert.</p>
        </div>
      </aside>
      <div className="sticky top-0 z-30 flex flex-col gap-3 border-b border-blue-900/20 bg-[#0B1437] px-4 py-3 text-white shadow-md lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-wide">
          Navigation gesperrt - Wizard aktiv
        </p>
        <div className="flex gap-4 overflow-x-auto">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs opacity-60"
            >
              <item.icon className="h-5 w-5 text-blue-200" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

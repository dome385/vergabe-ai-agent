"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  UploadCloud,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
  Mail,
  Slack,
  MapPin,
} from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { toast, Toaster } from "sonner";

import { Steps } from "@/components/ui/steps";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  useProfileStore,
  BasicsFormData,
  ReferencesFormData,
  PreferencesFormData,
  ReferenceEntry,
} from "@/stores/profile-store";
import { cn } from "@/lib/utils";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const wizardSteps = [
  {
    label: "Setup",
    helper: "Firmen-Basics",
    emoji: "🏢",
    title: "Willkommen! Baue dein Profil für perfekte Matches auf.",
  },
  {
    label: "Referenzen",
    helper: "Uploads & Nachweise",
    emoji: "📁",
    title: "Lade deine Erfolge hoch - Boost Matches um 40%.",
  },
  {
    label: "Feintuning",
    helper: "Preferences",
    emoji: "⚙️",
    title: "Passe an & starte die Tender-Jagd!",
  },
] as const;

const industryOptions = [
  { value: "IT-Dienste", label: "IT-Dienste (CPV 72)" },
  { value: "Bau", label: "Bau (CPV 45)" },
  { value: "Beratung", label: "Beratung (CPV 79)" },
  { value: "Andere", label: "Andere" },
];

const revenueLabels = ["<1M€", "1-10M€", ">10M€"];
const locationHints = ["München", "Berlin", "Hamburg"];
const certificateSeeds = ["ISO 27001", "DIN EN", "VgV-konform"];

const teaserMatches = [
  {
    id: "teaser-1",
    title: "Sanierung Schule München",
    score: 94,
    reason: "Passt zu deiner Branche.",
    budget: "150k€",
    location: "Bayern",
    deadline: "Noch 8 Tage",
  },
  {
    id: "teaser-2",
    title: "IT-Upgrade Smart City",
    score: 88,
    reason: "Budget und Keywords matchen.",
    budget: "420k€",
    location: "NRW",
    deadline: "Noch 12 Tage",
  },
];

const basicsSchema = z.object({
  companyName: z.string().min(2, "Firmenname erforderlich"),
  industry: z.string().min(1, "Branche auswählen"),
  location: z.string().min(2, "Standort hinzufügen"),
  revenueTier: z.number().min(0).max(2),
  contactName: z.string().min(2, "Kontaktperson ergänzen"),
  contactEmail: z.string().email("Gültige E-Mail eintragen"),
});

const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
});

const referenceRowSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Projektname erforderlich"),
  year: z.number().min(2000).max(new Date().getFullYear()),
  budget: z.string().min(1, "Budget eintragen"),
  keywords: z.array(z.string()).min(1, "Bitte Keywords ergänzen"),
});

const referencesSchema = z.object({
  documents: z.array(documentSchema),
  references: z
    .array(referenceRowSchema)
    .min(1, "Mindestens eine Referenz anlegen"),
  certificates: z.array(z.string()).min(1, "Wähle deine Zertifikate"),
});

const preferencesSchema = z.object({
  alertEmail: z.boolean(),
  alertSlack: z.boolean(),
  alertFrequency: z.enum(["Täglich", "Wöchentlich"]),
  minMatchScore: z.number().min(0).max(100),
  budgetRange: z.tuple([z.number(), z.number()]),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Bitte DSGVO-Einwilligung bestätigen." }),
  }),
});

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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleFinish = (values: PreferencesFormData) => {
    setPreferences(values);
    const finalProfile = {
      basics,
      references,
      preferences: values,
      readyAt: new Date().toISOString(),
    };
    console.log("finalProfile", finalProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "tender-profile-ready",
        JSON.stringify(finalProfile)
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
                Step {currentStep + 1} / {totalSteps}
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

type BasicsStepProps = {
  initialValues: BasicsFormData;
  onNext: (values: BasicsFormData) => void;
  registerSubmit: SubmitRegistry;
};

const BasicsStep = ({
  initialValues,
  onNext,
  registerSubmit,
}: BasicsStepProps) => {
  const form = useForm<BasicsFormData>({
    resolver: zodResolver(basicsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const industryWatch = form.watch("industry");
  const locationWatch = form.watch("location");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locationMatches = useMemo(() => {
    if (!locationWatch) return locationHints;
    return locationHints.filter((hint) =>
      hint.toLowerCase().includes(locationWatch.toLowerCase())
    );
  }, [locationWatch]);

  const handleValid = useCallback(
    (values: BasicsFormData) => {
      onNext(values);
    },
    [onNext]
  );

  const handleError = useCallback((errors: FieldErrors<BasicsFormData>) => {
    const first = Object.values(errors)[0];
    const message =
      (first && "message" in first && first.message) ||
      "Bitte alle Felder prüfen.";
    toast.error(String(message));
  }, []);

  useEffect(() => {
    registerSubmit(0, () => form.handleSubmit(handleValid, handleError)());
  }, [form, handleValid, handleError, registerSubmit]);

  return (
    <Card className="rounded-2xl border-none bg-white shadow-2xl">
      <StepHeader
        emoji={wizardSteps[0].emoji}
        title={wizardSteps[0].title}
        subtitle="Wir nutzen deine Angaben nur für bessere Ausschreibungs-Matches."
      />
      <CardContent className="space-y-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel
                    label="Firmenname"
                    tooltip="Damit Auftraggeber dich eindeutig finden."
                  />
                  <FormControl>
                    <Input placeholder="Dein Firmenname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel
                    label="Branche / CPV"
                    tooltip="Steuert welche Ausschreibungen priorisiert werden."
                  />
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Branche wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {industryWatch && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["CPV 72", "CPV 73"].map((cpv) => (
                        <Badge
                          key={cpv}
                          className="bg-blue-50 text-blue-800 border-blue-100"
                        >
                          {cpv}
                        </Badge>
                      ))}
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">
                        AI Vorschlag aktiv
                      </Badge>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="relative">
                  <FieldLabel
                    label="Standort (PLZ / Stadt)"
                    tooltip="Für regionale Matches und Vergabestellen."
                  />
                  <FormControl>
                    <Input
                      placeholder="München, 80331"
                      {...field}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(event) => {
                        field.onChange(event);
                        setShowSuggestions(true);
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 120)
                      }
                    />
                  </FormControl>
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-blue-100 bg-white shadow-lg">
                      {locationMatches.map((city) => (
                        <button
                          type="button"
                          key={city}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-blue-50"
                          onClick={() => {
                            form.setValue("location", city, {
                              shouldValidate: true,
                            });
                            setShowSuggestions(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{city}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revenueTier"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel
                    label="Umsatzklasse"
                    tooltip="Hilft uns, Budgets mit deiner Kapazität zu matchen."
                  />
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={0}
                        max={2}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        {revenueLabels.map((label, index) => (
                          <span
                            key={label}
                            className={cn(
                              "rounded-full px-2 py-0.5",
                              field.value === index
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-400"
                            )}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Ansprechpartner"
                      tooltip="Wir personalisieren deine Bewerbungen."
                    />
                    <FormControl>
                      <Input placeholder="Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Kontakt-E-Mail"
                      tooltip="Für Freigaben und Alerts."
                    />
                    <FormControl>
                      <Input
                        placeholder="max@beispiel.de"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-500 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
              disabled={!form.formState.isValid}
            >
              Weiter <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

type ReferencesStepProps = {
  initialValues: ReferencesFormData;
  onNext: (values: ReferencesFormData) => void;
  onBack: () => void;
  registerSubmit: SubmitRegistry;
};

const ReferencesStep = ({
  initialValues,
  onNext,
  onBack,
  registerSubmit,
}: ReferencesStepProps) => {
  const form = useForm<ReferencesFormData>({
    resolver: zodResolver(referencesSchema),
    defaultValues: {
      documents: initialValues.documents ?? [],
      references: initialValues.references,
      certificates: initialValues.certificates.length
        ? initialValues.certificates
        : ["ISO 27001"],
    },
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "references",
  });
  const [certificateOptions, setCertificateOptions] =
    useState<string[]>(certificateSeeds);
  const [customCert, setCustomCert] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const uploadTimeout = useRef<NodeJS.Timeout>();
  const analyzeTimeout = useRef<NodeJS.Timeout>();
  const watchedCertificates = form.watch("certificates");

  useEffect(() => {
    return () => {
      if (uploadTimeout.current) clearTimeout(uploadTimeout.current);
      if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    };
  }, []);

  const handleValid = useCallback(
    (values: ReferencesFormData) => {
      setIsAnalyzing(true);
      analyzeTimeout.current = setTimeout(() => {
        setIsAnalyzing(false);
        onNext(values);
      }, 1200);
    },
    [onNext]
  );

  const handleError = useCallback((errors: FieldErrors<ReferencesFormData>) => {
    const first = Object.values(errors)[0];
    const message =
      (first && "message" in first && first.message) ||
      "Bitte Referenzen & Zertifikate prüfen.";
    toast.error(String(message));
  }, []);

  useEffect(() => {
    registerSubmit(1, () => form.handleSubmit(handleValid, handleError)());
  }, [form, registerSubmit, handleValid, handleError]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsUploading(true);
      if (uploadTimeout.current) {
        clearTimeout(uploadTimeout.current);
      }
      uploadTimeout.current = setTimeout(() => {
        const mapped = [
          ...acceptedFiles.map((file, index) => ({
            id: `${file.name}-${index}`,
            name: file.name,
            size: file.size,
          })),
          { id: "synthetic-ref1", name: "ref1.pdf", size: 32000 },
          { id: "synthetic-iso", name: "iso.pdf", size: 45000 },
        ];
        form.setValue("documents", mapped, { shouldDirty: true });
        toast.success("3 Items erkannt!");
        setIsUploading(false);
      }, 1000);
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
    },
  });

  const addReferenceRow = () => {
    const newRow: ReferenceEntry = {
      id: `ref-${Date.now()}`,
      name: "",
      year: new Date().getFullYear(),
      budget: "",
      keywords: [],
    };
    append(newRow);
  };

  const toggleCertificate = (cert: string) => {
    const current = form.getValues("certificates");
    if (current.includes(cert)) {
      form.setValue(
        "certificates",
        current.filter((item) => item !== cert),
        { shouldDirty: true }
      );
    } else {
      form.setValue("certificates", [...current, cert], { shouldDirty: true });
    }
  };

  const addCertificate = () => {
    const trimmed = customCert.trim();
    if (!trimmed) return;
    if (!certificateOptions.includes(trimmed)) {
      setCertificateOptions((prev) => [...prev, trimmed]);
    }
    toggleCertificate(trimmed);
    setCustomCert("");
  };

  return (
    <Card className="rounded-2xl border-none bg-white shadow-2xl">
      <StepHeader
        emoji={wizardSteps[1].emoji}
        title={wizardSteps[1].title}
        subtitle="Uploads erhöhen deinen Match-Score automatisch."
      />
      <CardContent className="space-y-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <div
              {...getRootProps()}
              className={cn(
                "rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all",
                isDragActive
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-slate-200 bg-slate-50/50"
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto mb-4 h-10 w-10 text-blue-500" />
              <p className="font-semibold text-slate-700">
                PDFs/CSVs hochladen (Referenzen, Zerts)
              </p>
              <p className="text-sm text-slate-500">
                Drag & Drop oder Datei auswählen
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(form.watch("documents") || []).map((doc) => (
                  <Badge
                    key={doc.id}
                    className="rounded-full bg-white text-slate-600 shadow"
                  >
                    {doc.name}
                  </Badge>
                ))}
              </div>
              {isUploading && (
                <p className="mt-3 text-sm font-medium text-blue-600">
                  Erkenne Inhalte…
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FieldLabel
                  label="Referenzprojekte"
                  tooltip="Gute Cases pushen den Match um Ø 40%."
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addReferenceRow}
                  className="bg-blue-50 text-blue-700"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Row
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projektname</TableHead>
                    <TableHead>Jahr</TableHead>
                    <TableHead>Budget (€)</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="min-w-[160px]">
                        <FormField
                          control={form.control}
                          name={`references.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Projekt A" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="min-w-[80px]">
                        <FormField
                          control={form.control}
                          name={`references.${index}.year`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={2000}
                                  max={new Date().getFullYear()}
                                  value={field.value}
                                  onChange={(event) =>
                                    field.onChange(Number(event.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="min-w-[110px]">
                        <FormField
                          control={form.control}
                          name={`references.${index}.budget`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="50k" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <Controller
                          control={form.control}
                          name={`references.${index}.keywords`}
                          render={({ field }) => (
                            <TagInput
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="w-12">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <FieldLabel
                  label="Zertifikate"
                  tooltip="Pflichtnachweise sorgen für Bonuspunkte."
                />
                {watchedCertificates.length < 2 && (
                  <Badge className="flex items-center gap-2 border-amber-200 bg-[#FBBF24]/20 text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    ISO fehlt? Füge hinzu!
                  </Badge>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {certificateOptions.map((cert) => (
                  <label
                    key={cert}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium",
                      watchedCertificates.includes(cert)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200"
                    )}
                  >
                    <Checkbox
                      checked={watchedCertificates.includes(cert)}
                      onCheckedChange={() => toggleCertificate(cert)}
                    />
                    {cert}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  placeholder="Mehr hinzufügen"
                  value={customCert}
                  onChange={(event) => setCustomCert(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-blue-700"
                  onClick={addCertificate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Hinzufügen
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500"
                onClick={onBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analysiere…" : "Analysieren & Weiter"}
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

type PreferencesStepProps = {
  initialValues: PreferencesFormData;
  onBack: () => void;
  onFinish: (values: PreferencesFormData) => void;
  registerSubmit: SubmitRegistry;
};

const PreferencesStep = ({
  initialValues,
  onBack,
  onFinish,
  registerSubmit,
}: PreferencesStepProps) => {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const budgetWatch = form.watch("budgetRange");
  const minScoreWatch = form.watch("minMatchScore");

  const handleValid = useCallback(
    (values: PreferencesFormData) => {
      setIsFinalizing(true);
      setTimeout(() => {
        onFinish(values);
        setIsFinalizing(false);
      }, 900);
    },
    [onFinish]
  );

  const handleError = useCallback(
    (errors: FieldErrors<PreferencesFormData>) => {
      const first = Object.values(errors)[0];
      const message =
        (first && "message" in first && first.message) ||
        "Bitte Präferenzen prüfen.";
      toast.error(String(message));
    },
    []
  );

  useEffect(() => {
    registerSubmit(2, () => form.handleSubmit(handleValid, handleError)());
  }, [form, registerSubmit, handleValid, handleError]);

  return (
    <Card className="rounded-2xl border-none bg-white shadow-2xl">
      <StepHeader
        emoji={wizardSteps[2].emoji}
        title={wizardSteps[2].title}
        subtitle="Justiere Alerts & Budgeträume, damit wir smart filtern."
      />
      <CardContent className="space-y-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap gap-3">
                <AlertToggle
                  icon={<Mail className="h-4 w-4" />}
                  label="E-Mail Alerts"
                >
                  <FormField
                    control={form.control}
                    name="alertEmail"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </AlertToggle>
                <AlertToggle
                  icon={<Slack className="h-4 w-4" />}
                  label="Slack Updates"
                >
                  <FormField
                    control={form.control}
                    name="alertSlack"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </AlertToggle>
              </div>
              <FormField
                control={form.control}
                name="alertFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">
                      Frequenz
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Täglich", "Wöchentlich"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <FieldLabel
                  label="Min. Match-Score"
                  tooltip="Steuert ab wann eine Ausschreibung im Feed landet."
                />
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {minScoreWatch}%
                </Badge>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <FormField
                  control={form.control}
                  name="minMatchScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <ScoreDial value={minScoreWatch} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <FieldLabel
                label="Budget-Range"
                tooltip="Wir filtern Aufträge außerhalb deiner Wunschspanne."
              />
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-blue-900">
                  <Badge className="border-blue-100 bg-blue-50 text-blue-800">
                    ab {formatCurrency(budgetWatch?.[0] ?? 0)}
                  </Badge>
                  <Badge className="border-blue-100 bg-blue-50 text-blue-800">
                    bis {formatCurrency(budgetWatch?.[1] ?? 0)}
                  </Badge>
                </div>
                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Slider
                          min={10000}
                          max={1000000}
                          step={5000}
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value as [number, number])
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <FieldLabel
                label="DSGVO & Consent"
                tooltip="Pflicht, um Matching-Daten langlebig zu speichern."
              />
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="mt-3 flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="text-sm text-slate-600">
                      Einwilligung zu Matching-Daten - löschen jederzeit.{" "}
                      <Link href="/policy" className="text-blue-700 underline">
                        /policy
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-600">
                Erste Matches warten schon:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {teaserMatches.map((teaser) => (
                  <div
                    key={teaser.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <ScoreDial value={teaser.score} compact />
                      <Badge className="border-yellow-200 bg-yellow-50 text-amber-700">
                        {teaser.deadline}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">
                      {teaser.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        {teaser.location}
                      </span>
                      <span className="flex items-center gap-1">
                        € {teaser.budget}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="mt-3 cursor-help border-amber-200 bg-[#FBBF24]/30 text-amber-700">
                          Match-Grund
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{teaser.reason}</TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled
                      className="mt-4 w-full border-dashed border-slate-300 text-slate-400"
                    >
                      Details - Nach Start!
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500"
                onClick={onBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                disabled={isFinalizing}
              >
                {isFinalizing ? "Starte Matching…" : "Matching starten!"}
                <RocketIcon />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const StepHeader = ({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) => (
  <CardHeader className="rounded-t-2xl bg-[#1E40AF] text-white">
    <CardTitle className="flex items-center gap-3 text-xl">
      <span className="text-3xl">{emoji}</span>
      {title}
    </CardTitle>
    <CardDescription className="text-blue-100">{subtitle}</CardDescription>
  </CardHeader>
);

const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
    <span>{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="cursor-help border-amber-200 bg-[#FBBF24]/30 text-amber-700">
          Warum?
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  </div>
);

const TagInput = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (keywords: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");
  const addKeyword = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...(value || []), trimmed]);
    setDraft("");
  };
  const removeKeyword = (keyword: string) => {
    onChange((value || []).filter((item) => item !== keyword));
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value?.length ? (
          value.map((keyword) => (
            <Badge
              key={keyword}
              className="flex items-center gap-1 bg-blue-50 text-blue-700"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="text-xs text-blue-500"
                aria-label={`Keyword ${keyword} entfernen`}
              >
                x
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-slate-400">Tags hinzufügen...</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addKeyword();
            }
          }}
          placeholder="Keyword"
        />
        <Button type="button" variant="secondary" onClick={addKeyword}>
          Hinzufügen
        </Button>
      </div>
    </div>
  );
};

const ScoreDial = ({
  value,
  compact,
}: {
  value: number;
  compact?: boolean;
}) => {
  const radius = compact ? 22 : 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((value ?? 0) / 100) * circumference;
  return (
    <div className={cn("relative", compact ? "h-16 w-16" : "h-20 w-20")}>
      <svg
        viewBox="0 0 80 80"
        className={cn(
          "text-slate-200",
          compact ? "h-16 w-16 -rotate-90" : "h-20 w-20 -rotate-90"
        )}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{value}%</span>
        {!compact && <span className="text-xs text-slate-500">Score</span>}
      </div>
    </div>
  );
};

const AlertToggle = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-1 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </span>
      {label}
    </div>
    {children}
  </div>
);

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

const RocketIcon = () => (
  <span className="ml-2 text-xl" role="img" aria-label="rocket">
    🚀
  </span>
);

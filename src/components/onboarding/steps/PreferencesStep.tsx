"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Slack,
  Rocket,
  MapPin,
  Target,
  Bell,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PreferencesFormData } from "@/stores/profile-store";
import { cn } from "@/lib/utils";
import { ScoreDial } from "../ui/ScoreDial";
import { TagInput } from "../ui/TagInput";

const preferencesSchema = z.object({
  alertEmail: z.boolean(),
  alertSlack: z.boolean(),
  alertFrequency: z.enum(["Täglich", "Wöchentlich"]),
  minMatchScore: z.number().min(0).max(100),
  budgetRange: z.tuple([z.number(), z.number()]),
  regions: z.array(z.string()).min(1, "Mindestens eine Region wählen"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Bitte DSGVO-Einwilligung bestätigen." }),
  }),
});

const regionOptions = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
  "Bundesweit",
];

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

type SubmitRegistry = (step: number, handler: () => void) => void;

type PreferencesStepProps = {
  initialValues: PreferencesFormData;
  onBack: () => void;
  onFinish: (values: PreferencesFormData) => void;
  registerSubmit: SubmitRegistry;
};

export const PreferencesStep = ({
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

  const handleError = useCallback((errors: any) => {
    const first = Object.values(errors)[0] as { message?: string };
    const message = first?.message || "Bitte Präferenzen prüfen.";
    toast.error(String(message));
  }, []);

  useEffect(() => {
    registerSubmit(2, () => form.handleSubmit(handleValid, handleError)());
  }, [form, registerSubmit, handleValid, handleError]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <Card className="rounded-2xl border-none bg-white shadow-2xl">
      <CardHeader className="rounded-t-2xl bg-[#1E40AF] text-white">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="text-3xl">⚙️</span>
          Feintuning
        </CardTitle>
        <CardDescription className="text-blue-100">
          Justiere Alerts & Budgeträume, damit wir smart filtern.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">
                  Benachrichtigungen
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                  <FormItem className="flex items-center gap-4 space-y-0">
                    <FormLabel className="text-sm font-medium text-slate-600 whitespace-nowrap">
                      Wie oft informieren?
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-[180px] bg-white">
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <FieldLabel
                    label="Min. Match-Score"
                    tooltip="Steuert ab wann eine Ausschreibung im Feed landet."
                    icon={<Target className="h-4 w-4" />}
                  />
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 ml-auto">
                    {minScoreWatch}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="minMatchScore"
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                  <ScoreDial
                    value={minScoreWatch}
                    compact
                    className="shrink-0"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <FieldLabel
                  label="Budget-Range"
                  tooltip="Wir filtern Aufträge außerhalb deiner Wunschspanne."
                  icon={<span className="text-lg leading-none">€</span>}
                />
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-blue-900">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-100"
                    >
                      ab {formatCurrency(budgetWatch?.[0] ?? 0)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-100"
                    >
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
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <FieldLabel
                label="Bevorzugte Regionen"
                tooltip="Wo möchtest du Aufträge annehmen?"
                icon={<MapPin className="h-4 w-4" />}
              />
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="regions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TagInput
                          value={field.value || []}
                          onChange={field.onChange}
                          placeholder="Region hinzufügen..."
                        />
                      </FormControl>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {regionOptions.slice(0, 6).map((region) => (
                          <Badge
                            key={region}
                            variant="outline"
                            className="cursor-pointer hover:bg-slate-100 text-slate-500 font-normal"
                            onClick={() => {
                              const current = field.value || [];
                              if (!current.includes(region)) {
                                field.onChange([...current, region]);
                              }
                            }}
                          >
                            + {region}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
              <FieldLabel
                label="DSGVO & Consent"
                tooltip="Pflicht, um Matching-Daten langlebig zu speichern."
              />
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="mt-3 flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="text-sm text-slate-600 leading-relaxed">
                      Ich stimme zu, dass meine Daten für das Matching
                      verarbeitet werden. Diese Einwilligung kann jederzeit
                      widerrufen werden.{" "}
                      <Link
                        href="/policy"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Datenschutzerklärung
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-emerald-500" />
                Erste Matches warten schon:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {teaserMatches.map((teaser) => (
                  <div
                    key={teaser.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <ScoreDial value={teaser.score} compact />
                      <Badge className="border-yellow-200 bg-yellow-50 text-amber-700 hover:bg-yellow-100">
                        {teaser.deadline}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-1">
                      {teaser.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {teaser.location}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        € {teaser.budget}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="cursor-help border-blue-100 text-blue-600 bg-blue-50/50"
                          >
                            Warum Match?
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{teaser.reason}</TooltipContent>
                      </Tooltip>
                      <span className="text-xs text-slate-400 italic">
                        Details nach Start
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row pt-4">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 hover:text-slate-900"
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
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const FieldLabel = ({
  label,
  tooltip,
  icon,
}: {
  label: string;
  tooltip: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
    {icon && <span className="text-slate-400">{icon}</span>}
    <span>{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="cursor-help border-amber-200 bg-[#FBBF24]/20 text-amber-700 hover:bg-[#FBBF24]/30 px-1.5 py-0 h-5 text-[10px]">
          ?
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  </div>
);

const AlertToggle = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </span>
      {label}
    </div>
    {children}
  </div>
);

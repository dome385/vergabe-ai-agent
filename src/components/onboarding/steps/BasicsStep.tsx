"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronRight,
  MapPin,
  Building2,
  Users,
  Globe,
  CheckCircle2,
} from "lucide-react";

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
import { BasicsFormData } from "@/stores/profile-store";
import { cn } from "@/lib/utils";
import { TagInput } from "../ui/TagInput";

const basicsSchema = z.object({
  companyName: z.string().min(2, "Firmenname erforderlich"),
  legalForm: z.string().default(""),
  taxId: z.string().default(""),
  industry: z.string().min(1, "Branche auswählen"),
  cpvCodes: z.array(z.string()).min(1, "Mindestens ein CPV-Code"),
  employeeCount: z.string().min(1, "Mitarbeiterzahl wählen"),
  addressStreet: z.string().default(""),
  addressZip: z.string().min(5, "PLZ erforderlich"),
  addressCity: z.string().min(2, "Stadt erforderlich"),
  addressCountry: z.string().default("DE"),
  serviceRadius: z.number().min(0).default(100),
  revenueTier: z.number().min(0).max(2),
  foundingYear: z.coerce.number().min(1800).max(new Date().getFullYear() + 1).default(new Date().getFullYear()),
  contactName: z.string().min(2, "Kontaktperson ergänzen"),
  contactEmail: z.string().email("Gültige E-Mail eintragen"),
  contactPhone: z.string().default(""),
  website: z.string().default(""),
  isAvpq: z.boolean(),
  profileSummary: z.string().default(""),
});

const industryOptions = [
  { value: "IT-Dienste", label: "IT-Dienste (CPV 72)" },
  { value: "Bau", label: "Bau (CPV 45)" },
  { value: "Beratung", label: "Beratung (CPV 79)" },
  { value: "Architektur", label: "Architektur (CPV 71)" },
  { value: "Marketing", label: "Marketing (CPV 79)" },
  { value: "Andere", label: "Andere" },
];

const employeeCountOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

const revenueLabels = ["<1M€", "1-10M€", ">10M€"];
const locationHints = ["München", "Berlin", "Hamburg", "Köln", "Frankfurt"];

type SubmitRegistry = (step: number, handler: () => void) => void;

type BasicsStepProps = {
  initialValues: BasicsFormData;
  onNext: (values: BasicsFormData) => void;
  registerSubmit: SubmitRegistry;
};

export const BasicsStep = ({
  initialValues,
  onNext,
  registerSubmit,
}: BasicsStepProps) => {
  const form = useForm<BasicsFormData>({
    resolver: zodResolver(basicsSchema) as any,
    defaultValues: initialValues,
    mode: "onChange",
  });

  const industryWatch = form.watch("industry");
  const cityWatch = form.watch("addressCity");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locationMatches = useMemo(() => {
    if (!cityWatch) return locationHints;
    return locationHints.filter((hint) =>
      hint.toLowerCase().includes(cityWatch.toLowerCase())
    );
  }, [cityWatch]);

  const handleValid = useCallback(
    (values: BasicsFormData) => {
      onNext(values);
    },
    [onNext]
  );

  const handleError = useCallback((errors: any) => {
    const first = Object.values(errors)[0] as { message?: string };
    const message = first?.message || "Bitte alle Felder prüfen.";
    toast.error(String(message));
  }, []);

  useEffect(() => {
    registerSubmit(0, () => form.handleSubmit(handleValid, handleError)());
  }, [form, handleValid, handleError, registerSubmit]);

  // Auto-suggest CPV codes based on industry
  useEffect(() => {
    if (industryWatch === "IT-Dienste") {
      const current = form.getValues("cpvCodes");
      if (!current.includes("72000000-5")) {
        form.setValue("cpvCodes", [...current, "72000000-5"]);
      }
    } else if (industryWatch === "Bau") {
      const current = form.getValues("cpvCodes");
      if (!current.includes("45000000-7")) {
        form.setValue("cpvCodes", [...current, "45000000-7"]);
      }
    }
  }, [industryWatch, form]);

  return (
    <Card className="rounded-2xl border-none bg-white shadow-2xl">
      <CardContent className="space-y-8 p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Firmendaten
          </h2>
          <p className="text-slate-500">
            Wir nutzen deine Angaben nur für bessere Ausschreibungs-Matches.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Firmenname"
                      tooltip="Damit Auftraggeber dich eindeutig finden."
                      icon={<Building2 className="h-4 w-4" />}
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Webseite"
                      tooltip="Optional: Für automatische Datenanreicherung."
                      icon={<Globe className="h-4 w-4" />}
                    />
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="legalForm"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Rechtsform" tooltip="z.B. GmbH, AG" />
                    <FormControl>
                      <Input placeholder="GmbH" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="USt-IdNr." tooltip="Für Rechnungen" />
                    <FormControl>
                      <Input placeholder="DE123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Branche"
                      tooltip="Steuert welche Ausschreibungen priorisiert werden."
                    />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Mitarbeiterzahl"
                      tooltip="Wichtig für Eignungskriterien."
                      icon={<Users className="h-4 w-4" />}
                    />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Anzahl wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employeeCountOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cpvCodes"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel
                    label="CPV Codes"
                    tooltip="Common Procurement Vocabulary - der Standard für Ausschreibungen."
                  />
                  <FormControl>
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="CPV Code hinzufügen (z.B. 72000000-5)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="addressStreet"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FieldLabel
                      label="Straße & Hausnummer"
                      tooltip="Firmensitz"
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <FormControl>
                      <Input placeholder="Musterstraße 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressZip"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="PLZ" tooltip="Postleitzahl" />
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem className="relative md:col-span-2">
                    <FieldLabel label="Stadt" tooltip="Ort" />
                    <FormControl>
                      <Input
                        placeholder="Musterstadt"
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
                    {showSuggestions && locationMatches.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-blue-100 bg-white shadow-lg">
                        {locationMatches.map((city) => (
                          <button
                            type="button"
                            key={city}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-blue-50"
                            onClick={() => {
                              form.setValue("addressCity", city, {
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="revenueTier"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Jahresumsatz"
                      tooltip="Hilft uns, Budgets mit deiner Kapazität zu matchen."
                    />
                    <FormControl>
                      <div className="space-y-3 pt-2">
                        <Slider
                          min={0}
                          max={2}
                          step={1}
                          value={[field.value || 0]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          {revenueLabels.map((label, index) => (
                            <span
                              key={label}
                              className={cn(
                                "rounded-full px-2 py-0.5 transition-colors",
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
              <FormField
                control={form.control}
                name="foundingYear"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Gründungsjahr" tooltip="Seit wann existiert die Firma?" />
                    <FormControl>
                      <Input type="number" placeholder="2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileSummary"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel
                    label="Kurzbeschreibung"
                    tooltip="Was macht deine Firma besonders?"
                  />
                  <FormControl>
                    <Input placeholder="Wir sind spezialisiert auf..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvpq"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-semibold text-slate-700">
                        AVPQ präqualifiziert?
                      </FormLabel>
                      {field.value && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Amtliches Verzeichnis präqualifizierter Unternehmen. Spart
                      viele Nachweise.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
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
            <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Telefonnummer"
                      tooltip="Für Rückfragen."
                    />
                    <FormControl>
                      <Input placeholder="+49 123 456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <Button
              type="submit"
              className="w-full bg-emerald-500 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
              disabled={!form.formState.isValid}
            >
              Weiter <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
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
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
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

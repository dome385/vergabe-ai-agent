'use client';

import React, { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react";

type TenderMeta = {
  title: string;
  location: string;
  deadline: string;
  budget: string;
  match: number;
  complianceStatus: "machbar" | "blockiert";
  effortHours: number;
  winChance: "Hoch" | "Medium" | "Niedrig";
  sourceLabel: string;
};

const TENDER_LIBRARY: Record<string, TenderMeta> = {
  "turnhalle-elektro": {
    title: "Sanierung Schulturnhalle - Gewerk Elektro",
    location: "Muenchen, Bayern",
    deadline: "Noch 8 Tage",
    budget: "150.000 EUR",
    match: 94,
    complianceStatus: "machbar",
    effortHours: 2,
    winChance: "Hoch",
    sourceLabel: "Stadt Muenchen - KNX Ausbau",
  },
  "it-infrastruktur": {
    title: "Neubau Verwaltungsgebaeude - IT-Infrastruktur",
    location: "Augsburg, Bayern",
    deadline: "Noch 14 Tage",
    budget: "450.000 EUR",
    match: 88,
    complianceStatus: "machbar",
    effortHours: 3,
    winChance: "Hoch",
    sourceLabel: "Landkreis Augsburg - Digitale Leitstelle",
  },
  "strassenbeleuchtung": {
    title: "Wartungsvertrag Strassenbeleuchtung 2025-2028",
    location: "Landkreis Dachau",
    deadline: "Noch 5 Tage",
    budget: "Offen",
    match: 72,
    complianceStatus: "blockiert",
    effortHours: 1,
    winChance: "Medium",
    sourceLabel: "Landratsamt Dachau - Infrastruktur",
  },
};

const DEFAULT_TENDER: TenderMeta = {
  title: "Deal Room",
  location: "Deutschland",
  deadline: "Frist offen",
  budget: "Auf Anfrage",
  match: 90,
  complianceStatus: "machbar",
  effortHours: 2,
  winChance: "Hoch",
  sourceLabel: "Verwaltung",
};

type Requirement = {
  label: string;
  detail: string;
  status: "ok" | "warning";
  actionLabel?: string;
};

const REQUIREMENTS: Requirement[] = [
  {
    label: "Bonitaetsnachweis",
    detail: "Vorhanden (Score 2024)",
    status: "ok",
  },
  {
    label: "Referenz \"Oeffentlicher Bau\"",
    detail: "2 passende Projekte hinterlegt",
    status: "ok",
  },
  {
    label: "ISO 27001 Zertifikat",
    detail: "Fehlt im Profil",
    status: "warning",
    actionLabel: "Jetzt hochladen",
  },
];

const KEYWORDS = [
  "Bonitaetsnachweis",
  "Referenz \"Oeffentlicher Bau\"",
  "ISO 27001",
  "Installation einer KNX-Steuerung",
] as const;

type Keyword = typeof KEYWORDS[number];

const SOURCE_DOCUMENT: Array<{ type: "heading" | "paragraph" | "list"; text: string }> = [
  { type: "heading", text: "Ausschreibungstext (Auszug):" },
  { type: "paragraph", text: "" },
  { type: "paragraph", text: "1. Gegenstand der Vergabe" },
  {
    type: "paragraph",
    text: "Gegenstand dieser Ausschreibung sind Elektroinstallationsarbeiten im Rahmen der Sanierung der Schulturnhalle des Gymnasiums Muenchen-Nord.",
  },
  { type: "paragraph", text: "" },
  { type: "paragraph", text: "2. Umfang der Leistungen" },
  { type: "list", text: "Demontage der Bestandsanlagen" },
  { type: "list", text: "Neuinstallation der Beleuchtungsanlage (LED)" },
  { type: "list", text: "Installation einer KNX-Steuerung für Licht und Jalousien" },
  { type: "list", text: "Erneuerung der Unterverteilungen" },
  { type: "list", text: "Sicherheitsbeleuchtung gemäß DIN VDE 0108" },
  { type: "paragraph", text: "" },
  { type: "paragraph", text: "3. Eignungskriterien" },
  {
    type: "paragraph",
    text: "Der Bieter muss seine Fachkunde, Leistungsfähigkeit und Zuverlässigkeit nachweisen.",
  },
  { type: "list", text: "Bonitaetsnachweis gemäß EU-VO 2024" },
  { type: "list", text: "Referenz \"Oeffentlicher Bau\" aus den letzten 3 Jahren" },
  { type: "list", text: "ISO 27001 Zertifikat oder gleichwertiger Nachweis" },
];

const GENERATION_STEPS = [
  "Formulare ausfuellen...",
  "Anschreiben texten...",
  "Referenzen anhaengen...",
] as const;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightSourceText = (text: string, keywords: readonly string[]) => {
  if (!keywords.length) {
    return text;
  }

  const regex = new RegExp(`(${keywords.map((keyword) => escapeRegExp(keyword)).join("|")})`, "gi");
  return text.split(regex).map((part, index) => {
    if (!part) return null;
    const keyword = keywords.find((item) => item.toLowerCase() === part.toLowerCase());
    if (keyword) {
      return (
        <span key={`kw-${keyword}-${index}`} className="bg-yellow-200 px-1 rounded text-slate-900">
          {part}
        </span>
      );
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
};

export default function TenderDealRoomPage() {
  const { id } = useParams<{ id: string }>();
  const tender = TENDER_LIBRARY[id] ?? DEFAULT_TENDER;
  const [activeKeywords, setActiveKeywords] = useState<Keyword[]>([...KEYWORDS]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleMagicButton = () => {
    if (isGenerating) return;
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    setIsGenerating(true);
    setCurrentStep(0);

    GENERATION_STEPS.forEach((_, index) => {
      const timeout = setTimeout(() => {
        if (index === GENERATION_STEPS.length - 1) {
          setCurrentStep(GENERATION_STEPS.length);
          setIsGenerating(false);
          const resetTimeout = setTimeout(() => setCurrentStep(-1), 1400);
          timers.current.push(resetTimeout);
        } else {
          setCurrentStep(index + 1);
        }
      }, (index + 1) * 1200);

      timers.current.push(timeout);
    });
  };

  const toggleKeyword = (keyword: Keyword) => {
    setActiveKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((item) => item !== keyword) : [...prev, keyword]
    );
  };

  const showStepList = currentStep > -1;
  const statusTone =
    tender.complianceStatus === "blockiert"
      ? {
          label: "Status: Blockiert",
          dot: "bg-rose-500",
          container: "bg-rose-50 border-rose-200 text-rose-700",
        }
      : {
          label: "Status: Machbar",
          dot: "bg-emerald-500",
          container: "bg-emerald-50 border-emerald-200 text-emerald-700",
        };

  return (
    <div className="relative space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Button asChild variant="ghost" size="sm" className="px-0 text-slate-500 hover:text-slate-900">
              <Link href="/dashboard" className="inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Zurueck zum Feed
              </Link>
            </Button>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
              Deal Room
            </Badge>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{tender.title}</h1>
            <p className="text-sm text-slate-500">
              {tender.location} - Frist: {tender.deadline}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">Match Score</p>
          <p className="text-3xl font-bold text-emerald-500">{tender.match}%</p>
          <p className="text-xs text-slate-400">Budget: {tender.budget}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        {/* Column 1: Source */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <FileText className="h-5 w-5 text-slate-400" />
              Das Original
            </CardTitle>
            <p className="text-sm text-slate-500">Quelle: {tender.sourceLabel}</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="rounded-[32px] border border-slate-200 bg-white shadow-inner overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ausschreibung</p>
                    <p className="text-xs text-slate-500">{tender.sourceLabel}</p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                  PDF Ansicht
                </span>
              </div>
              <div className="bg-slate-100/70 px-5 py-6">
                <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 font-serif text-slate-800 text-[15px] leading-relaxed shadow-inner">
                  <div className="space-y-3">
                    {SOURCE_DOCUMENT.map((line, index) => {
                      if (line.type === "heading") {
                        return (
                          <p key={index} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {line.text}
                          </p>
                        );
                      }

                      if (line.type === "list") {
                        return (
                          <p key={index} className="flex text-[15px] text-slate-800">
                            <span className="mr-3 text-slate-300">•</span>
                            <span>{highlightSourceText(line.text, activeKeywords)}</span>
                          </p>
                        );
                      }

                      return (
                        <p key={index} className="text-[15px] text-slate-800">
                          {highlightSourceText(line.text, activeKeywords)}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Highlights</p>
                <p className="text-[11px] text-slate-400">{activeKeywords.length} aktiv</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {KEYWORDS.map((keyword) => {
                  const active = activeKeywords.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => toggleKeyword(keyword)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active ? "border-yellow-300 bg-yellow-100 text-yellow-800 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-slate-500">Keywords anklicken, um gelbe Markierungen im PDF an/aus zu schalten.</p>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Compliance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base text-slate-900">Compliance-Matrix</CardTitle>
            <p className="text-sm text-slate-500">Agenten-Output in Echtzeit</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${statusTone.container}`}>
              <span className={`h-3 w-3 rounded-full ${statusTone.dot} animate-pulse`} />
              <div>
                <p className="text-sm font-semibold">{statusTone.label}</p>
                <p className="text-xs opacity-80">Bewirb dich hier, oder lass es.</p>
              </div>
            </div>

            <div className="space-y-3">
              {REQUIREMENTS.map((requirement) => (
                <div key={requirement.label} className="rounded-2xl border border-slate-200 px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {requirement.status === "ok" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <TriangleAlert className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{requirement.label}</p>
                      <p className="text-xs text-slate-500">{requirement.detail}</p>
                    </div>
                  </div>
                  {requirement.actionLabel && (
                    <Button variant="outline" size="sm" className="text-xs font-semibold">
                      <Upload className="h-3.5 w-3.5" />
                      {requirement.actionLabel}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 italic">Das ist der Filter, der entscheidet: Go oder No-Go.</p>
          </CardContent>
        </Card>

        {/* Column 3: Actions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base text-slate-900">Aktions-Leiste</CardTitle>
            <p className="text-sm text-slate-500">Conversion-Tools im Deal Room</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Aufwand</p>
                <p className="text-lg font-semibold text-slate-900">ca. {tender.effortHours} Std</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs uppercase text-emerald-600">Gewinnchance</p>
                <p className="text-lg font-semibold text-emerald-700">{tender.winChance}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Schnell-Check</p>
              <p className="text-xs text-slate-600">Agent bewertet Risiko &lt; 10%, Vorlage liegt bereit.</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleMagicButton} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" disabled={isGenerating}>
                <Sparkles className="h-4 w-4" />
                Bewerbung generieren
              </Button>

              {showStepList && (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                  {GENERATION_STEPS.map((step, index) => {
                    let state: "done" | "active" | "idle" = "idle";
                    if (currentStep === GENERATION_STEPS.length) {
                      state = "done";
                    } else if (currentStep > index) {
                      state = "done";
                    } else if (currentStep === index) {
                      state = isGenerating ? "active" : "done";
                    }

                    return (
                      <div
                        key={step}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                          state === "done"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : state === "active"
                            ? "border-blue-100 bg-blue-50 text-blue-700"
                            : "border-slate-100 text-slate-500"
                        }`}
                      >
                        {state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Experten hinzuziehen</p>
                  <p className="text-xs text-slate-600">Persoenliches Review inkl. Telefon-Support.</p>
                </div>
              </div>
              <Button className="w-full border-none bg-amber-500 text-white hover:bg-amber-600">
                Experten hinzuziehen (+49\u20ac)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

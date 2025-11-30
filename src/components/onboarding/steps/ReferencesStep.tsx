"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  ChevronLeft,
  UploadCloud,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  FileText,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReferencesFormData, ReferenceEntry } from "@/stores/profile-store";
import { cn } from "@/lib/utils";
import { TagInput } from "../ui/TagInput";

const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
});

const referenceRowSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Projektname erforderlich"),
  client: z.string().min(2, "Auftraggeber erforderlich"),
  year: z.number().min(2000).max(new Date().getFullYear()),
  budget: z.string().min(1, "Budget eintragen"),
  keywords: z.array(z.string()).min(1, "Bitte Keywords ergänzen"),
});

const referencesSchema = z.object({
  documents: z.array(documentSchema),
  references: z.array(referenceRowSchema),
  certificates: z.array(z.string()),
});

const certificateSeeds = ["ISO 27001", "DIN EN ISO 9001", "VgV-konform"];

type SubmitRegistry = (step: number, handler: () => void) => void;

type ReferencesStepProps = {
  initialValues: ReferencesFormData;
  onNext: (values: ReferencesFormData) => void;
  onBack: () => void;
  registerSubmit: SubmitRegistry;
};

export const ReferencesStep = ({
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
  const uploadTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const analyzeTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
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

  const handleError = useCallback(
    (errors: Record<string, { message?: string }>) => {
      const first = Object.values(errors)[0] as { message?: string };
      const message =
        first?.message || "Bitte Referenzen & Zertifikate prüfen.";
      toast.error(String(message));
    },
    []
  );

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
          { id: "synthetic-ref1", name: "referenzliste_2024.pdf", size: 32000 },
          { id: "synthetic-iso", name: "iso_zertifikat.pdf", size: 45000 },
        ];
        form.setValue("documents", mapped, { shouldDirty: true });
        toast.success("Dokumente erfolgreich analysiert!");
        setIsUploading(false);
      }, 1500);
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const addReferenceRow = () => {
    const newRow: ReferenceEntry = {
      id: `ref-${Date.now()}`,
      name: "",
      client: "",
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
      <CardHeader className="rounded-t-2xl bg-[#1E40AF] text-white">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="text-3xl">📁</span>
          Referenzen & Nachweise
        </CardTitle>
        <CardDescription className="text-blue-100">
          Uploads erhöhen deinen Match-Score automatisch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValid, handleError)}
            className="space-y-6"
          >
            <div
              {...getRootProps()}
              className={cn(
                "rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all cursor-pointer",
                isDragActive
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <UploadCloud className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-700">
                Dokumente hier ablegen
              </p>
              <p className="text-sm text-slate-500">
                PDF, Word oder CSV (Referenzlisten, Zertifikate)
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(form.watch("documents") || []).map((doc) => (
                  <Badge
                    key={doc.id}
                    variant="secondary"
                    className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-600 shadow-sm border border-slate-200"
                  >
                    <FileText className="h-3 w-3 text-blue-500" />
                    {doc.name}
                  </Badge>
                ))}
              </div>

              {isUploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  Analysiere Inhalte mit AI...
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel
                  label="Referenzprojekte"
                  tooltip="Gute Cases pushen den Match um Ø 40%."
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addReferenceRow}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Projekt hinzufügen
                </Button>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[200px]">Projektname</TableHead>
                      <TableHead className="w-[180px]">Auftraggeber</TableHead>
                      <TableHead className="w-[100px]">Jahr</TableHead>
                      <TableHead className="w-[120px]">Volumen</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`references.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Projekt A"
                                    {...field}
                                    className="h-9"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`references.${index}.client`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Behörde XY"
                                    {...field}
                                    className="h-9"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
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
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                    className="h-9"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`references.${index}.budget`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="50k €"
                                    {...field}
                                    className="h-9"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`references.${index}.keywords`}
                            render={({ field }) => (
                              <TagInput
                                value={field.value || []}
                                onChange={field.onChange}
                                placeholder="Tag..."
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <FieldLabel
                  label="Zertifikate & Nachweise"
                  tooltip="Pflichtnachweise sorgen für Bonuspunkte."
                />
                {watchedCertificates.length < 2 && (
                  <Badge className="flex items-center gap-1.5 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                    <AlertTriangle className="h-3 w-3" />
                    ISO fehlt? Füge hinzu!
                  </Badge>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {certificateOptions.map((cert) => (
                  <label
                    key={cert}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all cursor-pointer hover:shadow-sm",
                      watchedCertificates.includes(cert)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    <Checkbox
                      checked={watchedCertificates.includes(cert)}
                      onCheckedChange={() => toggleCertificate(cert)}
                      className={cn(
                        watchedCertificates.includes(cert) &&
                          "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      )}
                    />
                    {cert}
                    {watchedCertificates.includes(cert) && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
                    )}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row pt-2">
                <Input
                  placeholder="Anderes Zertifikat..."
                  value={customCert}
                  onChange={(event) => setCustomCert(event.target.value)}
                  className="bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={addCertificate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Hinzufügen
                </Button>
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
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analysiere Daten...
                  </>
                ) : (
                  <>
                    Analysieren & Weiter
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
    Upload,
    FileCode2,
    FileText,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Calendar,
    Building2,
    MapPin,
    Trash2,
    Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ParsedTender {
    id: string;
    title: string;
    description_full: string;
    deadline_at: string;
    awarding_authority: string;
    location_city: string;
    location_zip: string;
    cpv_codes: string[];
}

interface TenderListItem {
    id: string;
    title: string;
    awarding_authority: string;
    deadline_at: string;
}

interface Attachment {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

type TabType = "xml" | "pdf";

export default function UploadPage() {
    const router = useRouter();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<TabType>("xml");

    // XML Upload State
    const [isDraggingXml, setIsDraggingXml] = useState(false);
    const [isUploadingXml, setIsUploadingXml] = useState(false);
    const [uploadedTender, setUploadedTender] = useState<ParsedTender | null>(null);
    const [xmlError, setXmlError] = useState<string | null>(null);

    // PDF Upload State
    const [tenders, setTenders] = useState<TenderListItem[]>([]);
    const [selectedTender, setSelectedTender] = useState<string>("");
    const [isDraggingPdf, setIsDraggingPdf] = useState(false);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loadingTenders, setLoadingTenders] = useState(false);

    // Fetch tenders for dropdown
    useEffect(() => {
        const fetchTenders = async () => {
            setLoadingTenders(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const response = await fetch("/api/v1/tenders", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTenders(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch tenders:", err);
            } finally {
                setLoadingTenders(false);
            }
        };

        if (activeTab === "pdf") {
            fetchTenders();
        }
    }, [activeTab, supabase]);

    // Fetch attachments when tender selected
    useEffect(() => {
        const fetchAttachments = async () => {
            if (!selectedTender) {
                setAttachments([]);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const response = await fetch(`/api/v1/tenders/${selectedTender}/attachments`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAttachments(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch attachments:", err);
            }
        };

        fetchAttachments();
    }, [selectedTender, supabase]);

    // XML Upload handlers
    const handleDragOverXml = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingXml(true);
    }, []);

    const handleDragLeaveXml = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingXml(false);
    }, []);

    const handleDropXml = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingXml(false);

        const files = Array.from(e.dataTransfer.files);
        const xmlFile = files.find((f) => f.name.toLowerCase().endsWith(".xml"));

        if (!xmlFile) {
            toast.error("Bitte nur XML-Dateien hochladen");
            return;
        }

        await uploadXmlFile(xmlFile);
    }, []);

    const handleFileSelectXml = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.name.toLowerCase().endsWith(".xml")) {
                toast.error("Bitte nur XML-Dateien hochladen");
                return;
            }

            await uploadXmlFile(file);
        },
        []
    );

    const uploadXmlFile = async (file: File) => {
        setIsUploadingXml(true);
        setXmlError(null);
        setUploadedTender(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Nicht eingeloggt!");
                router.push("/login");
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/v1/ingest", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload fehlgeschlagen");
            }

            const data = await response.json();
            setUploadedTender(data);
            toast.success("Ausschreibung erfolgreich hochgeladen!");
        } catch (err: any) {
            const errorMessage = err.message || "Upload fehlgeschlagen";
            setXmlError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploadingXml(false);
        }
    };

    // PDF Upload handlers
    const handleDragOverPdf = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPdf(true);
    }, []);

    const handleDragLeavePdf = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPdf(false);
    }, []);

    const handleDropPdf = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPdf(false);

        if (!selectedTender) {
            toast.error("Bitte zuerst einen Tender auswählen");
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            await uploadPdfFile(file);
        }
    }, [selectedTender]);

    const handleFileSelectPdf = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!selectedTender) {
                toast.error("Bitte zuerst einen Tender auswählen");
                return;
            }

            const files = e.target.files;
            if (!files) return;

            for (const file of Array.from(files)) {
                await uploadPdfFile(file);
            }
        },
        [selectedTender]
    );

    const uploadPdfFile = async (file: File) => {
        const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

        if (!allowedExtensions.includes(ext)) {
            toast.error(`${file.name}: Nur PDF, DOC, DOCX, XLS, XLSX erlaubt`);
            return;
        }

        setIsUploadingPdf(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Nicht eingeloggt!");
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`/api/v1/tenders/${selectedTender}/attachments`, {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload fehlgeschlagen");
            }

            const data = await response.json();
            setAttachments((prev) => [data, ...prev]);
            toast.success(`${file.name} hochgeladen!`);
        } catch (err: any) {
            toast.error(err.message || "Upload fehlgeschlagen");
        } finally {
            setIsUploadingPdf(false);
        }
    };

    const deleteAttachment = async (attachmentId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`/api/v1/attachments/${attachmentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (response.ok) {
                setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
                toast.success("Dokument gelöscht");
            }
        } catch (err) {
            toast.error("Löschen fehlgeschlagen");
        }
    };

    const resetXmlUpload = () => {
        setUploadedTender(null);
        setXmlError(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Zurück zum Dashboard</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
                            TA
                        </div>
                        <span className="font-semibold text-slate-800">Tender AI</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Dokumente hochladen
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Laden Sie Ausschreibungen (XML) oder Anhänge (PDF) hoch.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab("xml")}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "xml"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <FileCode2 className="mr-2 inline h-4 w-4" />
                        Neue Ausschreibung (XML)
                    </button>
                    <button
                        onClick={() => setActiveTab("pdf")}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "pdf"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <FileText className="mr-2 inline h-4 w-4" />
                        Anhänge hinzufügen (PDF)
                    </button>
                </div>

                {/* XML Upload Tab */}
                {activeTab === "xml" && (
                    <AnimatePresence mode="wait">
                        {!uploadedTender && !xmlError ? (
                            <motion.div
                                key="dropzone"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    onDragOver={handleDragOverXml}
                                    onDragLeave={handleDragLeaveXml}
                                    onDrop={handleDropXml}
                                    className={`relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${isDraggingXml
                                        ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10"
                                        : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept=".xml"
                                        onChange={handleFileSelectXml}
                                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                        disabled={isUploadingXml}
                                    />

                                    <div className="flex flex-col items-center gap-4">
                                        {isUploadingXml ? (
                                            <>
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-slate-800">
                                                        Wird verarbeitet...
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${isDraggingXml ? "bg-blue-500" : "bg-slate-100"
                                                        }`}
                                                >
                                                    {isDraggingXml ? (
                                                        <Upload className="h-8 w-8 text-white" />
                                                    ) : (
                                                        <FileCode2 className="h-8 w-8 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-slate-800">
                                                        XML-Datei hierher ziehen
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        oder <span className="text-blue-600 underline">Datei auswählen</span>
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : uploadedTender ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg"
                            >
                                <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50 px-6 py-4">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Erfolgreich!</p>
                                        <p className="text-sm text-emerald-600">Ausschreibung hinzugefügt.</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-slate-900">{uploadedTender.title}</h3>

                                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                        {uploadedTender.awarding_authority && (
                                            <div className="flex items-start gap-2">
                                                <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Auftraggeber</p>
                                                    <p className="text-sm font-medium text-slate-700">{uploadedTender.awarding_authority}</p>
                                                </div>
                                            </div>
                                        )}

                                        {uploadedTender.deadline_at && (
                                            <div className="flex items-start gap-2">
                                                <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Frist</p>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {new Date(uploadedTender.deadline_at).toLocaleDateString("de-DE")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(uploadedTender.location_city || uploadedTender.location_zip) && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Standort</p>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {[uploadedTender.location_zip, uploadedTender.location_city].filter(Boolean).join(" ")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                                    <button
                                        onClick={resetXmlUpload}
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Weitere hochladen
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab("pdf");
                                            setSelectedTender(uploadedTender.id);
                                        }}
                                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        <Plus className="mr-1 inline h-4 w-4" />
                                        PDFs hinzufügen
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-lg"
                            >
                                <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <div>
                                        <p className="font-semibold text-red-800">Upload fehlgeschlagen</p>
                                        <p className="text-sm text-red-600">{xmlError}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 px-6 py-4">
                                    <button
                                        onClick={resetXmlUpload}
                                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        Erneut versuchen
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* PDF Upload Tab */}
                {activeTab === "pdf" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Tender Selection */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Ausschreibung auswählen
                            </label>
                            {loadingTenders ? (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Lade Ausschreibungen...
                                </div>
                            ) : (
                                <select
                                    value={selectedTender}
                                    onChange={(e) => setSelectedTender(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">-- Bitte wählen --</option>
                                    {tenders.map((tender) => (
                                        <option key={tender.id} value={tender.id}>
                                            {tender.title}
                                            {tender.awarding_authority && ` (${tender.awarding_authority})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* PDF Dropzone */}
                        {selectedTender && (
                            <>
                                <div
                                    onDragOver={handleDragOverPdf}
                                    onDragLeave={handleDragLeavePdf}
                                    onDrop={handleDropPdf}
                                    className={`relative rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${isDraggingPdf
                                        ? "border-emerald-500 bg-emerald-50/50"
                                        : "border-slate-300 bg-white hover:border-emerald-400"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        multiple
                                        onChange={handleFileSelectPdf}
                                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                        disabled={isUploadingPdf}
                                    />

                                    <div className="flex flex-col items-center gap-3">
                                        {isUploadingPdf ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                <FileText className="h-6 w-6 text-slate-400" />
                                            </div>
                                        )}
                                        <p className="text-center text-sm text-slate-600">
                                            PDF, DOC, DOCX, XLS, XLSX hierher ziehen
                                        </p>
                                    </div>
                                </div>

                                {/* Attachments List */}
                                {attachments.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="border-b border-slate-100 px-6 py-4">
                                            <h3 className="font-semibold text-slate-800">
                                                Hochgeladene Dokumente ({attachments.length})
                                            </h3>
                                        </div>
                                        <ul className="divide-y divide-slate-100">
                                            {attachments.map((att) => (
                                                <li key={att.id} className="flex items-center justify-between px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-slate-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{att.filename}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {formatFileSize(att.file_size)} • {att.file_type.toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteAttachment(att.id)}
                                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </main>

            <Toaster richColors closeButton position="top-right" />
        </div>
    );
}

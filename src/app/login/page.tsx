"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { fetchCompanyStatus } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error("Login fehlgeschlagen: " + error.message);
                return;
            }

            const userId = data.user?.id;
            if (!userId) {
                toast.error("Konnte Benutzer-ID nicht bestimmen.");
                return;
            }

            const { hasCompany, error: companyError } = await fetchCompanyStatus(supabase, userId);
            if (companyError) {
                console.error("Company lookup failed", companyError);
                toast.error("Profilstatus konnte nicht geladen werden. Bitte versuche es erneut.");
                return;
            }

            toast.success("Erfolgreich eingeloggt!");
            router.push(hasCompany ? "/dashboard" : "/onboarding");
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Willkommen zurück
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Melde dich an, um fortzufahren
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="email-address">Email Adresse</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Passwort</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Anmelden...
                                </>
                            ) : (
                                "Anmelden"
                            )}
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <span className="text-slate-600">Noch kein Account? </span>
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Jetzt registrieren
                    </Link>
                </div>
            </div>
        </div>
    );
}

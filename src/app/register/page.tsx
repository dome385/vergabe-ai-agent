"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            toast.error("Registrierung fehlgeschlagen: " + error.message);
            setLoading(false);
        } else {
            toast.success("Account erstellt! Bitte bestätige deine Email.");
            // Optional: Redirect to a "Check your email" page or directly to onboarding if email confirmation is disabled
            router.push("/onboarding");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Account erstellen
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Starte jetzt mit Tender AI
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
                                type="new-password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                                placeholder="••••••••"
                                minLength={6}
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
                                    Registrieren...
                                </>
                            ) : (
                                "Registrieren"
                            )}
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <span className="text-slate-600">Bereits einen Account? </span>
                    <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Hier anmelden
                    </Link>
                </div>
            </div>
        </div>
    );
}

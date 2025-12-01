"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

export default function RegisterPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Konto erstellen
                    </CardTitle>
                    <CardDescription className="text-center">
                        Starten Sie Ihre kostenlose Testphase noch heute
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Vollständiger Name</Label>
                        <Input id="name" placeholder="Max Mustermann" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Passwort</Label>
                        <Input id="password" type="password" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <div className="flex items-start gap-3">
                        <Checkbox id="terms" className="mt-1 shrink-0" />
                        <Label
                            htmlFor="terms"
                            className="flex-1 min-w-0 text-sm font-medium leading-relaxed text-muted-foreground flex-wrap peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Ich stimme den{" "}
                            <Link href="#" className="text-primary hover:underline">
                                Nutzungsbedingungen
                            </Link>{" "}
                            und der{" "}
                            <Link href="#" className="text-primary hover:underline">
                                Datenschutzerklärung
                            </Link>{" "}
                            zu.
                        </Label>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Konto erstellen
                    </Button>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        Bereits ein Konto?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Anmelden
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

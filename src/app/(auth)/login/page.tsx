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
import { Github, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Willkommen zurück
                    </CardTitle>
                    <CardDescription className="text-center">
                        Melden Sie sich an, um auf Ihr Dashboard zuzugreifen
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full">
                            <Github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                        <Button variant="outline" className="w-full">
                            <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4 fill-current">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            Google
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Oder mit Email
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="name@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Passwort</Label>
                        <Input id="password" type="password" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Angemeldet bleiben
                            </Label>
                        </div>
                        <Link
                            href="#"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Passwort vergessen?
                        </Link>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Anmelden
                    </Button>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        Noch kein Konto?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-primary hover:underline"
                        >
                            Registrieren
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

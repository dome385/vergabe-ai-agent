import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const PricingSection = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-navy-950">
            Faire Preise für jede Größe
          </h2>
          <p className="mt-4 text-slate-600">
            Starten Sie kostenlos und zahlen Sie nur, wenn Sie wachsen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basis Plan */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-navy-950">Basis</CardTitle>
              <CardDescription>Für den Einstieg</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-navy-950">Kostenlos</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-600">Opportunity Feed sehen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-600">Tägliche E-Mail Benachrichtigung</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Check className="h-5 w-5" />
                  <span>Keine Detail-Analysen</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Jetzt starten
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-emerald-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              BELIEBT
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-navy-950">Pro</CardTitle>
              <CardDescription>Für Gewinner</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-navy-950">499 €</span>
                <span className="text-slate-500 ml-2">/ Monat</span>
              </div>
              <p className="text-sm text-slate-500">oder 0,5% bei Erfolg</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-600 font-medium">Unbegrenzte Analysen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-600 font-medium">Bewerbungs-Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-600 font-medium">Experten-Hotline</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                14 Tage kostenlos testen
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

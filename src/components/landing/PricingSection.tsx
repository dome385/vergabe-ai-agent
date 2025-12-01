import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const PricingSection = () => {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-50 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy-950 mb-6">
            Faire Preise für jede Größe
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Starten Sie kostenlos und zahlen Sie nur, wenn Sie wachsen. Keine versteckten Kosten.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basis Plan */}
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-bold text-navy-950">Basis</CardTitle>
              <CardDescription className="text-base">Für den Einstieg</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-navy-950">0€</span>
                <span className="text-slate-500">/ Monat</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Opportunity Feed sehen</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Tägliche E-Mail Benachrichtigung</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>Keine Detail-Analysen</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Button variant="outline" className="w-full h-12 text-lg border-slate-300 hover:bg-slate-50 text-navy-950">
                Kostenlos starten
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-emerald-500 shadow-2xl shadow-emerald-500/10 relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
              BELIEBT
            </div>
            <CardHeader className="p-8 relative">
              <CardTitle className="text-2xl font-bold text-navy-950">Pro</CardTitle>
              <CardDescription className="text-base text-emerald-600 font-medium">Für Gewinner</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-navy-950">499€</span>
                <span className="text-slate-500">/ Monat</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">oder 0,5% bei Erfolg</p>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-navy-950 font-medium">Unbegrenzte Analysen</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-navy-950 font-medium">Bewerbungs-Generator</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-navy-950 font-medium">Experten-Hotline</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-navy-950 font-medium">Bevorzugter Support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0 relative">
              <Button className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]">
                14 Tage kostenlos testen
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

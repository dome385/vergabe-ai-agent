"use client"

import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ROICalculator = () => {
  const [revenue, setRevenue] = useState([1000000]);
  const [industry, setIndustry] = useState("bau");

  // Simple calculation logic for demo purposes
  const tendersPerWeek = Math.round((revenue[0] / 1000000) * 3);
  const potentialVolume = Math.round(revenue[0] * 0.45);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <section className="py-32 bg-navy-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white mb-6">
            Was kostet Sie das <span className="text-emerald-400">Nichtstun?</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Berechnen Sie Ihr ungenutztes Potenzial im öffentlichen Sektor.
          </p>
        </div>

        <Card className="max-w-5xl mx-auto bg-slate-900/50 border-slate-800 text-white backdrop-blur-sm shadow-2xl shadow-black/50">
          <CardHeader className="border-b border-slate-800 p-8">
            <CardTitle className="text-xl text-center text-slate-200 font-medium">
              Ihre Unternehmensdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-12">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Jahresumsatz</label>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {formatCurrency(revenue[0])}
                    </div>
                  </div>
                  <Slider
                    value={revenue}
                    onValueChange={setRevenue}
                    min={500000}
                    max={10000000}
                    step={100000}
                    className="py-4 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>500 T€</span>
                    <span>10 Mio €</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Branche</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12 text-lg focus:ring-emerald-500/50">
                      <SelectValue placeholder="Wählen Sie Ihre Branche" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="bau">Bauhauptgewerbe</SelectItem>
                      <SelectItem value="elektro">Elektro & TGA</SelectItem>
                      <SelectItem value="it">IT & Dienstleistung</SelectItem>
                      <SelectItem value="handwerk">Sonstiges Handwerk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-8 bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-inner">
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Verpasste Chancen / Woche</p>
                  <div className="text-5xl font-bold text-white">
                    {tendersPerWeek}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent w-full" />

                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Potenzielles Zusatzvolumen / Jahr</p>
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                    {formatCurrency(potentialVolume)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

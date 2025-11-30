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
    <section className="py-24 bg-navy-950 text-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Was kostet Sie das Nichtstun?
          </h2>
          <p className="mt-4 text-slate-400">
            Berechnen Sie Ihr ungenutztes Potenzial im öffentlichen Sektor.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-center text-slate-200">
              Ihre Unternehmensdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Jahresumsatz</label>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(revenue[0])}
                  </div>
                  <Slider
                    value={revenue}
                    onValueChange={setRevenue}
                    min={500000}
                    max={10000000}
                    step={100000}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Branche</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
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

              <div className="flex flex-col justify-center space-y-6 bg-slate-950/50 p-6 rounded-xl border border-slate-800">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Basierend auf Daten von 2024 verpassen Sie:</p>
                  <div className="text-4xl font-bold text-white mb-2">
                    {tendersPerWeek} <span className="text-lg font-normal text-slate-400">Ausschreibungen / Woche</span>
                  </div>
                </div>
                
                <div className="h-px bg-slate-800 w-full" />

                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Potenzielles Zusatzvolumen:</p>
                  <div className="text-4xl font-bold text-emerald-500">
                    {formatCurrency(potentialVolume)} <span className="text-lg font-normal text-slate-400">/ Jahr</span>
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

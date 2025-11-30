import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const SolutionSection = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto space-y-24">
        
        {/* Feature 1: Matching */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1 text-sm">
              Opportunity Feed
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-navy-950">
              Wir suchen nicht. Wir finden.
            </h2>
            <p className="text-lg text-slate-600">
              Unser Algorithmus kennt Ihre Zertifikate und Referenzen. Er zeigt Ihnen nur Aufträge, die Sie auch gewinnen können.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Match-Score &gt; 90%</span>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white flex items-center justify-center">
            {/* Placeholder for Screenshot */}
            <div className="text-slate-400 font-medium">App Screenshot: Opportunity Feed</div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Feature 2: Compliance */}
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="space-y-6 md:order-2">
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 px-4 py-1 text-sm">
              Compliance Check
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-navy-950">
              Der digitale Vergaberechtler.
            </h2>
            <p className="text-lg text-slate-600">
              Laden Sie die PDF hoch. Unsere KI prüft in 30 Sekunden auf Ausschlusskriterien, fehlende Nachweise und unrealistische Fristen.
            </p>
            <div className="flex items-center gap-2 text-amber-600 font-semibold">
              <Zap className="h-5 w-5" />
              <span>Prüfung in 30 Sekunden</span>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white flex items-center justify-center md:order-1">
            {/* Placeholder for Screenshot */}
            <div className="text-slate-400 font-medium">App Screenshot: Detail View / Ampel</div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
};

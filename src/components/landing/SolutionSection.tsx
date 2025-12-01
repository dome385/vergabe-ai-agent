import React from 'react';
import { CheckCircle2, Zap, Filter, FileCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const SolutionSection = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto space-y-32">

        {/* Feature 1: Matching */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5 text-sm font-medium rounded-full">
              Opportunity Feed
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-navy-950 leading-tight">
              Wir suchen nicht. <br />
              <span className="text-blue-600">Wir finden.</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Unser Algorithmus kennt Ihre Zertifikate und Referenzen. Er zeigt Ihnen nur Aufträge, die Sie auch gewinnen können.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-navy-950">Match-Score &gt; 90%</div>
                  <div className="text-sm text-slate-500">Nur relevante Ausschreibungen</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Filter className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-navy-950">Intelligente Filter</div>
                  <div className="text-sm text-slate-500">Nach Region, Gewerk und Budget</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wireframe Mockup 1 */}
          <div className="relative rounded-2xl bg-slate-100 p-4 shadow-2xl shadow-slate-200 border border-slate-200 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none rounded-2xl" />
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              {/* Fake Header */}
              <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              {/* Fake Content */}
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-emerald-100 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Compliance */}
        <div className="grid md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
          <div className="space-y-8 md:order-2">
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 px-4 py-1.5 text-sm font-medium rounded-full">
              Compliance Check
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-navy-950 leading-tight">
              Der digitale <br />
              <span className="text-amber-500">Vergaberechtler.</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Laden Sie die PDF hoch. Unsere KI prüft in 30 Sekunden auf Ausschlusskriterien, fehlende Nachweise und unrealistische Fristen.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-navy-950">Prüfung in 30 Sekunden</div>
                  <div className="text-sm text-slate-500">Statt 2 Stunden manueller Arbeit</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-navy-950">Automatische Zusammenfassung</div>
                  <div className="text-sm text-slate-500">Die wichtigsten Fakten auf einen Blick</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wireframe Mockup 2 */}
          <div className="relative rounded-2xl bg-slate-100 p-4 shadow-2xl shadow-slate-200 border border-slate-200 -rotate-2 hover:rotate-0 transition-transform duration-500 md:order-1">
            <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/5 to-transparent pointer-events-none rounded-2xl" />
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              {/* Fake Header */}
              <div className="h-12 border-b border-slate-100 flex items-center px-4 justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-8 w-24 bg-emerald-500 rounded-lg" />
              </div>
              {/* Fake Content */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="col-span-2 p-4 rounded-lg bg-red-50 border border-red-100 flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-1/3 bg-red-200 rounded" />
                    <div className="h-3 w-full bg-red-100 rounded" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  <div className="h-8 w-full bg-slate-100 rounded" />
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  <div className="h-8 w-full bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

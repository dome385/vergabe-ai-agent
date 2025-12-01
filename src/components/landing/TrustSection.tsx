import React from 'react';
import { ShieldCheck, Scale, FileSearch } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 mb-2">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Serverstandort Frankfurt</h3>
            <p className="text-slate-600 leading-relaxed">
              Alle Daten bleiben in Deutschland. Wir hosten ausschließlich auf ISO-27001 zertifizierten Servern.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 mb-2">
              <Scale className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Rechtssicherheit</h3>
            <p className="text-slate-600 leading-relaxed">
              Entwickelt mit Fachanwälten für Vergaberecht. Unsere Checklisten sind immer auf dem neuesten Stand.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 mb-2">
              <FileSearch className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Transparenz</h3>
            <p className="text-slate-600 leading-relaxed">
              Keine Blackbox. Sie sehen immer das Original-Dokument und die Fundstelle jeder Information.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { ShieldCheck, Scale, FileSearch } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 bg-blue-100 rounded-full text-blue-700">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Serverstandort Frankfurt</h3>
            <p className="text-slate-600">
              Alle Daten bleiben in Deutschland. Wir hosten ausschließlich auf ISO-27001 zertifizierten Servern.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-700">
              <Scale className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Rechtssicherheit</h3>
            <p className="text-slate-600">
              Entwickelt mit Fachanwälten für Vergaberecht. Unsere Checklisten sind immer auf dem neuesten Stand.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="p-3 bg-amber-100 rounded-full text-amber-700">
              <FileSearch className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-950">Transparenz</h3>
            <p className="text-slate-600">
              Keine Blackbox. Sie sehen immer das Original-Dokument und die Fundstelle jeder Information.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

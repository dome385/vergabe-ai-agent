import React from 'react';
import { TenderCard } from "@/components/dashboard/TenderCard";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from 'lucide-react';

export default function DashboardPage() {
  const tenders = [
    {
      title: "Sanierung Schulturnhalle - Gewerk Elektro",
      matchScore: 94,
      location: "München (12km)",
      budget: "150.000 € (geschätzt)",
      deadline: "Noch 8 Tage",
      reason: "Ausschreibung fordert 'KNX-Systeme', was in Ihrem Profil als Kernkompetenz hinterlegt ist.",
      tags: ["Elektro", "Sanierung", "Öffentlich"]
    },
    {
      title: "Neubau Verwaltungsgebäude - IT-Infrastruktur",
      matchScore: 88,
      location: "Augsburg (45km)",
      budget: "450.000 € (geschätzt)",
      deadline: "Noch 14 Tage",
      reason: "Gute Übereinstimmung mit Ihren Referenzprojekten im Bereich Netzwerktechnik.",
      tags: ["IT", "Netzwerk", "Neubau"]
    },
    {
      title: "Wartungsvertrag Straßenbeleuchtung 2025-2028",
      matchScore: 72,
      location: "Landkreis Dachau (25km)",
      budget: "Unbekannt",
      deadline: "Noch 5 Tage",
      reason: "Regionale Nähe passt, aber geforderte Zertifizierung 'DIN VDE 0100' fehlt im Profil.",
      tags: ["Wartung", "Elektro", "Infrastruktur"]
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Opportunity Feed</h1>
          <p className="text-slate-500">Wir haben heute 3 neue relevante Ausschreibungen für Sie gefunden.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-slate-600 bg-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="text-slate-600 bg-white">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Sortierung
          </Button>
        </div>
      </div>

      {/* Filter Chips (Mock) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium cursor-pointer hover:bg-emerald-200">
          Match &gt; 90%
        </div>
        <div className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-50">
          Region: Bayern
        </div>
        <div className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-50">
          Frist &lt; 7 Tage
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {tenders.map((tender, index) => (
          <TenderCard key={index} {...tender} />
        ))}
      </div>

    </div>
  );
}

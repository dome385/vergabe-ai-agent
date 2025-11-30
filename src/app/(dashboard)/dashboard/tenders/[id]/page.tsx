import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Wand2, Phone, FileText } from 'lucide-react';

export default function TenderDetailPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Sanierung Schulturnhalle - Gewerk Elektro</h1>
          <div className="flex gap-4 text-sm text-slate-500 mt-1">
            <span>Referenz-Nr: 2024-XYZ-123</span>
            <span>•</span>
            <span>Frist: 08.12.2024 (Noch 8 Tage)</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3 py-1">
            Status: Machbar
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Column 1: Source (PDF Viewer Mock) */}
        <Card className="col-span-5 flex flex-col h-full border-slate-200 shadow-sm">
          <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Original-Ausschreibung.pdf
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-slate-100 p-0 overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>PDF Viewer Mockup</p>
                <p className="text-xs mt-2">Hier würde das Original-Dokument angezeigt werden.</p>
              </div>
            </div>
            {/* Highlight Overlay Mock */}
            <div className="absolute top-20 left-10 w-3/4 h-4 bg-yellow-200/50 mix-blend-multiply rounded cursor-pointer hover:bg-yellow-300/50" title="Gefundenes Keyword: KNX-Systeme"></div>
            <div className="absolute top-32 left-10 w-1/2 h-4 bg-red-200/50 mix-blend-multiply rounded cursor-pointer hover:bg-red-300/50" title="Ausschlusskriterium?"></div>
          </CardContent>
        </Card>

        {/* Column 2: Compliance Matrix */}
        <Card className="col-span-4 flex flex-col h-full border-slate-200 shadow-sm">
          <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-medium text-slate-700">Compliance Check</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-auto">
            <div className="divide-y divide-slate-100">
              
              <div className="p-4 flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy-950">Bonitätsnachweis</p>
                  <p className="text-xs text-slate-500">Im Profil vorhanden (Gültig bis 12/2025)</p>
                </div>
              </div>

              <div className="p-4 flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy-950">Referenz "Öffentlicher Bau"</p>
                  <p className="text-xs text-slate-500">3 passende Referenzen gefunden</p>
                </div>
              </div>

              <div className="p-4 flex gap-3 items-start bg-amber-50/50">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy-950">ISO 27001 Zertifikat</p>
                  <p className="text-xs text-slate-500 mb-2">Fehlt in Ihrem Profil.</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                    Jetzt hochladen
                  </Button>
                </div>
              </div>

              <div className="p-4 flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy-950">Mindestumsatz</p>
                  <p className="text-xs text-slate-500">Erfüllt (über 500k €)</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Column 3: Action Bar */}
        <Card className="col-span-3 flex flex-col h-full border-slate-200 shadow-sm bg-slate-50/50">
          <CardHeader className="py-3 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-700">Aktionen</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Aufwand:</span>
                <span className="font-medium text-navy-950">ca. 2 Std.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gewinnchance:</span>
                <span className="font-medium text-emerald-600">Hoch</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-12 text-lg font-semibold group">
                <Wand2 className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Bewerbung generieren
              </Button>
              <p className="text-xs text-center text-slate-400">
                Erstellt Anschreiben, Formulare & Referenzliste
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <Button variant="outline" className="w-full border-slate-300 text-slate-600 hover:bg-white">
                <Phone className="mr-2 h-4 w-4" />
                Experten hinzuziehen (+49€)
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

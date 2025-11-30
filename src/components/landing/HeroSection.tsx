import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden bg-navy-950 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
          <path d="M0 0 L100 100" stroke="white" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Ihr automatischer Zugang zu <br className="hidden sm:inline" />
            <span className="text-emerald-500">öffentlichen Milliarden-Aufträgen.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">
            Schluss mit manueller Suche. Der Vergabe-Agent matcht Ihr Unternehmen proaktiv mit passenden Ausschreibungen und prüft die Machbarkeit in Sekunden. 100% DSGVO-konform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              Kostenlose Potenzial-Analyse starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-slate-300 hover:text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Wie es funktioniert
            </Button>
          </div>

          <div className="pt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-400">Bereits von 500+ deutschen Handwerksbetrieben genutzt.</p>
            <div className="flex gap-6 opacity-50 grayscale">
              {/* Placeholders for logos */}
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-24 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

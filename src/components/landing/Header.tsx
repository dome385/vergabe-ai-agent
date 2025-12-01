import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export const Header = () => {
  return (
    <header
      data-scroll-lock-aware
      className="fixed top-0 left-0 w-full z-50 glass-dark border-b border-white/10 transition-all duration-300"
    >
      <div className="container px-4 md:px-6 mx-auto h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative h-10 w-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-xl">V</span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">Vergabe-Agent</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors relative group">
            Funktionen
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors relative group">
            Preise
             <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="#about" className="hover:text-white transition-colors relative group">
            Über uns
             <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              Login
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-navy-950 hover:bg-emerald-50 font-semibold shadow-lg shadow-white/10 hover:shadow-white/20 transition-all hover:-translate-y-0.5">
              App starten
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

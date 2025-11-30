import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-navy-950/80 backdrop-blur-md border-b border-white/10">
      <div className="container px-4 md:px-6 mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Vergabe-Agent</span>
        </div>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Funktionen</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Preise</Link>
          <Link href="#about" className="hover:text-white transition-colors">Über uns</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:text-emerald-400 hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-navy-950 hover:bg-slate-200 font-semibold">
              App starten
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

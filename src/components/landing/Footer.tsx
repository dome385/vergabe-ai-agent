import React from 'react';
import { Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-white/10 py-12 text-slate-400">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Vergabe-Agent</span>
        </div>

        <div className="flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Impressum</a>
          <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
          <a href="#" className="hover:text-white transition-colors">AGB</a>
        </div>

        <div className="flex items-center gap-2 text-white font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <Phone className="h-4 w-4 text-emerald-400" />
          <span>089 / 123 456 78</span>
        </div>

        <div className="text-xs text-slate-600 md:ml-auto md:order-last">
          &copy; {new Date().getFullYear()} Vergabe-Agent GmbH
        </div>

      </div>
    </footer>
  );
};

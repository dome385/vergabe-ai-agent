import React from 'react';
import { Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Vergabe-Agent GmbH. Alle Rechte vorbehalten.
        </div>

        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-navy-950">Impressum</a>
          <a href="#" className="hover:text-navy-950">Datenschutz</a>
          <a href="#" className="hover:text-navy-950">AGB</a>
        </div>

        <div className="flex items-center gap-2 text-navy-950 font-bold">
          <Phone className="h-4 w-4" />
          <span>089 / 123 456 78</span>
        </div>

      </div>
    </footer>
  );
};

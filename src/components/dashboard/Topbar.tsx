import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center w-96 gap-2">
        <Search className="h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Suche nach Ausschreibungen, CPV-Codes..." 
          className="border-none shadow-none bg-transparent focus-visible:ring-0 pl-0 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-navy-950">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-navy-950">Max Mustermann</div>
            <div className="text-xs text-slate-500">Musterbau GmbH</div>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>MM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

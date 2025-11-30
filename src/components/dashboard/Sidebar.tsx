"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, Bell, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Opportunity Feed", href: "/dashboard" },
    { icon: FileText, label: "Meine Bewerbungen", href: "/dashboard/applications" },
    { icon: Bell, label: "Benachrichtigungen", href: "/dashboard/notifications" },
    { icon: Settings, label: "Einstellungen", href: "/dashboard/settings" },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
          V
        </div>
        <span className="text-lg font-bold text-white tracking-tight">Vergabe-Agent</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </aside>
  );
};

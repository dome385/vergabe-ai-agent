"use client";

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative w-full py-32 lg:py-48 overflow-hidden bg-navy-950 text-white">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Jetzt verfügbar: KI-Potenzialanalyse 2.0
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 pb-2">
              Ihr automatischer Zugang zu <br className="hidden sm:inline" />
              <span className="text-emerald-400">öffentlichen Milliarden-Aufträgen.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl text-slate-300 md:text-2xl leading-relaxed"
          >
            Schluss mit manueller Suche. Der Vergabe-Agent matcht Ihr Unternehmen proaktiv mit passenden Ausschreibungen und prüft die Machbarkeit in Sekunden.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Button
              asChild
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold px-8 py-7 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] transition-all hover:scale-105"
            >
              <Link href="/onboarding" className="flex items-center">
                Kostenlose Analyse starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:text-emerald-400 hover:bg-white/5 px-8 py-7 text-lg rounded-full border border-white/10 backdrop-blur-sm"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Wie es funktioniert
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-16 flex flex-col items-center gap-6"
          >
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Vertraut von 500+ führenden Unternehmen</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Improved Placeholders */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-32 bg-white/20 rounded animate-pulse" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

"use client";

import { cn } from "@/lib/utils";

type ScoreDialProps = {
  value: number;
  compact?: boolean;
  className?: string;
};

export const ScoreDial = ({ value, compact, className }: ScoreDialProps) => {
  const radius = compact ? 22 : 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((value ?? 0) / 100) * circumference;

  return (
    <div
      className={cn("relative", compact ? "h-16 w-16" : "h-20 w-20", className)}
    >
      <svg
        viewBox="0 0 80 80"
        className={cn(
          "text-slate-200",
          compact ? "h-16 w-16 -rotate-90" : "h-20 w-20 -rotate-90"
        )}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold text-slate-800",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {value}%
        </span>
        {!compact && <span className="text-xs text-slate-500">Score</span>}
      </div>
    </div>
  );
};

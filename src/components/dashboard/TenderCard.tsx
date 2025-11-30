import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Clock, Brain, ChevronRight, X } from 'lucide-react';

interface TenderCardProps {
  title: string;
  matchScore: number;
  location: string;
  budget: string;
  deadline: string;
  reason: string;
  tags: string[];
}

const MatchScoreRing = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let colorClass = "text-slate-200";
  if (score >= 90) colorClass = "text-emerald-500";
  else if (score >= 70) colorClass = "text-amber-500";
  else colorClass = "text-slate-400";

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-xl font-bold ${colorClass}`}>{score}%</span>
      </div>
    </div>
  );
};

export const TenderCard = ({ title, matchScore, location, budget, deadline, reason, tags }: TenderCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left: Score */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <MatchScoreRing score={matchScore} />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Match Score</span>
        </div>

        {/* Center: Content */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-xl font-bold text-navy-950 hover:text-blue-600 cursor-pointer transition-colors">
              {title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              <span>{budget}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Clock className="h-4 w-4" />
              <span>{deadline}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
            <Brain className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Match-Grund:</span> {reason}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            Details prüfen
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="flex-1 text-slate-400 hover:text-red-500 hover:bg-red-50">
            <X className="mr-2 h-4 w-4" />
            Verwerfen
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

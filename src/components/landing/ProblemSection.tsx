import React from 'react';
import { Search, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProblemSection = () => {
  const problems = [
    {
      icon: <Search className="h-10 w-10 text-red-500" />,
      title: "Die Nadel im Heuhaufen",
      description: "Täglich erscheinen 5.000 neue Bekanntmachungen auf 300 verschiedenen Portalen. Niemand hat Zeit, das zu lesen."
    },
    {
      icon: <AlertTriangle className="h-10 w-10 text-amber-500" />,
      title: "Die Formfehler-Falle",
      description: "Ein fehlendes Häkchen in Anlage 4B, und Ihre Arbeit war umsonst. Vergaberecht ist gnadenlos."
    },
    {
      icon: <FileText className="h-10 w-10 text-slate-500" />,
      title: "Bürokratie-Wahnsinn",
      description: "80 Seiten PDF lesen, um festzustellen, dass Sie gar nicht teilnehmen dürfen."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy-950">
            Warum Sie 80% der Staatsaufträge verpassen:
          </h2>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, index) => (
            <Card key={index} className="border-none shadow-none bg-transparent text-center">
              <CardHeader className="flex flex-col items-center gap-4 pb-2">
                <div className="p-4 rounded-full bg-slate-50">
                  {problem.icon}
                </div>
                <CardTitle className="text-xl font-bold text-navy-950">
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

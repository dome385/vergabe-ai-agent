import React from 'react';
import { Search, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProblemSection = () => {
  const problems = [
    {
      icon: <Search className="h-8 w-8 text-white" />,
      color: "bg-blue-500",
      title: "Die Nadel im Heuhaufen",
      description: "Täglich erscheinen 5.000 neue Bekanntmachungen auf 300 verschiedenen Portalen. Niemand hat Zeit, das zu lesen."
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-white" />,
      color: "bg-amber-500",
      title: "Die Formfehler-Falle",
      description: "Ein fehlendes Häkchen in Anlage 4B, und Ihre Arbeit war umsonst. Vergaberecht ist gnadenlos."
    },
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      color: "bg-slate-500",
      title: "Bürokratie-Wahnsinn",
      description: "80 Seiten PDF lesen, um festzustellen, dass Sie gar nicht teilnehmen dürfen."
    }
  ];

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy-950 mb-6">
            Warum Sie <span className="text-red-600">80%</span> der Staatsaufträge verpassen
          </h2>
          <p className="text-lg text-slate-600">
            Der öffentliche Sektor ist der größte Auftraggeber Deutschlands. Doch der Prozess ist kaputt.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, index) => (
            <Card key={index} className="border-none shadow-xl shadow-slate-200/50 bg-white hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
              <div className={`h-2 w-full ${problem.color}`} />
              <CardHeader className="flex flex-col items-start gap-6 pb-4 pt-8 px-8">
                <div className={`p-4 rounded-2xl ${problem.color} shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  {problem.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-navy-950">
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-slate-600 leading-relaxed text-lg">
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

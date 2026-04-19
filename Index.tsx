import { Link } from "react-router-dom";
import { ArrowRight, FileSpreadsheet, Sparkles, Calculator, FileDown, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: FileSpreadsheet, title: "Carica Excel o PDF", desc: "Importa il computo metrico in qualsiasi formato. Lo leggiamo noi." },
  { icon: Sparkles, title: "Estrazione AI", desc: "L'intelligenza artificiale riconosce voci, quantità e unità di misura." },
  { icon: Calculator, title: "Margini in tempo reale", desc: "Imposta il margine globale e personalizzalo riga per riga." },
  { icon: FileDown, title: "Esporta in PDF", desc: "Preventivo professionale pronto da inviare al cliente." },
  { icon: ShieldCheck, title: "Listino tuo, tuo soltanto", desc: "I tuoi prezzi salvati nel profilo, sempre disponibili." },
  { icon: Zap, title: "Veloce, davvero", desc: "Da computo a preventivo in meno di 5 minuti." },
];

const Index = () => {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";

  return (
    <div className="min-h-screen bg-hero text-foreground">
      <header className="container flex items-center justify-between py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="default" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow">
              <Link to="/app">Vai all'app</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/auth">Accedi</Link></Button>
              <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow">
                <Link to="/auth?mode=signup">Inizia gratis</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="container py-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Preventivi pronti in minuti, non in giorni
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Da computo metrico a <span className="text-gradient-primary">preventivo professionale</span> in 4 click.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">
            XBuild è lo strumento pensato per imprese edili e artigiani che vogliono smettere di perdere ore con Excel.
            Carica, calcola, esporta. Stop.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow text-base">
              <Link to={ctaTo}>
                Inizia ora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Nessuna carta di credito richiesta</p>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:border-primary/50 hover:shadow-glow">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-8">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} XBuild — Costruito per chi costruisce.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

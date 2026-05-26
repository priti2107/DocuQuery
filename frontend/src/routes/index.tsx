import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BrainCircuit, Briefcase, FileText, Database, Leaf, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({ component: Landing });

const features = [
  { icon: BrainCircuit, title: "Contextual Brain", desc: "Our AI understands the semantic structure of academic papers, not just the keywords." },
  { icon: Briefcase, title: "Career Targets", desc: "Match your research findings with specific job requirements and skill sets." },
  { icon: FileText, title: "Instant Digests", desc: "Get executive summaries of 50-page reports in a matter of seconds." },
  { icon: Database, title: "Data Extraction", desc: "Automatically pull tables and charts into structured datasets for analysis." },
];

const trending = [
  { tag: "FINANCE", title: "Q3 Market Volatility Analysis", meta: "4.2k Queries today", gradient: "from-clay/50 to-gold/40" },
  { tag: "BIOTECH", title: "mRNA Delivery Papers 2024", meta: "1.8k Queries today", gradient: "from-primary/60 to-sage/50" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-semibold text-primary">DocuQuery</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link to="/documents" className="hover:text-foreground">Documents</Link>
            <Link to="/ai-query" className="hover:text-foreground">AI Query</Link>
            <Link to="/careers" className="hover:text-foreground">Careers</Link>
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Quick Search..." className="h-9 w-56 rounded-full bg-muted/50 pl-9" />
            </div>
            <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grain absolute inset-0 opacity-40" />
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-sage/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-20 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary shadow-soft">
              <Sparkles className="h-3 w-3" /> AI-powered document intelligence
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Query any document.{" "}
              <span className="text-gradient-moss">Land your dream role.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              Transform complex PDFs, research papers, and case studies into actionable insights. DocuQuery uses advanced LLMs to help you master any subject in seconds.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/documents">Upload a Document <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to="/careers">Explore Careers</Link>
              </Button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto mt-14 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-sage/10 to-gold/10" />
            <div className="relative grid h-full grid-cols-12 gap-3 p-6">
              <div className="col-span-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-3 rounded-full bg-muted-foreground/15" style={{ width: `${60 + (i % 3) * 15}%` }} />
                ))}
              </div>
              <div className="col-span-9 rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
                <div className="mb-3 h-24 rounded-lg bg-gradient-to-tr from-primary/20 to-transparent" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-2.5 rounded-full bg-muted-foreground/15" style={{ width: `${50 + (i * 8) % 45}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="surface-card p-5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Trending Intelligence</h2>
            <p className="mt-2 text-sm text-muted-foreground">See what other researchers and candidates are analyzing this week. Stay ahead of the industry curve.</p>
            <Link to="/content" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              View All Trending Content <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {trending.map((t) => (
            <motion.div
              key={t.title}
              whileHover={{ y: -4 }}
              className={`surface-card relative aspect-[4/3] overflow-hidden p-5 bg-gradient-to-br ${t.gradient}`}
            >
              <div className="absolute inset-0 bg-grain opacity-30" />
              <div className="relative flex h-full flex-col justify-end">
                <span className="inline-flex w-fit rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-wider text-primary-foreground">{t.tag}</span>
                <h3 className="mt-2 font-serif text-xl font-semibold text-background drop-shadow">{t.title}</h3>
                <p className="text-xs text-background/80">{t.meta}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground shadow-lift">
          <div className="absolute inset-0 bg-grain opacity-10" />
          <div className="relative">
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">Ready to master your documents?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">Join 50,000+ students and professionals who are using AI to accelerate their careers and academic excellence.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary" className="rounded-full px-6 bg-white hover:bg-slate-100 text-slate-900 cursor-pointer">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" className="rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">Book a Demo</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-semibold text-primary">DocuQuery</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Empowering the next generation of professionals with AI-driven document intelligence.</p>
          </div>
          {[
            { h: "Product", items: ["Pricing", "Features", "Integrations", "API"] },
            { h: "Company", items: ["About Us", "Careers", "Blog", "Contact"] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="text-sm font-semibold">{c.h}</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {c.items.map((i) => <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold">Newsletter</h4>
            <div className="mt-3 flex gap-2">
              <Input placeholder="Email address" className="h-9 rounded-full" />
              <Button size="sm" className="h-9 rounded-full px-3">→</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">No spam, only insights.</p>
          </div>
        </div>
        <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          © 2024 DocuQuery Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

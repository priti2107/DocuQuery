import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search as SearchIcon, FileText, Briefcase, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_user/search")({ component: Search });

const tabs = ["All", "Documents", "Internships", "Content"];

const docs = [
  { title: "Q4 Financial Summary.pdf", desc: "Detailed analysis of market trends and growth projections.", tag: "Finance", time: "Modified 2 days ago" },
  { title: "Brand Identity Guidelines", desc: "Typography, spacing, and visual language rules for the brand.", tag: "Design", time: "Modified 1 week ago" },
];

const intern = [
  { title: "AI Research Associate", company: "Neural Systems Lab", loc: "Remote" },
  { title: "UX Design Intern", company: "Product Design Team", loc: "New York, NY" },
  { title: "Frontend Developer", company: "Web Platform Group", loc: "London, UK" },
];

const curated = [
  { icon: BookOpen, title: "Accelerating AI workflows in 2024", meta: "Blog Post • 5 min read" },
  { icon: FileText, title: "Mastering the AI Query Language", meta: "Video Tutorial • 12:40" },
  { icon: Briefcase, title: "Academic Resource Pack", meta: "Collection • 14 files" },
];

function Search() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="surface-card p-8">
        <h1 className="font-serif text-3xl font-semibold flex items-center gap-2"><SearchIcon className="h-6 w-6 text-primary" /> Search everything</h1>
        <div className="relative mt-5">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus placeholder="Type to find documents, internships, or content..." className="h-12 rounded-xl bg-muted/40 pl-11 pr-16 text-base" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((t, i) => (
            <button key={t} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <Section title="Documents">
        <div className="grid gap-3 md:grid-cols-2">
          {docs.map((d, i) => (
            <motion.div key={d.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{d.title}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">{d.desc}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[10px] font-medium text-primary">{d.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{d.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Recent Internships">
        <div className="grid gap-3 md:grid-cols-3">
          {intern.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }} className="surface-card overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-primary/20 via-sage/15 to-gold/15" />
              <div className="p-4">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.company}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{it.loc}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Curated Content">
        <ul className="space-y-2">
          {curated.map((c, i) => (
            <motion.li key={c.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="surface-card flex items-center gap-3 p-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><c.icon className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.meta}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </motion.li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        <a href="#" className="text-xs text-primary hover:underline">View all</a>
      </div>
      {children}
    </section>
  );
}

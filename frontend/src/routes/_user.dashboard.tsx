import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, Zap, Bookmark, Flame, FileType, FileCode, FileEdit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recentDocs, recentActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/_user/dashboard")({ component: Dashboard });

const stats = [
  { icon: FileText, label: "Documents", value: "14", delta: "+2 today", tint: "bg-primary/10 text-primary" },
  { icon: Zap, label: "AI Queries", value: "148", delta: "+12 today", tint: "bg-gold/15 text-gold" },
  { icon: Bookmark, label: "Saved Jobs", value: "9", delta: "No change", tint: "bg-sage/15 text-primary" },
  { icon: Flame, label: "Streak", value: "7", delta: "Keep going!", tint: "bg-clay/15 text-clay" },
];

const iconForType = (t: string) => t === "pdf" ? FileType : t === "doc" ? FileEdit : FileCode;
const tagTint: Record<string, string> = {
  Academic: "bg-sage/20 text-primary",
  Career: "bg-clay/20 text-clay",
  Tech: "bg-gold/20 text-gold",
};

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Good morning, Aryan <span className="inline-block animate-[wave_1.6s_ease-in-out]">👋</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Here is what's happening with your intelligence engine today.</p>
        </div>
        <Button size="lg" className="rounded-full px-6">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="surface-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground">{s.delta}</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
            <div className="font-serif text-3xl font-semibold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Recent documents</h2>
            <Link to="/documents" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {recentDocs.map((d, i) => {
              const Ico = iconForType(d.type);
              return (
                <motion.li
                  key={d.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                      <Ico className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.meta}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagTint[d.tag]}`}>{d.tag}</span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-serif text-xl font-semibold">Recent activity</h2>
          <ol className="mt-5 space-y-4">
            {recentActivity.map((a, i) => (
              <motion.li
                key={a.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex gap-3"
              >
                <div className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </motion.li>
            ))}
          </ol>
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="text-sm font-semibold text-primary">Pro Tip</div>
            <p className="mt-1 text-xs text-muted-foreground">Use the AI Query bar to ask questions directly across multiple documents at once.</p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <motion.div whileHover={{ y: -3 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.04_160)] p-8 text-primary-foreground shadow-lift">
        <div className="absolute inset-0 bg-grain opacity-10" />
        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-serif text-2xl font-semibold">Master your research workflow</h3>
            <p className="mt-2 text-sm text-primary-foreground/80">Connect your Google Drive or Notion to automatically index your library with AI.</p>
            <Button variant="secondary" className="mt-4 rounded-full px-5">Connect Sources <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </div>
          <div className="relative h-40 rounded-xl bg-gradient-to-br from-sage/30 to-gold/20 backdrop-blur" />
        </div>
      </motion.div>
    </div>
  );
}

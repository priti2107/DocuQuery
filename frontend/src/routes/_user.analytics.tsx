import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Activity, FileSearch, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { dauData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_user/analytics")({ component: Analytics });

const kpis = [
  { icon: Clock, label: "Avg. Session Time", value: "12m 42s", delta: "+8%", positive: true },
  { icon: Activity, label: "Job CTR", value: "4.82%", delta: "+1.2%", positive: true },
  { icon: FileSearch, label: "Total Searches", value: "84.2k", delta: "+14%", positive: true },
  { icon: TrendingUp, label: "Bounce Rate", value: "22.4%", delta: "-2%", positive: true },
];

const topDocs = [
  { rank: "01", name: "Q3 Finance Report.pdf", meta: "482 total interactions" },
  { rank: "02", name: "Neural Networks 101.docx", meta: "312 total interactions" },
  { rank: "03", name: "User Interview Summary.txt", meta: "128 total interactions" },
  { rank: "04", name: "Product Roadmap 2024.pdf", meta: "94 total interactions" },
  { rank: "05", name: "Legal Terms v2.docx", meta: "76 total interactions" },
];

function Analytics() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Performance Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time insights across your intellectual repository.</p>
        </div>
        <Button variant="outline" className="rounded-full">Last 30 Days</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 font-serif text-3xl font-semibold">{k.value}</div>
            <div className="mt-1 text-xs text-primary">{k.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">AI queries this week</h2>
            <span className="text-xs text-muted-foreground">May 15 – 21</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={dauData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="current" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} animationDuration={1200} />
                <Line type="monotone" dataKey="prev" stroke="var(--color-clay)" strokeWidth={2} strokeDasharray="4 4" dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Top queries</h2>
            <a href="#" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {topDocs.map((d) => (
              <li key={d.name} className="flex items-center gap-3 py-3">
                <span className="font-serif text-xl font-semibold text-muted-foreground">{d.rank}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.meta}</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface-card flex flex-wrap items-center gap-5 bg-gradient-to-br from-primary/10 to-sage/10 p-6">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="font-serif text-lg font-semibold">AI Recommendation</div>
          <p className="text-sm text-muted-foreground">Your query volume peaked on Thursday. Consider automating repetitive questions through our Knowledge Graph feature.</p>
        </div>
        <Button variant="outline" className="rounded-full">Explore Features</Button>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, FileText, Briefcase, AlertCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { growthData } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({ component: Overview });

const stats = [
  { icon: Users, label: "Total Users", value: "42.5k", delta: "+12%", tint: "bg-primary/10 text-primary" },
  { icon: FileText, label: "Total Posts", value: "1,204", delta: "+5%", tint: "bg-sage/15 text-primary" },
  { icon: Briefcase, label: "Active Listings", value: "892", delta: "+12%", tint: "bg-gold/15 text-gold" },
  { icon: AlertCircle, label: "Pending Approvals", value: "24", delta: "Action req.", tint: "bg-clay/15 text-clay" },
];

const activity = [
  { who: "Google", what: "added 2 new internships", when: "12 minutes ago" },
  { who: "Aryan", what: "approved 5 user reports", when: "45 minutes ago" },
  { who: "Microsoft", what: "joined the platform", when: "2 hours ago" },
  { who: "System", what: "flagged suspicious traffic", when: "4 hours ago" },
  { who: "Sarah", what: "verified 12 new listings", when: "Yesterday" },
];

const distribution = [
  { label: "Engineering", value: 412, pct: 80 },
  { label: "Design", value: 184, pct: 50 },
  { label: "Marketing", value: 128, pct: 38 },
  { label: "Product", value: 96, pct: 28 },
  { label: "Sales", value: 72, pct: 22 },
];

function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time performance metrics and system health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-primary"><TrendingUp className="h-3 w-3" />{s.delta}</span>
            </div>
            <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="font-serif text-3xl font-semibold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Platform Growth</h2>
              <p className="text-xs text-muted-foreground">User acquisition vs. content creation (last 30 days)</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <Legend color="var(--color-primary)" label="Users" />
              <Legend color="var(--color-sage)" label="Posts" />
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={growthData}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="users" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} animationDuration={1400} />
                <Line type="monotone" dataKey="posts" stroke="var(--color-sage)" strokeWidth={2.5} dot={false} animationDuration={1400} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-serif text-xl font-semibold">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {activity.map((a, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 text-sm">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-primary text-xs font-semibold">{a.who[0]}</div>
                <div>
                  <div><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface-card p-6">
        <h2 className="font-serif text-xl font-semibold">Opportunity Distribution</h2>
        <p className="text-xs text-muted-foreground">Active roles across different industry sectors.</p>
        <ul className="mt-5 space-y-3">
          {distribution.map((d, i) => (
            <li key={d.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="text-muted-foreground">{d.value} Roles</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.9, delay: i * 0.08 }} className="h-full rounded-full bg-gradient-to-r from-primary to-sage" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>;
}

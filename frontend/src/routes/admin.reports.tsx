import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flag, CheckCircle2, Clock, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { reports } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

const reasonTint: Record<string, string> = {
  Spam: "bg-destructive/15 text-destructive",
  Misleading: "bg-gold/15 text-gold",
  Harassment: "bg-clay/15 text-clay",
  Other: "bg-muted text-muted-foreground",
};

const stats = [
  { icon: Flag, label: "Pending Flags", value: "42", delta: "+12% vs last week", tint: "bg-clay/15 text-clay" },
  { icon: CheckCircle2, label: "Resolved Today", value: "156", delta: "88% rate", tint: "bg-sage/15 text-primary" },
  { icon: Clock, label: "Response Time", value: "Fast", delta: "4.2h avg", tint: "bg-gold/15 text-gold" },
];

const breakdown = [
  { label: "Spam", pct: 65 },
  { label: "Misleading", pct: 20 },
  { label: "Harassment", pct: 10 },
  { label: "Other", pct: 5 },
];

function AdminReports() {
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Reports & Flags</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage reported content and user behavioral issues across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full"><Filter className="mr-1 h-4 w-4" /> Filters</Button>
          <Button variant="outline" className="rounded-full"><Download className="mr-1 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <Input placeholder="Search reports..." className="h-10 max-w-md rounded-full" />

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}><s.icon className="h-4 w-4" /></div>
              <span className="text-xs text-primary">{s.delta}</span>
            </div>
            <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="font-serif text-3xl font-semibold">{s.value}</div>
          </motion.div>
        ))}
        <div className="surface-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">System Health</div>
          <div className="mt-2 font-serif text-2xl font-semibold text-primary">Optimal</div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1 }} className="h-full bg-primary" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">94%</div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Checkbox /> <span className="text-sm">Select All</span>
            <Button size="sm" variant="ghost" className="rounded-full">Bulk Dismiss</Button>
            <Button size="sm" variant="ghost" className="rounded-full text-destructive">Bulk Remove</Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Showing 1-10 of 42 reports</span>
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Reporter</th>
              <th className="px-5 py-3 text-left">Type & Content</th>
              <th className="px-5 py-3 text-left">Reason</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox />
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">{r.reporter.split(" ").map(w => w[0]).join("")}</div>
                    <div>
                      <div className="font-medium">{r.reporter}</div>
                      <div className="text-xs text-muted-foreground">ID: {r.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-primary">{r.type}</span>
                  <span className="ml-2 text-muted-foreground">{r.content}</span>
                </td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${reasonTint[r.reason]}`}>{r.reason}</span></td>
                <td className="px-5 py-4 text-muted-foreground text-xs">{r.date}</td>
                <td className="px-5 py-4 text-right text-xs">
                  <button className="font-medium text-primary hover:underline">Review</button>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <button className="font-medium text-destructive hover:underline">Remove</button>
                  <button className="ml-2 text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h3 className="font-serif text-lg font-semibold">Reports by Category</h3>
          <ul className="mt-4 space-y-3">
            {breakdown.map((b, i) => (
              <li key={b.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{b.label}</span>
                  <span className="text-muted-foreground">{b.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-clay to-gold" />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-6">
          <h3 className="font-serif text-lg font-semibold">Recent Global Activity</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <li><div className="font-medium">System Auto-Moderation</div><div className="text-xs text-muted-foreground">Flagged user @troll_bot for suspicious login patterns. <span>2 mins ago</span></div></li>
            <li><div className="font-medium">Resolution Log</div><div className="text-xs text-muted-foreground">Admin Alex Rivera removed "Fake Scholarship Ad" report. 14 mins ago</div></li>
            <li><div className="font-medium">New Critical Report</div><div className="text-xs text-muted-foreground">3 identical reports for news item "Crypto News". 45 mins ago</div></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

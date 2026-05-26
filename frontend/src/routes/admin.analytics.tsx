import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, MousePointerClick, Search, TrendingDown, TrendingUp, Sparkles, Download } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { dauData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

const kpis = [
  { icon: Clock, label: "Avg. Session Time", value: "12m 42s", delta: "+8%", up: true },
  { icon: MousePointerClick, label: "Job CTR", value: "4.82%", delta: "+1.2%", up: true },
  { icon: Search, label: "Total Searches", value: "84.2k", delta: "+14%", up: true },
  { icon: TrendingDown, label: "Bounce Rate", value: "22.4%", delta: "-2%", up: true },
];

const opps = [
  { name: "Senior Product Designer", company: "Luma Innovations", views: "12,402", clicks: 892, rate: "7.2%", trend: "14%", up: true },
  { name: "Backend Engineer (Go)", company: "Streamline.io", views: "10,840", clicks: 764, rate: "7.0%", trend: "8%", up: true },
  { name: "Marketing Manager", company: "Vivid Collective", views: "8,201", clicks: 412, rate: "5.0%", trend: "3%", up: false },
  { name: "Data Science Internship", company: "Core AI Research", views: "7,932", clicks: 642, rate: "8.1%", trend: "22%", up: true },
];

const channels = [
  { label: "Direct Search", pct: 45 },
  { label: "Referral Traffic", pct: 32 },
  { label: "Social Media", pct: 23 },
];

function AdminAnalytics() {
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Deep Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Detailed engagement metrics for the last 30 days.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">Last 30 Days</Button>
          <Button variant="outline" className="rounded-full"><Download className="mr-1 h-4 w-4" /> Export report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</span>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 font-serif text-3xl font-semibold">{k.value}</div>
            <div className={`mt-1 inline-flex items-center gap-1 text-xs ${k.up ? "text-primary" : "text-destructive"}`}>
              <TrendingUp className="h-3 w-3" />{k.delta}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Daily Active Users (DAU)</h2>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Current</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-clay" /> Previous</span>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={dauData}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="current" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} animationDuration={1400} />
                <Line type="monotone" dataKey="prev" stroke="var(--color-clay)" strokeWidth={2} strokeDasharray="4 4" dot={false} animationDuration={1400} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-serif text-xl font-semibold">Peak Usage Hours</h2>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 * 5 }).map((_, i) => {
              const intensity = Math.abs(Math.sin(i * 0.7)) * 0.9 + 0.1;
              return <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }} className="aspect-square rounded" style={{ background: `oklch(0.55 0.06 155 / ${intensity})` }} />;
            })}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">12:00 PM - 2:00 PM is the <span className="font-medium text-primary">Highest Engagement</span> window.</div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-serif text-xl font-semibold">Most Viewed Opportunities</h2>
          <a href="#" className="text-xs text-primary hover:underline">View all opportunities</a>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Opportunity</th>
              <th className="px-5 py-3 text-left">Company</th>
              <th className="px-5 py-3 text-right">Views</th>
              <th className="px-5 py-3 text-right">Clicks</th>
              <th className="px-5 py-3 text-right">Conv. Rate</th>
              <th className="px-5 py-3 text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {opps.map((o) => (
              <tr key={o.name} className="border-t border-border hover:bg-muted/30">
                <td className="px-5 py-3 font-medium">{o.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.company}</td>
                <td className="px-5 py-3 text-right">{o.views}</td>
                <td className="px-5 py-3 text-right">{o.clicks}</td>
                <td className="px-5 py-3 text-right">{o.rate}</td>
                <td className="px-5 py-3 text-right"><span className={`inline-flex items-center gap-1 ${o.up ? "text-primary" : "text-destructive"}`}>{o.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{o.trend}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="font-serif text-xl font-semibold">User Acquisition Channels</h2>
          <ul className="mt-5 space-y-4">
            {channels.map((c, i) => (
              <li key={c.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-primary to-sage" />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold"><Sparkles className="h-4 w-4" /> Automated Optimization</div>
          <p className="mt-2 text-sm text-primary-foreground/85">DocuQuery AI has identified a 12% drop in engagement for mobile users on the "Categories" page. Would you like to view the suggested UI improvements?</p>
          <Button variant="secondary" className="mt-4 rounded-full">View AI Suggestions</Button>
        </div>
      </div>
    </div>
  );
}

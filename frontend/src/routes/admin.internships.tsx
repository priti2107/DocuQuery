import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, MapPin, MoreVertical, ChevronLeft, ChevronRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { adminOpportunities } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/internships")({ component: AdminInternships });

const statusTint: Record<string, string> = {
  Active: "bg-sage/20 text-primary",
  Pending: "bg-gold/15 text-gold",
  Expired: "bg-muted text-muted-foreground",
};

const tabs = ["Active", "Expired", "Pending"];

function AdminInternships() {
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Manage Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and manage internship and job postings across the platform.</p>
        </div>
        <Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add New</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search by title or company..." className="h-10 max-w-sm rounded-full" />
        <Button variant="outline" className="rounded-full">All Categories</Button>
        <Button variant="outline" className="rounded-full">All Locations</Button>
        <div className="ml-auto inline-flex rounded-full border border-border p-0.5">
          {tabs.map((t, i) => (
            <button key={t} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left"><Checkbox /></th>
              <th className="px-5 py-3 text-left">Title & Company</th>
              <th className="px-5 py-3 text-left">Date Posted</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminOpportunities.map((o, i) => (
              <motion.tr key={o.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t border-border transition hover:bg-muted/30">
                <td className="px-5 py-4"><Checkbox /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary font-serif text-sm font-semibold text-primary">{o.company[0]}</div>
                    <div>
                      <div className="font-medium">{o.title}</div>
                      <div className="text-xs text-muted-foreground">{o.company}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{o.date}</td>
                <td className="px-5 py-4"><span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{o.location}</span></td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTint[o.status]}`}>{o.status}</span></td>
                <td className="px-5 py-4 text-right"><button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Showing 1-3 of 48 results</span>
          <div className="flex items-center gap-1">
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
            {["1", "2", "3", "...", "16"].map((p, i) => (
              <button key={i} className={`grid h-7 min-w-7 place-items-center rounded-md px-1.5 ${p === "1" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>
            ))}
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="text-xs uppercase tracking-wider text-primary-foreground/70 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Growth</div>
          <div className="mt-1 font-serif text-2xl font-semibold">+24% More Openings</div>
          <p className="mt-2 text-sm text-primary-foreground/80">Engagement is up since last quarter. Consider featuring top-tier remote roles to capitalize on trend shifts.</p>
        </div>
        <SmallCard title="Review Queue" desc="12 pending opportunities require approval." />
        <SmallCard title="Drafts" desc="4 job drafts saved by the recruitment team." />
      </div>
    </div>
  );
}

function SmallCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="surface-card flex flex-col p-6">
      <div className="font-serif text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <ArrowUpRight className="mt-auto h-4 w-4 self-end text-primary" />
    </div>
  );
}

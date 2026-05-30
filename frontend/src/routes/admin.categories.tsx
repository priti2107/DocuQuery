import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { GripVertical, Pencil, Trash2, Plus, Search, X } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

const tags = [
  { name: "Product Design", count: 128 },
  { name: "UI/UX Strategy", count: 45 },
  { name: "Figma Mastery", count: 230, active: true },
  { name: "Motion Design", count: 32 },
  { name: "Typography", count: 89 },
  { name: "Branding", count: 156 },
  { name: "Prototyping", count: 67 },
  { name: "User Research", count: 94 },
  { name: "Web Accessibility", count: 41 },
];

function AdminCategories() {
  const [selected, setSelected] = useState(1);
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Categories & Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage skill keywords and discoverability tags for this vertical.</p>
        </div>
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Global search..." className="h-10 rounded-full pl-9" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px,1fr]">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">Main Categories</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-primary">{categories.length} Total</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="New category name..." className="h-9 rounded-lg" />
            <Button className="h-9 rounded-lg px-4">Add</Button>
          </div>
          <ul className="mt-4 space-y-1.5">
            {categories.map((c, i) => {
              const Ico = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[c.icon];
              const active = i === selected;
              return (
                <motion.li key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <button
                    onClick={() => setSelected(i)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"}`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {Ico && <Ico className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                    <span className={`flex-1 text-left font-medium ${active ? "text-primary" : ""}`}>{c.name}</span>
                    {active && (
                      <>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold">Tags for <span className="text-primary">{categories[selected]?.name}</span></h2>
                <p className="text-xs text-muted-foreground">Manage skill keywords and discoverability tags for this vertical.</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search tags..." className="h-9 w-48 rounded-full pl-9" />
                </div>
                <Button className="h-9 rounded-full"><Plus className="mr-1 h-3.5 w-3.5" /> New Tag</Button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <motion.span
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${t.active ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
                >
                  {t.name}
                  <span className={t.active ? "text-primary/70" : "text-muted-foreground"}>{t.count}</span>
                  {t.active && <X className="h-3 w-3 cursor-pointer text-primary" />}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatTile label="Top Tag" value="Figma Mastery" hint="↑ 14% this month" tint="primary" />
            <StatTile label="Empty Categories" value="2" hint="Requires attention" tint="clay" />
            <StatTile label="Search Coverage" value="94.2%" hint="Optimal performance" tint="sage" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, hint, tint }: { label: string; value: string; hint: string; tint: "primary" | "clay" | "sage" }) {
  const map = { primary: "from-primary/10 to-sage/10", clay: "from-clay/10 to-gold/10", sage: "from-sage/15 to-primary/10" } as const;
  return (
    <div className={`surface-card bg-gradient-to-br ${map[tint]} p-5`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-primary">{hint}</div>
    </div>
  );
}

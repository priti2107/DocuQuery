import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { internships } from "@/lib/mock-data";

export const Route = createFileRoute("/_user/careers")({ component: Careers });

const roleTypes = ["Engineering", "Product Management", "Design & UX", "AI Research"];
const locations = ["Remote", "San Francisco", "New York", "London"];
const durations = ["3 Months (Summer)", "6 Months (Co-op)", "12 Months"];

function Careers() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Career Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Find elite internship opportunities matched to your academic profile.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search internships..." className="h-10 rounded-full bg-card pl-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* Filters */}
        <aside className="surface-card h-fit p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h3>
            <button className="text-xs text-primary hover:underline">Clear all</button>
          </div>
          <FilterGroup title="Role Type" items={roleTypes} />
          <FilterGroup title="Location" items={locations} />
          <FilterGroup title="Duration" items={durations} />
          <Button className="mt-6 w-full rounded-full">Apply Filters</Button>
        </aside>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {internships.map((j, i) => (
            <motion.article
              key={j.role + j.company}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="surface-card group flex flex-col p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-secondary to-sage/30 font-serif text-sm font-semibold text-primary">
                    {j.company[0]}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold leading-tight">{j.role}</h3>
                    <div className="text-xs text-muted-foreground">{j.company}</div>
                  </div>
                </div>
                <button className="text-muted-foreground transition hover:text-clay">
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Tag tone="sage"><MapPin className="mr-1 h-3 w-3" />{j.location}</Tag>
                <Tag tone="gold">{j.pay}</Tag>
                <Tag tone="clay">{j.mode}</Tag>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{j.desc}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Posted {j.posted}</span>
                <Button size="sm" className="rounded-full px-4">Apply Now</Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-5">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id={it} />
            <label htmlFor={it}>{it}</label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tag({ tone, children }: { tone: "sage" | "gold" | "clay"; children: React.ReactNode }) {
  const map = {
    sage: "bg-sage/20 text-primary",
    gold: "bg-gold/15 text-gold",
    clay: "bg-clay/15 text-clay",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[tone]}`}>{children}</span>;
}

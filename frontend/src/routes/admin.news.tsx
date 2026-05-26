import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { newsPosts } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/news")({ component: AdminNews });

function AdminNews() {
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">News & Updates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and publish articles for the DocuQuery ecosystem.</p>
        </div>
        <Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Create Post</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search news, tags, or authors..." className="h-10 rounded-full pl-9" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {newsPosts.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="surface-card flex flex-col overflow-hidden"
          >
            <div className="relative h-40 bg-gradient-to-br from-primary/30 via-sage/20 to-gold/15">
              <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-primary backdrop-blur">{p.tag}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider text-muted-foreground">{p.date}</span>
                <div className="flex items-center gap-2">
                  <span className={p.published ? "text-primary" : "text-muted-foreground"}>{p.published ? "Published" : "Draft"}</span>
                  <Switch defaultChecked={p.published} />
                </div>
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[0, 1].map((j) => <div key={j} className="h-6 w-6 rounded-full border-2 border-card bg-gradient-to-br from-sage to-primary" />)}
                </div>
                <a href="#" className="text-xs text-primary hover:underline">Edit Post →</a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing 4 of 42 articles</span>
        <div className="flex items-center gap-1">
          <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
          {["1", "2", "3", "...", "12"].map((p, i) => (
            <button key={i} className={`grid h-7 min-w-7 place-items-center rounded-md px-1.5 ${p === "1" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>
          ))}
          <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

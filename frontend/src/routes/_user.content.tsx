import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Send, ArrowRight } from "lucide-react";
import { interviews } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_user/content")({ component: Content });

const tabs = ["CEO Interviews", "News", "Learning"];

function Content() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Knowledge Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Insights from leaders and industry updates.</p>
        </div>
        <Button variant="outline" className="rounded-full">Filter results</Button>
      </div>

      <div className="flex gap-6 border-b border-border">
        {tabs.map((t, i) => (
          <button key={t} className={`relative pb-3 text-sm font-medium ${i === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
            {i === 0 && <motion.span layoutId="content-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {interviews.map((it, i) => (
          <motion.li
            key={it.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="surface-card flex gap-5 overflow-hidden p-4"
          >
            <div className="hidden h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-sage/15 to-gold/15 sm:block" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-primary">{it.tag}</span>
                <span className="text-muted-foreground">• {it.time}</span>
              </div>
              <h3 className="mt-2 font-serif text-xl font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{it.desc}</p>
              <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Read Interview <ArrowRight className="h-3.5 w-3.5" /></a>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="text-center">
        <Button variant="outline" className="rounded-full">Load More Interviews</Button>
      </div>

      {/* Floating AI bar */}
      <div className="fixed bottom-6 left-1/2 z-30 w-[min(90%,640px)] -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 shadow-lift backdrop-blur">
          <Input placeholder="Ask AI about these interviews..." className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0" />
          <Button size="icon" className="h-9 w-9 rounded-full"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

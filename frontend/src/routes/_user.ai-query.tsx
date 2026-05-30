import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Paperclip, Send, Share2, MoreVertical, FileText, Zap, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_user/ai-query")({ component: AIQuery });

const history = [
  { title: "ML Research Paper Analysis", sub: "Comparing transformer architectures...", active: true, badge: "Active Now" },
  { title: "Blockchain Scalability", sub: "Synthesizing consensus layer data..." },
  { title: "Neural ODEs Note", sub: "Key takeaways from lecture 4..." },
  { title: "Data Structures Prep", sub: "2 weeks ago" },
];

const fullAnswer = "The primary difference lies in the segment-level recurrence mechanism. While standard Transformers have a fixed context length that limits long-range dependencies, Transformer-XL introduces a hidden state from previous segments to provide a longer-term memory.";

function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

function AIQuery() {
  const typed = useTypewriter(fullAnswer);
  return (
    <div className="mx-auto grid h-[calc(100vh-8rem)] max-w-7xl grid-cols-12 gap-6">
      {/* History */}
      <aside className="col-span-12 space-y-3 md:col-span-4 lg:col-span-3">
        <h2 className="font-serif text-xl font-semibold">Query History</h2>
        {history.map((h, i) => (
          <motion.button
            key={h.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`surface-card w-full p-4 text-left transition ${h.active ? "ring-1 ring-primary/30" : ""}`}
          >
            {h.badge && <span className="mb-1 inline-block rounded-full bg-sage/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{h.badge}</span>}
            <div className="text-sm font-medium">{h.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{h.sub}</div>
          </motion.button>
        ))}
      </aside>

      {/* Chat */}
      <section className="surface-card relative col-span-12 flex flex-col md:col-span-8 lg:col-span-9">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
              <FileText className="h-3.5 w-3.5 text-primary" /> ML_Paper_V2.pdf
            </span>
            <span className="text-muted-foreground">/</span>
            <h3 className="font-serif text-lg font-semibold">Deep Learning Context</h3>
          </div>
          <div className="flex gap-2 text-muted-foreground">
            <button className="hover:text-foreground"><Share2 className="h-4 w-4" /></button>
            <button className="hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {/* AI greeting */}
          <Message from="ai">
            <p>Hello! I've indexed the machine learning research paper you uploaded. I can help you synthesize the methodology, evaluate the results, or explain specific formulas. What would you like to start with?</p>
          </Message>
          {/* User */}
          <Message from="user">
            <p>Can you explain the main difference between the suggested Transformer-XL architecture and the standard vanilla Transformer discussed in section 3.2?</p>
          </Message>
          {/* Typing answer */}
          <Message from="ai">
            <p>{typed}<span className="ml-0.5 inline-block h-4 w-0.5 animate-[blink_1s_steps(1)_infinite] bg-primary align-middle" /></p>
            <a href="#" className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm transition hover:border-primary/30">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Section 3.2: Architecture Comparison</div>
                <div className="text-xs text-muted-foreground">Page 14, Paragraph 3</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </Message>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 focus-within:ring-2 focus-within:ring-primary/30">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Ask anything about the research paper..." className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button size="icon" className="h-8 w-8 rounded-full"><Send className="h-3.5 w-3.5" /></Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">DocuQuery AI can make mistakes. Please verify important citations.</p>
        </div>
      </section>
    </div>
  );
}

function Message({ from, children }: { from: "ai" | "user"; children: React.ReactNode }) {
  if (from === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-sm text-primary-foreground shadow-soft">
          {children}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Zap className="h-4 w-4" />
      </div>
      <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-3 text-sm shadow-soft">
        {children}
      </div>
    </motion.div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X, MoreVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_user/documents")({ component: Documents });

const uploads = [
  { name: "Neural_Networks_Intro.pdf", status: "Processing", progress: 72 },
  { name: "Macroeconomics_Thesis_Final.pdf", meta: "12.4 MB • Uploaded 2 mins ago", status: "Ready" },
  { name: "Research_Notes_Quantum_Computing.docx", meta: "2.1 MB • Uploaded 5 mins ago", status: "Ready" },
];

function Documents() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-semibold">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload academic papers, reports, or textbooks to begin your AI-powered analysis.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-sage/10 to-primary/5 p-12 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-serif text-2xl font-semibold">Drop files here or click to upload</h3>
        <p className="mt-1 text-sm text-muted-foreground">Support for PDF, DOCX, and TXT up to 50MB</p>
        <Button className="mt-5 rounded-full px-6">Browse Files</Button>
      </motion.div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Recent Uploads</h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">3 files total</span>
        </div>

        <ul className="mt-4 space-y-3">
          {uploads.map((u, i) => (
            <motion.li
              key={u.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="surface-card flex items-center gap-4 p-4"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  {u.status === "Processing" ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold">Processing</span>
                  ) : (
                    <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[11px] font-medium text-primary">Ready</span>
                  )}
                </div>
                {u.progress ? (
                  <Progress value={u.progress} className="mt-2 h-1.5" />
                ) : (
                  <div className="mt-0.5 text-xs text-muted-foreground">{u.meta}</div>
                )}
              </div>
              {u.status === "Ready" ? (
                <>
                  <Button size="sm" className="rounded-full">Query →</Button>
                  <button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                </>
              ) : (
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              )}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card md:col-span-2 bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground">
          <h3 className="font-serif text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5" /> Maximize Your Research</h3>
          <p className="mt-2 text-sm text-primary-foreground/80">Unlock advanced AI features, unlimited storage, and high-priority processing for your documents.</p>
          <Button variant="secondary" className="mt-4 rounded-full">Learn More</Button>
        </div>
        <div className="surface-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Storage used</div>
          <div className="mt-2 font-serif text-3xl font-semibold">420<span className="text-base text-muted-foreground"> MB / 2 GB</span></div>
          <Progress value={21} className="mt-4 h-2" />
        </div>
      </div>
    </div>
  );
}

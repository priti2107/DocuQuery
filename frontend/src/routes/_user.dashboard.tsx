import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Zap,
  Bookmark,
  Flame,
  FileType,
  FileCode,
  FileEdit,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentService, DocumentResponse } from "@/services/documentService";
import { AuthService, UserResponse } from "@/services/authService";

export const Route = createFileRoute("/_user/dashboard")({
  component: Dashboard,
});

const iconForType = (t: string) =>
  t.includes("pdf") ? FileType : t.includes("doc") ? FileEdit : FileCode;

function Dashboard() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docResponse, profile] = await Promise.allSettled([
        DocumentService.listDocuments(0, 5),
        AuthService.getProfile(),
      ]);

      if (docResponse.status === "fulfilled") {
        setDocuments(docResponse.value.documents);
        setTotalDocs(docResponse.value.total);
      }
      if (profile.status === "fulfilled") {
        setUser(profile.value);
      }
    } catch {
      // Silently handle — dashboard is best-effort
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.full_name?.split(" ")[0] || "there";

  const stats = [
    {
      icon: FileText,
      label: "Documents",
      value: String(totalDocs),
      delta: isLoading ? "Loading..." : `${totalDocs} uploaded`,
      tint: "bg-primary/10 text-primary",
    },
    {
      icon: Zap,
      label: "AI Queries",
      value: "—",
      delta: "Use AI Query page",
      tint: "bg-gold/15 text-gold",
    },
    {
      icon: Bookmark,
      label: "Saved Jobs",
      value: "—",
      delta: "Coming soon",
      tint: "bg-sage/15 text-primary",
    },
    {
      icon: Flame,
      label: "Doc Limit",
      value: String(user?.documents_limit ?? "—"),
      delta: user?.role === "pro" ? "Pro plan" : "Free plan",
      tint: "bg-clay/15 text-clay",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">
            {greeting()}, {displayName}{" "}
            <span className="inline-block animate-[wave_1.6s_ease-in-out]">
              👋
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what's happening with your intelligence engine today.
          </p>
        </div>
        <Link to="/documents">
          <Button size="lg" className="rounded-full px-6">
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="surface-card p-5"
          >
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground">{s.delta}</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
            <div className="font-serif text-3xl font-semibold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">
              Recent documents
            </h2>
            <Link
              to="/documents"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">
                No documents yet. Upload your first document to get started.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {documents.map((doc, i) => {
                const Ico = iconForType(doc.file_type);
                return (
                  <motion.li
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                        <Ico className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium truncate max-w-xs">
                          {doc.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024 / 1024).toFixed(1)} MB •{" "}
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-primary capitalize">
                      {doc.status}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="surface-card p-6">
          <h2 className="font-serif text-xl font-semibold">Quick Actions</h2>
          <div className="mt-5 space-y-3">
            <Link to="/documents">
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Documents
              </Button>
            </Link>
            <Link to="/ai-query">
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
              >
                <Zap className="mr-2 h-4 w-4" /> Ask AI a Question
              </Button>
            </Link>
            <Link to="/search">
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
              >
                <FileText className="mr-2 h-4 w-4" /> Search Documents
              </Button>
            </Link>
          </div>
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="text-sm font-semibold text-primary">Pro Tip</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the AI Query bar to ask questions directly across multiple
              documents at once.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <motion.div
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.04_160)] p-8 text-primary-foreground shadow-lift"
      >
        <div className="absolute inset-0 bg-grain opacity-10" />
        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-serif text-2xl font-semibold">
              Master your research workflow
            </h3>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Upload documents and use AI to extract insights, answer questions,
              and find relevant information instantly.
            </p>
            <Link to="/documents">
              <Button variant="secondary" className="mt-4 rounded-full px-5">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative h-40 rounded-xl bg-gradient-to-br from-sage/30 to-gold/20 backdrop-blur" />
        </div>
      </motion.div>
    </div>
  );
}

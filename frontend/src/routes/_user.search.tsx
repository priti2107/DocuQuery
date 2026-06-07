import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  FileText,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentService, SearchResultChunk, DocumentResponse } from "@/services/documentService";

export const Route = createFileRoute("/_user/search")({ component: Search });

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultChunk[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [scope, setScope] = useState<"current" | "all">("current");
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await DocumentService.listDocuments(0, 100);
        setDocuments(response.documents);
        if (response.documents.length > 0) {
          setSelectedDocId(response.documents[0].id);
        }
      } catch (err) {
        console.error("Failed to load documents for scoping:", err);
      }
    };
    fetchDocs();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchedQuery(q);

    try {
      const docIdParam = scope === "current" ? (selectedDocId || undefined) : undefined;
      const response = await DocumentService.searchDocuments(q, docIdParam, 10);
      setResults(response.matches);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again.",
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Search Header */}
      <div className="surface-card p-8">
        <h1 className="font-serif text-3xl font-semibold flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-primary" /> Semantic Search
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search across all your uploaded documents using natural language.
          Results are ranked by semantic similarity.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Retrieval Scope:
            </span>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="scope"
                value="current"
                checked={scope === "current"}
                onChange={() => setScope("current")}
                className="accent-primary h-4 w-4 cursor-pointer"
              />
              Current Document
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="scope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className="accent-primary h-4 w-4 cursor-pointer"
              />
              All My Documents
            </label>
          </div>

          {scope === "current" && (
            <div className="flex items-center gap-2 animate-fade-in">
              <label htmlFor="scope-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Document:
              </label>
              <select
                id="scope-select"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer max-w-xs"
              >
                {documents.length === 0 ? (
                  <option value="">No documents found</option>
                ) : (
                  documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or describe what you're looking for..."
            className="h-12 rounded-xl bg-muted/40 pl-11 pr-24 text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-8 px-4 text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Search Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {hasSearched && !isLoading && !error && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">
              {results.length > 0
                ? `${results.length} result${results.length === 1 ? "" : "s"} for "${searchedQuery}"`
                : `No results for "${searchedQuery}"`}
            </h2>
          </div>

          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground"
            >
              <Info className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">
                No matching chunks found. Make sure you have uploaded documents
                and generated embeddings.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {results.map((chunk, i) => (
                <motion.div
                  key={`${chunk.document_id}-${chunk.chunk_index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="surface-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          Document: {chunk.document_id.slice(0, 12)}…
                        </span>
                        <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Chunk {chunk.chunk_index}
                        </span>
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
                          Score: {(chunk.score * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {chunk.chunk_size} chars
                        </span>
                      </div>
                      {/* Content */}
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {chunk.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Searching across your documents...</span>
          </div>
        </div>
      )}

      {/* Initial empty state */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center text-muted-foreground"
        >
          <SearchIcon className="h-10 w-10 mx-auto opacity-30 mb-3" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Search your knowledge base
          </h3>
          <p className="mt-1 text-sm max-w-md mx-auto">
            Type a natural language query above. The AI will find the most
            semantically similar passages from your uploaded documents.
          </p>
        </motion.div>
      )}
    </div>
  );
}

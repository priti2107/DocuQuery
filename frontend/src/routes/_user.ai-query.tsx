import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, FileText, Zap, Loader2, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentService, ChatResponse } from "@/services/documentService";

export const Route = createFileRoute("/_user/ai-query")({ component: AIQuery });

interface ChatMessage {
  id: string;
  from: "user" | "ai";
  content: string;
  response?: ChatResponse;
  error?: string;
  loading?: boolean;
}

function AIQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, from: "user", content: query },
      { id: aiMsgId, from: "ai", content: "", loading: true },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await DocumentService.chatWithDocuments(query, 5);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, content: response.answer, response, loading: false }
            : msg
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get AI response";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, content: "", error: errorMessage, loading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mx-auto grid h-[calc(100vh-8rem)] max-w-7xl grid-cols-12 gap-6">
      {/* History Sidebar */}
      <aside className="col-span-12 space-y-3 md:col-span-4 lg:col-span-3">
        <h2 className="font-serif text-xl font-semibold">Conversations</h2>
        {messages.filter((m) => m.from === "user").length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
            <Info className="mx-auto h-5 w-5 mb-2 opacity-50" />
            No queries yet. Ask a question about your uploaded documents.
          </div>
        ) : (
          messages
            .filter((m) => m.from === "user")
            .map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-card w-full p-4 text-left"
              >
                <div className="text-sm font-medium truncate">{m.content}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Query #{i + 1}
                </div>
              </motion.div>
            ))
        )}
      </aside>

      {/* Chat Area */}
      <section className="surface-card relative col-span-12 flex flex-col md:col-span-8 lg:col-span-9">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg font-semibold">
              Document Intelligence
            </h3>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Ask anything about your documents
              </h3>
              <p className="mt-2 text-sm max-w-md">
                Upload documents in the Knowledge Base, then ask questions here.
                The AI will retrieve relevant passages and generate answers with
                source citations.
              </p>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 focus-within:ring-2 focus-within:ring-primary/30">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            DocuQuery AI can make mistakes. Please verify important citations.
          </p>
        </div>
      </section>
    </div>
  );
}

function Message({ msg }: { msg: ChatMessage }) {
  if (msg.from === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-sm text-primary-foreground shadow-soft">
          <p>{msg.content}</p>
        </div>
      </motion.div>
    );
  }

  // AI message
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Zap className="h-4 w-4" />
      </div>
      <div className="max-w-2xl space-y-3">
        {/* Loading state */}
        {msg.loading && (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-3 text-sm shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching documents and generating answer...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {msg.error && (
          <div className="rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-5 py-3 text-sm shadow-soft">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{msg.error}</span>
            </div>
          </div>
        )}

        {/* Answer */}
        {msg.content && (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-3 text-sm shadow-soft">
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        )}

        {/* Sources and metadata */}
        {msg.response && (
          <div className="space-y-2">
            {/* Model & chunk info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                Model: {msg.response.model}
              </span>
              <span>
                {msg.response.num_chunks} context{" "}
                {msg.response.num_chunks === 1 ? "chunk" : "chunks"} used
              </span>
            </div>

            {/* Source chunks */}
            {msg.response.sources.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sources
                </div>
                {msg.response.sources.map((source, i) => (
                  <div
                    key={`${source.document_id}-${source.chunk_index}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm transition hover:border-primary/30"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        Document: {source.document_id.slice(0, 12)}…
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Chunk {source.chunk_index} • Relevance:{" "}
                        {(source.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  X,
  MoreVertical,
  Sparkles,
  Zap,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export const Route = createFileRoute("/_user/documents")({
  component: Documents,
});

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "extracting" | "chunking" | "ready" | "error";
  error?: string;
}

function Documents() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, UploadProgress>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DocumentService.listDocuments(0, 50);
      setDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${file.name}-${Date.now()}-${i}`;

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/csv",
      ];

      if (!allowedTypes.includes(file.type)) {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: `File type not supported. Use PDF, DOCX, TXT, or CSV.`,
          });
          return newMap;
        });
        continue;
      }

      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: "File exceeds 50MB limit",
          });
          return newMap;
        });
        continue;
      }

      // Start upload
      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        });
        return newMap;
      });

      try {
        // Upload file with progress tracking
        const uploadResult = await DocumentService.uploadDocument(
          file,
          (progress) => {
            setUploadProgress((prev) => {
              const newMap = new Map(prev);
              const current = newMap.get(fileId) || {
                fileId,
                fileName: file.name,
                progress: 0,
                status: "uploading",
              };
              newMap.set(fileId, { ...current, progress });
              return newMap;
            });
          },
        );

        // Update to extracting state
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 100,
            status: "extracting",
          });
          return newMap;
        });

        // Poll for extraction/chunking completion
        await pollForCompletion(fileId, uploadResult.document_id);

        // After upload is complete, trigger embeddings
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 100,
            status: "ready",
          });
          return newMap;
        });

        // Generate embeddings for the document
        try {
          await DocumentService.generateEmbeddings(uploadResult.document_id);
        } catch (embeddingErr) {
          console.warn("Embedding generation delayed:", embeddingErr);
          // Don't fail the upload if embeddings fail - they can be generated later
        }

        // Reload documents list
        await loadDocuments();
      } catch (err) {
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
          return newMap;
        });
      }
    }
  };

  const pollForCompletion = async (
    fileId: string,
    documentId: string,
    maxAttempts = 30,
  ) => {
    // Poll for extraction/chunking to complete (up to 30 seconds)
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await DocumentService.listDocuments(0, 50);
        const doc = response.documents.find((d) => d.id === documentId);

        if (doc && doc.status === "uploaded") {
          // Mark as chunking
          setUploadProgress((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(fileId);
            if (current) {
              newMap.set(fileId, { ...current, status: "chunking" });
            }
            return newMap;
          });
          // Give it a moment and continue polling
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // If we got here, extraction/chunking is complete
        break;
      } catch (err) {
        console.warn("Poll attempt failed:", err);
      }

      // Wait 1 second before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await DocumentService.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document",
      );
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.currentTarget.files!);
    // Reset input so same file can be selected again
    e.currentTarget.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
    handleFileSelect(e.dataTransfer.files);
  };

  // Combine documents with upload progress
  const allItems = [
    ...Array.from(uploadProgress.values()).map((item) => ({
      id: item.fileId,
      name: item.fileName,
      status: item.status,
      progress: item.progress,
      error: item.error,
      isTemp: true,
      meta: undefined as string | undefined,
    })),
    ...documents.map((doc) => ({
      id: doc.id,
      name: doc.filename,
      status: doc.status === "uploaded" ? ("ready" as const) : doc.status,
      progress: 100,
      meta: `${(doc.file_size / 1024 / 1024).toFixed(1)} MB • ${new Date(doc.upload_date).toLocaleDateString()}`,
      isTemp: false,
      error: undefined as string | undefined,
    })),
  ];

  const storageUsedMB =
    documents.reduce((sum, doc) => sum + doc.file_size, 0) / 1024 / 1024;
  const storageQuotaMB = 2048; // 2GB
  const storagePercent = (storageUsedMB / storageQuotaMB) * 100;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      <div>
        <h1 className="font-serif text-4xl font-semibold">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload academic papers, reports, or textbooks to begin your AI-powered
          analysis.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          dragOverRef.current
            ? "border-primary bg-primary/10"
            : "border-primary/30 bg-gradient-to-br from-sage/10 to-primary/5 hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.csv"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload files"
        />
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-serif text-2xl font-semibold">
          Drop files here or click to upload
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Support for PDF, DOCX, and TXT up to 50MB
        </p>
        <Button className="mt-5 rounded-full px-6" onClick={handleBrowseClick}>
          Browse Files
        </Button>
      </motion.div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">
            {isLoading ? "Loading Documents..." : "Your Documents"}
          </h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {allItems.length} {allItems.length === 1 ? "file" : "files"} total
          </span>
        </div>

        {allItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground"
          >
            <FileText className="h-8 w-8 mx-auto opacity-50 mb-2" />
            <p className="text-sm">
              No documents yet. Upload your first document to get started.
            </p>
          </motion.div>
        ) : (
          <ul className="mt-4 space-y-3">
            {allItems.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.06 }}
                className="surface-card flex items-center gap-4 p-4"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="truncate text-sm font-medium">
                      {item.name}
                    </div>
                    {item.status === "uploading" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        Uploading
                      </span>
                    )}
                    {item.status === "extracting" && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-700">
                        Extracting
                      </span>
                    )}
                    {item.status === "chunking" && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                        Chunking
                      </span>
                    )}
                    {item.status === "ready" && (
                      <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Ready
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                        Error
                      </span>
                    )}
                  </div>
                  {item.error ? (
                    <div className="mt-0.5 text-xs text-red-600">
                      {item.error}
                    </div>
                  ) : item.progress !== undefined ? (
                    <Progress value={item.progress} className="mt-2 h-1.5" />
                  ) : item.meta ? (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {item.meta}
                    </div>
                  ) : null}
                </div>
                {item.status === "ready" && !item.isTemp ? (
                  <>
                    <Button size="sm" className="rounded-full" disabled>
                      Query →
                    </Button>
                    <button
                      className="text-muted-foreground hover:text-foreground p-1"
                      onClick={() => handleDeleteDocument(item.id)}
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : item.status === "error" || item.isTemp ? (
                  <button
                    className="text-muted-foreground hover:text-foreground p-1"
                    onClick={() => {
                      if (item.isTemp) {
                        setUploadProgress((prev) => {
                          const newMap = new Map(prev);
                          newMap.delete(item.id);
                          return newMap;
                        });
                      }
                    }}
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card md:col-span-2 bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground">
          <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" /> Query Your Documents
          </h3>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Upload documents and use AI to extract insights, answer questions,
            and find relevant information instantly.
          </p>
          <Button variant="secondary" className="mt-4 rounded-full" disabled>
            Open Chat
          </Button>
        </div>
        <div className="surface-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Storage used
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold">
            {storageUsedMB.toFixed(0)}
            <span className="text-base text-muted-foreground">
              {" "}
              MB / {storageQuotaMB} MB
            </span>
          </div>
          <Progress
            value={Math.min(storagePercent, 100)}
            className="mt-4 h-2"
          />
        </div>
      </div>
    </div>
  );
}

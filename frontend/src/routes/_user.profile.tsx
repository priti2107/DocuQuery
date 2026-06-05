import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Edit3, UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthService, UserResponse } from "@/services/authService";

export const Route = createFileRoute("/_user/profile")({ component: Profile });

function Profile() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await AuthService.getProfile();
      setUser(profile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl py-12">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">
              Failed to load profile
            </h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={loadProfile}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse first/last name from full_name
  const nameParts = (user?.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="surface-card flex flex-wrap items-center gap-5 p-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sage to-primary grid place-items-center text-primary-foreground font-serif text-2xl font-bold">
            {firstName.charAt(0).toUpperCase()}
            {lastName.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <Edit3 className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-semibold">
            {user?.full_name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "pro" ? "Pro" : "Free"} Plan • Document limit:{" "}
            {user?.documents_limit ?? 10}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${user?.is_active ? "bg-sage/20 text-primary" : "bg-red-100 text-red-700"}`}
          >
            {user?.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card space-y-5 p-6 lg:col-span-2">
          <h2 className="font-serif text-xl font-semibold">
            Personal Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First Name" value={firstName} />
            <Field label="Last Name" value={lastName} />
            <Field label="Email Address" value={user?.email || ""} />
            <Field label="Role" value={user?.role || "free"} />
          </div>
          <div>
            <Label className="text-sm font-medium">Biography</Label>
            <Textarea
              defaultValue=""
              placeholder="Tell us about yourself..."
              className="mt-1.5 min-h-24"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-6">
            <h2 className="font-serif text-xl font-semibold">Account Details</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Document Limit</span>
                <span className="font-medium">{user?.documents_limit}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </li>
            </ul>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-serif text-xl font-semibold">Resume</h2>
            <div className="mt-4 grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
              <UploadCloud className="h-8 w-8 text-primary" />
              <div className="mt-2 text-sm font-medium">
                Click or drag resume here
              </div>
              <div className="text-xs text-muted-foreground">
                PDF, DOCX (Max 5MB)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost">Discard Changes</Button>
        <Button className="rounded-full px-6">Save Changes</Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input defaultValue={value} className="mt-1.5" />
    </div>
  );
}

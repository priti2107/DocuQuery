import React, { useState } from "react";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { Leaf, User, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";

export function SignupPage() {
  const router = useRouter();
  
  // Get search params for redirects after successful sign up
  const search = useSearch({ strict: false }) as { redirect?: string };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email regex validation
  const isEmailValid = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email) {
      setError("Email address is required.");
      return;
    }
    if (!isEmailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.signup(name, email, password);
      
      toast.success("Account created successfully!", {
        description: "Please sign in with your credentials.",
      });
      
      // Navigate to login page
      await router.navigate({
        to: "/login",
        search: { redirect: search.redirect },
      });
    } catch (err: any) {
      setError(err.message || "Email address already registered.");
      toast.error("Registration failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-300 group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              DocuQuery
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start querying your documents with AI today
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-soft p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-slide-up">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="John Doe"
                  className="pl-10 h-11 rounded-lg border-border bg-muted/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-card"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  className="pl-10 h-11 rounded-lg border-border bg-muted/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-card"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="•••••••• (min 8 characters)"
                  className="pl-10 pr-10 h-11 rounded-lg border-border bg-muted/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-lg border-border bg-muted/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-card"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={search}
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}


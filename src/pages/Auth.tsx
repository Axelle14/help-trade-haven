import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Repeat2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${next}`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Check your email if confirmation is required.");
        navigate(next);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(next);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + next,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin + next,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Apple sign-in failed";
      toast.error(msg);
      setAppleLoading(false);
    }
  };

  const handleMicrosoft = async () => {
    setMicrosoftLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("microsoft", {
        redirect_uri: window.location.origin + next,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Microsoft sign-in failed";
      toast.error(msg);
      setMicrosoftLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email above first, then tap 'Forgot password'.");
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent — check your email.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md bg-card rounded-3xl p-8 shadow-float border border-foreground/5">
        <Link to="/" className="block">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mx-auto mb-6">
            <Repeat2 className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </Link>
        <h1 className="font-display font-bold text-2xl text-center mb-2">
          {mode === "signup" ? "Join Service Swap" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "Start trading skills today" : "Sign in to your account"}
        </p>

        <Button
          type="button" variant="outline" size="lg"
          className="w-full rounded-xl gap-2.5 mb-4"
          onClick={handleGoogle} disabled={googleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </Button>

        <Button
          type="button" variant="outline" size="lg"
          className="w-full rounded-xl gap-2.5 mb-4 bg-foreground text-background hover:bg-foreground/90 hover:text-background border-foreground"
          onClick={handleApple} disabled={appleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {appleLoading ? "Redirecting…" : "Continue with Apple"}
        </Button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-foreground/10" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-2 text-muted-foreground">or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Lopez" className="rounded-xl h-11" maxLength={60} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="rounded-xl h-11" maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "signin" && (
                <button type="button" onClick={handleForgotPassword} disabled={resetting}
                  className="text-xs text-primary hover:underline">
                  {resetting ? "Sending…" : "Forgot password?"}
                </button>
              )}
            </div>
            <Input id="password" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters" className="rounded-xl h-11" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-sm text-muted-foreground hover:text-foreground mt-6 transition-smooth"
        >
          {mode === "signup" ? (
            <>Already have an account? <span className="text-primary font-semibold">Sign in</span></>
          ) : (
            <>New here? <span className="text-primary font-semibold">Create an account</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Auth;

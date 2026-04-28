import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery token in the URL hash and exchanges it for a session.
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setReady(true);
    } else {
      // If a session exists (already exchanged), allow update too.
      supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    }
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate("/communities");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-card rounded-3xl p-8 shadow-float border border-foreground/5">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mx-auto mb-6">
          <KeyRound className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-bold text-2xl text-center mb-2">Set a new password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {ready ? "Choose something memorable." : "Open the reset link from your email to continue."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">Confirm</Label>
            <Input id="pw2" type="password" required minLength={8} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} className="rounded-xl h-11" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !ready}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

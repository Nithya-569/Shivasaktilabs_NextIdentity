import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + "/profile",
      },
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Error sending link", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Link sent!", description: "Check your email for your login link." });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-2">
            <span className="text-primary-foreground font-bold text-xl">NI</span>
          </div>
          <CardTitle className="text-2xl">Welcome to NextIdentity</CardTitle>
          <CardDescription className="text-base">
            {sent
              ? `We sent a login link to ${email}`
              : "Sign in or create your account with your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Mail size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the link in your email to sign in. You can close this tab.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
                {submitting ? "Sending link..." : "Continue with Email"}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base"
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: window.location.origin + "/profile",
                    },
                  });
                  if (error) {
                    setSubmitting(false);
                    toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
                  <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
                </svg>
                Continue with Google
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                New here? We'll create your account automatically. Returning? You'll be signed right in. ✨
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

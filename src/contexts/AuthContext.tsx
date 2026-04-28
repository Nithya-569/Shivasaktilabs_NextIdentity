import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Upsert profile row — single atomic call, no select-then-insert race condition
async function ensureProfileExists(userId: string) {
  try {
    await supabase
      .from("profiles")
      .upsert(
        { user_id: userId },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
  } catch {
    // Non-fatal — pages handle missing profile gracefully
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingResolved = useRef(false);

  const resolveLoading = (s: Session | null) => {
    setSession(s);
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        resolveLoading(newSession);
        if (newSession?.user) {
          ensureProfileExists(newSession.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      resolveLoading(existingSession);
      if (existingSession?.user) {
        ensureProfileExists(existingSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
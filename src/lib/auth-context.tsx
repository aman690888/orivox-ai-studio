import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { ensureProfile } from "./database/profiles";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const initSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth session error:", error.message);
        throw error;
      }
      
      if (session?.user) {
        await ensureProfile(session.user);
        setRole(session.user.app_metadata?.role || "user");
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (err) {
      setSession(null);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.debug(`Auth event triggered: ${event}`);
      
      if ((event as string) === "SIGNED_OUT" || (event as string) === "USER_DELETED") {
        setSession(null);
        setUser(null);
        setRole(null);
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        console.debug("Token successfully refreshed");
      }

      if (currentSession?.user) {
        try {
          await ensureProfile(currentSession.user);
          setRole(currentSession.user.app_metadata?.role || "user");
        } catch (error) {
          console.error("Failed to ensure profile on auth change", error);
        }
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initSession]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error", error);
      toast.error("Failed to sign out");
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error("Session refresh failed", error);
      toast.error("Your session has expired. Please log in again.");
      await signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

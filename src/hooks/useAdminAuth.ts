import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
}

async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.role;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    role: null,
    isAdmin: false,
    isLoading: true,
  });

  const resolveSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({ user: null, session: null, role: null, isAdmin: false, isLoading: false });
      return;
    }
    const role = await fetchUserRole(session.user.id);
    setState({
      user: session.user,
      session,
      role,
      isAdmin: role === "admin",
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveSession(session);
    });

    return () => subscription.unsubscribe();
  }, [resolveSession]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return { ...state, signIn, signOut };
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "./supabase";

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // If Supabase is not configured, allow local development mode
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;

      if (!currentSession) {
        router.replace("/signin");
      } else {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, changedSession) => {
        if (!isMounted) return;

        if (!changedSession) {
          setSession(null);
          setUser(null);
          router.replace("/signin");
        } else {
          setSession(changedSession);
          setUser(changedSession.user);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, session, isLoading };
}

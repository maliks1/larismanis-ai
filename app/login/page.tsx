"use client";

import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

// ssr: false ensures this is only rendered on the client,
// so AuthUI can safely access window.location without hydration issues.
const AuthUI = dynamic(() => import("./AuthUI"), { ssr: false });

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Check current session first
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        router.push("/dashboard");
        router.refresh();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // Only redirect if session exists AND event is relevant (not SIGNED_OUT)
      if (session && event !== "SIGNED_OUT") {
        router.push("/dashboard");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="no-scrollbar w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/95 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            🛒 LarisManis AI
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Masuk untuk mengelola keuangan UMKM Anda
          </p>
        </div>

        <AuthUI />
      </div>
    </div>
  );
}

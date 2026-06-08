"use client";

import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ssr: false ensures this is only rendered on the client,
// so AuthUI can safely access window.location without hydration issues.
const AuthUI = dynamic(() => import("./AuthUI"), { ssr: false });

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/80">
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
    </main>
  );
}

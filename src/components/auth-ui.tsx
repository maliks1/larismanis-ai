"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getBrowserSupabaseClient } from "@/lib/supabase";

export function AuthUI() {
  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 text-amber-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Supabase Belum Dikonfigurasi
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Silakan lengkapi{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            dan{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            di <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/80">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Masuk ke LarisManis AI
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gunakan akun Anda untuk mengakses fitur lengkap
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "github"]}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Kata Sandi",
                email_input_placeholder: "nama@email.com",
                password_input_placeholder: "Masukkan kata sandi",
                button_label: "Masuk",
                loading_button_label: "Sedang masuk...",
                social_provider_text: "Masuk dengan {{provider}}",
                link_text: "Sudah punya akun? Masuk",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Buat Kata Sandi",
                email_input_placeholder: "nama@email.com",
                password_input_placeholder: "Buat kata sandi yang kuat",
                button_label: "Daftar",
                loading_button_label: "Sedang membuat akun...",
                social_provider_text: "Daftar dengan {{provider}}",
                link_text: "Belum punya akun? Daftar",
                confirmation_text: "Periksa email Anda untuk tautan konfirmasi",
              },
              magic_link: {
                email_input_placeholder: "nama@email.com",
                button_label: "Kirim Tautan",
                loading_button_label: "Mengirim tautan...",
                link_text: "Kirim saya tautan masuk aja",
                confirmation_text: "Periksa email Anda untuk tautan ajaib",
              },
              forgotten_password: {
                email_label: "Email",
                password_label: "Kata Sandi Baru",
                email_input_placeholder: "nama@email.com",
                button_label: "Kirim Instruksi Reset",
                loading_button_label: "Mengirim...",
                link_text: "Lupa kata sandi?",
                confirmation_text: "Periksa email Anda untuk tautan reset",
              },
              update_password: {
                password_label: "Kata Sandi Baru",
                password_input_placeholder: "Masukkan kata sandi baru",
                button_label: "Perbarui Kata Sandi",
                loading_button_label: "Memperbarui...",
                confirmation_text: "Kata sandi berhasil diperbarui!",
              },
              verify_otp: {
                email_input_placeholder: "Masukkan kode",
                phone_input_placeholder: "Masukkan kode",
                button_label: "Verifikasi",
                loading_button_label: "Memverifikasi...",
              },
            },
          }}
          theme="default"
        />
      </div>
    </div>
  );
}

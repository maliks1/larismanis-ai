'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'

// This component is always rendered client-side (loaded via dynamic with ssr: false),
// so window.location is always available here.
export default function AuthUI() {
  const supabase = createClient()
  const origin = window.location.origin

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="light"
      providers={[]}
      redirectTo={`${origin}/auth/callback`}
      localization={{
        variables: {
          sign_in: {
            email_label: 'Email',
            password_label: 'Password',
            button_label: 'Masuk',
            loading_button_label: 'Sedang masuk...',
            link_text: 'Sudah punya akun? Masuk',
          },
          sign_up: {
            email_label: 'Email',
            password_label: 'Buat Password',
            button_label: 'Daftar',
            loading_button_label: 'Sedang mendaftar...',
            link_text: 'Belum punya akun? Daftar',
          },
        },
      }}
    />
  )
}

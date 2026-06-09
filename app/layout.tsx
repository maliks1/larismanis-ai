// Force dynamic rendering to ensure middleware auth checks are always fresh
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LarisManis AI - Asisten Keuangan Suara & Pemasaran Visual UMKM",
  description:
    "Asisten keuangan suara dan generator pemasaran visual untuk UMKM Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
      (function() {
        function getTheme() {
          const stored = localStorage.getItem('theme');
          if (stored === 'dark' || stored === 'light') {
            return stored;
          }
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        const theme = getTheme();
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })()
    `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,#f1f5f9_0%,#f8fafc_50%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,#151b2d_0%,#0b0f19_60%,#080b13_100%)] text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

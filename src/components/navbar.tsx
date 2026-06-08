"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import {
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Database,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const supabase = getBrowserSupabaseClient();

  const links = [
    { href: "/", label: "Dashboard Keuangan", icon: LayoutDashboard },
    { href: "/riwayat", label: "Riwayat Transaksi", icon: FileText },
    { href: "/budget", label: "Budget & Target", icon: Target },
    { href: "/analisis", label: "Analisis Likuiditas", icon: TrendingUp },
    { href: "/marketing", label: "Visual Pemasaran", icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 dark:border-slate-800/50 dark:bg-slate-950/75 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                LarisManis{" "}
                <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/55 dark:hover:text-slate-250"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Supabase Status Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                supabase
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
              title={
                supabase
                  ? "Supabase Terkoneksi"
                  : "Supabase Belum Dikonfigurasi"
              }
            >
              <Database className="h-3 w-3" />
              <span className="hidden md:inline">
                {supabase ? "Terkoneksi" : "Offline Mode"}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation links */}
      <div className="flex sm:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 px-4 py-2 gap-2 overflow-x-auto scrollbar-none justify-start">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

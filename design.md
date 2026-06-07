# LarisManis AI — Design System & Source of Truth

> **Versi Dokumen:** 1.0.0  
> **Terakhir Diperbarui:** 2026-06-07  
> **Framework:** Next.js 16 + Tailwind CSS v4

Dokumen ini adalah satu-satunya sumber kebenaran (Single Source of Truth) untuk semua keputusan desain dan styling pada proyek LarisManis AI. Semua AI future yang membuat halaman baru **WAJIB** mengikuti aturan di bawah ini tanpa kecuali.

---

## 1. Prinsip Desain & Tema (Design Principles & Theme)

### Kesan Visual
Website ini memiliki kesan visual: **Clean, Modern, Minimalis, Korporat ringan dengan sentuhan Friendly**.

### Karakteristik Utama
- **Gaya:** Minimal dengan aksen gradient halus dan efek glassmorphism ringan
- **Suasana:** Profesional namun approachable untuk UMKM Indonesia
- **Mode:** Dark mode support dengan tema yang konsisten
- **Transisi:** Smooth transition 300ms untuk perubahan warna dan state
- **Aksen:** Indigo sebagai brand color utama dengan sentuhan emerald (success) dan amber (warning)

### Theme Variables (CSS Custom Properties)

```css
/* Light Mode */
--background: #f8fafc;       /* Slate 50 - Page background */
--foreground: #0f172a;       /* Slate 900 - Primary text */
--card: #ffffff;             /* White cards */
--card-foreground: #0f172a;  /* Slate 900 */
--primary: #4f46e5;           /* Indigo 600 */
--primary-foreground: #ffffff;
--secondary: #f1f5f9;        /* Slate 100 */
--secondary-foreground: #0f172a;
--muted: #f8fafc;            /* Slate 50 */
--muted-foreground: #64748b; /* Slate 500 */
--accent: #f1f5f9;           /* Slate 100 */
--accent-foreground: #0f172a;
--destructive: #ef4444;      /* Red 500 */
--destructive-foreground: #ffffff;
--border: #e2e8f0;           /* Slate 200 */
--input: #e2e8f0;            /* Slate 200 */
--ring: #6366f1;             /* Indigo 500 */

/* Dark Mode */
--background: #0b0f19;        /* Deep Charcoal Blue */
--foreground: #f8fafc;        /* Slate 50 */
--card: #151b2d;              /* Slightly lighter deep charcoal-blue */
--card-foreground: #f8fafc;
--primary: #6366f1;          /* Indigo 500 (lighter for dark bg) */
--primary-foreground: #ffffff;
--secondary: #1e293b;         /* Slate 800 */
--secondary-foreground: #f8fafc;
--muted: #1e293b;            /* Slate 800 */
--muted-foreground: #94a3b8; /* Slate 400 */
--accent: #1e293b;           /* Slate 800 */
--accent-foreground: #f8fafc;
--destructive: #f87171;      /* Red 400 */
--destructive-foreground: #ffffff;
--border: #1e293b;           /* Slate 800 */
--input: #1e293b;
--ring: #818cf8;             /* Indigo 400 */

/* Border Radius Scale */
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 0.75rem;  /* 12px */
--radius-lg: 1rem;     /* 16px */
```

---

## 2. Palet Warna (Color Palette)

### Tabel Warna Lengkap

| Nama             | Light Mode      | Dark Mode       | Fungsi                              |
|------------------|-----------------|-----------------|-------------------------------------|
| **Primary**      | `#4f46e5`       | `#6366f1`       | Brand, CTA buttons, active states   |
| **Primary Hover**| `#4338ca`       | `#4f46e5`       | Hover state untuk primary           |
| **Background**   | `#f8fafc`       | `#0b0f19`       | Page background                     |
| **Card**         | `#ffffff`       | `#151b2d`       | Card/container background           |
| **Foreground**   | `#0f172a`       | `#f8fafc`       | Primary text                        |
| **Secondary**    | `#f1f5f9`       | `#1e293b`       | Secondary surfaces                  |
| **Muted**        | `#f8fafc`       | `#1e293b`       | Muted backgrounds                   |
| **Muted Foreground** | `#64748b`   | `#94a3b8`       | Secondary text, labels              |
| **Border**        | `#e2e8f0`       | `#1e293b`       | Card/input borders                  |
| **Input**        | `#e2e8f0`       | `#1e293b`       | Form input backgrounds              |
| **Ring**         | `#6366f1`       | `#818cf8`       | Focus ring color                    |
| **Accent**       | `#f1f5f9`       | `#1e293b`       | Accent highlights                   |

### Status Colors

| Status      | Light Mode Background | Light Mode Text   | Dark Mode Background | Dark Mode Text  |
|-------------|-----------------------|-------------------|----------------------|-----------------|
| **Success** | `#ecfdf5` (#d1fae5)** | `#047857` (Emerald 700) | `#064e3b`/40 | `#34d399` |
| **Warning** | `#fffbeb`             | `#b45309` (Amber 700) | `#78350f`/40 | `#fbbf24` |
| **Error**   | `#fef2f2`             | `#b91c1c` (Red 700) | `#7f1d1d`/40 | `#f87171` |
| **Info**    | `#eff6ff`             | `#1d4ed8` (Blue 700) | `#1e3a5f`/40 | `#60a5fa` |

### Special Colors

| Nama              | Value      | Usage                              |
|-------------------|------------|------------------------------------|
| Selection BG      | `rgba(99, 102, 241, 0.28)` | Text selection highlight |
| Overlay White     | `white/75`, `white/60`, `white/40` | Glassmorphism effects |
| Overlay Dark      | `slate-950/75`, `slate-950/95` | Dark mode overlays |

---

## 3. Tipografi (Typography)

### Font Family

| Role    | Font                    | Variable          | Fallback               |
|---------|-------------------------|-------------------|------------------------|
| Primary | Geist Sans              | `--font-geist-sans` | Arial, Helvetica, sans-serif |
| Mono    | Geist Mono              | `--font-geist-mono` | monospace              |

**Implementation:**
```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Font Scale

| Element          | Size           | Weight    | Line Height   | Tailwind Class       |
|------------------|----------------|-----------|---------------|----------------------|
| **H1**           | 3rem (48px)    | 800 (Extra Bold) | tight (1.25) | `text-5xl font-extrabold tracking-tight` |
| **H2**           | 2rem (32px)    | 700 (Bold) | tight (1.25) | `text-3xl sm:text-4xl font-bold tracking-tight` |
| **H3**           | 1.5rem (24px)  | 700 (Bold) | tight (1.25) | `text-2xl font-bold` |
| **H4**           | 1.25rem (20px) | 700 (Bold) | tight (1.25) | `text-xl font-bold` |
| **Body Large**   | 1.125rem (18px)| 400 (Regular) | relaxed (1.625) | `text-lg leading-relaxed` |
| **Body**         | 1rem (16px)    | 400 (Regular) | relaxed (1.625) | `text-base leading-relaxed` |
| **Body Small**   | 0.875rem (14px)| 400 (Regular) | relaxed (1.625) | `text-sm leading-relaxed` |
| **XS**           | 0.75rem (12px) | 500 (Medium) | normal (1.5) | `text-xs` |
| **Label/Tag**    | 0.75rem (12px) | 600 (Semibold) | normal (1.5) | `text-xs font-semibold` |
| **Button**       | 0.875rem (14px)| 600 (Semibold) | normal (1.5) | `text-sm font-semibold` |
| **Caption**      | 0.75rem (12px) | 400 (Regular) | normal (1.5) | `text-xs` |
| **Uppercase Label** | 0.75rem (12px) | 700 (Bold) | normal (1.5) | `text-xs font-bold uppercase tracking-[0.2em]` |

### Font Weight Reference

| Weight    | Value | Tailwind Class   | Usage                    |
|-----------|-------|------------------|--------------------------|
| Extrabold | 800   | `font-extrabold` | H1, metric values        |
| Bold      | 700   | `font-bold`      | H2, H3, H4, section titles |
| Semibold  | 600   | `font-semibold`  | Button text, labels, nav links |
| Medium    | 500   | `font-medium`     | Tags, badges, captions   |
| Regular   | 400   | `font-normal`    | Body text                |

---

## 4. Sistem Spasi & Layout (Spacing & Layout System)

### Spacing Scale (Tailwind Default)

| Token | Value | Common Usage                    |
|-------|-------|---------------------------------|
| `1`   | 4px   | Tight gaps, icon margins        |
| `2`   | 8px   | Small gaps                      |
| `3`   | 12px  | Icon-to-text, compact padding   |
| `4`   | 16px  | Standard padding, gaps          |
| `5`   | 20px  | Card internal padding (sm)      |
| `6`   | 24px  | Section gaps, card padding      |
| `8`   | 32px  | Large section gaps              |
| `10`  | 40px  | Hero spacing                    |
| `12`  | 48px  | Major section separation        |

### Layout Rules

#### Container
- **Max Width:** `80rem` (1280px) — `max-w-7xl`
- **Padding X:** `1rem` (16px) mobile, `1.5rem` (24px) sm, `2rem` (32px) lg
- **Class:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`

#### Section Spacing
- **Vertical Gap between sections:** `gap-6` (24px)
- **Card internal padding:** `p-5` to `p-6` (20px to 24px)
- **Grid gaps:** `gap-4` (16px) for tight grids, `gap-6` (24px) for standard

### Responsive Breakpoints

| Breakpoint | Prefix | Min Width | Typical Layout Changes                    |
|------------|--------|-----------|-------------------------------------------|
| Mobile     | (default) | 0px     | Single column, stacked layout             |
| `sm`       | `sm:`   | 640px    | 2-column grids start, larger text         |
| `md`       | `md:`   | 768px    | 2-column layouts, side-by-side cards            |
| `lg`       | `lg:`   | 1024px   | 3-column grids, expanded navigation            |
| `xl`       | `xl:`   | 1280px   | Full desktop experience                        |

### Grid System

| Grid Type      | Classes                    | Description                          |
|----------------|----------------------------|--------------------------------------|
| 2 Columns      | `grid-cols-1 sm:grid-cols-2` | Mobile stacks, tablet+ 2-col       |
| 3 Columns      | `sm:grid-cols-2 lg:grid-cols-3` | Compact 3-col for highlights    |
| 4 Columns      | `grid-cols-2 lg:grid-cols-4` | Detail grids, financial metrics     |
| Asymmetric     | `lg:grid-cols-[1.3fr_0.7fr]` | Dashboard main + sidebar layout |

---

## 5. Komponen UI Standar (Standard UI Components)

### 5.1 Buttons

#### Primary Button
```tsx
// CTA Button - Main actions
className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 
  text-sm font-semibold text-white shadow-lg shadow-indigo-200 
  dark:shadow-none hover:bg-indigo-500 transition duration-300 hover:scale-102 cursor-pointer"
```

| Property    | Value                                   |
|-------------|-----------------------------------------|
| Background  | `bg-indigo-600` → `hover:bg-indigo-500` |
| Text        | `text-white`, `text-sm font-semibold`   |
| Padding     | `px-6 py-3.5`                           |
| Border      | `rounded-2xl`                           |
| Shadow      | `shadow-lg shadow-indigo-200`           |
| Transition  | `duration-300`, `hover:scale-102`      |
| Icon Gap    | `gap-2`                                 |

#### Secondary Button
```tsx
className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 
  dark:border-slate-800 bg-white dark:bg-slate-900 px-5 
  text-sm font-semibold text-slate-700 dark:text-slate-350 
  hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300 hover:scale-102 cursor-pointer"
```

| Property    | Value                                              |
|-------------|----------------------------------------------------|
| Background  | `bg-white dark:bg-slate-900`                      |
| Border      | `border border-slate-200 dark:border-slate-800`    |
| Text        | `text-slate-700 dark:text-slate-350`               |
| Padding     | `h-12 px-5`                                       |
| Border      | `rounded-xl`                                      |

#### Ghost Button
```tsx
className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
  // Active: bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300
  // Default: text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/55 dark:hover:text-slate-250"
```

#### Icon Button (Square)
```tsx
className="flex h-10 w-10 items-center justify-center rounded-xl 
  border border-slate-200 bg-white text-slate-600 
  hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 
  dark:hover:bg-slate-850 transition cursor-pointer"
```

| Property    | Value                                              |
|-------------|----------------------------------------------------|
| Size        | `h-10 w-10` (40x40px)                             |
| Border      | `rounded-xl`                                       |
| Background  | `bg-white dark:bg-slate-900`                      |

#### Danger/Record Button (Special)
```tsx
// Recording active state
className="bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20"
```

---

### 5.2 Form Inputs

#### Textarea
```tsx
className="min-h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-800 
  bg-slate-50 dark:bg-slate-950/40 px-4 py-4 
  text-base leading-relaxed text-slate-900 dark:text-white 
  placeholder-slate-400 outline-none transition duration-300 
  focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10"
```

| Property      | Value                                                  |
|--------------|--------------------------------------------------------|
| Min Height   | `min-h-48` (192px)                                     |
| Background   | `bg-slate-50 dark:bg-slate-950/40`                     |
| Border       | `border-slate-200 dark:border-slate-800`               |
| Padding      | `px-4 py-4`                                            |
| Focus Border | `focus:border-indigo-500`                              |
| Focus Ring   | `focus:ring-4 focus:ring-indigo-500/10`               |
| Border Radius| `rounded-2xl`                                          |

#### Select (Native)
Styling follows same pattern as textarea with `rounded-xl`.

#### Checkbox & Radio
```tsx
// Styled with Tailwind form packages or custom CSS
// Use indigo-500/indigo-600 for checked state
```

---

### 5.3 Cards & Containers

#### Standard Card
```tsx
className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 
  bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300"
```

| Property      | Value                                                  |
|--------------|--------------------------------------------------------|
| Border        | `border border-slate-200/50 dark:border-slate-800/50`   |
| Background    | `bg-white dark:bg-slate-900`                           |
| Padding       | `p-6` (24px)                                           |
| Border Radius | `rounded-3xl`                                          |
| Shadow        | `shadow-sm`                                            |

#### Glassmorphism Card (Hero/Special)
```tsx
className="relative overflow-hidden rounded-3xl border border-slate-200/50 
  bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/40 p-6 sm:p-8 
  shadow-sm backdrop-blur-md transition-colors duration-300"
```

#### Metric Card (Dashboard)
```tsx
className="rounded-2xl border border-slate-250/50 dark:border-slate-800 
  bg-slate-50/50 dark:bg-slate-950/40 p-5 transition-colors duration-300"
```

#### Alert/Status Card
```tsx
// Success
className="rounded-2xl border border-emerald-200 dark:border-emerald-950 
  bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-350"

// Warning
className="rounded-2xl border border-amber-200 dark:border-amber-950 
  bg-amber-50/30 dark:bg-amber-950/10 text-amber-900 dark:text-amber-300"

// Error
className="rounded-2xl border border-red-200/50 bg-red-50/40 
  dark:border-red-950/50 dark:bg-red-950/10 p-4 
  text-xs sm:text-sm text-red-900 dark:text-red-400"
```

#### Inline Info Box
```tsx
className="rounded-xl bg-slate-100 dark:bg-slate-950/60 
  border border-slate-200/50 dark:border-slate-800/40 px-4 py-3 
  text-xs sm:text-sm text-slate-600 dark:text-slate-400"
```

#### Dashed/Empty State Card
```tsx
className="rounded-2xl border border-dashed border-slate-200 
  dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 p-5 text-center"
```

---

### 5.4 Navigation & Footer

#### Navbar (Sticky)
```tsx
<nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 
  bg-white/75 dark:border-slate-800/50 dark:bg-slate-950/75 
  backdrop-blur-md transition-colors duration-300">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between gap-4">
      {/* Logo, Nav Links, Controls */}
    </div>
  </div>
  {/* Mobile Nav */}
</nav>
```

| Property    | Value                                              |
|-------------|----------------------------------------------------|
| Position    | `sticky top-0 z-50`                                |
| Height      | `h-16` (64px)                                      |
| Background  | `bg-white/75 dark:bg-slate-950/75` + `backdrop-blur-md` |
| Border      | `border-b border-slate-200/50 dark:border-slate-800/50` |

#### Nav Links (Desktop)
```tsx
className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
  // Active: bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300
  // Default: text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/55 dark:hover:text-slate-250"
```

#### Nav Links (Mobile)
```tsx
className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition
  // Same active/default logic but smaller padding
```

#### Status Badge (Inline)
```tsx
className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 
  text-xs font-semibold 
  // Connected: bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300
  // Offline: bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
```

#### Footer (If needed)
- Height: `h-16` (matches navbar)
- Same container padding rules
- Border top instead of bottom

---

### 5.5 Badges & Tags

#### Category Badge
```tsx
className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase
  // Income: bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400
  // Expense: bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
```

#### Section Label (Uppercase)
```tsx
className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
```

---

## 6. Aturan Penulisan Kode (Coding & Styling Conventions)

### 6.1 Tailwind CSS Usage

**WAJIB gunakan Tailwind CSS utility classes** untuk semua styling. Jangan gunakan inline styles kecuali untuk nilai dinamis.

#### Class Ordering Convention
```tsx
// Urutan: Layout → Spacing → Typography → Colors → Effects → State
<element className="flex items-center gap-4 p-6 text-sm font-semibold bg-white rounded-xl shadow-sm hover:bg-slate-50" />
```

#### Responsive Class Pattern
```tsx
// Mobile-first: mulai dari base, tambahkan breakpoint di atas
className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Padding pattern:
className="px-4 py-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
```

#### Dark Mode Classes
```tsx
// Selalu gunakan pattern: light dark:dark
className="text-slate-900 dark:text-white bg-white dark:bg-slate-900"

// Untuk opacity overlay di dark mode:
className="bg-white/75 dark:bg-slate-950/75"
```

### 6.2 Component Patterns

#### Page Container
```tsx
<main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
  {/* Content sections */}
</main>
```

#### Section Wrapper
```tsx
<section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
  {/* Main content + Sidebar */}
</section>
```

#### Card with Header
```tsx
<div className="rounded-3xl border border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-900 p-6 shadow-sm transition-colors duration-300">
  <div className="mb-6 flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
      {/* Icon */}
    </div>
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Title</h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Subtitle</p>
    </div>
  </div>
  {/* Card content */}
</div>
```

#### Icon Container (Card Icon)
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-xl 
  bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400">
  <Icon className="h-5 w-5" />
</div>
```

### 6.3 CSS Variables Usage

Untuk warna yang tidak tersedia di Tailwind, gunakan CSS variables dari `globals.css`:

```tsx
// Box shadow dengan primary color
className="shadow-lg shadow-indigo-200 dark:shadow-none"

// Border dengan opacity
className="border-slate-200/50 dark:border-slate-800/50"

// Overlay backgrounds
className="bg-white/75 dark:bg-slate-950/75"
```

### 6.4 Animation & Transition

```tsx
// Standard transition (semua interactive elements)
className="transition duration-300"

// Hover scale (buttons)
className="hover:scale-102"

// Pulse animation (recording/active states)
className="animate-pulse"

// Spin animation (loading)
className="animate-spin"

// Ping animation (notification dots)
className="animate-ping"
```

### 6.5 Accessibility

```tsx
// Always include aria-labels for icon buttons
<button aria-label="Toggle theme">

// Focus visible states
className="focus:outline-none focus:ring-4 focus:ring-indigo-500/10"

// Disabled states
className="disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
```

---

## 7. Instruksi Khusus untuk AI Masa Depan (Prompting Guide)

### MANDATORY COMPLIANCE

**PERHATIKAN: Semua AI yang membuat atau memodifikasi halaman di proyek ini WAJIB 100% mengikuti aturan di bawah ini:**

1. **WARNA:** Gunakan persis warna yang sudah ditentukan di Section 2. Jangan menggunakan warna di luar palette yang sudah ada. Jika butuh warna baru, TANYA DULU sebelum mengimplementasikan.

2. **SPASI:** Patuhi spacing scale di Section 4. Jangan inventif dengan nilai random seperti `p-7` atau `gap-5.5`. Gunakan nilai yang sudah ada di Tailwind default scale.

3. **KOMPONEN:** Untuk setiap komponen baru, ikutkan pattern yang sudah distandarkan di Section 5. Jangan ubah border-radius, shadow, atau padding yang sudah ditentukan.

4. **DARK MODE:** SEMUA komponen HARUS mendukung dark mode dengan pattern `light dark:dark`. Tidak ada komponen yang hanya punya light mode.

5. **FONT:** Hanya gunakan Geist Sans dan Geist Mono dari Next.js font system. Jangan mengimport font lain.

6. **TRANSISI:** Gunakan `transition duration-300` untuk semua perubahan state. Jangan pakai `duration-150` atau `duration-500`.

7. **CONTAINER:** Semua halaman HARUS dibungkus dengan `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.

**Jika ragu dengan implementasi styling, selalu rujuk ke file `app/globals.css` dan komponen yang sudah ada di `src/components/` sebagai referensi. KONSISTENSI adalah kunci.**

---

*End of Design System Document*
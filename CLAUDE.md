@AGENTS.md

# CLAUDE.md - Project Context for LarisManis AI

## 📌 Project Overview

**LarisManis AI** is a voice-first financial assistant and visual marketing generator for Indonesian MSMEs (UMKM).

- **Core Value:** Record transactions via voice ("pemasukan 3 goceng") parsed by AI into structured financial data.
- **Key Features:** Voice Ledger, Real-time Financial Health Dashboard (Liquidity Ratios, Margin Analysis), Budget Management, Transaction History with PDF Export, and AI-powered Marketing Copy Generation from product photos.
- **Target Users:** Indonesian MSME owners, freelancers, and small business owners.

## 🏗️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.2.7 |
| UI Library | React | 19.2.7 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.3.0 |
| Database/Auth/Storage | Supabase | @supabase/ssr 0.10.3, @supabase/supabase-js 2.108.0 |
| AI Engine | Google Gemini | @ai-sdk/google 3.0.80, ai 6.0.197 |
| Validation | Zod | 4.4.3 |
| Visualization | Recharts | 3.8.1 |
| PDF Export | jspdf | 4.2.1 |
| Icons | lucide-react | 1.17.0 |
| Date Utils | date-fns | 4.1.0 |

## ⚠️ Important Constraints

- Use **Server Components** by default. Only use `"use client"` for interactive UI (voice recording, forms, auth UI).
- Use **Server Actions** (`src/actions/`) for database mutations.
- Always use **TypeScript interfaces** from `src/types/database.types.ts`.
- For styling, prefer **Tailwind utility classes**. Avoid inline styles.

## 📂 Directory Structure

```
app/
├── page.tsx                      # Landing/Home page
├── layout.tsx                    # Root layout
├── globals.css                   # Global styles
├── api/
│   ├── transcribe/route.ts       # Audio → Text (Gemini)
│   ├── parse-ledger/route.ts     # Text → Structured JSON (Gemini)
│   └── generate-copy/route.ts    # Image → Marketing Copy (Gemini Vision)
├── auth/
│   ├── page.tsx                  # Auth page wrapper
│   └── callback/route.ts         # Supabase auth callback
├── login/
│   ├── page.tsx                  # Login page
│   └── AuthUI.tsx                # Login UI component
├── dashboard/page.tsx            # Main dashboard
├── landing/page.tsx              # Landing page
├── analisis/page.tsx             # Financial analysis page
├── riwayat/page.tsx             # Transaction history + PDF export
├── marketing/page.tsx           # Marketing copy generator
└── budget/page.tsx              # Budget management

src/
├── components/
│   ├── auth-ui.tsx               # Supabase Auth UI (client)
│   ├── navbar.tsx                # Navigation bar
│   ├── theme-provider.tsx        # Theme provider
│   ├── voice-ledger.tsx          # Voice input component
│   ├── dashboard-stats.tsx       # Financial metrics dashboard
│   ├── transaction-history.tsx    # Transaction list component
│   ├── category-visualization.tsx # Category charts
│   ├── budget-target.tsx         # Budget targets component
│   └── home-dashboard.tsx        # Home dashboard component
├── actions/
│   └── budget-actions.ts         # Budget CRUD operations
├── lib/
│   ├── supabase.ts               # Supabase clients (server + browser singleton)
│   ├── financial-metrics.ts      # Ratio calculations (Current Ratio, Net Profit Margin)
│   └── export-pdf.ts             # PDF export utility
└── types/
    └── database.types.ts         # Supabase schema types (transactions, budgets)

supabase/
└── migrations/
    └── 001_create_budgets_table.sql # Budget table migration with RLS policies
```

## 🔄 Core Data Flows

### 1. Voice Ledger (Transaction Input)
1. User records audio → `app/api/transcribe` (Gemini Audio-to-Text)
2. Text → `app/api/parse-ledger` (Gemini Text-to-Structured JSON)
3. Insert to `transactions` table in Supabase

**Key Logic:** Parser handles Indonesian slang ("goceng" = 5000, "cepek" = 100, "ceban" = 1000, "gocap" = 50000, "50 rebu" = 50000).

**Files:** `src/components/voice-ledger.tsx`, `app/api/transcribe/route.ts`, `app/api/parse-ledger/route.ts`.

### 2. Real-time Financial Dashboard
1. Transaction inserted → Supabase Realtime
2. `dashboard-stats.tsx` re-renders
3. `src/lib/financial-metrics.ts` calculates:
   - **Current Ratio:** Current Assets / Short-term Liabilities
   - **Net Profit Margin:** (Income - Expenses) / Income

**Files:** `src/components/dashboard-stats.tsx`, `src/lib/financial-metrics.ts`, `app/analisis/page.tsx`.

### 3. Marketing Copy Generator
1. User uploads image → Upload to Supabase Storage (`marketing-assets` bucket)
2. Gemini Vision analyzes image → Generates Caption, Hashtags, Product Name, Angle

**Files:** `app/marketing/page.tsx`, `app/api/generate-copy/route.ts`.

### 4. Budget Management
1. User sets budget targets per category
2. Server Actions (`src/actions/budget-actions.ts`) handle CRUD
3. RLS policies enforce user isolation

**Files:** `app/budget/page.tsx`, `src/actions/budget-actions.ts`, `supabase/migrations/001_create_budgets_table.sql`.

### 5. PDF Export
1. User views transaction history
2. Click "Export PDF" → `src/lib/export-pdf.ts` generates jspdf

**Files:** `app/riwayat/page.tsx`, `src/lib/export-pdf.ts`.

## 🗄️ Database Schema

### `transactions` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (from Supabase Auth) |
| tipe_transaksi | "pemasukan" \| "pengeluaran" | Transaction type |
| nominal | number | Amount in IDR |
| kategori | string | Category |
| deskripsi | string | Description |
| tingkat_urgensi | "rendah" \| "sedang" \| "tinggi" | Urgency level |
| kelompok_keuangan | enum | Financial group |
| created_at | timestamp | Creation time |

### `budgets` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK to auth.users) |
| kategori | TEXT | Category |
| tipe_transaksi | TEXT | "pemasukan" or "pengeluaran" |
| target_nominal | NUMERIC | Target amount |
| periode_bulan | TEXT | Period (YYYY-MM format) |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update |

**RLS Policies:** Users can only access their own data.

## 🔐 Authentication

- **Provider:** Supabase Auth with Google and GitHub OAuth
- **Implementation:** `@supabase/auth-ui-react` + `@supabase/ssr`
- **Client:** `getBrowserSupabaseClient()` singleton for client components
- **Server:** `createSupabaseServerClient()` for server components/actions
- **Callback:** `app/auth/callback/route.ts` handles auth redirect

## ⚙️ Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash  # optional, defaults to gemini-2.5-flash

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=marketing-assets  # optional
```

## 🛠️ Development Guidelines

1. **Context First:** Always check `CLAUDE.md` and `src/types/database.types.ts` before modifying code.
2. **Selective Reading:** Do NOT read the entire codebase. Only read files relevant to the specific task.
3. **Error Handling:** Wrap AI API calls in try-catch blocks. Return user-friendly error messages in Indonesian.
4. **Language:** UI and comments in **Indonesian** for target users. Code variables/comments in English.
5. **Server vs Client:** Default to Server Components. Add `"use client"` only when needed for interactivity.

## 🚧 Known Issues & TODOs

- [ ] **iOS Support:** MediaRecorder API has limited support on iOS Safari.
- [ ] **Error Boundaries:** No global error boundary implemented.
- [ ] **Testing:** No automated tests yet. Consider adding `__tests__/` for complex logic.

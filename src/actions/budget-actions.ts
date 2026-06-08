"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];
type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

export interface BudgetResult {
  success: boolean;
  data?: BudgetRow;
  error?: string;
}

/**
 * Server Action to save (insert or update) a budget
 */
export async function saveBudget(
  payload: Omit<BudgetInsert, "id" | "created_at" | "updated_at">,
  budgetId?: string
): Promise<BudgetResult> {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return {
        success: false,
        error: "Konfigurasi Supabase tidak ditemukan. Pastikan environment variables sudah diset.",
      };
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Anda belum login. Silakan login terlebih dahulu.",
      };
    }

    let result;

    if (budgetId) {
      // Update existing budget - JANGAN sertakan user_id di payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id: _, ...updatePayload } = payload;
      const dataToUpdate = {
        ...updatePayload,
        updated_at: new Date().toISOString(),
      };

      result = await supabase
        .from("budgets")
        .update(dataToUpdate as BudgetUpdate)
        .eq("id", budgetId)
        .eq("user_id", user.id) // Ensure user can only update their own
        .select()
        .single();
    } else {
      // Insert new budget - WAJIB sertakan user_id
      const dataToInsert = {
        ...payload,
        user_id: user.id,
      };

      result = await supabase
        .from("budgets")
        .insert(dataToInsert)
        .select()
        .single();
    }

    if (result.error) {
      console.error("Supabase error:", result.error);

      // Handle specific error codes
      if (result.error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'budgets' belum dibuat. Silakan jalankan migration SQL di Supabase Dashboard.",
        };
      }

      if (result.error.code === "42501") {
        return {
          success: false,
          error: "Anda tidak memiliki akses untuk operasi ini. Pastikan RLS policy sudah dikonfigurasi dengan benar.",
        };
      }

      return {
        success: false,
        error: `Gagal menyimpan budget: ${result.error.message}`,
      };
    }

    return {
      success: true,
      data: result.data as BudgetRow,
    };
  } catch (error) {
    console.error("Unexpected error in saveBudget:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
    };
  }
}

/**
 * Server Action to delete a budget
 */
export async function deleteBudget(budgetId: string): Promise<BudgetResult> {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return {
        success: false,
        error: "Konfigurasi Supabase tidak ditemukan.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Anda belum login.",
      };
    }

    const result = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id); // Ensure user can only delete their own

    if (result.error) {
      console.error("Supabase delete error:", result.error);

      if (result.error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'budgets' belum dibuat.",
        };
      }

      return {
        success: false,
        error: `Gagal menghapus budget: ${result.error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in deleteBudget:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga.",
    };
  }
}

/**
 * Server Action to fetch budgets for current user
 */
export async function getBudgets(): Promise<{
  success: boolean;
  data?: BudgetRow[];
  error?: string;
}> {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return {
        success: false,
        error: "Konfigurasi Supabase tidak ditemukan.",
      };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Anda belum login.",
      };
    }

    const result = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (result.error) {
      console.error("Supabase fetch error:", result.error);

      if (result.error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'budgets' belum dibuat.",
        };
      }

      return {
        success: false,
        error: `Gagal mengambil data budget: ${result.error.message}`,
      };
    }

    return {
      success: true,
      data: result.data as BudgetRow[],
    };
  } catch (error) {
    console.error("Unexpected error in getBudgets:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga.",
    };
  }
}

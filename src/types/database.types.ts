export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          tipe_transaksi: "pemasukan" | "pengeluaran";
          nominal: number;
          kategori: string;
          deskripsi: string;
          tingkat_urgensi: "rendah" | "sedang" | "tinggi";
          kelompok_keuangan:
            | "aset_lancar"
            | "kewajiban_jangka_pendek"
            | "pendapatan"
            | "beban_operasional";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          tipe_transaksi: "pemasukan" | "pengeluaran";
          nominal: number;
          kategori: string;
          deskripsi: string;
          tingkat_urgensi: "rendah" | "sedang" | "tinggi";
          kelompok_keuangan:
            | "aset_lancar"
            | "kewajiban_jangka_pendek"
            | "pendapatan"
            | "beban_operasional";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
    };
  };
};

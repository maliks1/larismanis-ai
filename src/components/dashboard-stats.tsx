type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-300">{hint}</p>
    </article>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-3">
      <MetricCard
        label="Current Ratio"
        value="--"
        hint="Akan dihitung dari aset lancar dan kewajiban jangka pendek."
      />
      <MetricCard
        label="Net Profit Margin"
        value="--"
        hint="Belum aktif sampai data transaksi realtime tersedia."
      />
      <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4">
        <p className="text-sm font-semibold text-amber-200">Status siaga</p>
        <p className="mt-1 text-sm leading-6 text-zinc-300">
          Menunggu transaksi nyata untuk mengaktifkan analisis mitigasi risiko.
        </p>
      </div>
    </div>
  );
}

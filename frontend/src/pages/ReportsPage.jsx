import { useFetch } from "../hooks/useFetch";
import { reportService } from "../services";
import { fmt } from "../utils/helpers";
import { Spinner } from "../components/shared/UI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Icon } from "@iconify/react";

const STAT_COLORS = {
  teal: { bg: "bg-teal/10", text: "text-teal" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500" },
};

function StatCard({ icon, label, value, sub, color = "teal" }) {
  const c = STAT_COLORS[color] || STAT_COLORS.teal;
  return (
    <div className="card px-5 py-[18px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1.5">{label}</p>
          <p className="font-syne text-[26px] font-bold text-navy">{value}</p>
          {sub && <p className={`text-xs font-medium mt-1 ${c.text}`}>{sub}</p>}
        </div>
        <span
          className={`text-[22px] w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-[13px]">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="text-teal font-bold">{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function ReportsPage() {
  const { data: summary, loading: l1 } = useFetch(() =>
    reportService.summary(),
  );
  const { data: byDay, loading: l2 } = useFetch(() =>
    reportService.salesByDay(7),
  );
  const { data: topProd, loading: l3 } = useFetch(() =>
    reportService.topProducts(),
  );

  const loading = l1 || l2 || l3;

  const variation = summary
    ? summary.sales_yesterday > 0
      ? (
          ((summary.sales_today - summary.sales_yesterday) /
            summary.sales_yesterday) *
          100
        ).toFixed(1)
      : null
    : null;

  const chartData = (byDay || []).map((d) => ({
    day: new Date(d.date + "T00:00:00").toLocaleDateString("es-MX", {
      weekday: "short",
    }),
    total: d.total,
  }));

  return (
    <div className="fade-in p-5 flex flex-col gap-5 overflow-y-auto h-full">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
            <StatCard
              icon={<Icon icon="tabler:pig-money" />}
              label="Ventas hoy"
              color="teal"
              value={fmt(summary?.sales_today ?? 0)}
              sub={
                variation != null
                  ? `${variation > 0 ? "+" : ""}${variation}% vs ayer`
                  : "Sin datos de ayer"
              }
            />
            <StatCard
              icon={<Icon icon="hugeicons:money-bag-02" />}
              label="Transacciones"
              color="amber"
              value={summary?.transactions_today ?? 0}
              sub="Ventas del día"
            />
            <StatCard
              icon={<Icon icon="hugeicons:ice-cream-01" />}
              label="Productos vendidos"
              color="purple"
              value={summary?.items_today ?? 0}
              sub="Unidades totales"
            />
            <StatCard
              icon={<Icon icon="fluent:alert-on-16-regular" />}
              label="Stock crítico"
              color="rose"
              value={summary?.low_stock_count ?? 0}
              sub="Revisar inventario"
            />
          </div>

          {/* Sales chart */}
          <div className="card px-6 py-[22px]">
            <h3 className="font-syne text-[15px] font-bold text-navy mb-5">
              Ventas — últimos 7 días
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#0D948808" }}
                />
                <Bar dataKey="total" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          {topProd?.length > 0 && (
            <div className="card px-6 py-[22px]">
              <h3 className="font-syne text-[15px] font-bold text-navy mb-4">
                Productos más vendidos
              </h3>
              <div className="flex flex-col gap-2.5">
                {topProd.slice(0, 5).map((p, i) => {
                  const pct = (p.units_sold / topProd[0].units_sold) * 100;
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-[13px] font-semibold text-navy truncate">
                            {p.name}
                          </span>
                          <span className="text-xs text-slate-500 shrink-0 ml-2">
                            {p.units_sold} uds · {fmt(p.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-[width] duration-500 ease-out ${i === 0 ? "bg-teal" : "bg-teal/40"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

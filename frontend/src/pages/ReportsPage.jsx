import { useFetch } from "../hooks/useFetch";
import { reportService } from "../services";
import { fmt, fmtDate } from "../utils/helpers";
import { Spinner } from "../components/shared/UI";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 6 }}>{label}</p>
          <p style={{ fontFamily: "Syne,sans-serif", fontSize: 26, fontWeight: 800, color: "#0F2D40" }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color, fontWeight: 500, marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{
          fontSize: 22, width: 44, height: 44, borderRadius: 12,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <p style={{ color: "#64748B", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#0D9488", fontWeight: 700 }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function ReportsPage() {
  const { data: summary, loading: l1 } = useFetch(() => reportService.summary());
  const { data: byDay,   loading: l2 } = useFetch(() => reportService.salesByDay(7));
  const { data: topProd, loading: l3 } = useFetch(() => reportService.topProducts());

  const loading = l1 || l2 || l3;

  // Calcular variación día anterior
  const variation = summary
    ? summary.sales_yesterday > 0
      ? (((summary.sales_today - summary.sales_yesterday) / summary.sales_yesterday) * 100).toFixed(1)
      : null
    : null;

  const chartData = (byDay || []).map(d => ({
    day: new Date(d.date + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short" }),
    total: d.total,
  }));

  return (
    <div className="fade-in" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", height: "100%" }}>

      {loading ? <Spinner /> : (
        <>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
            <StatCard icon="💰" label="Ventas hoy"        color="#0D9488"
              value={fmt(summary?.sales_today ?? 0)}
              sub={variation != null ? `${variation > 0 ? "+" : ""}${variation}% vs ayer` : "Sin datos de ayer"} />
            <StatCard icon="🧾" label="Transacciones"     color="#F59E0B"
              value={summary?.transactions_today ?? 0}
              sub="Ventas del día" />
            <StatCard icon="🍦" label="Productos vendidos" color="#10B981"
              value={summary?.items_today ?? 0}
              sub="Unidades totales" />
            <StatCard icon="⚠️" label="Stock crítico"     color="#F43F5E"
              value={summary?.low_stock_count ?? 0}
              sub="Revisar inventario" />
          </div>

          {/* Sales chart */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: "#0F2D40", marginBottom: 20 }}>
              Ventas — últimos 7 días
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0D948808" }} />
                <Bar dataKey="total" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          {topProd && topProd.length > 0 && (
            <div className="card" style={{ padding: "22px 24px" }}>
              <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 700, color: "#0F2D40", marginBottom: 16 }}>
                Productos más vendidos
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topProd.slice(0, 5).map((p, i) => {
                  const maxUnits = topProd[0].units_sold;
                  return (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F2D40" }}>{p.name}</span>
                          <span style={{ fontSize: 12, color: "#64748B" }}>{p.units_sold} uds · {fmt(p.revenue)}</span>
                        </div>
                        <div style={{ height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 99,
                            width: `${(p.units_sold / maxUnits) * 100}%`,
                            background: i === 0 ? "#0D9488" : "#0D948866",
                            transition: "width .6s cubic-bezier(.22,1,.36,1)",
                          }} />
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

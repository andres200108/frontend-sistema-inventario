import { useState, useEffect } from "react";
import { getResumen } from "../services/dashboard.service";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Home() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResumen().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={s.loading}>Cargando...</p>;
  if (!data)   return <p style={s.loading}>Error cargando datos</p>;

  const barData = {
    labels: ['Productos', 'Entradas hoy', 'Salidas hoy', 'Stock crítico'],
    datasets: [{
      label: 'Cantidad',
      data: [data.total_productos, data.entradas_hoy, data.salidas_hoy, data.stock_critico],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      borderRadius: 8,
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  const doughnutData = {
    labels: data.productos_criticos.map(p => p.nombre),
    datasets: [{
      data: data.productos_criticos.map(p => p.stock),
      backgroundColor: ['#EF4444','#F59E0B','#F97316','#EAB308','#DC2626'],
    }]
  };

  return (
    <div>
      <h2 style={s.h2}>Panel principal</h2>

      <div style={s.grid4}>
        {[
          { label: "Total productos",  value: data.total_productos, color: "var(--color-text-info)", bg: "var(--color-background-info)" },
          { label: "Entradas hoy",     value: data.entradas_hoy,    color: "var(--color-text-success)", bg: "var(--color-background-success)" },
          { label: "Salidas hoy",      value: data.salidas_hoy,     color: "var(--color-text-warning)", bg: "var(--color-background-warning)" },
          { label: "Stock crítico",    value: data.stock_critico,   color: "var(--color-text-danger)", bg: "var(--color-background-danger)" },
        ].map((m) => (
          <div key={m.label} style={{...s.metricCard, borderLeft: `4px solid ${m.color}`}}>
            <p style={s.metricLabel}>{m.label}</p>
            <p style={{ ...s.metricValue, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={s.grid3}>
        <div style={{...s.card, gridColumn: "span 2"}}>
          <h3 style={s.h3}>Resumen gráfico</h3>
          <Bar data={barData} options={barOptions} />
        </div>
        <div style={s.card}>
          <h3 style={s.h3}>Stock crítico</h3>
          {data.productos_criticos.length === 0 ? (
            <p style={s.empty}>Sin productos críticos</p>
          ) : (
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }} />
          )}
        </div>
      </div>

      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={s.h3}>Últimas entradas</h3>
          {data.ultimas_entradas.length === 0 ? <p style={s.empty}>Sin registros</p> :
            data.ultimas_entradas.map((e, i) => (
              <div key={i} style={s.row}>
                <div>
                  <span style={s.rowLabel}>{e.producto}</span>
                  <span style={{fontSize:11, color:"var(--color-text-tertiary)",marginLeft:8}}>{new Date(e.fecha).toLocaleDateString("es-CO")}</span>
                </div>
                <span style={{ color: "var(--color-text-success)", fontWeight: 500 }}>+{e.cantidad}</span>
              </div>
            ))}
        </div>

        <div style={s.card}>
          <h3 style={s.h3}>Productos críticos</h3>
          {data.productos_criticos.length === 0 ? <p style={s.empty}>Todo en orden</p> :
            data.productos_criticos.map((p, i) => (
              <div key={i} style={s.row}>
                <span style={s.rowLabel}>{p.codigo} - {p.nombre}</span>
                <span style={{
                  background: p.stock === 0 ? "var(--color-background-danger)" : "var(--color-background-warning)",
                  color: p.stock === 0 ? "var(--color-text-danger)" : "var(--color-text-warning)",
                  padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 500
                }}>{p.stock}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  h2:          { margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 },
  h3:          { margin: "0 0 1rem", fontSize: 15, fontWeight: 500 },
  loading:     { padding: "2rem", color: "var(--color-text-secondary)" },
  empty:       { fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center", padding: "1rem" },
  grid4:       { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" },
  grid3:       { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: "1.5rem" },
  grid2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  metricCard:  { background: "var(--color-background-primary)", borderRadius: 12, padding: "1.25rem", border: "0.5px solid var(--color-border-tertiary)" },
  metricLabel: { margin: "0 0 6px", fontSize: 12, color: "var(--color-text-secondary)" },
  metricValue: { margin: 0, fontSize: 32, fontWeight: 600 },
  card:        { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1.5rem" },
  row:         { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 },
  rowLabel:    { color: "var(--color-text-secondary)", fontSize: 13 },
};

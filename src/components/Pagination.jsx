import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ current, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={s.container}>
      <span style={s.info}>
        {(current - 1) * perPage + 1}-{Math.min(current * perPage, total)} de {total}
      </span>
      <div style={s.buttons}>
        <button onClick={() => onChange(current - 1)} disabled={current === 1} style={s.btn}>
          <ChevronLeft size={14} />
        </button>
        {start > 1 && <><button onClick={() => onChange(1)} style={s.btn}>1</button><span style={s.dots}>...</span></>}
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} style={{...s.btn, ...(p === current ? s.active : {})}}>
            {p}
          </button>
        ))}
        {end < totalPages && <><span style={s.dots}>...</span><button onClick={() => onChange(totalPages)} style={s.btn}>{totalPages}</button></>}
        <button onClick={() => onChange(current + 1)} disabled={current === totalPages} style={s.btn}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const s = {
  container: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: 8 },
  info:      { fontSize: 12, color: "var(--color-text-secondary)" },
  buttons:   { display: "flex", gap: 4, alignItems: "center" },
  btn:       { padding: "5px 10px", fontSize: 12, borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 },
  active:    { background: "var(--color-background-info)", color: "var(--color-text-info)", borderColor: "var(--color-border-info)", fontWeight: 500 },
  dots:      { fontSize: 12, color: "var(--color-text-tertiary)", padding: "0 4px" },
};

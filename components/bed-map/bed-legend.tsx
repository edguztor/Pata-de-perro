export function BedLegend() {
  const items = [
    { color: "bg-emerald-400", label: "Disponible" },
    { color: "bg-rose-400", label: "Ocupada" },
    { color: "bg-amber-400", label: "Reservada (por llegar)" },
    { color: "bg-slate-400", label: "Mantenimiento" },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${color}`} />
          <span className="text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

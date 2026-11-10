export function Skeleton({ filas = 3 }: { filas?: number }) {
  return <div role="status" aria-label="Cargando" className="space-y-3"><span className="sr-only">Cargando…</span>
    {Array.from({ length: Math.max(1, Math.min(20, filas)) }, (_, indice) => <div key={indice} className="esqueleto h-20 rounded-xl motion-safe:animate-pulse" />)}</div>
}

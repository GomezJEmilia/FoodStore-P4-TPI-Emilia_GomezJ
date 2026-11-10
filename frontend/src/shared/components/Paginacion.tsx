import { Button } from '@/shared/ui/Button'

interface Props { pagina: number; porPagina: number; total: number; onCambiar: (pagina: number) => void; cargando?: boolean }

export function Paginacion({ pagina, porPagina, total, onCambiar, cargando = false }: Props) {
  const paginas = Math.max(1, Math.ceil(total / Math.max(1, porPagina)))
  return <nav aria-label="Paginación" className="mt-6 flex flex-wrap items-center justify-between gap-3">
    <span className="texto-secundario text-sm" aria-live="polite">Página {pagina + 1} de {paginas} · {total} resultados</span>
    <div className="flex gap-2">
      <Button variante="secundario" disabled={cargando || pagina <= 0} onClick={() => onCambiar(pagina - 1)}>Anterior</Button>
      <Button variante="secundario" disabled={cargando || pagina + 1 >= paginas} onClick={() => onCambiar(pagina + 1)}>Siguiente</Button>
    </div>
  </nav>
}

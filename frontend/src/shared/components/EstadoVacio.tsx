import type { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'

export function EstadoVacio({ titulo = 'Sin resultados', descripcion, accion }: { titulo?: string; descripcion?: string; accion?: ReactNode }) {
  return <Card className="py-12 text-center"><h2 className="text-lg font-bold">{titulo}</h2>
    {descripcion && <p className="texto-secundario mt-2">{descripcion}</p>}{accion && <div className="mt-5">{accion}</div>}</Card>
}

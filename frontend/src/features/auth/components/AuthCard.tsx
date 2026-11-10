import type { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'

export function AuthCard({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: ReactNode }) {
  return <div className="mx-auto max-w-lg py-4 sm:py-10"><Card>
    <p className="texto-secundario text-sm font-semibold">Food Store</p>
    <h1 className="mt-2 text-3xl font-black">{titulo}</h1>
    <p className="texto-secundario mb-7 mt-3">{descripcion}</p>
    {children}
  </Card></div>
}

import { Button } from '@/shared/ui/Button'

export function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return <div role="alert" className="mensaje-error rounded-xl border p-5"><p>{mensaje}</p>
    {onReintentar && <Button variante="secundario" className="mt-4" onClick={onReintentar}>Reintentar</Button>}</div>
}

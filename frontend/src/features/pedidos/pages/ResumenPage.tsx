import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'
import { moneda } from '@/shared/utils/moneda'
import { useResumen } from '../hooks/useAdminPedidos'

export function ResumenPage() {
  const consulta = useResumen()
  return <><h1 className="mb-3 text-3xl font-black">Resumen del negocio</h1>
    <p className="texto-secundario mb-7">Los ingresos corresponden a pedidos entregados de todo el historial. Pedidos de hoy se cuenta desde la medianoche de Argentina.</p>
    {consulta.isPending ? <Skeleton /> : consulta.isError ? <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => { void consulta.refetch() }} />
      : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[
        ['Pendientes', consulta.data.pendientes], ['En preparación', consulta.data.en_preparacion], ['Entregados', consulta.data.entregados],
        ['Cancelados', consulta.data.cancelados], ['Pedidos de hoy', consulta.data.pedidos_hoy], ['Ingresos de entregados', moneda(consulta.data.ingresos_entregados)],
      ].map(([etiqueta, valor]) => <Card key={etiqueta}><h2 className="texto-secundario font-semibold">{etiqueta}</h2><p className="mt-3 text-3xl font-black">{valor}</p></Card>)}</div>}
  </>
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { handleApiError } from '@/shared/api/handleApiError'
import { moneda } from '@/shared/utils/moneda'
import { DetallePedido } from '../components/DetallePedido'
import { useCancelarPedido, useDetallePedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

export function MisPedidosPage() {
  const { usuario, esAdmin } = useAuth()
  const [pagina, setPagina] = useState(0)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pedidos = usePedidos(pagina)
  const detalle = useDetallePedido(seleccionado)
  const cancelacion = useCancelarPedido()
  const location = useLocation()
  const estado: unknown = location.state
  const creado = typeof estado === 'object' && estado !== null && 'pedidoCreado' in estado && typeof estado.pedidoCreado === 'number'
    ? estado.pedidoCreado : null
  async function cancelar(pedido: Pedido) {
    if (cancelacion.isPending || !window.confirm(`¿Querés cancelar el pedido #${pedido.id}?`)) return
    setError(null)
    try { await cancelacion.mutateAsync(pedido.id) }
    catch (error: unknown) { setError(handleApiError(error, 'No fue posible cancelar el pedido')) }
  }
  function botonCancelar(pedido: Pedido) {
    return pedido.usuario_id === usuario?.id && pedido.estado === 'PENDIENTE'
      ? <Button variante="peligro" disabled={cancelacion.isPending} onClick={() => { void cancelar(pedido) }}>Cancelar pedido #{pedido.id}</Button> : null
  }
  return <>
    <h1 className="mb-3 text-3xl font-black">Mis pedidos</h1>
    <p className="texto-secundario mb-6">Consultá el detalle y cancelá tus pedidos mientras estén pendientes.{esAdmin && ' Tu cuenta administradora recibe el listado completo; aquí solo se ofrece cancelar tus propios pedidos pendientes.'}</p>
    {creado !== null && <p role="status" className="superficie mb-6 rounded-xl border p-4">Pedido #{creado} creado correctamente. Tu carrito se vació.</p>}
    {error && <div className="mb-5"><EstadoError mensaje={error} /></div>}
    {pedidos.isPending ? <Skeleton /> : pedidos.isError
      ? <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => { void pedidos.refetch() }} />
      : <>
        {pedidos.data.items.length === 0 ? <EstadoVacio titulo="No hay pedidos para mostrar" accion={<Link to="/" className="boton boton-primario">Ir al catálogo</Link>} />
          : <div className="space-y-4">{pedidos.data.items.map((pedido) => <Card key={pedido.id} className="flex flex-wrap items-center justify-between gap-5">
            <div><h2 className="mb-2 text-lg font-bold">Pedido #{pedido.id}</h2><BadgeEstado estado={pedido.estado} />
              <p className="texto-secundario mt-2 text-sm">{new Date(pedido.created_at).toLocaleString('es-AR')}</p><p className="mt-2 font-bold">{moneda(pedido.total)}</p></div>
            <div className="flex flex-wrap gap-3"><Button variante="secundario" onClick={() => { setError(null); setSeleccionado(pedido.id) }}>Ver detalle #{pedido.id}</Button>{botonCancelar(pedido)}</div>
          </Card>)}</div>}
        <Paginacion pagina={pagina} porPagina={10} total={pedidos.data.total} cargando={pedidos.isFetching} onCambiar={setPagina} />
      </>}
    {seleccionado !== null && <Modal titulo={`Pedido #${seleccionado}`} bloqueado={cancelacion.isPending} onCerrar={() => { setSeleccionado(null); setError(null) }}>
      {detalle.isPending ? <Skeleton filas={2} /> : detalle.isError
        ? <EstadoError mensaje={handleApiError(detalle.error)} onReintentar={() => { void detalle.refetch() }} />
        : detalle.data && <><DetallePedido pedido={detalle.data} />
          {error && <div className="mt-5"><EstadoError mensaje={error} /></div>}
          <div className="mt-6">{botonCancelar(detalle.data)}</div></>}
    </Modal>}
  </>
}

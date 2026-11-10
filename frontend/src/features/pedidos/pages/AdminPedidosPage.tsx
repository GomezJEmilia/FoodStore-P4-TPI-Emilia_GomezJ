import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import type { EstadoPedido } from '@/shared/ui/BadgeEstado'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { handleApiError } from '@/shared/api/handleApiError'
import { moneda } from '@/shared/utils/moneda'
import { DetallePedido } from '../components/DetallePedido'
import { useDetallePedido } from '../hooks/usePedidos'
import { useAdminPedidos, useCambiarEstado } from '../hooks/useAdminPedidos'
import type { Pedido } from '../types/pedido'

const destinos: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'], EN_PREPARACION: ['ENTREGADO', 'CANCELADO'], ENTREGADO: [], CANCELADO: [],
}
const acciones: Partial<Record<EstadoPedido, string>> = { EN_PREPARACION: 'Preparar', ENTREGADO: 'Entregar', CANCELADO: 'Cancelar' }

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const consulta = useAdminPedidos(pagina, estado), detalle = useDetallePedido(seleccionado), cambio = useCambiarEstado()
  async function transicionar(pedido: Pedido, destino: EstadoPedido) {
    if (cambio.isPending || !window.confirm(`¿${acciones[destino]} el pedido #${pedido.id}?${destino === 'CANCELADO' ? ' Se restituirá el stock.' : ''}`)) return
    setError(null)
    try { await cambio.mutateAsync({ id: pedido.id, estado: destino }) } catch (error: unknown) { setError(handleApiError(error)) }
  }
  function botones(pedido: Pedido) {
    return destinos[pedido.estado].length ? <div className="flex flex-wrap gap-2">{destinos[pedido.estado].map((destino) => <Button key={destino}
      variante={destino === 'CANCELADO' ? 'peligro' : 'secundario'} disabled={cambio.isPending} onClick={() => { void transicionar(pedido, destino) }}>{acciones[destino]} #{pedido.id}</Button>)}</div>
      : <span className="texto-secundario text-sm">Sin acciones: estado terminal</span>
  }
  return <>
    <h1 className="mb-6 text-3xl font-black">Administrar pedidos</h1>
    <div className="mb-6 max-w-xs space-y-2"><label htmlFor="estado-pedidos" className="block font-semibold">Filtrar por estado</label>
      <select id="estado-pedidos" className="campo" value={estado} onChange={(evento) => { setEstado(evento.target.value as EstadoPedido | ''); setPagina(0); setError(null) }}>
        <option value="">Todos</option><option value="PENDIENTE">Pendiente</option><option value="EN_PREPARACION">En preparación</option><option value="ENTREGADO">Entregado</option><option value="CANCELADO">Cancelado</option>
      </select></div>
    {error && seleccionado === null && <div className="mb-5"><EstadoError mensaje={error} /></div>}
    {consulta.isPending ? <Skeleton /> : consulta.isError ? <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => { void consulta.refetch() }} />
      : <>
        {consulta.data.items.length === 0 ? <EstadoVacio titulo="No hay pedidos para este filtro" /> : <div className="superficie overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm">
          <caption className="sr-only">Pedidos de todos los clientes</caption><thead><tr>{['Pedido', 'Usuario', 'Fecha', 'Estado', 'Total', 'Acciones'].map((titulo) => <th key={titulo} scope="col" className="border-tema border-b p-4">{titulo}</th>)}</tr></thead>
          <tbody>{consulta.data.items.map((pedido) => <tr key={pedido.id}>
            <td className="p-4">#{pedido.id}</td><td className="p-4">#{pedido.usuario_id}</td><td className="p-4">{new Date(pedido.created_at).toLocaleString('es-AR')}</td>
            <td className="p-4"><BadgeEstado estado={pedido.estado} /></td><td className="whitespace-nowrap p-4">{moneda(pedido.total)}</td>
            <td className="space-y-3 p-4"><Button variante="secundario" onClick={() => { setError(null); setSeleccionado(pedido.id) }}>Detalle #{pedido.id}</Button>{botones(pedido)}</td>
          </tr>)}</tbody></table></div>}
        <Paginacion pagina={pagina} porPagina={10} total={consulta.data.total} cargando={consulta.isFetching} onCambiar={setPagina} />
        {pagina > 0 && consulta.data.items.length === 0 && <Button className="mt-3" variante="secundario" onClick={() => setPagina(0)}>Volver a la primera página</Button>}
      </>}
    {seleccionado !== null && <Modal titulo={`Pedido #${seleccionado}`} bloqueado={cambio.isPending} onCerrar={() => { setSeleccionado(null); setError(null) }}>
      {detalle.isPending ? <Skeleton filas={2} /> : detalle.isError ? <EstadoError mensaje={handleApiError(detalle.error)} onReintentar={() => { void detalle.refetch() }} />
        : detalle.data && <><DetallePedido pedido={detalle.data} />{error && <div className="mt-5"><EstadoError mensaje={error} /></div>}<div className="mt-6">{botones(detalle.data)}</div></>}
    </Modal>}
  </>
}

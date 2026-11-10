import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { moneda } from '@/shared/utils/moneda'
import type { Pedido } from '../types/pedido'

export function DetallePedido({ pedido }: { pedido: Pedido }) {
  return <div className="space-y-5">
    <BadgeEstado estado={pedido.estado} />
    <dl className="space-y-2 break-words text-sm">
      <div><dt className="texto-secundario">Dirección de entrega</dt><dd>{pedido.direccion_entrega}</dd></div>
      <div><dt className="texto-secundario">Forma de pago</dt><dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd></div>
      <div><dt className="texto-secundario">Fecha</dt><dd>{new Date(pedido.created_at).toLocaleString('es-AR')}</dd></div>
      {pedido.notas && <div><dt className="texto-secundario">Notas</dt><dd className="whitespace-pre-wrap">{pedido.notas}</dd></div>}
    </dl>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <caption className="texto-secundario mb-3 text-left">Nombre y precio guardados al comprar</caption>
      <thead><tr className="border-tema border-b"><th scope="col" className="py-2 pr-3">Producto</th><th scope="col" className="px-2">Cantidad</th><th scope="col" className="px-2">Precio</th><th scope="col" className="pl-2">Subtotal</th></tr></thead>
      <tbody>{pedido.items.map((item) => <tr key={item.producto_id} className="border-tema border-b">
        <td className="py-3 pr-3">{item.nombre_producto}</td><td className="px-2">{item.cantidad}</td>
        <td className="whitespace-nowrap px-2">{moneda(item.precio_unitario)}</td><td className="whitespace-nowrap pl-2">{moneda(item.subtotal)}</td>
      </tr>)}</tbody>
    </table></div>
    <p className="text-right text-xl font-black">Total confirmado: {moneda(pedido.total)}</p>
  </div>
}

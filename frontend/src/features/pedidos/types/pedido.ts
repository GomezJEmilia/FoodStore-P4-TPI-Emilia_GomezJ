import type { EstadoPedido } from '@/shared/ui/BadgeEstado'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'
export interface PedidoCreate {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}
export interface DetallePedido {
  producto_id: number; nombre_producto: string; precio_unitario: number; cantidad: number; subtotal: number
}
export interface Pedido {
  id: number; usuario_id: number; estado: EstadoPedido; forma_pago: FormaPago
  direccion_entrega: string; notas: string | null; total: number
  created_at: string; updated_at: string; items: DetallePedido[]
}
export interface PedidosPaginados { total: number; items: Pedido[] }

import { axiosInstance } from '@/shared/api/axiosInstance'
import type { EstadoPedido } from '@/shared/ui/BadgeEstado'
import type { Pedido, PedidosPaginados } from '../types/pedido'
export interface ResumenPedidos {
  pendientes: number; en_preparacion: number; entregados: number; cancelados: number; pedidos_hoy: number; ingresos_entregados: number
}
export async function obtenerPedidosAdmin(pagina: number, estado: EstadoPedido | '', signal?: AbortSignal): Promise<PedidosPaginados> {
  return (await axiosInstance.get<PedidosPaginados>('/pedidos', { params: { skip: pagina * 10, limit: 10, estado: estado || undefined }, signal })).data
}
export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  return (await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data
}
export async function obtenerResumen(signal?: AbortSignal): Promise<ResumenPedidos> {
  return (await axiosInstance.get<ResumenPedidos>('/pedidos/resumen', { signal })).data
}

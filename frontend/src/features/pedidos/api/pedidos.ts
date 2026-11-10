import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Pedido, PedidoCreate, PedidosPaginados } from '../types/pedido'

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', datos)
  return data
}
export async function obtenerPedidos(pagina: number, signal?: AbortSignal): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params: { skip: pagina * 10, limit: 10 }, signal })
  return data
}
export async function obtenerPedido(id: number, signal?: AbortSignal): Promise<Pedido> {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`, { signal })
  return data
}
export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { cancelarPedido, crearPedido, obtenerPedido, obtenerPedidos } from '../api/pedidos'
import type { Pedido } from '../types/pedido'

export function useActualizarPedidos() {
  const cliente = useQueryClient()
  return (pedido: Pedido) => {
    cliente.setQueryData(['pedidos', 'detalle', pedido.id], pedido)
    void cliente.invalidateQueries({ queryKey: ['pedidos'] })
    void cliente.invalidateQueries({ queryKey: ['productos'] })
  }
}
export function useCrearPedido() {
  const actualizar = useActualizarPedidos()
  return useMutation({ mutationFn: crearPedido, retry: false, onSuccess: actualizar })
}
export function useCancelarPedido() {
  const actualizar = useActualizarPedidos()
  return useMutation({ mutationFn: cancelarPedido, retry: false, onSuccess: actualizar })
}
export function usePedidos(pagina: number) {
  const { usuario, autenticado } = useAuth()
  return useQuery({ queryKey: ['pedidos', 'lista', usuario?.id, pagina],
    queryFn: ({ signal }) => obtenerPedidos(pagina, signal), enabled: autenticado })
}
export function useDetallePedido(id: number | null) {
  const { autenticado } = useAuth()
  return useQuery({ queryKey: ['pedidos', 'detalle', id],
    queryFn: ({ signal }) => obtenerPedido(id!, signal), enabled: autenticado && id !== null })
}

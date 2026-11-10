import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EstadoPedido } from '@/shared/ui/BadgeEstado'
import { useAuth } from '@/features/auth'
import { cambiarEstado, obtenerPedidosAdmin, obtenerResumen } from '../api/admin'
import { useActualizarPedidos } from './usePedidos'
export function useAdminPedidos(pagina: number, estado: EstadoPedido | '') {
  const { esAdmin } = useAuth()
  return useQuery({ queryKey: ['pedidos', 'admin', pagina, estado], queryFn: ({ signal }) => obtenerPedidosAdmin(pagina, estado, signal), enabled: esAdmin })
}
export function useCambiarEstado() {
  const actualizar = useActualizarPedidos(), cliente = useQueryClient()
  return useMutation({ mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado), onSuccess: actualizar,
    onError: () => { void cliente.invalidateQueries({ queryKey: ['pedidos'] }) } })
}
export function useResumen() {
  const { esAdmin } = useAuth()
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: ({ signal }) => obtenerResumen(signal), enabled: esAdmin })
}

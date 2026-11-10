import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { cambiarAcceso, obtenerUsuarios } from '../api/usuarios'
export function useUsuarios() {
  const { esAdmin } = useAuth(), cliente = useQueryClient()
  const consulta = useQuery({ queryKey: ['usuarios'], queryFn: ({ signal }) => obtenerUsuarios(signal), enabled: esAdmin })
  const acceso = useMutation({ mutationFn: ({ id, disabled }: { id: number; disabled: boolean }) => cambiarAcceso(id, disabled),
    onSuccess: () => { void cliente.invalidateQueries({ queryKey: ['usuarios'] }) } })
  return { consulta, acceso }
}

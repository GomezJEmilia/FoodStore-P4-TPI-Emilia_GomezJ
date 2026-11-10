import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Usuario } from '@/features/auth'
export async function obtenerUsuarios(signal?: AbortSignal): Promise<Usuario[]> {
  return (await axiosInstance.get<Usuario[]>('/admin/usuarios', { signal })).data
}
export async function cambiarAcceso(id: number, disabled: boolean): Promise<Usuario> {
  return (await axiosInstance.post<Usuario>(`/admin/usuarios/${id}/${disabled ? 'desactivar' : 'activar'}`)).data
}

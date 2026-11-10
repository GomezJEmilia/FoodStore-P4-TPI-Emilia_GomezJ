import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Categoria } from '../types/categoria'

export async function obtenerCategorias(signal?: AbortSignal): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias', { signal })
  return data
}

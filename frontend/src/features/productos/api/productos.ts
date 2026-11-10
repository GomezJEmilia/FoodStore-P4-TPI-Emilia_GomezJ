import { axiosInstance } from '@/shared/api/axiosInstance'
import type { FiltrosCatalogo, ProductosPaginados } from '../types/producto'

export async function obtenerProductos(filtros: FiltrosCatalogo, signal?: AbortSignal): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    signal,
    params: { skip: filtros.pagina * filtros.porPagina, limit: filtros.porPagina,
      search: filtros.search.trim() || undefined, categoria_id: filtros.categoria_id },
  })
  return data
}

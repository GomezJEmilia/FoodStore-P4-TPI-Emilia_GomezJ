import { useQuery } from '@tanstack/react-query'
import { obtenerProductos } from '../api/productos'
import type { FiltrosCatalogo } from '../types/producto'

export function useCatalogo(filtros: FiltrosCatalogo) {
  return useQuery({ queryKey: ['productos', 'catalogo', filtros], queryFn: ({ signal }) => obtenerProductos(filtros, signal) })
}

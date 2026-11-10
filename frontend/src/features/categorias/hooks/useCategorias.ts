import { useQuery } from '@tanstack/react-query'
import { obtenerCategorias } from '../api/categorias'
export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: ({ signal }) => obtenerCategorias(signal) })
}

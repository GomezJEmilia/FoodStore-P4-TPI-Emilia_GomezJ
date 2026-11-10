import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarStock, crearProducto, editarProducto, eliminarProducto, obtenerProductosAdmin } from '../api/admin'
import type { ProductoData } from '../api/admin'
export function useAdminProductos() {
  const cliente = useQueryClient()
  const actualizar = () => { void cliente.invalidateQueries({ queryKey: ['productos'] }) }
  const consulta = useQuery({ queryKey: ['productos', 'admin'], queryFn: ({ signal }) => obtenerProductosAdmin(signal) })
  const crear = useMutation({ mutationFn: crearProducto, onSuccess: actualizar })
  const editar = useMutation({ mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoData> }) => editarProducto(id, datos), onSuccess: actualizar })
  const eliminar = useMutation({ mutationFn: eliminarProducto, onSuccess: actualizar })
  const stock = useMutation({ mutationFn: ({ id, datos }: { id: number; datos: { stock: number; disponible: boolean } }) => cambiarStock(id, datos), onSuccess: actualizar })
  return { consulta, crear, editar, eliminar, stock }
}

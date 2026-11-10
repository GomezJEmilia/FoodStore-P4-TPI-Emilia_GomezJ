import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearCategoria, editarCategoria, eliminarCategoria } from '../api/admin'
import type { CategoriaData } from '../api/admin'
export function useAdminCategorias() {
  const cliente = useQueryClient()
  const actualizar = () => { void cliente.invalidateQueries({ queryKey: ['categorias'] }); void cliente.invalidateQueries({ queryKey: ['productos'] }) }
  const crear = useMutation({ mutationFn: crearCategoria, onSuccess: actualizar })
  const editar = useMutation({ mutationFn: ({ id, datos }: { id: number; datos: CategoriaData }) => editarCategoria(id, datos), onSuccess: actualizar })
  const eliminar = useMutation({ mutationFn: eliminarCategoria, onSuccess: actualizar })
  return { crear, editar, eliminar }
}

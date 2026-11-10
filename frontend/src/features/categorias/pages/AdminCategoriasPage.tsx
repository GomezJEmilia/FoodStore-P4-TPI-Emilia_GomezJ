import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/shared/ui/Button'
import { TablaAdmin } from '@/shared/components/TablaAdmin'
import { FormularioCatalogo } from '@/shared/components/FormularioCatalogo'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'
import { useCategorias } from '../hooks/useCategorias'
import { useAdminCategorias } from '../hooks/useAdminCategorias'
import type { Categoria } from '../types/categoria'

export function AdminCategoriasPage() {
  const consulta = useCategorias(), operaciones = useAdminCategorias()
  const [editor, setEditor] = useState<{ categoria: Categoria | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const guardando = operaciones.crear.isPending || operaciones.editar.isPending
  function abrir(categoria: Categoria | null) { setErrorModal(null); setEditor({ categoria }) }
  async function guardar(datos: Record<string, string>) {
    try {
      setErrorModal(null)
      const data = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() }
      if (editor?.categoria) await operaciones.editar.mutateAsync({ id: editor.categoria.id, datos: data })
      else await operaciones.crear.mutateAsync(data)
      setEditor(null)
    } catch (error: unknown) { setErrorModal(handleApiError(error)) }
  }
  async function eliminar(categoria: Categoria) {
    if (!window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"? Sus productos se conservan.`)) return
    setError(null)
    try { await operaciones.eliminar.mutateAsync(categoria.id) } catch (error: unknown) { setError(handleApiError(error)) }
  }
  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' }, { accessorKey: 'descripcion', header: 'Descripción' },
    { id: 'acciones', header: 'Acciones', enableSorting: false, cell: ({ row }) => <div className="flex gap-2"><Button variante="secundario" onClick={() => abrir(row.original)}>Editar</Button>
      <Button variante="peligro" disabled={operaciones.eliminar.isPending} onClick={() => { void eliminar(row.original) }}>Dar de baja</Button></div> },
  ]
  return <><div className="mb-7 flex flex-wrap justify-between gap-4"><h1 className="text-3xl font-black">Administrar categorías</h1><Button onClick={() => abrir(null)}>Nueva categoría</Button></div>
    {error && <div className="mb-5"><EstadoError mensaje={error} /></div>}
    {consulta.isPending ? <Skeleton /> : consulta.isError ? <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => { void consulta.refetch() }} />
      : <TablaAdmin datos={consulta.data} columnas={columnas} titulo="categorías" />}
    {editor && <FormularioCatalogo key={editor.categoria?.id ?? 'nueva'} titulo={editor.categoria ? 'Editar categoría' : 'Nueva categoría'}
      iniciales={{ nombre: editor.categoria?.nombre ?? '', descripcion: editor.categoria?.descripcion ?? '' }}
      campos={[{ nombre: 'nombre', etiqueta: 'Nombre', validar: (valor) => valor.trim().length < 2 || valor.trim().length > 100 ? 'Usá entre 2 y 100 caracteres' : undefined }, { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' }]}
      guardando={guardando} error={errorModal} onGuardar={guardar} onCerrar={() => { if (!guardando) setEditor(null) }} />}
  </>
}

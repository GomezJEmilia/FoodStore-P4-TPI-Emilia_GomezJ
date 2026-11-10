import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias'
import { Button } from '@/shared/ui/Button'
import { TablaAdmin } from '@/shared/components/TablaAdmin'
import { FormularioCatalogo } from '@/shared/components/FormularioCatalogo'
import type { CampoCatalogo } from '@/shared/components/FormularioCatalogo'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'
import { moneda } from '@/shared/utils/moneda'
import { nombreObligatorio, validarImagen, validarPrecio, validarStock } from '@/shared/utils/validacionesCatalogo'
import { useAdminProductos } from '../hooks/useAdminProductos'
import type { Producto } from '../types/producto'
import type { ProductoData } from '../api/admin'

type Editor = { tipo: 'producto'; producto: Producto | null } | { tipo: 'stock'; producto: Producto }
export function AdminProductosPage() {
  const operaciones = useAdminProductos(), categorias = useCategorias()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [error, setError] = useState<string | null>(null), [errorModal, setErrorModal] = useState<string | null>(null)
  const guardando = operaciones.crear.isPending || operaciones.editar.isPending || operaciones.stock.isPending
  function abrir(nuevo: Editor) { setErrorModal(null); setEditor(nuevo) }
  async function guardar(datos: Record<string, string>) {
    if (!editor) return
    setErrorModal(null)
    try {
      if (editor.tipo === 'stock') await operaciones.stock.mutateAsync({ id: editor.producto.id, datos: { stock: Number(datos.stock), disponible: datos.disponible === 'true' } })
      else {
        const data: ProductoData = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), precio_base: Number(datos.precio_base), imagen_url: datos.imagen_url.trim(),
          stock: Number(datos.stock), disponible: datos.disponible === 'true', categoria_id: Number(datos.categoria_id) }
        if (editor.producto) {
          const cambios: Partial<ProductoData> = {}
          if (data.nombre !== editor.producto.nombre) cambios.nombre = data.nombre
          if (data.descripcion !== editor.producto.descripcion) cambios.descripcion = data.descripcion
          if (data.precio_base !== editor.producto.precio_base) cambios.precio_base = data.precio_base
          if (data.imagen_url !== editor.producto.imagen_url) cambios.imagen_url = data.imagen_url
          if (data.stock !== editor.producto.stock) cambios.stock = data.stock
          if (data.disponible !== editor.producto.disponible) cambios.disponible = data.disponible
          if (data.categoria_id !== editor.producto.categoria_id) cambios.categoria_id = data.categoria_id
          await operaciones.editar.mutateAsync({ id: editor.producto.id, datos: cambios })
        } else await operaciones.crear.mutateAsync(data)
      }
      setEditor(null)
    } catch (error: unknown) { setErrorModal(handleApiError(error)) }
  }
  async function eliminar(producto: Producto) {
    if (!window.confirm(`¿Dar de baja "${producto.nombre}"? Los pedidos históricos se conservan.`)) return
    setError(null)
    try { await operaciones.eliminar.mutateAsync(producto.id) } catch (error: unknown) { setError(handleApiError(error)) }
  }
  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre' }, { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => moneda(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' }, { accessorKey: 'disponible', header: 'Disponible', cell: ({ row }) => row.original.disponible ? 'Sí' : 'No' },
    { id: 'acciones', header: 'Acciones', enableSorting: false, cell: ({ row }) => <div className="flex flex-wrap gap-2">
      <Button variante="secundario" onClick={() => abrir({ tipo: 'producto', producto: row.original })}>Editar</Button>
      <Button variante="secundario" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>Stock</Button>
      <Button variante="peligro" disabled={operaciones.eliminar.isPending} onClick={() => { void eliminar(row.original) }}>Dar de baja</Button></div> },
  ]
  const producto = editor?.producto
  const opciones = (categorias.data ?? []).map((categoria) => ({ valor: String(categoria.id), etiqueta: categoria.nombre }))
  if (producto && !opciones.some((o) => o.valor === String(producto.categoria_id))) opciones.push({ valor: String(producto.categoria_id), etiqueta: `${producto.categoria.nombre} (inactiva; conservada)` })
  const basicos: CampoCatalogo[] = [
    { nombre: 'nombre', etiqueta: 'Nombre', validar: nombreObligatorio }, { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' },
    { nombre: 'precio_base', etiqueta: 'Precio', tipo: 'number', paso: '0.01', validar: validarPrecio },
    { nombre: 'imagen_url', etiqueta: 'URL de imagen (opcional)', validar: validarImagen },
    { nombre: 'categoria_id', etiqueta: 'Categoría', tipo: 'select', opciones: [{ valor: '', etiqueta: 'Seleccioná una categoría' }, ...opciones], validar: (valor) => Number(valor) > 0 ? undefined : 'Seleccioná una categoría' },
  ]
  const stock: CampoCatalogo[] = [{ nombre: 'stock', etiqueta: 'Stock', tipo: 'number', paso: '1', validar: validarStock }, { nombre: 'disponible', etiqueta: 'Disponible para la venta', tipo: 'checkbox' }]
  return <><div className="mb-7 flex flex-wrap justify-between gap-4"><h1 className="text-3xl font-black">Administrar productos</h1>
    <Button disabled={!categorias.data?.length || categorias.isError} onClick={() => abrir({ tipo: 'producto', producto: null })}>Nuevo producto</Button></div>
    {categorias.isError && <div className="mb-5"><EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => { void categorias.refetch() }} /></div>}
    {!categorias.isPending && !categorias.isError && !categorias.data?.length && <p className="texto-secundario mb-5">Creá una categoría activa antes de dar de alta productos.</p>}
    {error && <div className="mb-5"><EstadoError mensaje={error} /></div>}
    {operaciones.consulta.isPending ? <Skeleton /> : operaciones.consulta.isError ? <EstadoError mensaje={handleApiError(operaciones.consulta.error)} onReintentar={() => { void operaciones.consulta.refetch() }} />
      : <TablaAdmin datos={operaciones.consulta.data} columnas={columnas} titulo="productos" />}
    {editor && <FormularioCatalogo key={`${editor.tipo}-${producto?.id ?? 'nuevo'}`} titulo={editor.tipo === 'stock' ? 'Stock y disponibilidad' : producto ? 'Editar producto' : 'Nuevo producto'}
      iniciales={{ nombre: producto?.nombre ?? '', descripcion: producto?.descripcion ?? '', precio_base: String(producto?.precio_base ?? ''), imagen_url: producto?.imagen_url ?? '', categoria_id: producto ? String(producto.categoria_id) : '', stock: String(producto?.stock ?? 0), disponible: String(producto?.disponible ?? true) }}
      campos={editor.tipo === 'stock' ? stock : [...basicos, ...stock]} guardando={guardando} error={errorModal} onGuardar={guardar} onCerrar={() => { if (!guardando) setEditor(null) }} />}
  </>
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategorias } from '@/features/categorias'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { handleApiError } from '@/shared/api/handleApiError'
import { ProductoCard } from '../components/ProductoCard'
import { useCatalogo } from '../hooks/useCatalogo'
import type { Producto } from '../types/producto'

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({ search: '', categoria: '', pagina: 0 })
  const [mensaje, setMensaje] = useState('')
  const [errorCarrito, setErrorCarrito] = useState<string | null>(null)
  const categorias = useCategorias()
  const productos = useCatalogo({ pagina: filtros.pagina, porPagina: 6, search: filtros.search,
    categoria_id: filtros.categoria ? Number(filtros.categoria) : undefined })
  const items = useCartStore((estado) => estado.items)
  const agregar = useCartStore((estado) => estado.agregar)
  function agregarProducto(producto: Producto) {
    const cantidad = useCartStore.getState().items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0
    if (!producto.activo || !producto.disponible || cantidad >= producto.stock) return
    try {
      agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base, stock_referencia: producto.stock })
      setErrorCarrito(null)
      setMensaje(`${producto.nombre} agregado. Cantidad: ${cantidad + 1}.`)
    } catch { setErrorCarrito('No fue posible agregar el producto al carrito') }
  }
  function restarProducto(producto: Producto) {
    const carrito = useCartStore.getState()
    const item = carrito.items.find((linea) => linea.producto_id === producto.id)
    if (!item) return
    if (item.cantidad === 1) carrito.quitar(producto.id)
    else carrito.cambiarCantidad(producto.id, item.cantidad - 1)
    setMensaje(item.cantidad === 1 ? `${producto.nombre} quitado del carrito.` : `${producto.nombre}: ${item.cantidad - 1} unidades.`)
  }
  function limpiar() { setBusqueda(''); setFiltros({ search: '', categoria: '', pagina: 0 }) }
  return <>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="texto-secundario text-sm font-semibold">Elegí tus favoritos</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Nuestro catálogo</h1></div>
      <Link to="/carrito" className="boton boton-secundario">Ver carrito</Link>
    </div>
    <form className="superficie mb-6 grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end" onSubmit={(evento) => {
      evento.preventDefault(); setFiltros((anterior) => ({ ...anterior, search: busqueda.trim(), pagina: 0 }))
    }}>
      <Input etiqueta="Buscar por nombre" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Ej.: hamburguesa" type="search" />
      <div className="space-y-2"><label htmlFor="categoria-catalogo" className="block text-sm font-semibold">Categoría</label>
        <select id="categoria-catalogo" className="campo" value={filtros.categoria} disabled={categorias.isPending || categorias.isError}
          onChange={(evento) => setFiltros((anterior) => ({ ...anterior, categoria: evento.target.value, pagina: 0 }))}>
          <option value="">Todas las categorías</option>
          {categorias.data?.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
        </select></div>
      <Button type="submit">Buscar</Button><Button variante="secundario" onClick={limpiar}>Limpiar</Button>
    </form>
    {categorias.isError && <div className="mb-5"><EstadoError mensaje={handleApiError(categorias.error, 'No se pudieron cargar las categorías')} onReintentar={() => { void categorias.refetch() }} /></div>}
    {errorCarrito && <div className="mb-5"><EstadoError mensaje={errorCarrito} /></div>}
    <p role="status" aria-live="polite" className="texto-secundario mb-4 min-h-6 text-sm">{mensaje}</p>
    {productos.isPending ? <Skeleton filas={3} /> : productos.isError
      ? <EstadoError mensaje={handleApiError(productos.error, 'No se pudieron cargar los productos')} onReintentar={() => { void productos.refetch() }} />
      : <>
        {productos.data.items.length === 0
          ? <EstadoVacio titulo="No encontramos productos" descripcion="Probá con otra búsqueda o categoría."
            accion={<Button variante="secundario" onClick={limpiar}>Limpiar filtros</Button>} />
          : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Productos del catálogo">
            {productos.data.items.map((producto) => <ProductoCard key={`${producto.id}-${producto.imagen_url}`} producto={producto}
              cantidadEnCarrito={items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0} onAgregar={agregarProducto} onRestar={restarProducto} />)}
          </div>}
        <Paginacion pagina={filtros.pagina} porPagina={6} total={productos.data.total} cargando={productos.isFetching}
          onCambiar={(pagina) => setFiltros((anterior) => ({ ...anterior, pagina }))} />
        {filtros.pagina > 0 && productos.data.items.length === 0 && <Button variante="secundario" className="mt-4" onClick={() => setFiltros((anterior) => ({ ...anterior, pagina: 0 }))}>Volver a la primera página</Button>}
      </>}
  </>
}

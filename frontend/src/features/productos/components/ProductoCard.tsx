import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { moneda } from '@/shared/utils/moneda'
import type { Producto } from '../types/producto'

interface Props { producto: Producto; cantidadEnCarrito: number; onAgregar: (producto: Producto) => void; onRestar: (producto: Producto) => void }

export function ProductoCard({ producto, cantidadEnCarrito, onAgregar, onRestar }: Props) {
  const [imagenFallida, setImagenFallida] = useState(false)
  const vendible = producto.activo && producto.disponible && producto.stock > 0
  const limite = cantidadEnCarrito >= producto.stock
  return <Card className="flex h-full flex-col p-0! overflow-hidden">
    {producto.imagen_url && !imagenFallida
      ? <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" onError={() => setImagenFallida(true)} className="aspect-[4/3] w-full object-cover" />
      : <div className="esqueleto texto-secundario flex aspect-[4/3] items-center justify-center text-sm" role="img" aria-label={`${producto.nombre}: sin imagen`}>Sin imagen</div>}
    <div className="flex flex-1 flex-col p-5">
      <p className="texto-secundario text-xs font-semibold">{producto.categoria.nombre}</p>
      <h2 className="mt-2 break-words text-xl font-bold">{producto.nombre}</h2>
      <p className="texto-secundario mt-2 flex-1 break-words text-sm">{producto.descripcion || 'Sin descripción'}</p>
      <p className="mt-5 text-xl font-black">{moneda(producto.precio_base)}</p>
      <p className="texto-secundario mb-4 mt-1 text-sm">{!producto.disponible ? 'No disponible' : producto.stock === 0 ? 'Sin stock' : `Stock de referencia: ${producto.stock}`}</p>
      {cantidadEnCarrito === 0 ? <Button disabled={!vendible} onClick={() => onAgregar(producto)}>
        {vendible ? 'Agregar al carrito' : 'No disponible'}
      </Button> : <div>
        <div role="group" aria-label={`Cantidad de ${producto.nombre} en el carrito`} className="flex items-center justify-between gap-3">
          <Button variante="secundario" aria-label={`Quitar una unidad de ${producto.nombre}`} onClick={() => onRestar(producto)}>−</Button>
          <span aria-live="polite" className="font-bold">{cantidadEnCarrito}</span>
          <Button variante="secundario" aria-label={`Agregar una unidad de ${producto.nombre}`} disabled={!vendible || limite} onClick={() => onAgregar(producto)}>+</Button>
        </div>
        <p className="texto-secundario mt-2 text-center text-xs">{!vendible ? 'Podés quitar unidades; el producto ya no está disponible.' : limite ? 'Stock de referencia alcanzado' : 'Unidades en tu carrito'}</p>
      </div>}
    </div>
  </Card>
}

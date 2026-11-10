import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import type { ItemCarrito } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { moneda, subtotal } from '@/shared/utils/moneda'

function LineaCarrito({ item, onCantidad, onQuitar }: { item: ItemCarrito; onCantidad: (cantidad: number) => void; onQuitar: () => void }) {
  const [borrador, setBorrador] = useState(String(item.cantidad))
  const [error, setError] = useState<string | undefined>()
  function cambiar(valor: string) {
    setBorrador(valor)
    const cantidad = Number(valor)
    if (!/^\d+$/.test(valor) || !Number.isSafeInteger(cantidad) || cantidad < 1) {
      setError(`Ingresá un entero positivo. Se conserva la cantidad ${item.cantidad}.`); return
    }
    setError(undefined); onCantidad(cantidad)
  }
  return <Card className="grid gap-5 sm:grid-cols-[1fr_10rem_auto] sm:items-center">
    <div><h2 className="break-words text-lg font-bold">{item.nombre}</h2>
      <p className="texto-secundario mt-1 text-sm">Precio guardado: {moneda(item.precio_unitario)}</p>
      <p className="texto-secundario mt-1 text-sm">{item.stock_referencia === undefined ? 'Stock a verificar al confirmar' : `Último stock de referencia: ${item.stock_referencia}`}</p>
      {item.stock_referencia !== undefined && item.cantidad > item.stock_referencia && <p className="texto-error mt-2 text-sm">La cantidad supera el último stock conocido. El servidor lo comprobará al confirmar.</p>}
    </div>
    <Input etiqueta={`Cantidad de ${item.nombre}`} type="number" min={1} step={1} value={borrador} error={error}
      onChange={(evento) => cambiar(evento.target.value)} onBlur={() => { setBorrador(String(item.cantidad)); setError(undefined) }} />
    <div className="sm:text-right"><p className="mb-3 font-bold">Subtotal: {moneda(subtotal(item.precio_unitario, item.cantidad))}</p>
      <Button variante="peligro" onClick={onQuitar} aria-label={`Quitar ${item.nombre}`}>Quitar</Button></div>
  </Card>
}

export function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore()
  if (items.length === 0) return <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agregá productos del catálogo para preparar tu compra."
    accion={<Link to="/" className="boton boton-primario">Explorar catálogo</Link>} />
  return <>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-black">Tu carrito</h1>
      <Button variante="secundario" onClick={() => { if (window.confirm('¿Querés vaciar el carrito?')) vaciar() }}>Vaciar carrito</Button></div>
    <p className="texto-secundario mb-6">Los precios y el stock guardados son orientativos. El backend vuelve a validarlos al confirmar y calcula el importe definitivo. Agregar al carrito no reserva stock.</p>
    <div className="space-y-4">{items.map((item) => <LineaCarrito key={item.producto_id} item={item}
      onCantidad={(cantidad) => cambiarCantidad(item.producto_id, cantidad)} onQuitar={() => quitar(item.producto_id)} />)}</div>
    <Card className="mt-7 flex flex-wrap items-center justify-between gap-5">
      <div><p className="texto-secundario text-sm">Total estimado</p><p className="text-3xl font-black" aria-live="polite">{moneda(total())}</p></div>
      <div className="flex flex-wrap gap-3"><Link to="/" className="boton boton-secundario">Seguir comprando</Link>
        <Link to="/checkout" className="boton boton-primario">Continuar compra</Link></div>
    </Card>
  </>
}

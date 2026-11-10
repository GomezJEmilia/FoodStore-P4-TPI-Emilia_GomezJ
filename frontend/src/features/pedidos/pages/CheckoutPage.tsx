import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Card } from '@/shared/ui/Card'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { handleApiError } from '@/shared/api/handleApiError'
import { moneda, subtotal } from '@/shared/utils/moneda'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore()
  const compra = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const formulario = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      if (compra.isPending) return
      const actuales = useCartStore.getState().items
      if (actuales.length === 0) { setError('El carrito está vacío'); return }
      setError(null)
      try {
        const pedido = await compra.mutateAsync({
          items: actuales.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
          direccion_entrega: value.direccion_entrega.trim(), forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        })
        vaciar()
        navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } })
      } catch (error: unknown) { setError(handleApiError(error, 'No fue posible confirmar la compra')) }
    },
  })
  if (items.length === 0) return <EstadoVacio titulo="No hay productos para confirmar" descripcion="Agregá productos antes de continuar."
    accion={<Link to="/" className="boton boton-primario">Ir al catálogo</Link>} />
  return <>
    <h1 className="mb-7 text-3xl font-black">Confirmar compra</h1>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><h2 className="mb-5 text-xl font-bold">Datos de entrega</h2>
        <form noValidate className="space-y-5" onSubmit={(evento) => { evento.preventDefault(); if (!compra.isPending) void formulario.handleSubmit() }}>
          <formulario.Field name="direccion_entrega" validators={{ onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 5 || largo > 200 ? 'Ingresá una dirección de entre 5 y 200 caracteres' : undefined
          } }}>
            {(campo) => <Input etiqueta="Dirección de entrega" name={campo.name} autoComplete="street-address" required maxLength={200}
              disabled={compra.isPending} value={campo.state.value} onChange={(evento) => campo.handleChange(evento.target.value)} onBlur={campo.handleBlur}
              error={campo.state.meta.isTouched ? campo.state.meta.errors.join('. ') || undefined : undefined} />}
          </formulario.Field>
          <formulario.Field name="forma_pago" validators={{ onChange: ({ value }) => ['EFECTIVO', 'TRANSFERENCIA'].includes(value) ? undefined : 'Elegí una forma de pago válida' }}>
            {(campo) => <div className="space-y-2"><label htmlFor="forma-pago" className="block text-sm font-semibold">Forma de pago</label>
              <select id="forma-pago" className="campo" value={campo.state.value} disabled={compra.isPending} onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value as FormaPago)}>
                <option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option>
              </select></div>}
          </formulario.Field>
          <formulario.Field name="notas">
            {(campo) => <div className="space-y-2"><label htmlFor="notas-pedido" className="block text-sm font-semibold">Notas (opcional)</label>
              <textarea id="notas-pedido" className="campo min-h-24" value={campo.state.value} disabled={compra.isPending}
                onChange={(evento) => campo.handleChange(evento.target.value)} onBlur={campo.handleBlur} /></div>}
          </formulario.Field>
          {error && <EstadoError mensaje={error} />}
          {error && <p className="texto-secundario text-sm">Tu carrito se conserva. Si se interrumpió la conexión, revisá Mis pedidos antes de volver a confirmar: el servidor podría haber recibido la compra.</p>}
          <formulario.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting]}>
            {([puedeEnviar, enviando]) => <Button type="submit" className="w-full" cargando={enviando || compra.isPending} disabled={!puedeEnviar}>Confirmar pedido</Button>}
          </formulario.Subscribe>
          <Link to="/carrito" className="enlace-nav">Volver al carrito</Link>
        </form>
      </Card>
      <Card><h2 className="mb-5 text-xl font-bold">Resumen estimado</h2>
        <ul className="space-y-3">{items.map((item) => <li key={item.producto_id} className="flex flex-wrap justify-between gap-2">
          <span>{item.cantidad} × {item.nombre}</span><span>{moneda(subtotal(item.precio_unitario, item.cantidad))}</span>
        </li>)}</ul>
        <p className="mt-6 text-xl font-black">Total estimado: {moneda(total())}</p>
        <p className="texto-secundario mt-4 text-sm">El backend valida disponibilidad y stock y calcula el precio definitivo al confirmar. El pago es manual; esta pantalla no realiza cobros en línea.</p>
      </Card>
    </div>
  </>
}

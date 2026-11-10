import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  stock_referencia?: number
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

function validarCantidad(cantidad: number): void {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) throw new Error('La cantidad debe ser un entero positivo')
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: (producto, cantidad = 1) => {
    validarCantidad(cantidad)
    if (!Number.isSafeInteger(producto.producto_id) || producto.producto_id < 1
      || !Number.isFinite(producto.precio_unitario) || producto.precio_unitario < 0
      || !producto.nombre.trim()) throw new Error('Producto inválido para el carrito')
    const anterior = get().items.find((item) => item.producto_id === producto.producto_id)
    const nuevaCantidad = (anterior?.cantidad ?? 0) + cantidad
    validarCantidad(nuevaCantidad)
    set((estado) => ({ items: anterior
      ? estado.items.map((item) => item.producto_id === producto.producto_id
        ? { ...producto, cantidad: nuevaCantidad } : item)
      : [...estado.items, { ...producto, cantidad }],
    }))
  },
  quitar: (id) => set((estado) => ({ items: estado.items.filter((item) => item.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => {
    validarCantidad(cantidad)
    set((estado) => ({ items: estado.items.map((item) => item.producto_id === id ? { ...item, cantidad } : item) }))
  },
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((total, item) => total + Math.round(item.precio_unitario * 100) * item.cantidad, 0) / 100,
}), { name: 'foodstore-cart', partialize: (estado) => ({ items: estado.items }) }))

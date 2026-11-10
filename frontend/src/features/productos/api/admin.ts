import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Producto, ProductosPaginados } from '../types/producto'
export interface ProductoData {
  nombre: string; descripcion: string; precio_base: number; imagen_url: string; stock: number; disponible: boolean; categoria_id: number
}
export async function obtenerProductosAdmin(signal?: AbortSignal): Promise<Producto[]> {
  const productos: Producto[] = []
  for (let skip = 0; ; skip += 100) {
    const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params: { skip, limit: 100 }, signal })
    productos.push(...data.items)
    if (productos.length >= data.total || data.items.length === 0) return productos
  }
}
export async function crearProducto(datos: ProductoData): Promise<Producto> { return (await axiosInstance.post<Producto>('/productos', datos)).data }
export async function editarProducto(id: number, datos: Partial<ProductoData>): Promise<Producto> { return (await axiosInstance.put<Producto>(`/productos/${id}`, datos)).data }
export async function eliminarProducto(id: number): Promise<void> { await axiosInstance.delete(`/productos/${id}`) }
export async function cambiarStock(id: number, datos: { stock: number; disponible: boolean }): Promise<Producto> { return (await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos)).data }

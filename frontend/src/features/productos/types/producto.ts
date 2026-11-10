import type { Categoria } from '@/features/categorias'
export interface Producto {
  id: number; nombre: string; descripcion: string; precio_base: number; imagen_url: string
  stock: number; disponible: boolean; activo: boolean; categoria_id: number; categoria: Categoria
}
export interface ProductosPaginados { total: number; items: Producto[] }
export interface FiltrosCatalogo { pagina: number; porPagina: number; search: string; categoria_id?: number }

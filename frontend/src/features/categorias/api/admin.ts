import { axiosInstance } from '@/shared/api/axiosInstance'
import type { Categoria } from '../types/categoria'
export interface CategoriaData { nombre: string; descripcion: string }
export async function crearCategoria(datos: CategoriaData): Promise<Categoria> { return (await axiosInstance.post<Categoria>('/categorias', datos)).data }
export async function editarCategoria(id: number, datos: CategoriaData): Promise<Categoria> { return (await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)).data }
export async function eliminarCategoria(id: number): Promise<void> { await axiosInstance.delete(`/categorias/${id}`) }

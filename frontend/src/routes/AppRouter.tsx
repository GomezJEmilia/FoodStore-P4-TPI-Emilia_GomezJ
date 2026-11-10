import { lazy, Suspense } from 'react'
import { Skeleton } from '@/shared/components/Skeleton'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, RegistroPage } from '@/features/auth'
import { CatalogoPage, CarritoPage } from '@/features/productos'
import { CheckoutPage, MisPedidosPage } from '@/features/pedidos'
import { MainLayout } from '@/shared/layout/MainLayout'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { ProtectedRoute } from './ProtectedRoute'

const AdminCategoriasPage = lazy(() => import('@/features/categorias/admin').then((modulo) => ({ default: modulo.AdminCategoriasPage })))
const AdminProductosPage = lazy(() => import('@/features/productos/admin').then((modulo) => ({ default: modulo.AdminProductosPage })))

const AdminPedidosPage = lazy(() => import('@/features/pedidos/admin').then((modulo) => ({ default: modulo.AdminPedidosPage })))
const ResumenPage = lazy(() => import('@/features/pedidos/admin').then((modulo) => ({ default: modulo.ResumenPage })))
const AdminUsuariosPage = lazy(() => import('@/features/usuarios/admin').then((modulo) => ({ default: modulo.AdminUsuariosPage })))

export function AppRouter() {
  return <BrowserRouter><Suspense fallback={<Skeleton />}><Routes><Route element={<MainLayout />}>
    <Route index element={<CatalogoPage />} />
    <Route path="carrito" element={<CarritoPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegistroPage />} />
    <Route path="registro" element={<Navigate to="/register" replace />} />
    <Route path="unauthorized" element={<EstadoVacio titulo="Acceso no permitido" descripcion="Tu cuenta no tiene permisos para esta sección." accion={<Link className="enlace-nav" to="/">Volver al catálogo</Link>} />} />
    <Route element={<ProtectedRoute />}>
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="mis-pedidos" element={<MisPedidosPage />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="admin/resumen" element={<ResumenPage />} />
      <Route path="admin/categorias" element={<AdminCategoriasPage />} />
      <Route path="admin/productos" element={<AdminProductosPage />} />
      <Route path="admin/pedidos" element={<AdminPedidosPage />} />
      <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
    </Route>
    <Route path="*" element={<EstadoVacio titulo="Página no encontrada" accion={<Link to="/" className="enlace-nav">Volver al catálogo</Link>} />} />
  </Route></Routes></Suspense></BrowserRouter>
}

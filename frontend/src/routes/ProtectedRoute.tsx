import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { Rol } from '@/features/auth'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Rol[] }) {
  const { usuario, checking, errorSesion, checkSession } = useAuth()
  const location = useLocation()
  if (checking) return <Skeleton />
  if (errorSesion) return <EstadoError mensaje={errorSesion} onReintentar={() => { void checkSession() }} />
  if (!usuario || usuario.disabled) return <Navigate to="/login" state={{ desde: location.pathname }} replace />
  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}

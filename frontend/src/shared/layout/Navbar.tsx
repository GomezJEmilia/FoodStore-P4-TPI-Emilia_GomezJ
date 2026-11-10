import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'

export function Navbar() {
  const { usuario, autenticado, esAdmin, logout, cargando } = useAuth()
  const darkMode = useThemeStore((estado) => estado.darkMode)
  const toggleTheme = useThemeStore((estado) => estado.toggleTheme)
  const cantidad = useCartStore((estado) => estado.items.reduce((total, item) => total + item.cantidad, 0))
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const enPanel = esAdmin && location.pathname.startsWith('/admin/')
  async function salir() {
    setError(null)
    try { await logout(); navigate('/login', { replace: true }) }
    catch (error: unknown) { setError(handleApiError(error, 'No fue posible cerrar sesión')) }
  }
  const enlace = ({ isActive }: { isActive: boolean }) => `enlace-nav ${isActive ? 'enlace-activo' : ''}`
  return <header className="superficie border-b">
    <nav aria-label="Navegación principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link to={enPanel ? "/admin/resumen" : "/"} className="text-xl font-black">Food Store{enPanel && <span className="texto-secundario ml-2 text-sm font-medium">Administración</span>}</Link>
      <div className="flex flex-wrap items-center gap-2">
        {enPanel ? <>
          {[
            ['/admin/resumen', 'Resumen'], ['/admin/categorias', 'Categorías'],
            ['/admin/productos', 'Productos'], ['/admin/pedidos', 'Pedidos'], ['/admin/usuarios', 'Usuarios'],
          ].map(([ruta, titulo]) => <NavLink key={ruta} to={ruta} className={enlace}>{titulo}</NavLink>)}
          <Link to="/" className="boton boton-secundario">Ver tienda</Link>
        </> : <>
          <NavLink to="/" end className={enlace}>Catálogo</NavLink>
          <NavLink to="/carrito" className={enlace}>Carrito ({cantidad})</NavLink>
        </>}
        {autenticado ? <>
          {!enPanel && <NavLink to="/mis-pedidos" className={enlace}>Mis pedidos</NavLink>}
          {esAdmin && !enPanel && <NavLink to="/admin/resumen" className={enlace}>Administración</NavLink>}
          <span className="texto-secundario max-w-52 break-words text-sm">{usuario?.full_name} · {esAdmin ? 'Admin' : 'Cliente'}</span>
          <Button variante="secundario" cargando={cargando} onClick={() => { void salir() }}>Cerrar sesión</Button>
        </> : <><NavLink to="/login" className={enlace}>Ingresar</NavLink><NavLink to="/register" className={enlace}>Registrarse</NavLink></>}
        <Button variante="secundario" onClick={toggleTheme} aria-pressed={darkMode} aria-label="Modo oscuro">{darkMode ? 'Tema claro' : 'Tema oscuro'}</Button>
      </div>
    </nav>
    {error && <p role="alert" className="texto-error mx-auto max-w-7xl px-4 pb-4">{error}</p>}
  </header>
}

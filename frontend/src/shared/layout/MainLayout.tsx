import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout() {
  return <div className="flex min-h-screen flex-col"><a href="#contenido" className="salto-contenido">Ir al contenido</a>
    <Navbar /><main id="contenido" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"><Outlet /></main>
    <footer className="texto-secundario border-tema border-t px-4 py-5 text-center text-sm">Food Store · Programación IV</footer></div>
}

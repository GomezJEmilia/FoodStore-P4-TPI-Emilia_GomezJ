import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro'
  cargando?: boolean
}

export function Button({ variante = 'primario', cargando = false, disabled, children, className = '', type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || cargando} aria-busy={cargando}
    className={`boton boton-${variante} ${className}`}>{cargando ? 'Procesando…' : children}</button>
}

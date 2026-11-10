import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { etiqueta: string; error?: string; ayuda?: string }

export function Input({ etiqueta, error, ayuda, id, className = '', ...props }: InputProps) {
  const generado = useId()
  const inputId = id ?? generado
  const descripcion = error ?? ayuda
  return <div className="space-y-2">
    <label htmlFor={inputId} className="block text-sm font-semibold">{etiqueta}</label>
    <input {...props} id={inputId} aria-invalid={error ? true : undefined}
      aria-describedby={descripcion ? `${inputId}-detalle` : undefined} className={`campo ${className}`} />
    {descripcion && <p id={`${inputId}-detalle`} className={error ? 'texto-error text-sm' : 'texto-secundario text-sm'}>{descripcion}</p>}
  </div>
}

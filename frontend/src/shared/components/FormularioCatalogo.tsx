import { useForm } from '@tanstack/react-form'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EstadoError } from './EstadoError'

export interface CampoCatalogo {
  nombre: string; etiqueta: string; tipo?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox'
  opciones?: { valor: string; etiqueta: string; deshabilitada?: boolean }[]
  validar?: (valor: string) => string | undefined
  paso?: string
}
interface Props {
  titulo: string; iniciales: Record<string, string>; campos: CampoCatalogo[]; guardando: boolean; error: string | null
  onGuardar: (datos: Record<string, string>) => Promise<void>; onCerrar: () => void
}

export function FormularioCatalogo({ titulo, iniciales, campos, guardando, error, onGuardar, onCerrar }: Props) {
  const formulario = useForm({ defaultValues: iniciales, onSubmit: async ({ value }) => { await onGuardar(value) } })
  return <Modal titulo={titulo} onCerrar={onCerrar} bloqueado={guardando}>
    <form noValidate className="space-y-5" onSubmit={(evento) => { evento.preventDefault(); if (!guardando) void formulario.handleSubmit() }}>
      {campos.map((config) => <formulario.Field key={config.nombre} name={config.nombre} validators={{ onChange: ({ value }) => config.validar?.(value) }}>
        {(campo) => {
          const errorCampo = campo.state.meta.isTouched ? campo.state.meta.errors.join('. ') || undefined : undefined
          const id = `catalogo-${config.nombre}`
          if (config.tipo === 'checkbox') return <label className="flex items-center gap-3" htmlFor={id}><input id={id} type="checkbox" disabled={guardando} checked={campo.state.value === 'true'} onBlur={campo.handleBlur} onChange={(evento) => campo.handleChange(String(evento.target.checked))} />{config.etiqueta}</label>
          if (config.tipo === 'select' || config.tipo === 'textarea') return <div className="space-y-2"><label htmlFor={id} className="block text-sm font-semibold">{config.etiqueta}</label>
            {config.tipo === 'select' ? <select id={id} className="campo" disabled={guardando} value={campo.state.value} onBlur={campo.handleBlur} onChange={(evento) => campo.handleChange(evento.target.value)} aria-invalid={!!errorCampo} aria-describedby={errorCampo ? `${id}-error` : undefined}>
              {config.opciones?.map((opcion) => <option key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada}>{opcion.etiqueta}</option>)}
            </select> : <textarea id={id} className="campo min-h-24" disabled={guardando} value={campo.state.value} onBlur={campo.handleBlur} onChange={(evento) => campo.handleChange(evento.target.value)} />}
            {errorCampo && <p id={`${id}-error`} className="texto-error text-sm">{errorCampo}</p>}</div>
          return <Input id={id} etiqueta={config.etiqueta} type={config.tipo ?? 'text'} step={config.paso} disabled={guardando} value={campo.state.value} onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)} error={errorCampo} />
        }}
      </formulario.Field>)}
      {error && <EstadoError mensaje={error} />}
      <div className="flex flex-wrap justify-end gap-3"><Button variante="secundario" disabled={guardando} onClick={onCerrar}>Cancelar</Button>
        <formulario.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting]}>{([puede, enviando]) => <Button type="submit" disabled={!puede} cargando={guardando || enviando}>Guardar</Button>}</formulario.Subscribe>
      </div>
    </form>
  </Modal>
}

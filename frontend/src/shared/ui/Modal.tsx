import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps { titulo: string; children: ReactNode; onCerrar: () => void; bloqueado?: boolean }

export function Modal({ titulo, children, onCerrar, bloqueado = false }: ModalProps) {
  const tituloId = useId()
  const panel = useRef<HTMLElement>(null)
  const cerrar = useRef(onCerrar)
  const bloqueo = useRef(bloqueado)
  useEffect(() => { cerrar.current = onCerrar; bloqueo.current = bloqueado }, [onCerrar, bloqueado])
  useEffect(() => {
    const anterior = document.activeElement
    const scroll = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    function teclado(evento: KeyboardEvent) {
      if (evento.key === 'Escape') { evento.preventDefault(); if (!bloqueo.current) cerrar.current() }
      if (evento.key !== 'Tab') return
      const elementos = Array.from(panel.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
      ) ?? []).filter((elemento) => elemento.getClientRects().length > 0)
      const primero = elementos[0], ultimo = elementos.at(-1)
      if (!primero) { evento.preventDefault(); panel.current?.focus(); return }
      if (evento.shiftKey && (document.activeElement === primero || document.activeElement === panel.current)) {
        evento.preventDefault(); ultimo?.focus()
      } else if (!evento.shiftKey && (document.activeElement === ultimo || document.activeElement === panel.current)) {
        evento.preventDefault(); primero.focus()
      }
    }
    document.addEventListener('keydown', teclado)
    return () => {
      document.body.style.overflow = scroll
      document.removeEventListener('keydown', teclado)
      if (anterior instanceof HTMLElement) anterior.focus()
    }
  }, [])
  return createPortal(<div className="modal-fondo" onClick={(evento) => {
    if (evento.target === evento.currentTarget && !bloqueado) onCerrar()
  }}>
    <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={tituloId} aria-busy={bloqueado}
      className="superficie max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border p-6 shadow-xl outline-none">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={tituloId} className="text-xl font-bold">{titulo}</h2>
        <Button variante="secundario" onClick={onCerrar} disabled={bloqueado} aria-label="Cerrar modal">×</Button>
      </div>{children}
    </section>
  </div>, document.body)
}

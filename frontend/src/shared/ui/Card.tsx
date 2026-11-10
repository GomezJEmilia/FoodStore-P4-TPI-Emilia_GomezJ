import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`superficie rounded-2xl border p-6 shadow-sm ${className}`} />
}

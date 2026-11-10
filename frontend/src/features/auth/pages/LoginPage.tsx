import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { AuthCard } from '../components/AuthCard'
import { useAuth } from '../hooks/useAuth'
import { destinoTrasLogin, validarUsername } from '../validaciones'

function estadoNavegacion(valor: unknown): { desde?: unknown; registrado?: unknown; username?: unknown } {
  return typeof valor === 'object' && valor !== null ? valor : {}
}

export function LoginPage() {
  const { usuario, autenticado, checking, cargando, errorSesion, checkSession, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const estado = estadoNavegacion(location.state)
  const [error, setError] = useState<string | null>(null)
  const formulario = useForm({
    defaultValues: { username: typeof estado.username === 'string' ? estado.username : '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const actual = await login({ username: value.username.trim().toLowerCase(), password: value.password })
        if (actual && !actual.disabled) navigate(destinoTrasLogin(actual.role, estado.desde), { replace: true })
      } catch (error: unknown) {
        setError(handleApiError(error, 'No fue posible iniciar sesión'))
      }
    },
  })
  if (checking && !cargando) return <Skeleton filas={2} />
  if (autenticado && usuario) return <Navigate to={destinoTrasLogin(usuario.role, estado.desde)} replace />
  return <AuthCard titulo="Iniciar sesión" descripcion="Ingresá con tu nombre de usuario y contraseña.">
    {estado.registrado === true && <p role="status" className="mb-5 rounded-lg border border-tema p-3">Cuenta creada correctamente. Ya podés iniciar sesión.</p>}
    {errorSesion && <div className="mb-5"><EstadoError mensaje={errorSesion} onReintentar={() => { void checkSession() }} /></div>}
    <form noValidate onSubmit={(evento) => { evento.preventDefault(); if (!cargando) void formulario.handleSubmit() }} className="space-y-5">
      <formulario.Field name="username" validators={{ onChange: ({ value }) => validarUsername(value), onBlur: ({ value }) => validarUsername(value) }}>
        {(campo) => <Input etiqueta="Nombre de usuario" name={campo.name} autoComplete="username" autoCapitalize="none" spellCheck={false}
          required maxLength={50} value={campo.state.value} onBlur={campo.handleBlur} disabled={cargando}
          onChange={(evento) => { campo.handleChange(evento.target.value); setError(null) }}
          error={campo.state.meta.isTouched ? campo.state.meta.errors.join('. ') || undefined : undefined} />}
      </formulario.Field>
      <formulario.Field name="password" validators={{ onChange: ({ value }) => value ? undefined : 'Ingresá tu contraseña', onBlur: ({ value }) => value ? undefined : 'Ingresá tu contraseña' }}>
        {(campo) => <Input etiqueta="Contraseña" name={campo.name} type="password" autoComplete="current-password" required
          value={campo.state.value} onBlur={campo.handleBlur} disabled={cargando}
          onChange={(evento) => { campo.handleChange(evento.target.value); setError(null) }}
          error={campo.state.meta.isTouched ? campo.state.meta.errors.join('. ') || undefined : undefined} />}
      </formulario.Field>
      {error && <EstadoError mensaje={error} />}
      <formulario.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting]}>
        {([puedeEnviar, enviando]) => <Button type="submit" className="w-full" cargando={enviando || cargando} disabled={!puedeEnviar}>Ingresar</Button>}
      </formulario.Subscribe>
    </form>
    <p className="texto-secundario mt-6 text-sm">¿Todavía no tenés cuenta? <Link to="/register" className="font-semibold underline underline-offset-4">Registrate</Link></p>
  </AuthCard>
}

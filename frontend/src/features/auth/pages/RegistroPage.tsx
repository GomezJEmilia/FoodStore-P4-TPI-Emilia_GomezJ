import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { handleApiError } from '@/shared/api/handleApiError'
import { AuthCard } from '../components/AuthCard'
import { useAuth } from '../hooks/useAuth'
import { useRegistro } from '../hooks/useRegistro'
import { destinoTrasLogin, validarEmail, validarNombre, validarPassword, validarUsername } from '../validaciones'

const campos = [
  { nombre: 'username', etiqueta: 'Nombre de usuario', tipo: 'text', autocomplete: 'username', validar: validarUsername, maximo: 50 },
  { nombre: 'full_name', etiqueta: 'Nombre completo', tipo: 'text', autocomplete: 'name', validar: validarNombre, maximo: 200 },
  { nombre: 'email', etiqueta: 'Correo electrónico', tipo: 'email', autocomplete: 'email', validar: validarEmail, maximo: 254 },
  { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', autocomplete: 'new-password', validar: validarPassword, maximo: undefined },
] as const

export function RegistroPage() {
  const { usuario, autenticado, checking } = useAuth()
  const registro = useRegistro()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const formulario = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const datos = { username: value.username.trim().toLowerCase(), full_name: value.full_name.trim(), email: value.email.trim().toLowerCase(), password: value.password }
        await registro.mutateAsync(datos)
        navigate('/login', { replace: true, state: { registrado: true, username: datos.username } })
      } catch (error: unknown) { setError(handleApiError(error, 'No fue posible crear la cuenta')) }
    },
  })
  if (checking) return <Skeleton filas={2} />
  if (autenticado && usuario) return <Navigate to={destinoTrasLogin(usuario.role, undefined)} replace />
  return <AuthCard titulo="Crear cuenta" descripcion="Registrate para confirmar compras y consultar tus pedidos.">
    <form noValidate onSubmit={(evento) => { evento.preventDefault(); if (!registro.isPending) void formulario.handleSubmit() }} className="space-y-5">
      {campos.map((config) => <formulario.Field key={config.nombre} name={config.nombre}
        validators={{ onChange: ({ value }) => config.validar(value), onBlur: ({ value }) => config.validar(value) }}>
        {(campo) => <Input etiqueta={config.etiqueta} name={campo.name} type={config.tipo} autoComplete={config.autocomplete}
          required maxLength={config.maximo} disabled={registro.isPending} value={campo.state.value} onBlur={campo.handleBlur}
          autoCapitalize={config.nombre === 'full_name' ? 'words' : 'none'}
          onChange={(evento) => { campo.handleChange(evento.target.value); setError(null) }}
          ayuda={config.nombre === 'password' ? 'Al menos ocho caracteres; máximo 72 bytes UTF-8.' : undefined}
          error={campo.state.meta.isTouched ? campo.state.meta.errors.join('. ') || undefined : undefined} />}
      </formulario.Field>)}
      {error && <EstadoError mensaje={error} />}
      <formulario.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting]}>
        {([puedeEnviar, enviando]) => <Button type="submit" className="w-full" cargando={enviando || registro.isPending} disabled={!puedeEnviar}>Crear cuenta</Button>}
      </formulario.Subscribe>
    </form>
    <p className="texto-secundario mt-6 text-sm">¿Ya tenés cuenta? <Link to="/login" className="font-semibold underline underline-offset-4">Iniciá sesión</Link></p>
  </AuthCard>
}

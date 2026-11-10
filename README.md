# Food Store — Trabajo Práctico Integrador

**Materia:** Programación IV  
**Estudiante:** Emilia Gómez Juárez

Aplicación Full Stack para un local de comidas. Permite consultar el catálogo, preparar un carrito, realizar pedidos y administrarlos desde un panel con acceso por rol.

## Tecnologías

| Backend | Frontend |
|---|---|
| Python 3.13 | React + TypeScript |
| FastAPI | Vite |
| SQLModel y SQLAlchemy | Tailwind CSS |
| PostgreSQL | React Router |
| JWT y bcrypt | Axios |
| Repository y Unit of Work | TanStack Query, Form y Table |
| | Zustand |

Las versiones están fijadas en `backend/requirements.txt` y `frontend/package.json`. El frontend incluye `pnpm-lock.yaml`.

## Funcionalidades

### Visitantes

- Consultar el catálogo público.
- Buscar productos y filtrar por categoría.
- Recorrer páginas del catálogo.
- Agregar productos al carrito.
- Modificar cantidades y quitar productos.
- Conservar el carrito al recargar.
- Registrarse e iniciar sesión.

### Clientes autenticados

- Confirmar una compra con dirección, forma de pago y notas.
- Consultar sus pedidos y los detalles históricos.
- Cancelar sus propios pedidos mientras estén pendientes.
- Cerrar sesión.

### Administradores

- Crear, editar y dar de baja categorías y productos.
- Modificar stock y disponibilidad.
- Consultar todos los pedidos.
- Avanzar o cancelar pedidos según su estado.
- Consultar el resumen del negocio.
- Activar y desactivar usuarios.

La aplicación incluye tema claro y oscuro persistente.

## Organización del proyecto

| Carpeta | Contenido |
|---|---|
| `backend/app/core/` | Configuración, conexión, seguridad, dependencias, repositorio base y UoW |
| `backend/app/modules/` | Autenticación, usuarios, categorías, productos y pedidos |
| `backend/app/db/` | Registro de modelos y seed |
| `backend/tests/` | Archivos `.http` opcionales de comprobación |
| `frontend/src/features/` | Funcionalidades organizadas por dominio |
| `frontend/src/shared/` | Cliente HTTP, componentes, layout y utilidades compartidas |
| `frontend/src/store/` | Sesión, carrito y tema |
| `frontend/src/routes/` | Rutas y protección por sesión y rol |

## Requisitos

- Python 3.13.
- PostgreSQL 15 o superior.
- Node.js 24 o superior.
- pnpm 10 o superior.

Los comandos siguientes están preparados para PowerShell.

## 1. Crear la base de datos

Abrir PostgreSQL como administrador. Ajustar la ruta a la versión instalada:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

Crear un rol exclusivo para el proyecto:

```sql
CREATE ROLE foodstore_tpi_user LOGIN;
```

Asignarle una contraseña mediante el comando interactivo:

```text
\password foodstore_tpi_user
```

Crear la base:

```sql
CREATE DATABASE foodstore_tpi_db OWNER foodstore_tpi_user;
```

Salir:

```text
\q
```

Estos pasos se realizan una sola vez y no modifican las bases de los trabajos anteriores.

## 2. Configurar el backend

Desde la raíz del proyecto:

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m pip check
Copy-Item .env.example .env
```

La copia de `.env.example` se realiza en la primera instalación. Si `.env` ya está configurado, conservarlo.

Configurar `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg2://foodstore_tpi_user:CAMBIAR_PASSWORD@localhost:5432/foodstore_tpi_db

SECRET_KEY=REEMPLAZAR_POR_UNA_CLAVE_ALEATORIA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

FRONTEND_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

SEED_ADMIN_PASSWORD=Admin1234!
```

Reemplazar la contraseña de PostgreSQL y generar una clave de firma:

```powershell
py -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copiar el resultado en `SECRET_KEY`.

Si la contraseña de PostgreSQL contiene caracteres reservados de URL, deben codificarse en `DATABASE_URL`; por ejemplo, `@` se representa como `%40`.

Comprobar la conexión:

```powershell
py -c "from app.core.database import comprobar_conexion; comprobar_conexion(); print('PostgreSQL conectado')"
```

No incluir `.env` en el repositorio ni en la entrega.

## 3. Crear tablas y cargar datos iniciales

Desde `backend`, con el entorno virtual activado:

```powershell
py -m app.db.seed
```

El comando crea las tablas faltantes y carga, sobre una base vacía:

- Un administrador.
- Tres categorías.
- Ocho productos con stock.

### Administrador de demostración

| Campo | Valor predeterminado |
|---|---|
| Username | `admin` |
| Contraseña | `Admin1234!` |

La contraseña inicial puede configurarse con `SEED_ADMIN_PASSWORD` antes de crear la cuenta. Cambiar esa variable después no modifica una contraseña ya guardada.

### Catálogo inicial

| Categoría | Productos |
|---|---|
| Hamburguesas | Clásica, con queso y vegetariana |
| Acompañamientos | Papas fritas y aros de cebolla |
| Bebidas | Agua mineral, gaseosa y café |

El seed puede ejecutarse nuevamente sin duplicar las entradas que coincidan por sus identificadores de búsqueda.

No restablece contraseñas, no repone stock, no sobrescribe precios y no reactiva registros dados de baja. Los productos se identifican por nombre normalizado y categoría; renombrarlos o moverlos puede hacer que una ejecución posterior agregue la entrada original.

El proyecto utiliza `create_all_tables()`, sin Alembic. Este mecanismo crea tablas faltantes, pero no modifica estructuras existentes.

## 4. Ejecutar el backend

Desde `backend`, con `.venv` activado:

```powershell
py -m uvicorn app.main:app --reload
```

Direcciones disponibles:

- API: http://localhost:8000/api/v1
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI: http://localhost:8000/openapi.json
- Comprobación de conexión: http://localhost:8000/api/v1/health

Swagger permite consultar y probar endpoints. ReDoc ofrece otra presentación del mismo contrato de la API.

Para detener el servidor: `Ctrl+C`.

## 5. Configurar y ejecutar el frontend

Abrir otra terminal desde la raíz del proyecto:

```powershell
cd frontend
pnpm install --frozen-lockfile
Copy-Item .env.example .env
```

Conservar un `.env` existente si ya está configurado.

Su contenido debe incluir:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Comprobar e iniciar:

```powershell
pnpm lint
pnpm build
pnpm dev
```

Abrir:

http://localhost:5173

El frontend no utiliza `.venv`.

Usar `localhost` tanto en el frontend como en el backend para mantener coherencia con las cookies y CORS. Vite tiene configurado el puerto 5173 y no cambia automáticamente a otro si está ocupado.

## Modelo de datos

El modelo contiene cinco entidades:

- **Usuario:** identidad, credenciales protegidas, rol y estado de acceso.
- **Categoria:** clasificación de productos.
- **Producto:** categoría, precio, imagen, stock y disponibilidad.
- **Pedido:** usuario, entrega, forma de pago, estado y total.
- **DetallePedido:** producto, cantidad y copia histórica del nombre y precio.

Relaciones:

- Una categoría tiene muchos productos.
- Un usuario tiene muchos pedidos.
- Un pedido contiene varios detalles.
- Un producto puede aparecer en distintos detalles.

Cada producto pertenece a una única categoría.

## Arquitectura del backend

| Pieza | Responsabilidad |
|---|---|
| Model | Representar tablas y relaciones |
| Schema | Validar entradas y definir respuestas |
| Repository | Consultar y modificar entidades, sin confirmar transacciones |
| Unit of Work | Compartir sesión, confirmar o revertir y cerrar |
| Service | Aplicar reglas de negocio y coordinar operaciones |
| Router | Recibir HTTP, aplicar dependencias y traducir errores |

Los services utilizan el UoW mediante `with`.

Si el bloque termina correctamente, el UoW confirma la transacción. Ante una excepción o un fallo al confirmar, revierte los cambios y cierra la sesión.

`flush()` envía cambios a la base y permite obtener IDs sin confirmar la transacción.

## Autenticación y permisos

El registro público crea siempre cuentas con rol `user`.

El login recibe un formulario OAuth2 con `username` y `password`. El backend genera un JWT y lo guarda en la cookie `access_token`, configurada como HttpOnly.

El frontend:

- Utiliza Axios con `withCredentials: true`.
- Nunca lee ni almacena el JWT.
- Persiste únicamente el usuario público en AuthStore.
- Comprueba `/auth/me` al iniciar.
- No habilita rutas a partir de los datos persistidos mientras esa comprobación está pendiente.
- Limpia la caché del servidor al cambiar o cerrar sesión.

El backend consulta el estado actual del usuario en las peticiones autenticadas. Ocultar una acción en la interfaz no reemplaza la autorización del servidor.

| Situación | Respuesta habitual |
|---|---|
| Sesión ausente o inválida | 401 |
| Rol insuficiente o pedido ajeno | 403 |
| Cuenta desactivada | 400 |
| Recurso inexistente o dado de baja | 404 |
| Nombre de categoría o cuenta duplicado | 409 |
| Datos de entrada inválidos | 422 |

El administrador no puede desactivar su propia cuenta. La interfaz oculta esa acción y el backend también la rechaza.

## Catálogo y bajas lógicas

Las lecturas de categorías y productos activos son públicas. Las escrituras requieren administrador.

El nombre de categoría es único sin distinguir mayúsculas y espacios exteriores. Su nombre queda reservado después de la baja.

Los nombres de productos pueden repetirse.

Dar de baja una categoría no elimina ni oculta sus productos. Al editar uno de ellos puede conservarse su categoría inactiva o seleccionarse otra activa.

Las bajas cambian `activo` a `false`; no eliminan las filas. Los usuarios utilizan `disabled`.

Las actualizaciones mediante PUT son parciales según el contrato del trabajo: los campos omitidos se conservan. Valores como `0` y `false` se procesan correctamente.

## Carrito y compra

El catálogo utiliza búsqueda, filtro por categoría y paginación del servidor.

Después de agregar un producto, la tarjeta muestra controles para sumar o restar unidades. Restar la última unidad elimina la línea.

El carrito persiste al recargar y al cerrar sesión. Sus precios, stock y total son orientativos; agregar productos no reserva existencias.

Al confirmar se envían únicamente:

- IDs y cantidades de los productos.
- Dirección de entrega.
- Forma de pago.
- Notas opcionales.

El usuario se obtiene de la sesión. El backend valida los productos, su disponibilidad y stock, y calcula los importes definitivos.

Si la compra falla, se conserva el carrito. Después de una respuesta exitosa se vacía y se abre Mis pedidos.

No hay reintento automático del envío. Si se pierde la conexión al confirmar, conviene consultar Mis pedidos antes de volver a enviarlo: el servidor podría haber recibido la compra.

El pago es manual mediante efectivo o transferencia; no se integra una pasarela.

## Pedidos y stock

La creación del pedido, sus detalles y el descuento de stock forman una única transacción.

Si un producto es inválido o no tiene stock suficiente, se revierte la operación completa.

Se utilizan bloqueos de filas en PostgreSQL para coordinar las modificaciones de stock y las transiciones del pedido.

Cada detalle conserva el nombre y precio del producto al comprar. Cambiar el catálogo después no modifica esos valores históricos.

### Estados

| Estado actual | Destinos válidos |
|---|---|
| PENDIENTE | EN_PREPARACION o CANCELADO |
| EN_PREPARACION | ENTREGADO o CANCELADO |
| ENTREGADO | Ninguno |
| CANCELADO | Ninguno |

El cliente solo puede cancelar sus pedidos propios en PENDIENTE.

El administrador puede avanzar o cancelar pedidos no terminales desde Administración → Pedidos.

Cancelar restituye el stock dentro de la misma transacción. Una segunda cancelación se rechaza antes de volver a restituirlo.

Los pedidos no se borran ni permiten editar sus líneas o totales.

## Panel administrativo

### Categorías y productos

- TanStack Table con búsqueda, ordenamiento y paginación.
- Formularios TanStack Form con precarga de edición.
- Confirmación antes de la baja.
- Errores visibles sin cerrar el formulario.
- Cambio específico de stock y disponibilidad.

La edición de productos envía únicamente campos modificados. Editar una descripción no sobrescribe un stock que no se tocó en el formulario.

### Pedidos

- Listado paginado.
- Filtro por estado aplicado en el servidor.
- Detalle histórico.
- Acciones según las transiciones permitidas.
- Confirmación antes de cambiar el estado.

### Resumen

Muestra:

- Pedidos pendientes.
- Pedidos en preparación.
- Pedidos entregados.
- Pedidos cancelados.
- Pedidos de hoy.
- Ingresos de pedidos entregados.

“Pedidos de hoy” utiliza medianoche a medianoche de Argentina, configurada como UTC−03:00. Las fechas se almacenan en UTC y los límites de la consulta se convierten a esa referencia.

Los ingresos corresponden a todos los pedidos entregados del historial, no solamente a los de hoy.

### Usuarios

- Tabla con username, nombre, correo, rol y estado.
- Activación y desactivación con confirmación.
- Autodesactivación oculta y rechazada por el backend.

## Estado del frontend

- **TanStack Query:** consultas, mutaciones e invalidación de datos del servidor.
- **TanStack Form:** formularios y validaciones.
- **TanStack Table:** tablas administrativas.
- **Zustand:** sesión, carrito y tema.
- **React Router:** navegación y protección por rol.

Los cambios de pedidos invalidan también resumen y productos. Los cambios de categorías actualizan sus listados y los productos relacionados.

El Navbar adapta sus enlaces al contexto: navegación de compra en la tienda y navegación administrativa dentro del panel, con un acceso para volver a la tienda.

## Rutas principales

| Ruta | Acceso |
|---|---|
| `/` | Público |
| `/carrito` | Público |
| `/login` | Público |
| `/register` | Público |
| `/checkout` | Sesión |
| `/mis-pedidos` | Sesión |
| `/admin/resumen` | Admin |
| `/admin/categorias` | Admin |
| `/admin/productos` | Admin |
| `/admin/pedidos` | Admin |
| `/admin/usuarios` | Admin |
| `/unauthorized` | Público |

## Comprobaciones

Frontend:

```powershell
pnpm lint
pnpm build
```

El único archivo `backend/tests/pruebas_TPI.http` reúne el recorrido esencial de endpoints y reglas. Es un apoyo opcional, no un requisito adicional de entrega.

Ejecutarlo de arriba hacia abajo con REST Client de VSCode y las cookies habilitadas, después del seed. Cambiar `marca` al repetirlo y ajustar la contraseña del administrador si se configuró otra. Los títulos indican el código esperado y los valores relevantes. Las peticiones nombradas deben ejecutarse antes de sus referencias a IDs.

Las 56 peticiones se ejecutaron en orden sobre SQLite aislado con los resultados esperados. Se verificaron también seed repetible, rollback sin datos parciales, restitución única de stock, conservación del precio histórico, cookie HttpOnly, documentación y CORS. Esto no sustituye la comprobación contra PostgreSQL.

Se realizaron comprobaciones del backend sobre SQLite aislado y pruebas del frontend con DOM simulado y respuestas HTTP controladas. Lint y build finalizaron sin errores.

Queda pendiente completar la revisión integral contra PostgreSQL y el navegador real, incluida la concurrencia de compras y cancelaciones. Las pruebas controladas no sustituyen esa integración.

### Recorrido manual recomendado

1. Ejecutar el seed dos veces y comprobar que no duplica datos.
2. Registrarse, iniciar sesión y recargar.
3. Buscar productos, agregarlos y modificar cantidades.
4. Recargar y comprobar la persistencia del carrito.
5. Confirmar una compra y revisar el detalle.
6. Cancelar un pedido pendiente y comprobar la restitución de stock.
7. Intentar una compra con stock insuficiente y verificar que no deje cambios parciales.
8. Comprobar que un cliente no acceda a pedidos ajenos ni al panel.
9. Administrar categorías, productos y estados de pedidos.
10. Desactivar un cliente con sesión abierta en otro perfil y comprobar el rechazo de su siguiente petición.
11. Revisar tema oscuro y pantallas angostas.

## Uso de inteligencia artificial

Se utilizó inteligencia artificial como asistente para planificar, explicar conceptos, proponer código y apoyar la revisión y documentación.

Las propuestas se contrastaron con la consigna y se sometieron a revisiones, compilación y pruebas. La asistencia no reemplaza la comprensión del código ni la responsabilidad sobre la entrega.

## Enlaces

- Repositorio público: **pendiente de completar**.
- Video de demostración: **pendiente de completar**.
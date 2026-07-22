# Guía de Despliegue - Nuevo El Salvador Shop

## Requisitos Previos

- Node.js 18+ instalado
- npm, yarn, pnpm o bun
- Cuenta en [Supabase.com](https://supabase.com)
- Git (opcional)

## Paso 1: Configurar Supabase

### 1.1 Crear un Nuevo Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Haz clic en "New Project"
3. Completa los detalles:
   - **Project Name**: `nuevo-el-salvador-shop`
   - **Database Password**: Genera una contraseña segura
   - **Region**: Elige la más cercana a El Salvador (us-east-1 recomendado)
4. Espera a que se cree el proyecto (5-10 minutos)

### 1.2 Obtener las Credenciales

1. Ve a Settings → API
2. Copia estos valores:
   - **Project URL** → `SUPABASE_URL_2`
   - **Public API Key (Anon)** → `SUPABASE_PUBLISHABLE_KEY_3`
   - **Service Role Key** → `SUPABASE_SECRET_KEY_3` (CONFIDENCIAL)
   - **JWKS URL** → `SUPABASE_JWKS_URL_2`

### 1.3 Crear Storage Bucket

1. Ve a Storage en el panel lateral izquierdo
2. Haz clic en "Create bucket"
3. Nombre: `productos`
4. No requiere ser público en este momento
5. Haz clic en "Create bucket"

## Paso 2: Configurar la Base de Datos

### 2.1 Ejecutar el Script SQL

1. Ve a SQL Editor en el panel lateral izquierdo
2. Haz clic en "New Query"
3. Copia todo el contenido de `scripts/setup-database.sql`
4. Pégalo en el editor SQL
5. Haz clic en "Run" (esquina inferior derecha)
6. Espera a que se complete sin errores

**Qué se crea:**
- Tabla `profiles` (datos de usuarios extendidos)
- Tabla `categories` (categorías de productos)
- Tabla `products` (catálogo de productos)
- Tabla `product_variants` (variantes de productos)
- Tabla `cart_items` (carrito de compras)
- Tabla `orders` (pedidos)
- Tabla `order_items` (items en pedidos)
- Row Level Security policies para seguridad
- Índices para performance
- Datos de muestra para pruebas

## Paso 3: Clonar y Configurar el Proyecto

### 3.1 Clonar el Repositorio (o descargar)

```bash
# Si tienes Git
git clone <tu-repo>
cd nuevo-el-salvador-shop

# O simplemente descargar los archivos
```

### 3.2 Instalar Dependencias

```bash
pnpm install
# o
npm install
# o
yarn install
```

### 3.3 Configurar Variables de Entorno

Edita `.env.local` con tus credenciales:

```bash
# Abre el archivo .env.local
nano .env.local

# O ábrelo con tu editor favorito y reemplaza:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
SUPABASE_SECRET_KEY=your-service-role-key-here
SUPABASE_JWKS_URL=https://your-project-id.supabase.co/auth/v1/.well-known/jwks.json
```

## Paso 4: Ejecutar el Proyecto Localmente

```bash
pnpm dev
# o
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## Paso 5: Crear tu Cuenta de Administrador

### 5.1 Registrarse

1. Ve a http://localhost:3000/auth/sign-up
2. Crea una cuenta con tu email
3. Verifica tu email en Supabase (Development, no envía emails reales)

### 5.2 Otorgar Permisos de Admin

1. Ve a https://app.supabase.com
2. Ve a SQL Editor
3. Ejecuta esta query (reemplaza con tu email):

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'
);
```

Presiona "Run"

4. Recarga http://localhost:3000
5. Ahora deberías ver el enlace "Admin" en el header (si lo has agregado)

## Paso 6: Acceder al Panel de Administración

### Rutas Admin

- **Dashboard**: http://localhost:3000/admin
- **Gestión de Productos**: http://localhost:3000/admin/productos
- **Gestión de Pedidos**: http://localhost:3000/admin/pedidos

### En el Panel Admin Puedes:

1. **Crear Productos**: 
   - Nombre, descripción, precio
   - Subir imágenes a Supabase Storage
   - Asignar categoría y stock
   - Agregar badges (OFERTA, TOP VENTAS, etc)

2. **Ver Estadísticas**:
   - Total de productos
   - Total de pedidos
   - Ingresos
   - Usuarios activos

3. **Gestionar Pedidos**:
   - Ver todos los pedidos
   - Cambiar estado (Pendiente → Procesando → Enviado → Entregado)

## Paso 7: Prueba la Tienda

### Comprar como Cliente:

1. Abre otra pestaña en incógnito o desconecta
2. Ve a http://localhost:3000
3. Deberías ver los productos que creaste
4. Agrega productos al carrito
5. El carrito debe funcionar sin necesidad de comprar (no hay pago conectado aún)

### Los Productos Aparecen Automáticamente:

- Los productos creados en admin se muestran en homepage
- Las imágenes se cargan desde Supabase Storage
- Los precios y descuentos se calculan automáticamente

## Estructura de Carpetas Importante

```
/app
  /admin                    ← Panel de administración
    /productos             ← Gestión de productos
    /pedidos               ← Gestión de pedidos
    page.tsx               ← Dashboard
    layout.tsx             ← Layout del admin
  /auth                     ← Autenticación
  /cart                     ← Carrito
  page.tsx                  ← Homepage

/components
  /admin
    /image-uploader.tsx    ← Carga de imágenes

/lib
  /supabase                 ← Clientes de Supabase

/scripts
  /setup-database.sql       ← Schema de BD (ya ejecutado)
```

## Variables de Entorno - Explicación

| Variable | Valor | Origen |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon Key | Supabase → Settings → API |
| `SUPABASE_SECRET_KEY` | Service Role Key | Supabase → Settings → API |
| `SUPABASE_JWKS_URL` | URL de JWKS | Supabase → Settings → API |

**IMPORTANTE**: 
- `SUPABASE_SECRET_KEY` es confidencial, NUNCA lo compartas
- Las variables con `NEXT_PUBLIC_` se envían al cliente (está bien que sean públicas)
- Las demás permanecen en el servidor (seguras)

## Solución de Problemas

### "Cannot find module '@supabase/ssr'"

```bash
pnpm install @supabase/ssr @supabase/supabase-js
```

### "Auth callback error"

Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcto (sin slash al final):
```
✓ https://your-project-id.supabase.co
✗ https://your-project-id.supabase.co/
```

### "No se ve la imagen del producto"

1. Verifica que el bucket `productos` exista en Storage
2. Verifica que el nombre sea exacto: `productos`
3. Intenta subir una imagen nuevamente

### "Access denied al crear producto"

Verifica que tu usuario tenga `is_admin = TRUE` en la BD:

```sql
SELECT id, email, (
  SELECT is_admin FROM public.profiles WHERE id = auth.users.id
) as is_admin FROM auth.users;
```

## Próximos Pasos

1. **Conectar Pagos** (Wompi o Stripe)
2. **Agregar Búsqueda y Filtros**
3. **Sistema de Reseñas**
4. **Notificaciones por Email**
5. **Desplegar a Producción**

## Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Producción
pnpm start

# Linter
pnpm lint

# TypeScript check
pnpm type-check
```

## Contacto y Soporte

Si encuentras problemas:
1. Revisa el console en DevTools (F12)
2. Revisa los logs en Supabase
3. Verifica que todas las variables de entorno sean correctas

---

**¡Listo!** 🚀 Tu tienda está configurada y lista para usar.

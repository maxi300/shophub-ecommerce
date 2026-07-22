# 🚀 DESPLIEGUE LOCAL - Nuevo El Salvador Shop

**Tiempo estimado: 10-15 minutos**

## Paso 1: Obtener Credenciales Supabase

### 1.1 Crear Proyecto en Supabase
1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Ingresa nombre: `nuevo-el-salvador-shop`
4. Elige región (más cercana a El Salvador: `us-east-1`)
5. Crea contraseña de BD fuerte
6. **Espera a que se cree** (~2-3 min)

### 1.2 Obtener Credenciales
En Settings → API, copia:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable Key (anon)** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Secret Key (service_role)** → `SUPABASE_SECRET_KEY`

En Settings → Auth, obtén:
- **JWKS URL** → copiar completo → `SUPABASE_JWKS_URL`

### 1.3 Crear Storage Bucket
1. Ve a Storage (sidebar izquierdo)
2. Click en "New Bucket"
3. Nombre: `productos`
4. ✅ Marca "Public bucket"
5. Crear

## Paso 2: Configurar Proyecto Local

### 2.1 Clonar/Descargar
```bash
# Si no lo tienes
cd ~/proyectos
# Tu proyecto debe estar aquí
cd nuevo-el-salvador-shop
```

### 2.2 Instalar Dependencias
```bash
pnpm install
# O si usas npm:
npm install
```

### 2.3 Configurar Variables de Entorno

**IMPORTANTE**: Los valores exactos van sin comillas

```bash
# Copiar template
cp .env.local .env.local.bak

# Editar .env.local con tus credenciales
nano .env.local
# O abre con VSCode:
code .env.local
```

**Contenido de `.env.local`:**
```
# Supabase URLs (SIN slash al final)
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWKS_URL=https://xyzabc.supabase.co/auth/v1/.well-known/jwks.json

# Next.js Auth Callback
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

**Verificar**: 
- `NEXT_PUBLIC_SUPABASE_URL` debe ser `https://...supabase.co` (SIN `/`)
- Si tienes el `.env.local` correcto, no aparecerá error

### 2.4 Crear BD y Tablas

1. Ve a Supabase Editor SQL
2. Abre el archivo: `/scripts/setup-database.sql`
3. **COPIA TODO el contenido**
4. En Supabase SQL Editor, **PEGA todo**
5. Click en "Run" (▶️) **ABAJO A LA DERECHA**
6. **Espera a que termine** (~10 segundos)
7. Si sale ✅ verde = ¡ÉXITO!

**Si hay error:**
- Revisa que el bucket `productos` exista
- Asegúrate que está marcado como "Public"
- Re-ejecuta sin espacios en blanco extra

## Paso 3: Iniciar Servidor Local

```bash
# Iniciar desarrollo
pnpm dev

# Debería ver:
# ▲ Next.js 16.0.0
# - Local:        http://localhost:3000
```

Abre en navegador: **http://localhost:3000**

## Paso 4: Crear Cuenta Admin

### 4.1 Crear Usuario
1. En la tienda (http://localhost:3000), click en "Registrarse"
2. Usa email de prueba: `admin@test.com`
3. Contraseña: `AdminPassword123!`
4. Registrate

### 4.2 Hacer Admin este Usuario

**En Supabase SQL Editor:**
```sql
-- Ejecuta esto:
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@test.com' 
  LIMIT 1
);
```

**Verificar:**
```sql
-- Consulta este para confirmar:
SELECT id, email, raw_user_meta_data, 
       (SELECT is_admin FROM profiles WHERE profiles.id = users.id) as is_admin
FROM auth.users 
WHERE email = 'admin@test.com';
```

### 4.3 Acceder al Admin Panel
```
http://localhost:3000/admin
```

Si ves el dashboard = ✅ LISTO!

## Paso 5: Agregar Primer Producto

### 5.1 Ir a Gestión de Productos
```
http://localhost:3000/admin/productos
```

### 5.2 Crear Producto
1. Click en "Crear Nuevo Producto"
2. Llena formulario:
   - **Nombre**: "Auriculares Inalámbricos"
   - **Descripción**: "Alta calidad con ANC"
   - **Precio**: 49.99
   - **Descuento**: 39.99
   - **Stock**: 100
   - **Categoría**: Electrónica (crear si no existe)
   - **Badge**: "-20%"
   - **Imagen**: Arrastra o haz click

3. Click en "Crear Producto"

### 5.3 Verificar en Tienda
```
http://localhost:3000
```

Deberías ver el producto en el grid!

## Paso 6: Agregar Más Productos (Opcional)

Repite el Paso 5 con:
- Cargador USB-C: $19.99
- Funda de teléfono: $12.99
- Audífonos deportivos: $79.99

## Troubleshooting

### ❌ "Cannot find module '@supabase/ssr'"
```bash
pnpm install @supabase/ssr @supabase/supabase-js
pnpm dev
```

### ❌ "NEXT_PUBLIC_SUPABASE_URL is required"
- Verifica `.env.local` tiene valores
- Verifica NO hay comillas
- Verifica NO hay espacios extra

### ❌ "Access denied" en admin
- Ejecuta SQL para hacer admin al usuario
- Cierra sesión y vuelve a loguearte

### ❌ "Upload image failed"
- Bucket `productos` debe ser **PUBLIC**
- En Supabase Storage → Productos → Policies
- Debe permitir insert/update/delete

### ❌ "Imagen no se muestra"
- Verifica URL en Supabase Storage
- Debe empezar con `https://...supabase.co/storage/...`

## URLs Útiles

| Sección | URL |
|---------|-----|
| Tienda | http://localhost:3000 |
| Login | http://localhost:3000/auth/login |
| Registro | http://localhost:3000/auth/sign-up |
| Carrito | http://localhost:3000/cart |
| **Admin Dashboard** | **http://localhost:3000/admin** |
| **Productos (Admin)** | **http://localhost:3000/admin/productos** |
| **Pedidos (Admin)** | **http://localhost:3000/admin/pedidos** |
| Supabase Console | https://app.supabase.com |

## Archivo .env.local Completo (Ejemplo)

```env
# URLs Supabase - Reemplaza con tus valores reales
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk1MzI1MzAwLCJleHAiOjE4NTMwOTEzMDB9.dummytoken123
SUPABASE_URL=https://xyzabc123.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk1MzI1MzAwLCJleHAiOjE4NTMwOTEzMDB9.dummytoken123
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTUzMjUzMDAsImV4cCI6MTg1MzA5MTMwMH0.dummytoken456
SUPABASE_JWKS_URL=https://xyzabc123.supabase.co/auth/v1/.well-known/jwks.json
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## ✅ Checklist de Verificación

- [ ] Supabase proyecto creado
- [ ] Credenciales copiadas a `.env.local`
- [ ] Bucket `productos` creado (public)
- [ ] SQL ejecutado en Supabase
- [ ] `pnpm install` completado
- [ ] `pnpm dev` corriendo sin errores
- [ ] Puede registrarse usuario
- [ ] Usuario hecho admin
- [ ] Puede acceder a `/admin`
- [ ] Puede crear producto
- [ ] Producto aparece en tienda
- [ ] Imagen se descarga correctamente

## 🎉 ¡Listo para Producción!

Una vez todo funciona en local, puedes:
1. Desplegar en **Vercel** (recomendado)
2. Desplegar en tu servidor
3. Agregar dominio personalizado
4. Integrar pagos (Wompi, Stripe)
5. Agregar más categorías y productos

Para más detalles, consulta:
- **DEPLOYMENT_GUIDE.md** - Despliegue completo
- **ADMIN_ARCHITECTURE.md** - Detalles técnicos
- **README.md** - Documentación general

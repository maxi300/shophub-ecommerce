# ✅ Checklist de Despliegue - Nuevo El Salvador Shop

Usa esta lista para asegurar que todo está configurado correctamente.

---

## 🔧 Pre-Requisitos

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] pnpm instalado (`pnpm --version`)
- [ ] Cuenta en Supabase.com
- [ ] Git configurado (opcional)

---

## 📱 Paso 1: Setup Supabase (5-10 min)

### 1.1 Crear Proyecto
- [ ] Ir a https://app.supabase.com
- [ ] Clic "New Project"
- [ ] Llenar:
  - [ ] Project Name: `nuevo-el-salvador-shop`
  - [ ] Database Password: Generar contraseña segura
  - [ ] Region: `us-east-1` (o cercana a El Salvador)
  - [ ] Esperar 5-10 minutos

### 1.2 Obtener Credenciales
- [ ] Ir a Settings → API
- [ ] Copiar `Project URL` → SUPABASE_URL_2
- [ ] Copiar `Public API Key (Anon)` → SUPABASE_PUBLISHABLE_KEY_3
- [ ] Copiar `Service Role Key` → SUPABASE_SECRET_KEY_3 ⚠️ CONFIDENCIAL
- [ ] Copiar `JWKS URL` → SUPABASE_JWKS_URL_2

### 1.3 Crear Storage Bucket
- [ ] Ir a Storage (sidebar izquierdo)
- [ ] Clic "Create bucket"
- [ ] Nombre: `productos` (exacto)
- [ ] [ ] Create bucket

### 1.4 Ejecutar SQL Schema
- [ ] Ir a SQL Editor
- [ ] New Query
- [ ] Copiar todo de `scripts/setup-database.sql`
- [ ] Pegar en editor SQL
- [ ] Clic "Run"
- [ ] ✅ Ver "Success" sin errores

---

## 📁 Paso 2: Setup Proyecto Local (5 min)

### 2.1 Clonar/Descargar
- [ ] Descargar archivo del proyecto
- [ ] `cd nuevo-el-salvador-shop`

### 2.2 Instalar Dependencias
```bash
pnpm install
```
- [ ] Esperar a que termine

### 2.3 Configurar .env.local
- [ ] Abrir archivo `.env.local`
- [ ] Reemplazar:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` con tu URL
  - [ ] `SUPABASE_URL` con tu URL
  - [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con tu Anon Key
  - [ ] `SUPABASE_PUBLISHABLE_KEY` con tu Anon Key
  - [ ] `SUPABASE_SECRET_KEY` con tu Service Role Key
  - [ ] `SUPABASE_JWKS_URL` con tu JWKS URL
- [ ] Guardar archivo

**Valores esperados:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xyz123.supabase.co (SIN slash al final)
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1Ni... (starts with eyJ)
```

---

## 🚀 Paso 3: Correr en Desarrollo (1 min)

### 3.1 Iniciar Dev Server
```bash
pnpm dev
```
- [ ] Ver: `ready - started server on 0.0.0.0:3000`
- [ ] Abrir http://localhost:3000
- [ ] ✅ Ver homepage con productos de prueba

### 3.2 Test Básico
- [ ] Ir a http://localhost:3000
- [ ] Ver grid de productos
- [ ] Ver categorías
- [ ] No hay errores en console (F12)

---

## 👤 Paso 4: Setup Admin (5 min)

### 4.1 Crear Cuenta
- [ ] Clic "Sign Up" en header
- [ ] Llenar email y contraseña
- [ ] Confirmación de email en Supabase (development, no envía)
- [ ] ✅ Logged in

### 4.2 Hacer Admin
- [ ] Copiar tu `user_id` (desde Supabase → Auth → Users)
- [ ] Ir a SQL Editor en Supabase
- [ ] Nueva query:
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE id = 'your-user-id-here';
```
- [ ] Ejecutar ("Run")
- [ ] Refrescar http://localhost:3000

### 4.3 Acceder a Admin
- [ ] Ir a http://localhost:3000/admin
- [ ] ✅ Ver dashboard sin errores

---

## 🛍️ Paso 5: Test Funcionalidades (10 min)

### 5.1 Crear Producto
- [ ] Ir a http://localhost:3000/admin/productos
- [ ] Clic "Nuevo Producto"
- [ ] Llenar:
  - [ ] Nombre: "Mi Primer Producto"
  - [ ] Precio: 19.99
  - [ ] Stock: 10
  - [ ] Imagen: Subir una foto (drag & drop)
  - [ ] ✅ Ver preview de imagen
- [ ] Clic "Crear Producto"
- [ ] ✅ Ver producto en lista

### 5.2 Ver en Tienda
- [ ] Abrir nueva pestaña incógnito
- [ ] Ir a http://localhost:3000
- [ ] ✅ Ver tu producto en homepage
- [ ] ✅ Ver imagen cargada

### 5.3 Test Carrito
- [ ] Clic en producto
- [ ] Clic "Agregar al carrito"
- [ ] Ir a /cart
- [ ] ✅ Ver producto en carrito

### 5.4 Gestión de Pedidos
- [ ] Ir a http://localhost:3000/admin/pedidos
- [ ] ✅ Ver lista de pedidos (vacía si es nuevo)
- [ ] Crear un pedido (via checkout en tienda si aplica)

---

## 🔒 Paso 6: Verificar Seguridad (5 min)

### 6.1 Verificar Protección Admin
- [ ] Abrir incógnito
- [ ] Ir a http://localhost:3000/admin
- [ ] ✅ Redirige a login

### 6.2 Verificar Non-Admin Access
- [ ] Registrar nuevo usuario (diferente email)
- [ ] Ir a http://localhost:3000/admin
- [ ] ✅ Redirige a home

### 6.3 Verificar RLS
- [ ] En console (F12), ejecutar:
```javascript
// Intentar acceso sin autenticación
fetch('http://localhost:3000/api/products', {
  headers: { 'Content-Type': 'application/json' }
})
```
- [ ] ✅ Debe funcionar (productos públicos)

---

## 📦 Paso 7: Preparar para Producción (opcional)

### 7.1 Build
```bash
pnpm run build
```
- [ ] ✅ Sin errores
- [ ] Ver "successfully built"

### 7.2 Production Preview
```bash
pnpm start
```
- [ ] Ir a http://localhost:3000
- [ ] ✅ Todo funciona igual

### 7.3 Environment Variables (Vercel/Hosting)
- [ ] Agregar `SUPABASE_SECRET_KEY` en hosting
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Agregar `SUPABASE_JWKS_URL`

---

## 🎉 Paso 8: Verificación Final

- [ ] ✅ Homepage carga con productos
- [ ] ✅ Admin panel accesible con is_admin = true
- [ ] ✅ Admin dashboard muestra estadísticas
- [ ] ✅ Puedo crear productos
- [ ] ✅ Puedo subir imágenes
- [ ] ✅ Imágenes aparecen en tienda
- [ ] ✅ Puedo gestionar pedidos
- [ ] ✅ No-admin usuarios no ven admin
- [ ] ✅ No hay errores en console

---

## 🚨 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Cannot find module @supabase/ssr" | `pnpm install @supabase/ssr` |
| "Auth callback error" | Verifica SUPABASE_URL (sin slash) |
| "Access Denied" al crear | Verifica `is_admin = TRUE` en BD |
| "No se ve imagen" | Verifica bucket "productos" existe |
| "SUPABASE_URL is required" | Verifica .env.local tiene valores |

---

## 📞 Checklist de Soporte

Si hay problema:
1. [ ] Verificar .env.local tiene valores correctos
2. [ ] Verificar SQL ejecutado sin errores
3. [ ] Verificar bucket "productos" existe
4. [ ] Abrir DevTools (F12) → Console → buscar errores
5. [ ] Verificar Supabase logs (if applicable)
6. [ ] Intentar `pnpm install` nuevamente

---

## ✅ Completado!

Cuando todos los items están checked ✅, ¡tu tienda está lista!

**Próximos pasos:**
- [ ] Agregar tus productos reales
- [ ] Agregar más usuarios admin
- [ ] Conectar pagos (Wompi, Stripe)
- [ ] Desplegar a producción

---

*Fecha: 2024-07-22*
*Proyecto: Nuevo El Salvador Shop*

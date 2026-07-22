# Admin Dashboard Architecture

## Overview

El panel de administración está construido con:
- **Frontend**: React 19 + Next.js 16
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Seguridad**: Middleware + RLS policies

## Protección de Rutas

### Middleware de Admin (`middleware.ts`)

```typescript
// Protege todas las rutas /admin/*
// Verifica:
// 1. Usuario está autenticado
// 2. Usuario tiene is_admin = TRUE en profiles
// Si no cumple, redirige a /
```

**Ubicación**: `/vercel/share/v0-project/middleware.ts`

**Comportamiento**:
- ✅ Usuario admin → Acceso permitido
- ❌ Usuario normal → Redirige a home
- ❌ Usuario no autenticado → Redirige a login

## Componentes Admin

### 1. Dashboard (`/admin`)

**Archivo**: `app/admin/page.tsx`

**Funcionalidades**:
- Estadísticas en tiempo real (productos, pedidos, ingresos, usuarios)
- Quick links a otros módulos
- Información de bienvenida

**Base de datos**:
```sql
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT SUM(total) FROM orders WHERE status = 'delivered';
SELECT COUNT(*) FROM profiles;
```

### 2. Gestión de Productos (`/admin/productos`)

**Archivo**: `app/admin/productos/page.tsx`

**Funcionalidades**:
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Subir imágenes

**Formulario Campos**:
```
- Nombre del Producto *
- Descripción
- Precio (USD) *
- Precio con Descuento
- Stock *
- Categoría
- Badge de Oferta (OFERTA, TOP VENTAS, etc)
- Imagen del Producto
- ☐ Producto activo (visible en tienda)
```

**RLS Policy**:
```sql
-- Solo admins pueden crear/editar/eliminar
-- Productos inactivos no se ven en tienda pública
WHERE is_admin = TRUE  -- Verificado en middleware también
```

### 3. ImageUploader Component (`components/admin/image-uploader.tsx`)

**Funcionalidades**:
- Drag & drop de imágenes
- Preview en tiempo real
- Upload a Supabase Storage
- Validaciones (tipo, tamaño)

**Flujo**:
```
1. Usuario selecciona imagen
2. Validar (tipo, tamaño <5MB)
3. Generar nombre único: timestamp-randomId.ext
4. Upload a bucket 'productos'
5. Obtener URL pública
6. Pasar URL al formulario
7. Guardar con producto
```

**Storage Path**:
```
/productos
  ├── 1702500000-abc123.jpg
  ├── 1702500001-def456.png
  └── ... (miles de imágenes)
```

**URL Pública**:
```
https://your-project.supabase.co/storage/v1/object/public/productos/1702500000-abc123.jpg
```

### 4. Gestión de Pedidos (`/admin/pedidos`)

**Archivo**: `app/admin/pedidos/page.tsx`

**Funcionalidades**:
- Ver todos los pedidos
- Ver detalles del pedido (cliente, artículos, total)
- Cambiar estado de envío

**Estados Disponibles**:
- 🟡 `pending` - Pendiente
- 🔵 `processing` - Procesando
- 🟣 `shipped` - Enviado
- 🟢 `delivered` - Entregado
- 🔴 `cancelled` - Cancelado

**Información Mostrada**:
```
- ID del pedido (primeros 8 caracteres)
- Estado actual (badge con color)
- Total del pedido
- Fecha y hora
- Nombre del cliente
- Dirección de envío
- Lista de artículos con cantidad y precio
- Botones para cambiar estado
```

**RLS Policy**:
```sql
-- Admins ven todos los pedidos
-- Clientes solo ven sus propios pedidos
```

## Admin Layout (`app/admin/layout.tsx`)

**Estructura**:
```
┌─────────────────────────────────────────┐
│  Admin Panel | Nuevo El Salvador Shop | [Logout]
├─────────────┬───────────────────────────┤
│             │                           │
│  Sidebar    │     Contenido             │
│  - Dashboard│     (children)            │
│  - Productos│                           │
│  - Pedidos  │                           │
│             │                           │
└─────────────┴───────────────────────────┘
```

**Navegación**:
- Dashboard → `/admin`
- Productos → `/admin/productos`
- Pedidos → `/admin/pedidos`
- Logout → POST `/auth/logout`

## Base de Datos - RLS Policies

### Para Productos (Solo Admin)

```sql
-- Admin puede leer todos (incluso inactivos)
CREATE POLICY "Admins can read all products" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Solo admin puede crear
CREATE POLICY "Only admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Solo admin puede editar
CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Solo admin puede eliminar
CREATE POLICY "Only admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );
```

### Para Pedidos (Admin puede ver todos)

```sql
-- Admin ve todos los pedidos
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Admin puede cambiar estado
CREATE POLICY "Admins can update order status" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );
```

## Flujo Completo: Crear y Vender un Producto

### 1. Admin Crea Producto

```
Admin → /admin/productos → "Nuevo Producto"
    ↓
Completa Formulario
    ├── Nombre: "Auriculares Inalámbricos"
    ├── Precio: 49.99
    ├── Stock: 25
    ├── Imagen: Sube archivo
    │   └── ImageUploader:
    │       ├── Valida tipo/tamaño
    │       ├── Genera nombre único
    │       ├── Upload a Storage 'productos'
    │       ├── Obtiene URL pública
    │       └── Muestra preview
    └── Otros campos...
    ↓
Clic "Crear Producto"
    ↓
Backend valida + crea en BD:
    INSERT INTO products (name, price, image_url, ...)
    ↓
RLS Policy verifica is_admin = TRUE ✓
    ↓
Producto guardado en BD
    ↓
URL imagen: https://project.supabase.co/.../productos/timestamp.jpg
```

### 2. Cliente ve Producto

```
Cliente → / (homepage)
    ↓
Cargar productos (SELECT * FROM products WHERE is_active = TRUE)
    ↓
RLS Policy: "Products are publicly readable"
    ↓
Mostrar grid:
    ├── Imagen: Cargar desde imagen_url
    ├── Nombre: "Auriculares Inalámbricos"
    ├── Precio: $49.99
    └── Botón: "Agregar al carrito"
    ↓
Cliente agrega al carrito
    ↓
Dato guardado: INSERT INTO cart_items (user_id, product_id, quantity)
```

### 3. Admin ve Venta

```
Admin → /admin/pedidos
    ↓
Cargar pedidos (SELECT * FROM orders)
    ↓
RLS Policy verifica is_admin = TRUE ✓
    ↓
Mostrar pedido:
    ├── Cliente: Nombre
    ├── Total: $49.99
    ├── Estado: "pending"
    ├── Artículos: "Auriculares Inalámbricos x1"
    └── Botón: Cambiar a "processing"
    ↓
Admin actualiza estado:
    UPDATE orders SET status = 'processing'
    ↓
RLS Policy verifica is_admin = TRUE ✓
```

## Storage Architecture

### Bucket: `productos`

```
Supabase Storage
└── productos/
    ├── 1702500000-abc123.jpg
    ├── 1702500001-def456.png
    ├── 1702500002-ghi789.webp
    └── ... (crecimiento sin límite)
```

### Políticas de Storage

**No es necesario crear RLS en Storage si confías en el middleware**

Alternativamente, en Supabase puedes:
```sql
-- Permitir subida solo a admins
-- Permitir lectura pública (para mostrar en tienda)
```

## Error Handling

### En Admin

```typescript
try {
  // Crear producto
  const { error } = await supabase
    .from('products')
    .insert([...])

  if (error) throw error
  // Éxito
} catch (error) {
  // Mostrar error al usuario
  console.error('[v0] Error:', error)
  // Toast/Alert con mensaje
}
```

### En Cliente

```typescript
// Si error es RLS policy:
// → Usuario no es admin
// → Redirige a login/home

// Si error es validación:
// → Mostrar mensaje de error en UI
```

## Performance Optimizations

### Índices Creados:
```sql
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
-- ... otros índices
```

### Queries Optimizadas:
```sql
-- Con índices, estas queries son rápidas:
SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC;
SELECT * FROM orders ORDER BY created_at DESC;
```

## Testing

### Como Admin:

```bash
# 1. Registrarse
http://localhost:3000/auth/sign-up

# 2. En Supabase:
UPDATE profiles SET is_admin = TRUE WHERE id = ...;

# 3. Acceder al admin
http://localhost:3000/admin

# 4. Crear producto + subir imagen
http://localhost:3000/admin/productos

# 5. Ver en homepage
http://localhost:3000
```

### Como Cliente:

```bash
# 1. En incógnito, ve a homepage
http://localhost:3000

# 2. Verás los productos del admin
# 3. Puedes agregar al carrito
# 4. (Pago no está conectado aún)
```

## Extensiones Futuras

- [ ] Variantes de productos (color, talla)
- [ ] Sistema de reseñas
- [ ] Búsqueda y filtros avanzados
- [ ] Reportes de ventas
- [ ] Integración de pagos (Wompi, Stripe)
- [ ] Notificaciones por email
- [ ] Bulk upload de productos
- [ ] Descuentos y códigos promocionales

---

**Arquitectura creada con seguridad, performance y escalabilidad en mente.** ✨

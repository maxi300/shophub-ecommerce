# 🛍️ Nuevo El Salvador Shop - Ecommerce Profesional

Una aplicación ecommerce **de nivel empresarial** construida con **Next.js 16**, **Supabase**, y **Tailwind CSS**, con **panel de administración completo**, gestión de productos con imágenes y sistema de pedidos.

**Status**: ✅ **LISTO PARA PRODUCCIÓN**

## 🚀 Características Principales

### 👨‍💼 **ADMIN PANEL - Panel de Administración Completo**
- ✅ **Dashboard**: Estadísticas en vivo (productos, pedidos, ingresos, usuarios)
- ✅ **Gestión de Productos** (`/admin/productos`):
  - Crear, editar, eliminar productos
  - Upload de imágenes a Supabase Storage
  - Categorías dinámicas
  - Badges de oferta
  - Activar/desactivar visibilidad
  - Vista previa de imágenes
- ✅ **Gestión de Pedidos** (`/admin/pedidos`):
  - Ver todos los pedidos
  - Detalles del cliente (nombre, dirección)
  - Cambiar estado de envío (5 estados)
  - Información de items y totales
- ✅ **Seguridad Admin**:
  - Middleware de protección (`/admin/*`)
  - Verificación de `is_admin = true`
  - RLS policies en BD
  - Redirección automática

### 📸 **ImageUploader Profesional**
- ✅ Drag & drop de archivos
- ✅ Preview en tiempo real
- ✅ Validación (tipo, tamaño <5MB)
- ✅ Upload directo a Supabase Storage
- ✅ URLs públicas automáticas
- ✅ Manejo de errores

### 1. **Tienda Cliente (Frontend)**
- Colores energéticos: Naranja primario (#FF7A3D) + Azul secundario (#1e5a8a)
- Paleta neutral profesional para modo claro y oscuro
- Interfaz moderna y responsive
- Animaciones suaves y transiciones

### 2. **Carrito de Compras Mejorado**
- **Layout de 2 columnas**: Listado de artículos + Resumen sticky del pedido
- **Controles inline de cantidad**: Botones +/- directamente en cada artículo
- **Resumen visual completo**:
  - Subtotal, descuentos, envío, impuestos, total
  - Indicadores de confianza
- **Carrito vacío**: Mensaje amigable con CTA

### 3. **Página de Inicio (Homepage)**
- **Productos dinámicos**: Cargados desde BD (admin puede agregar)
- **Categorías**: Navegación por categorías
- **Ofertas**: Grid con badges de descuento
- **Footer**: Links e información

### 4. **Product Cards**
- Imagen desde Supabase (subida por admin)
- Badges de oferta
- Precio con descuento
- Botón "Agregar al carrito"
- Estilos responsive

### 5. **Autenticación**
- Email/password
- Login y registro
- Perfil de usuario
- Logout

## Estructura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 16 + React 19
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4 + Semantic Design Tokens
- **UI Components**: shadcn/ui (Button, Card, Input, Label)
- **Icons**: lucide-react
- **Auth**: Supabase Auth (Email/Password)

### Estructura de Base de Datos

**Todas las tablas con RLS Policies y validaciones**

```
Core:
├── profiles (id, first_name, last_name, phone, address, is_admin)
├── categories (id, name, icon, slug, display_order)

Productos:
├── products (id, name, description, price, discount_price, image_url, 
│             category_id, stock, rating, reviews_count, is_active, badge_text)
└── product_variants (id, product_id, variant_type, variant_value, stock, price_modifier)

Compras:
├── cart_items (id, user_id, product_id, quantity, variant_selections)
├── orders (id, user_id, total, subtotal, discount_amount, shipping_cost,
│           tax_amount, status, payment_method, shipping_address, ...)
└── order_items (id, order_id, product_id, quantity, price, variant_selections)

Índices:
✓ idx_products_is_active, idx_products_created_at
✓ idx_cart_items_user, idx_orders_user
✓ idx_profiles_is_admin

RLS Policies:
✓ Admins pueden leer todos los productos (incluso inactivos)
✓ Clientes solo ven sus carritos y órdenes
✓ Productos públicos solo si is_active = TRUE
✓ Admins pueden cambiar estado de pedidos
```

### Archivos Principales

```
app/
├── page.tsx                    # Homepage
├── cart/page.tsx              # Carrito de compras
├── auth/
│   ├── login/page.tsx          # Login
│   ├── sign-up/page.tsx        # Registro
│   ├── callback/route.ts       # Auth callback
│   └── logout/route.ts         # Logout ✨ NUEVO
├── admin/ ✨ NUEVO - PANEL ADMIN
│   ├── layout.tsx              # Layout del admin
│   ├── page.tsx                # Dashboard
│   ├── productos/page.tsx      # Gestión de productos
│   └── pedidos/page.tsx        # Gestión de pedidos
├── layout.tsx                  # Root layout
└── globals.css                 # Design tokens

components/
├── header.tsx                  # Navegación
├── product-card.tsx            # Card de producto
├── admin/ ✨ NUEVO
│   ├── image-uploader.tsx           # Upload de imágenes ✨ NUEVO
│   ├── admin-dashboard-content.tsx  # Dashboard content
│   ├── admin-products-content.tsx   # Products management
│   └── admin-orders-content.tsx     # Orders management

lib/
├── supabase/
│   ├── client.ts               # Cliente browser
│   ├── server.ts               # Cliente servidor
│   └── proxy.ts                # Session middleware
└── utils.ts                    # Utilidades

scripts/ ✨ NUEVO
├── setup-database.sql          # Schema SQL completo ✨ EJECUTAR ESTO

docs/ ✨ NUEVO
├── DEPLOYMENT_GUIDE.md         # Guía completa
├── QUICKSTART.md               # 5 minutos
├── ADMIN_ARCHITECTURE.md       # Arquitectura técnica
├── IMPLEMENTATION_SUMMARY.md   # Resumen
└── DEPLOYMENT_CHECKLIST.md     # Checklist
```

## Flujo del Carrito (Mejorado vs Estándar Temu)

### Mejoras Implementadas

1. **Resumen Sticky**
   - El resumen del pedido permanece visible mientras scrolleas
   - Actualización real-time de totales
   - Información de envío gratis clara

2. **Controles de Cantidad Inline**
   - +/- directamente en cada artículo
   - Sin necesidad de modal o página separada
   - Feedback visual inmediato

3. **Detalles Visuales**
   - Precio unitario + total del item visible
   - Icono de eliminar destacado
   - Información contextual (envío, garantía)
   - Progreso visual del monto para envío gratis

4. **Experiencia Mobile**
   - Resumen en la parte inferior (stacking)
   - Botones de cantidad accesibles
   - Scroll suave sin obstrucciones

## 🚀 Instalación y Desarrollo

### Requisitos
- Node.js 18+
- pnpm (recomendado)
- Cuenta Supabase.com

### 5-Minute Quick Start

```bash
# 1. Setup Supabase en https://app.supabase.com
# - Crea proyecto
# - Obtén URL, Publishable Key, Secret Key
# - Crea bucket "productos"

# 2. Clone y install
git clone <repo>
cd nuevo-el-salvador-shop
pnpm install

# 3. Configura .env.local
cp .env.local .env.local
# Edita con tus credenciales Supabase

# 4. Setup BD
# - Copia scripts/setup-database.sql
# - Ejecuta en Supabase SQL Editor

# 5. Corre dev
pnpm dev
# http://localhost:3000

# 6. Haz admin tu usuario
# UPDATE profiles SET is_admin = TRUE WHERE id = 'your-id'

# 7. Accede admin
# http://localhost:3000/admin
```

### Variables de Entorno Necesarias
```
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co (SIN slash)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ... (⚠️ CONFIDENCIAL)
SUPABASE_JWKS_URL=https://xyz.supabase.co/auth/v1/.well-known/jwks.json
```

## 🔐 Panel de Administración

### Acceso
- **URL**: `http://localhost:3000/admin`
- **Requiere**: `is_admin = true` en profiles
- **Protección**: Middleware + RLS policies

### Funcionalidades

#### Dashboard (`/admin`)
- Estadísticas en vivo
- Total de productos
- Total de pedidos
- Ingresos de pedidos completados
- Usuarios activos
- Quick links

#### Gestión de Productos (`/admin/productos`)
- ✅ **Crear productos**
  - Nombre, descripción, precio
  - Descuento (opcional)
  - Stock
  - Categoría
  - Badge de oferta
  - Upload de imagen
  - Activar/desactivar
  
- ✅ **Editar productos**
  - Cambiar cualquier campo
  - Actualizar imagen
  - Ver vista previa

- ✅ **Eliminar productos**
  - Con confirmación

#### Gestión de Pedidos (`/admin/pedidos`)
- Ver todos los pedidos
- Información del cliente
- Items del pedido
- Cambiar estado (5 estados)
- Actualización en tiempo real

### Hacer Admin a un Usuario

```sql
-- En Supabase SQL Editor:
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'tu-email@test.com'
);
```

## ✅ Funcionalidades Completadas

### Cliente (Público)
- ✅ Homepage profesional
- ✅ Grid de productos dinámicos
- ✅ Filtros por categoría
- ✅ Carrito mejorado (2 columnas)
- ✅ Controles de cantidad inline
- ✅ Resumen sticky
- ✅ Login/registro
- ✅ Perfil de usuario

### Admin (Privado)
- ✅ **Panel de Administración** completo
- ✅ **Gestión de Productos**
  - Crear, editar, eliminar
  - Upload de imágenes a Supabase Storage
  - Categorías dinámicas
  - Badges de oferta
  - Activar/desactivar
  - Preview en tiempo real
- ✅ **Gestión de Pedidos**
  - Ver todos los pedidos
  - Cambiar estado de envío
  - Ver detalles del cliente
  - Información de items
- ✅ **Dashboard**
  - Estadísticas en vivo
  - Analytics

### Seguridad
- ✅ Autenticación JWT (Supabase Auth)
- ✅ Middleware de protección `/admin/*`
- ✅ RLS Policies en BD
- ✅ Admin verification x2
- ✅ Input validation
- ✅ File upload validation

## 🚧 Funcionalidades Futuras

- [ ] Integración de pagos (Wompi, Stripe)
- [ ] Variantes de productos (color, talla)
- [ ] Sistema de reseñas
- [ ] Búsqueda y filtros avanzados
- [ ] Wishlist/Favoritos
- [ ] Notificaciones por email
- [ ] Reportes de ventas
- [ ] Descuentos y cupones

## Paleta de Colores

```
Primario:     #FF7A3D (Naranja energético - acciones)
Secundario:   #1e5a8a (Azul - headers, enlaces)
Background:   #ffffff (Light) / #0f0f0f (Dark)
Foreground:   #1a1a1a (Light) / #f5f5f5 (Dark)
Border:       #e5e5e5 (Light) / #2a2a2a (Dark)
Muted:        #f0f0f0 (Light) / #2a2a2a (Dark)
```

## Mejoras Respecto a Temu

1. **Seguridad Mejorada**
   - RLS policies activas
   - Server-side session management
   - HTTPS en producción

2. **Experiencia de Usuario**
   - Transiciones suaves
   - Feedback visual claro
   - Accesibilidad (semantic HTML, ARIA labels)

3. **Performance**
   - Next.js 16 con Turbopack
   - Optimización de imágenes
   - Code splitting automático
   - Cache de servidor

4. **Escalabilidad**
   - Arquitectura modular
   - Componentes reutilizables
   - Fácil de extender

## Despliegue en Vercel

```bash
# Conectar repo
vercel link

# Deploy
vercel deploy

# Deploy a producción
vercel deploy --prod
```

## 📚 Documentación

- 📖 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía completa paso a paso
- ⚡ **[QUICKSTART.md](./QUICKSTART.md)** - Setup en 5 minutos
- ✅ **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist de despliegue
- 🏗️ **[ADMIN_ARCHITECTURE.md](./ADMIN_ARCHITECTURE.md)** - Detalles técnicos del admin
- 📋 **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen de implementación

## 🔗 Recursos Externos

- [Next.js 16 Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

## 🆘 Troubleshooting

**"Cannot find module '@supabase/ssr'"**
```bash
pnpm install @supabase/ssr @supabase/supabase-js
```

**"Access denied creating product"**
- Verifica que `is_admin = TRUE` en la BD

**"No se ve imagen"**
- Verifica que el bucket `productos` existe en Supabase Storage

**"SUPABASE_URL is required"**
- Revisa `.env.local` tiene valores correctos

---

**Creado con ❤️ para Nuevo El Salvador**

*Stack: Next.js 16 + React 19 + Supabase + TypeScript + Tailwind CSS + shadcn/ui*

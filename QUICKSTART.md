# 🚀 QUICKSTART - Nuevo El Salvador Shop

## TL;DR (Para usuarios apurados)

### 1. Supabase Setup (5 minutos)
```bash
# Crea proyecto en https://app.supabase.com
# Obtén: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
```

### 2. Database Setup (2 minutos)
```bash
# En Supabase SQL Editor:
# 1. Abre SQL Editor
# 2. Nueva query
# 3. Copia + pega scripts/setup-database.sql
# 4. Run
```

### 3. Storage Setup (1 minuto)
```bash
# En Supabase Storage:
# 1. Create bucket
# 2. Nombre: "productos"
# 3. Listo
```

### 4. Env Setup (2 minutos)
```bash
# Edita .env.local con tus credenciales de Supabase
```

### 5. Run (1 minuto)
```bash
pnpm install
pnpm dev
# Abre http://localhost:3000
```

### 6. Make Admin (1 minuto)
```sql
-- En Supabase SQL Editor:
UPDATE public.profiles SET is_admin = TRUE 
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@test.com');
```

### 7. Admin Panel
```
Crea productos en: http://localhost:3000/admin/productos
Ve resultados en: http://localhost:3000
```

---

## Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage - Todos ven productos |
| `/auth/login` | Login |
| `/auth/sign-up` | Registro |
| `/cart` | Carrito de compras |
| `/admin` | Dashboard (solo admin) |
| `/admin/productos` | Crear/editar productos (solo admin) |
| `/admin/pedidos` | Gestionar pedidos (solo admin) |

---

## Test Rápido

### Como Cliente:
1. http://localhost:3000 → Ver productos
2. Agregar al carrito → Funciona
3. Ver carrito → http://localhost:3000/cart

### Como Admin:
1. http://localhost:3000/admin → Dashboard
2. /admin/productos → Crear nuevo
3. Completa formulario + sube imagen
4. Guardar
5. Recarga homepage → Verás el producto

---

## Variables .env.local

Mínimo necesario:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
```

---

## ¿No funciona? Verifica:

1. ✅ .env.local tiene valores correctos
2. ✅ `pnpm install` ejecutado
3. ✅ script SQL ejecutado en Supabase
4. ✅ bucket "productos" creado
5. ✅ Usuario marcado como admin

---

## Comandos

```bash
pnpm dev          # Desarrollo
pnpm build        # Build
pnpm lint         # Linter
```

---

Listo! 🎉

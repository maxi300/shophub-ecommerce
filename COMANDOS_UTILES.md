# 🛠️ COMANDOS ÚTILES - Nuevo El Salvador Shop

## Desarrollo

### Iniciar servidor
```bash
pnpm dev
# Abre: http://localhost:3000
```

### Build
```bash
pnpm build
# Genera .next/ optimizado
```

### Preview del build
```bash
pnpm build && pnpm start
```

### Linter/Format
```bash
pnpm lint
pnpm format
```

## Base de Datos

### Hacer admin a usuario
```sql
-- En Supabase SQL Editor
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu@email.com' 
  LIMIT 1
);
```

### Ver todos los usuarios
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### Ver todos los productos
```sql
SELECT id, name, price, discount_price, is_active, created_at 
FROM products 
ORDER BY created_at DESC;
```

### Ver todos los pedidos
```sql
SELECT o.id, u.email, o.total, o.status, o.created_at
FROM orders o
JOIN auth.users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```

### Ver productos activos
```sql
SELECT name, price, discount_price, image_url, is_active
FROM products
WHERE is_active = TRUE
ORDER BY created_at DESC;
```

### Desactivar todos los productos (temporal)
```sql
UPDATE products SET is_active = FALSE;
```

### Reactivar todos
```sql
UPDATE products SET is_active = TRUE;
```

### Eliminar un usuario
```sql
DELETE FROM auth.users WHERE email = 'usuario@test.com';
```

### Reset de base de datos (PELIGROSO!)
```bash
# En Supabase Dashboard:
# Settings → Databases → Reset Database
# Luego re-ejecutar scripts/setup-database.sql
```

## Storage (Imágenes)

### Listar archivos en bucket
```bash
# Desde Supabase Console
# Storage → productos → Ver archivos
```

### Eliminar imagen
```bash
# Supabase Console → Storage → productos
# Click 3 puntos → Delete
```

### URL pública de imagen
```
https://<PROJECT_ID>.supabase.co/storage/v1/object/public/productos/filename.jpg
```

## Git & Deploy

### Preparar para Vercel
```bash
git add .
git commit -m "Nuevo El Salvador Shop - Listo para producción"
git push origin main
```

### Deploy a Vercel
```bash
# Conecta en https://vercel.com
# Importa repositorio
# Variables de entorno automáticas desde .env
# Deploy
```

## Debugging

### Ver logs del servidor
```bash
# En terminal donde corre pnpm dev
# Aparecen automáticamente
```

### Ver logs del cliente
```bash
# Abre DevTools (F12)
# Console tab
# Observa errores
```

### Verificar variables de entorno
```bash
# En tu página (temporal):
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Limpiar caché
```bash
# Elimina carpetas
rm -rf .next
rm -rf node_modules/.cache

# Reinstala
pnpm install
pnpm dev
```

## Performance

### Analizar tamaño de bundle
```bash
pnpm build --analyze
```

### Ver métricas de Lighthouse
```bash
# En DevTools → Lighthouse tab
# Click "Analyze"
```

## Seguridad

### Regenerar JWT (en caso de compromiso)
```sql
-- En Supabase Settings → Auth
-- Regenerar secret key
```

### Cambiar contraseña de BD
```bash
# Supabase Settings → Databases → Reset password
```

### Ver acceso admin
```sql
SELECT id, email, 
       (SELECT is_admin FROM profiles WHERE profiles.id = users.id) as is_admin
FROM auth.users;
```

## Troubleshooting

### Limpiar node_modules
```bash
rm -rf node_modules
pnpm install
```

### Limpiar caché de pnpm
```bash
pnpm store prune
pnpm install
```

### Reiniciar servidor
```bash
# Ctrl+C en terminal
pnpm dev
```

### Ver versiones
```bash
node --version
pnpm --version
npm --version
```

## Testing (Usuarios de Prueba)

### Crear usuario admin
```
Email: admin@test.com
Contraseña: AdminPassword123!
# Luego ejecutar SQL para hacer admin
```

### Crear usuario cliente
```
Email: cliente@test.com
Contraseña: ClientPassword123!
# Sin SQL, es cliente normal
```

## URLs Importantes

```
localhost:3000                    Tienda principal
localhost:3000/admin              Admin Dashboard
localhost:3000/admin/productos    Gestión productos
localhost:3000/admin/pedidos      Gestión pedidos
localhost:3000/auth/login         Login
localhost:3000/auth/sign-up       Registro
localhost:3000/cart               Carrito

https://app.supabase.com          Supabase Console
https://vercel.com                Vercel Deploy
```

## Checklist Rápido (Antes de Desplegar)

```bash
# 1. Verificar compilación
pnpm build

# 2. Verificar variables
grep -r "NEXT_PUBLIC_SUPABASE" .env.local

# 3. Pruebas funcionales
# - [ ] Puede registrarse
# - [ ] Puede loguearse
# - [ ] Puede ver productos
# - [ ] Puede agregar al carrito
# - [ ] Admin puede acceder
# - [ ] Admin puede crear producto
# - [ ] Producto aparece en tienda
# - [ ] Imagen se carga

# 4. Limpiar
rm -rf .next

# 5. Commit final
git add .
git commit -m "Listo para producción"
git push
```

## Help & Docs

```bash
# Next.js help
pnpm next --help

# Ver versión Next.js
pnpm next --version

# TypeScript check
pnpm tsc --noEmit

# Lint
pnpm eslint .
```

---

**Consejo**: Guarda estos comandos en un archivo `.commands` en tu proyecto para acceso rápido.

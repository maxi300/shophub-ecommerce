# Guía del Carrito Mejorado - ShopHub

## Diseño y Funcionalidad del Carrito

El carrito de ShopHub implementa un diseño profesional de 2 columnas inspirado en Temu pero mejorado con características UX adicionales.

## Estructura Actual (2 Columnas)

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER                                │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────┐
│                                      │                  │
│   ARTÍCULOS EN EL CARRITO            │  RESUMEN STICKY  │
│                                      │                  │
│  ┌──────────────────────────────┐   │  Subtotal: $93   │
│  │  Producto 1                  │   │  Desc:    -$5    │
│  │  $45.99 x 1 = $45.99         │   │  Envío:   $0     │
│  │  [- 1 +] [Eliminar]          │   │  Impuestos: $7   │
│  └──────────────────────────────┘   │  ────────────────│
│                                      │  TOTAL: $95.54   │
│  ┌──────────────────────────────┐   │                  │
│  │  Producto 2                  │   │  [Ir al Pago]    │
│  │  $34.98 x 2 = $69.96         │   │                  │
│  │  [- 2 +] [Eliminar]          │   │  Beneficios:     │
│  └──────────────────────────────┘   │  ✓ Envío gratis  │
│                                      │  ✓ Pago seguro   │
│  ┌──────────────────────────────┐   │                  │
│  │  Producto 3                  │   │  [Seguir comp.]  │
│  │  $12.49 x 1 = $12.49         │   │                  │
│  │  [- 1 +] [Eliminar]          │   │  Protección:     │
│  └──────────────────────────────┘   │  ✓ Datos seguros │
│                                      │  ✓ 90 días dev.  │
│  [Consejo: Agrega más...]           └──────────────────┘
│                                      
│  ARTÍCULOS RELACIONADOS
│  ┌────┬────┬────┬────┐
│  │    │    │    │    │
│  └────┴────┴────┴────┘
│
└──────────────────────────────────────┴──────────────────┘
```

## Componentes Utilizados

### 1. **CartItemsSection** (`components/cart-items-section.tsx`)
Muestra el listado de artículos con:
- Imagen del producto
- Nombre y precio unitario
- Cálculo automático del total por item
- Controles +/- para cantidad
- Botón de eliminar
- Estado vacío personalizado

**Props:**
```tsx
interface CartItemsSectionProps {
  items: CartItem[]
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void
  onRemoveItem?: (itemId: string) => void
}
```

### 2. **CartSummary** (`components/cart-summary.tsx`)
Resumen del pedido sticky con:
- Desglose de costos (subtotal, descuentos, envío, impuestos)
- Total destacado en color primario
- Beneficios (iconos + texto)
- CTA principal "Ir al Pago"
- CTA secundaria "Seguir comprando"
- Indicadores de confianza

**Props:**
```tsx
interface CartSummaryProps {
  subtotal: number
  discount?: number
  shipping?: number
  tax?: number
  itemCount: number
  onCheckout?: () => void
}
```

## Características Principales

### ✨ Experiencia Visual
- **Colores profesionales**: Naranja primario para CTAs, grises neutrales
- **Tipografía clara**: Jerarquía visual con pesos de fuente
- **Espaciado**: Gaps coherentes usando Tailwind spacing
- **Hover states**: Transiciones suaves, feedback visual

### 🛒 Funcionalidad
- **Cantidad inline**: Sin necesidad de modal
- **Eliminación rápida**: Botón trash icon siempre visible
- **Cálculo automático**: Totales actualizados en real-time
- **Validación**: Cantidad mínima de 1

### 📱 Responsive
- **Desktop**: 2 columnas con resumen sticky en la derecha
- **Tablet**: Adaptación fluida
- **Mobile**: Stack vertical (resumen abajo)

### 🎯 Conversión
- **Indicadores de confianza**: Seguridad, garantía, envío gratis
- **Progreso visual**: Muestra camino al pago
- **Opciones claras**: Botones bien diferenciados
- **Consejo contextual**: "Agrega más para envío gratis"

## Flujo del Usuario

```
1. Producto → Click "Agregar" → Carrito
2. Carrito → Ver items
3. Ajustar cantidad con +/-
4. Ver resumen en tiempo real
5. Click "Ir al Pago" → Checkout
6. Alt: "Seguir comprando" → Volver a tienda
```

## Datos de Demostración

El carrito viene pre-cargado con 3 artículos:

```javascript
const demoCartItems = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Auriculares inalámbricos Bluetooth 5.0...',
    price: 45.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/...',
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Cargador rápido 65W USB-C con cable...',
    price: 17.49,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/...',
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Funda protectora premium para teléfono',
    price: 12.49,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/...',
  },
];
```

**Cálculos**:
- Subtotal: $93.46
- Descuento (> $50): -$5.00 ✓
- Envío: $0.00 (>$50) ✓
- Impuestos: $7.08
- **TOTAL: $95.54**

## Implementación Técnica

### Estado del Carrito
```tsx
const [cartItems, setCartItems] = useState(demoCartItems)

// Cálculos
const subtotal = cartItems.reduce((sum, item) => 
  sum + item.price * item.quantity, 0)
const discount = subtotal > 50 ? 5 : 0
const shipping = subtotal > 50 ? 0 : 9.99
const tax = (subtotal - discount) * 0.08
```

### Manejo de Eventos
```tsx
const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
  if (newQuantity <= 0) return
  setCartItems(items =>
    items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
  )
}

const handleRemoveItem = (itemId: string) => {
  setCartItems(items => items.filter(item => item.id !== itemId))
}
```

## Mejoras Futuras

### Corto Plazo
- [ ] Integración con Supabase para persistencia
- [ ] Sincronización en tiempo real entre tabs
- [ ] LocalStorage como fallback
- [ ] Códigos de descuento personalizados
- [ ] Cálculo de envío dinámico por ubicación

### Mediano Plazo
- [ ] Carrito guardado en cuenta
- [ ] Recomendaciones basadas en items
- [ ] Comparador de opciones de envío
- [ ] Seguimiento de envíos
- [ ] Historial de carritos abandonados

### Largo Plazo
- [ ] Checkout de un paso
- [ ] Múltiples direcciones de envío
- [ ] Suscripciones
- [ ] Regalos y tarjetas regalo
- [ ] Planes de pago

## Notas de Diseño

### Colores
- **Primario (#FF7A3D)**: CTAs principales, totales, badges
- **Secundario (#1e5a8a)**: Enlaces, headers
- **Muted (#e5e5e5)**: Bordes, separadores
- **Foreground (#1a1a1a)**: Texto principal

### Espaciado
- **Gaps**: `gap-4` para secciones, `gap-2` para items
- **Padding**: `p-6` contenedores, `p-4` items
- **Margins**: Mínimos, usar gaps en flex

### Tipografía
- **Título**: `text-lg font-bold`
- **Etiquetas**: `text-sm text-muted-foreground`
- **Precios**: `text-lg font-bold text-primary`
- **Total**: `text-2xl font-bold text-primary`

---

**Para más información, consulta el README.md principal.**

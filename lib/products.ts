export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  imageUrl?: string
  badge?: string
  badgeColor?: 'orange' | 'green' | 'red' | 'blue'
  soldCount?: number
  seller: string
  colors?: ProductColor[]
  sizes?: string[]
  stock: number
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Auriculares Bluetooth 5.0 con cancelación de ruido activa',
    description: 'Sonido envolvente con cancelación activa de ruido, hasta 30 horas de batería y estuche de carga rápida incluido.',
    price: 89.99,
    discountPrice: 14.99,
    seller: 'AudioTech Store',
    badge: 'Top Ventas',
    badgeColor: 'orange',
    soldCount: 3200,
    stock: 24,
    colors: [
      { name: 'Negro', hex: '#111827' },
      { name: 'Blanco', hex: '#f3f4f6' },
      { name: 'Azul', hex: '#1e40af' },
    ],
  },
  {
    id: '2',
    name: 'Cargador rápido 65W USB-C compatible con todos los modelos',
    description: 'Carga rápida de hasta 65W, compatible con laptops, tablets y celulares. Incluye cable trenzado reforzado.',
    price: 34.99,
    discountPrice: 8.49,
    seller: 'PowerPlus',
    soldCount: 5100,
    stock: 58,
    colors: [
      { name: 'Blanco', hex: '#f3f4f6' },
      { name: 'Negro', hex: '#111827' },
    ],
  },
  {
    id: '3',
    name: 'Smartwatch fitness con GPS y monitor cardíaco',
    description: 'Monitorea tu ritmo cardíaco, rutas GPS, sueño y más de 20 modos deportivos. Resistente al agua.',
    price: 199.99,
    discountPrice: 39.99,
    seller: 'FitLife Wearables',
    badge: 'Nuevo',
    badgeColor: 'blue',
    soldCount: 890,
    stock: 12,
    colors: [
      { name: 'Negro Profundo', hex: '#111827' },
      { name: 'Plata', hex: '#d1d5db' },
      { name: 'Rosa', hex: '#f9a8d4' },
    ],
  },
  {
    id: '4',
    name: 'Funda magnética para iPhone 15 Pro con MagSafe',
    description: 'Protección antigolpes con compatibilidad MagSafe total. Bordes reforzados y acabado antideslizante.',
    price: 24.99,
    discountPrice: 6.49,
    seller: 'CaseWorld',
    soldCount: 8900,
    stock: 140,
    colors: [
      { name: 'Negro Profundo', hex: '#111827' },
      { name: 'Blanco Hueso', hex: '#f3f0e8' },
      { name: 'Azul Marino', hex: '#1e3a5f' },
      { name: 'Verde', hex: '#4a7c59' },
      { name: 'Lila', hex: '#c4b5d4' },
    ],
  },
  {
    id: '5',
    name: 'Batería externa 20000mAh carga rápida inalámbrica',
    description: 'Carga inalámbrica y por cable, capacidad de 20000mAh para varias cargas completas de tu celular.',
    price: 79.99,
    discountPrice: 18.99,
    seller: 'PowerPlus',
    badge: 'Top Ventas',
    badgeColor: 'orange',
    soldCount: 4300,
    stock: 31,
    colors: [
      { name: 'Negro', hex: '#111827' },
      { name: 'Blanco', hex: '#f3f4f6' },
    ],
  },
  {
    id: '6',
    name: 'Cables USB-C trenzados premium pack 3 unidades 2m',
    description: 'Pack de 3 cables trenzados de nylon resistente, 2 metros de largo cada uno, carga rápida certificada.',
    price: 29.99,
    discountPrice: 5.99,
    seller: 'PowerPlus',
    soldCount: 12000,
    stock: 200,
    colors: [
      { name: 'Negro', hex: '#111827' },
      { name: 'Blanco', hex: '#f3f4f6' },
      { name: 'Rojo', hex: '#dc2626' },
    ],
  },
  {
    id: '7',
    name: 'Soporte ergonómico de escritorio ajustable para laptop',
    description: 'Ajusta altura y ángulo para una postura ergonómica. Compatible con laptops de 11 a 17 pulgadas.',
    price: 45.99,
    discountPrice: 12.49,
    seller: 'OfficeComfort',
    soldCount: 2100,
    stock: 46,
    colors: [
      { name: 'Plata', hex: '#d1d5db' },
      { name: 'Negro', hex: '#111827' },
    ],
  },
  {
    id: '8',
    name: 'Teclado mecánico gaming retroiluminado RGB compacto',
    description: 'Switches mecánicos táctiles, retroiluminación RGB personalizable y diseño compacto 75%.',
    price: 120.0,
    discountPrice: 34.99,
    seller: 'GamerZone',
    badge: 'Nuevo',
    badgeColor: 'green',
    soldCount: 1800,
    stock: 19,
    colors: [
      { name: 'Negro', hex: '#111827' },
      { name: 'Blanco', hex: '#f3f4f6' },
    ],
    sizes: ['60%', '75%', 'TKL'],
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

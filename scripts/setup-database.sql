-- =============================================================================
-- NUEVO EL SALVADOR SHOP - Ecommerce Database Setup
-- =============================================================================
-- This script sets up the complete database schema for the ecommerce platform
-- Run this in Supabase SQL Editor

-- =============================================================================
-- 1. CREATE PROFILES TABLE (Extended User Data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. CREATE CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. CREATE PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  badge_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. CREATE PRODUCT VARIANTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- 'color', 'size', 'version', etc
  variant_value TEXT NOT NULL, -- 'red', 'M', 'v2', etc
  stock INTEGER DEFAULT 0,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, variant_type, variant_value)
);

-- =============================================================================
-- 5. CREATE CART ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  variant_selections JSONB DEFAULT '{}', -- {"color": "red", "size": "M"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- =============================================================================
-- 6. CREATE ORDERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  payment_method TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. CREATE ORDER ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  variant_selections JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. ROW LEVEL SECURITY POLICIES - PROFILES
-- =============================================================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 10. ROW LEVEL SECURITY POLICIES - CATEGORIES (PUBLIC READ)
-- =============================================================================
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (TRUE);

-- =============================================================================
-- 11. ROW LEVEL SECURITY POLICIES - PRODUCTS (PUBLIC READ, ADMIN WRITE)
-- =============================================================================
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can read all products" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =============================================================================
-- 12. ROW LEVEL SECURITY POLICIES - PRODUCT VARIANTS (ADMIN ONLY)
-- =============================================================================
CREATE POLICY "Variants are publicly readable (via active products)" ON public.product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id AND products.is_active = TRUE
    )
  );

CREATE POLICY "Only admins can manage variants" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =============================================================================
-- 13. ROW LEVEL SECURITY POLICIES - CART ITEMS (USER-SPECIFIC)
-- =============================================================================
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 14. ROW LEVEL SECURITY POLICIES - ORDERS (USER-SPECIFIC, ADMIN CAN VIEW ALL)
-- =============================================================================
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update order status" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =============================================================================
-- 15. ROW LEVEL SECURITY POLICIES - ORDER ITEMS
-- =============================================================================
CREATE POLICY "Users can view order items from own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =============================================================================
-- 16. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product ON public.cart_items(product_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);

-- =============================================================================
-- 17. CREATE FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE((new.raw_user_meta_data ->> 'is_admin')::BOOLEAN, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 18. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 19. INSERT SAMPLE CATEGORIES
-- =============================================================================
INSERT INTO public.categories (name, slug, icon, description, display_order) VALUES
  ('Ropa de Playa', 'ropa-playa', '🏖️', 'Ropa cómoda para playa y verano', 1),
  ('Calzado de Niños', 'calzado-ninos', '👟', 'Zapatos seguros y cómodos para niños', 2),
  ('Lencería y Pijamas', 'lenceria-pijamas', '😴', 'Ropa cómoda para dormir', 3),
  ('Electrodomésticos', 'electrodomesticos', '⚡', 'Aparatos para el hogar', 4),
  ('Belleza y Salud', 'belleza-salud', '💄', 'Productos de cuidado personal', 5),
  ('Instrumentos Musicales', 'instrumentos-musicales', '🎸', 'Equipos de música profesional', 6),
  ('Moda Infantil', 'moda-infantil', '👶', 'Ropa moderna para niños', 7),
  ('Hogar Inteligente', 'hogar-inteligente', '🏠', 'Tecnología para el hogar', 8)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 20. SAMPLE DATA - PRODUCTS
-- =============================================================================
INSERT INTO public.products (name, description, price, discount_price, stock, category_id, is_active, is_featured, badge_text)
SELECT 
  'Portahuevos con ruedas de 4 niños',
  'Organizador de huevos de lujo con ruedas de movimiento, capacidad de 30 huevos',
  72,
  50,
  25,
  (SELECT id FROM public.categories WHERE slug = 'ropa-playa' LIMIT 1),
  TRUE,
  TRUE,
  'OFERTA'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Portahuevos con ruedas de 4 niños');

INSERT INTO public.products (name, description, price, discount_price, stock, category_id, is_active, is_featured, badge_text)
SELECT 
  '2 luces LED solares, foco solar para exterior',
  'Iluminación solar profesional para balcones y exteriores, 50W, IP65',
  6.73,
  NULL,
  15,
  (SELECT id FROM public.categories WHERE slug = 'hogar-inteligente' LIMIT 1),
  TRUE,
  FALSE,
  'TOP VENTAS'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = '2 luces LED solares, foco solar para exterior');

INSERT INTO public.products (name, description, price, discount_price, stock, category_id, is_active, is_featured, badge_text)
SELECT 
  'Tela de sombra para exteriores profesional',
  'Protección UV 90%, resistente a clima, 3x4 metros',
  13.11,
  12.05,
  8,
  (SELECT id FROM public.categories WHERE slug = 'ropa-playa' LIMIT 1),
  TRUE,
  FALSE,
  'LIQUIDACIÓN'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Tela de sombra para exteriores profesional');

INSERT INTO public.products (name, description, price, discount_price, stock, category_id, is_active, is_featured, badge_text)
SELECT 
  'Micrófono de solapa inalámbrico profesional',
  '2 unidades, sistema digital con carga USB-C, rango 20m',
  5.42,
  NULL,
  12,
  (SELECT id FROM public.categories WHERE slug = 'instrumentos-musicales' LIMIT 1),
  TRUE,
  FALSE,
  'RECOMENDADO'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Micrófono de solapa inalámbrico profesional');

INSERT INTO public.products (name, description, price, discount_price, stock, category_id, is_active, is_featured, badge_text)
SELECT 
  'Smartwatch profesional con GPS',
  'Pantalla AMOLED, batería 7 días, resistencia 5ATM, monitor salud',
  8.16,
  NULL,
  18,
  (SELECT id FROM public.categories WHERE slug = 'belleza-salud' LIMIT 1),
  TRUE,
  FALSE,
  'NOVEDAD'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Smartwatch profesional con GPS');

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
-- Si ves este mensaje sin errores, ¡la base de datos se configuró correctamente!
-- Schema creado: profiles, categories, products, product_variants, 
-- cart_items, orders, order_items con RLS policies completas.

-- Extend products table with e-commerce fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS short_description_he TEXT,
ADD COLUMN IF NOT EXISTS short_description_en TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS stock_qty INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS related_product_ids UUID[] DEFAULT '{}';

-- Generate unique slugs for existing products using ID
UPDATE public.products
SET slug = 'product-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Order status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'processing', 'completed')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'visa')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  
  -- Order totals
  total_items INTEGER NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  
  -- Customer details
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_notes TEXT,
  
  -- Optional user link (if logged in)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Cart items stored as JSONB
  cart_items JSONB NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Authenticated users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can create an order (guest checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Authenticated users can update their own pending orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Update RLS policies for products to allow authenticated users to manage
CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger to update orders updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
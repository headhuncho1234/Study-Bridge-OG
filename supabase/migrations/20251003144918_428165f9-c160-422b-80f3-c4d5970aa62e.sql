-- Create wellness_products table
CREATE TABLE public.wellness_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shirts', 'wristbands', 'cups', 'stress_balls', 'teddy_bears')),
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_cart table
CREATE TABLE public.shopping_cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.wellness_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.wellness_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wellness_products (public read)
CREATE POLICY "Products are viewable by everyone"
  ON public.wellness_products FOR SELECT
  USING (true);

-- RLS Policies for shopping_cart (users can only access their own cart)
CREATE POLICY "Users can view their own cart"
  ON public.shopping_cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart"
  ON public.shopping_cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON public.shopping_cart FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON public.shopping_cart FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for orders (users can only access their own orders)
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for order_items (users can view items for their orders)
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at on wellness_products
CREATE TRIGGER update_wellness_products_updated_at
  BEFORE UPDATE ON public.wellness_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on shopping_cart
CREATE TRIGGER update_shopping_cart_updated_at
  BEFORE UPDATE ON public.shopping_cart
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed wellness products
INSERT INTO public.wellness_products (name, description, category, price, image_url, stock_quantity) VALUES
  ('Wellness Comfort Tee', 'Soft cotton t-shirt with motivational wellness quote. Available in multiple sizes.', 'shirts', 24.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 50),
  ('Mindfulness Hoodie', 'Cozy hoodie perfect for relaxation and meditation sessions.', 'shirts', 45.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 30),
  ('Study Balance Tee', 'Lightweight performance shirt for active students.', 'shirts', 22.99, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', 40),
  
  ('Strength Wristband', 'Silicone wristband with "Stay Strong" message.', 'wristbands', 5.99, 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500', 100),
  ('Mindful Living Band', 'Comfortable reminder band for daily mindfulness practice.', 'wristbands', 6.99, 'https://images.unsplash.com/photo-1598662957477-89b7aa0f5b8c?w=500', 80),
  
  ('Motivational Water Bottle', 'Stainless steel bottle with time markers and wellness reminders.', 'cups', 18.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 60),
  ('Focus Coffee Mug', 'Ceramic mug with uplifting quote to start your day right.', 'cups', 12.99, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', 70),
  ('Thermal Wellness Tumbler', 'Keep drinks hot or cold while studying. Spill-proof lid included.', 'cups', 21.99, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500', 45),
  
  ('Squishy Stress Ball', 'Soft foam stress ball perfect for study breaks.', 'stress_balls', 7.99, 'https://images.unsplash.com/photo-1611095790444-1dfa35e37b52?w=500', 90),
  ('Gel Stress Reliever', 'Textured gel ball for anxiety relief during exams.', 'stress_balls', 8.99, 'https://images.unsplash.com/photo-1589666564459-93cdd3ab856a?w=500', 75),
  
  ('Comfort Companion Bear', 'Soft plush teddy bear for emotional support.', 'teddy_bears', 29.99, 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=500', 35),
  ('Mini Wellness Bear', 'Pocket-sized teddy perfect for on-the-go comfort.', 'teddy_bears', 15.99, 'https://images.unsplash.com/photo-1551268831-484f8d21e79b?w=500', 50);
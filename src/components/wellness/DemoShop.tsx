import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  merchantUrl: string;
  merchant: string;
  category: 'books' | 'apparel' | 'accessories';
}

const demoItems: ShopItem[] = [
  {
    id: 'wellness-journal',
    name: 'Mindfulness Journal',
    description: 'Daily wellness tracking and reflection journal',
    price: 'See on Amazon',
    image: '📔',
    merchantUrl: 'https://amazon.com/s?k=mindfulness+journal',
    merchant: 'Amazon',
    category: 'books'
  },
  {
    id: 'stress-relief-hoodie',
    name: 'Comfort Wellness Hoodie',
    description: 'Soft, cozy hoodie for ultimate comfort',
    price: 'See on Amazon',
    image: '👕',
    merchantUrl: 'https://amazon.com/s?k=comfort+hoodie',
    merchant: 'Amazon',
    category: 'apparel'
  },
  {
    id: 'meditation-cushion',
    name: 'Meditation Cushion',
    description: 'Premium zafu cushion for meditation practice',
    price: 'See on Target',
    image: '🪑',
    merchantUrl: 'https://target.com/s?searchTerm=meditation+cushion',
    merchant: 'Target',
    category: 'accessories'
  },
  {
    id: 'self-care-book',
    name: 'Self-Care Handbook',
    description: 'Complete guide to mental wellness and self-care',
    price: 'See on Barnes & Noble',
    image: '📚',
    merchantUrl: 'https://barnesandnoble.com/s/self+care+book',
    merchant: 'Barnes & Noble',
    category: 'books'
  },
  {
    id: 'wellness-tshirt',
    name: 'Positive Vibes T-Shirt',
    description: 'Inspirational wellness-themed apparel',
    price: 'See on Amazon',
    image: '👕',
    merchantUrl: 'https://amazon.com/s?k=positive+vibes+tshirt',
    merchant: 'Amazon',
    category: 'apparel'
  },
  {
    id: 'essential-oils',
    name: 'Aromatherapy Kit',
    description: 'Essential oils starter kit for relaxation',
    price: 'See on Target',
    image: '🕯️',
    merchantUrl: 'https://target.com/s?searchTerm=aromatherapy+kit',
    merchant: 'Target',
    category: 'accessories'
  }
];

interface DemoShopProps {
  onClose: () => void;
}

const DemoShop: React.FC<DemoShopProps> = ({ onClose }) => {
  const [cart, setCart] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = filter === 'all' 
    ? demoItems 
    : demoItems.filter(item => item.category === filter);

  const addToCart = (itemId: string) => {
    if (!cart.includes(itemId)) {
      setCart(prev => [...prev, itemId]);
      toast({
        title: "Added to Demo Cart",
        description: "This is a demo - no real purchase will be made.",
      });
    }
  };

  const handleDemoCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first!",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Demo Checkout Complete! 🎉",
      description: `Demo transaction for ${cart.length} items. No real charges applied.`,
    });
    setCart([]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books': return '📚';
      case 'apparel': return '👕';
      case 'accessories': return '✨';
      default: return '🛍️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wellness
        </Button>
        
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Demo Shop - No Real Purchases
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Wellness Items Shop (Demo)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Explore wellness products from trusted vendors. Click "Buy Now" to visit the merchant's site.
          </p>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'books', 'apparel', 'accessories'].map((category) => (
              <Button
                key={category}
                variant={filter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(category)}
                className="flex items-center gap-1"
              >
                {category !== 'all' && getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-4xl text-center mb-3 group-hover:scale-110 transition-transform">
                    {item.image}
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="font-medium">{item.price}</span>
                    <span>{item.merchant}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(item.merchantUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Buy Now
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => addToCart(item.id)}
                      disabled={cart.includes(item.id)}
                    >
                      {cart.includes(item.id) ? 'In Demo Cart' : 'Add to Demo Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Demo Cart */}
          {cart.length > 0 && (
            <Card className="mt-6 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Demo Cart</h4>
                    <p className="text-xs text-muted-foreground">
                      {cart.length} items selected for demo checkout
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCart([])}
                    >
                      Clear Cart
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleDemoCheckout}
                    >
                      Demo Checkout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoShop;
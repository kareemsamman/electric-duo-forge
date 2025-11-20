import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  name_en?: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: any, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, quantity: number = 1, openDrawer: boolean = true) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity
        return prevItems.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                line_total: (item.quantity + quantity) * item.unit_price
              }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product_id: product.id,
          name: product.product_name,
          name_en: product.product_name_en,
          sku: product.sku,
          unit_price: Number(product.price),
          quantity,
          line_total: Number(product.price) * quantity,
          image: product.product_image || product.thumbnail
        };
        return [...prevItems, newItem];
      }
    });
    
    toast.success('המוצר נוסף לעגלה');
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product_id !== productId));
    toast.success('המוצר הוסר מהעגלה');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              line_total: quantity * item.unit_price
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.line_total, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

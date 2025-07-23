
import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options?: Record<string, string>;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, options?: Record<string, string>) => void;
  updateQuantity: (itemId: string, quantity: number, options?: Record<string, string>) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);
  
  const findItemIndex = (itemId: string, options?: Record<string, string>) => {
    if (!options) {
      return items.findIndex(item => item.id === itemId && !item.options);
    }
    
    return items.findIndex(item => {
      if (item.id !== itemId) return false;
      if (!item.options && !options) return true;
      if (!item.options || !options) return false;
      
      // Compare options objects
      const itemOptionKeys = Object.keys(item.options);
      const newOptionKeys = Object.keys(options);
      
      if (itemOptionKeys.length !== newOptionKeys.length) return false;
      
      return itemOptionKeys.every(key => item.options?.[key] === options[key]);
    });
  };
  
  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      const existingIndex = findItemIndex(newItem.id, newItem.options);
      
      if (existingIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        return [...prevItems, newItem];
      }
    });
  };
  
  const removeItem = (itemId: string, options?: Record<string, string>) => {
    setItems(prevItems => {
      const existingIndex = findItemIndex(itemId, options);
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems.splice(existingIndex, 1);
        return updatedItems;
      }
      
      return prevItems;
    });
  };
  
  const updateQuantity = (itemId: string, quantity: number, options?: Record<string, string>) => {
    setItems(prevItems => {
      const existingIndex = findItemIndex(itemId, options);
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          updatedItems.splice(existingIndex, 1);
        } else {
          // Update quantity
          updatedItems[existingIndex].quantity = quantity;
        }
        
        return updatedItems;
      }
      
      return prevItems;
    });
  };
  
  const clearCart = () => {
    setItems([]);
  };
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  
  return context;
};

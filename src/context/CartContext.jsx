import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove entirely
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, delta) => {
    setCartItems((prev) => {
      return prev.map((i) => {
        if (i.id === id) {
          const newQ = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQ };
        }
        return i;
      });
    });
  };

  const clearCart = () => setCartItems([]);

  const { totalItems, subtotal } = useMemo(() => {
    let items = 0;
    let cost = 0;
    cartItems.forEach((item) => {
      items += item.quantity;
      cost += item.price * item.quantity;
    });
    return { totalItems: items, subtotal: cost };
  }, [cartItems]);

  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

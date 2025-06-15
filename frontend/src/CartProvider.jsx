// CartProvider.jsx
import React, { useState } from "react";
import { CartContext } from "./CartContext"; // ✅ FIXED

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    const exists = cart.find((item) => item.id === book.id);
    if (!exists) setCart((prev) => [...prev, book]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// CartProvider.jsx
// CartProvider.jsx
import React, { useState } from "react";
import { CartContext } from "./CartContext";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (book) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === book.id);
      if (exists) {
        // ✅ Increase quantity if already in cart
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // ✅ Add new item with quantity = 1
        return [...prevCart, { ...book, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0) // remove if quantity drops to 0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

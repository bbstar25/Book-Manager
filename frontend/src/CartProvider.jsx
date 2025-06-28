// CartProvider.jsx
import React, { useEffect, useState, useCallback } from "react";
import { CartContext } from "./CartContext";
import axios from "axios";

const API = "http://localhost:8000";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Memoized function to fetch cart (for useEffect + context)
  const fetchCartFromBackend = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }, [token]);

  // ✅ Fetch cart on first mount or when token changes
  useEffect(() => {
    if (token) {
      fetchCartFromBackend();
    }
  }, [token, fetchCartFromBackend]);

  const syncAdd = async (book, quantity) => {
    try {
      await axios.post(
        `${API}/cart/add`,
        {
          book_id: book.id,
          title: book.title,
          price: book.price,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Failed to sync add to backend cart:", err);
    }
  };

  const syncRemove = async (book_id) => {
    try {
      await axios.delete(`${API}/cart/remove/${book_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to sync remove from backend cart:", err);
    }
  };

  const addToCart = (book) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === book.id);
      const updated = exists
        ? prev.map((item) =>
            item.id === book.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...book, quantity: 1 }];
      return updated;
    });

    if (token) syncAdd(book, 1);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (token) syncRemove(id);
  };

  const increaseQuantity = (id) => {
    const book = cart.find((item) => item.id === id);
    if (book) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      if (token) syncAdd(book, 1);
    }
  };

  const decreaseQuantity = (id) => {
    const book = cart.find((item) => item.id === id);
    if (book) {
      if (book.quantity === 1) {
        removeFromCart(id);
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
        );
        if (token) syncAdd(book, -1);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        setCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        refreshCart: fetchCartFromBackend, // ✅ exposed in context
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

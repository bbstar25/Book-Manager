// CartContext.jsx
import { createContext, useContext } from "react";

// ✅ Create and export the context
export const CartContext = createContext();

// ✅ Optional: Custom hook for consuming the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

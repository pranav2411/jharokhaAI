"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

export interface CartItem {
  id: number;
  product_id: number;
  qty: number;
  selected_customizations: Record<string, any>;
  product: {
    id: number;
    title: string;
    base_price: number;
    images: string[];
    artisan_name: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: number, qty: number, customizations: Record<string, any>) => Promise<void>;
  updateQty: (cartItemId: number, qty: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCartState: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchCart = async () => {
    const activeUserId = currentUser ? currentUser.id : 1;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/cart/${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error("Error fetching cart from API, falling back to local storage:", err);
      // Fallback to localstorage
      const localCart = localStorage.getItem("jharokha_cart");
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);


  // Save to local storage for persistence fallbacks
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("jharokha_cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("jharokha_cart");
    }
  }, [cart]);

  const addToCart = async (productId: number, qty: number, customizations: Record<string, any>) => {
    const activeUserId = currentUser ? currentUser.id : 1;
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: activeUserId,
          product_id: productId,
          qty,
          selected_customizations: customizations,
        }),
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Fallback local update
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.product_id === productId &&
            JSON.stringify(item.selected_customizations) === JSON.stringify(customizations)
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].qty += qty;
          return updated;
        }
        // Mock new item (in real life, the server supplies the product details, but we mock for local resiliency)
        return [
          ...prev,
          {
            id: Date.now(),
            product_id: productId,
            qty,
            selected_customizations: customizations,
            product: {
              id: productId,
              title: "Product in Cart",
              base_price: 1000, // Default mock
              images: [],
              artisan_name: "Local Artisan",
            },
          },
        ];
      });
    }
  };

  const updateQty = async (cartItemId: number, qty: number) => {
    if (qty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setCart((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, qty } : item))
      );
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    }
  };

  const clearCartState = () => {
    setCart([]);
    localStorage.removeItem("jharokha_cart");
  };

  // Helper to calculate total including customizations if price details are embedded
  const calculateItemTotal = (item: CartItem) => {
    let price = item.product.base_price;
    // Add custom upcharges
    Object.values(item.selected_customizations).forEach((value) => {
      if (value && typeof value === "object" && "price" in value) {
        price += (value as any).price;
      }
    });
    return price * item.qty;
  };

  const cartTotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQty,
        removeFromCart,
        clearCartState,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

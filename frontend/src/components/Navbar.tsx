"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, User, Compass, History, Menu, X, Landmark } from "lucide-react";

export const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-cream-light/90 backdrop-blur-md border-b border-sandstone-light/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-10 h-12 flex items-center justify-center border-2 border-sandstone-dark rounded-t-full bg-sandstone-light/10 overflow-hidden transition-transform group-hover:scale-105">
                {/* Visual indicator of Jharokha Arch */}
                <div className="absolute inset-x-1.5 top-1.5 bottom-0 border border-sandstone-dark/30 border-b-0 rounded-t-full" />
                <Landmark className="w-5 h-5 text-sandstone-dark" />
              </div>
              <div>
                <span className="font-archivo text-xl sm:text-2xl font-black uppercase tracking-wider text-sandstone-dark block leading-none">
                  Jharokha
                </span>
                <span className="text-[9px] uppercase tracking-widest text-olive-dark font-semibold block mt-0.5">
                  Artisan Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/catalog"
              className="text-foreground hover:text-coral-accent font-medium text-sm transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-sandstone-light" />
              Explore Catalog
            </Link>
            <Link
              href="/orders"
              className="text-foreground hover:text-coral-accent font-medium text-sm transition-colors flex items-center gap-1.5"
            >
              <History className="w-4 h-4 text-sandstone-light" />
              My Orders
            </Link>
            <Link
              href="/admin"
              className="text-foreground hover:text-coral-accent font-medium text-sm transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-sandstone-light" />
              Admin Portal
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-sandstone-light/10 text-foreground transition-all duration-300 flex items-center justify-center border border-transparent hover:border-sandstone-light/30"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5.5 h-5.5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral-accent text-white font-archivo text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Indicator */}
            <div className="hidden sm:flex items-center space-x-2 border-l border-sandstone-light/30 pl-4">
              <div className="w-9 h-9 rounded-full bg-olive-dark text-cream-light font-archivo font-bold flex items-center justify-center text-sm border-2 border-sandstone-light/40 shadow-sm">
                AS
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">Aarav S.</p>
                <p className="text-[10px] text-olive-dark leading-tight">Buyer Profile</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-sandstone-light/10 text-foreground"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-light border-b border-sandstone-light/20 py-4 px-4 space-y-3">
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-sandstone-light/10 font-medium text-foreground transition-colors"
          >
            Explore Catalog
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-sandstone-light/10 font-medium text-foreground transition-colors"
          >
            My Orders
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-sandstone-light/10 font-medium text-foreground transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      )}
    </nav>
  );
};

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Landmark, ShoppingBag, User, Compass, History, Menu, X, LogOut, Key, Settings, LayoutDashboard } from "lucide-react";

export const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                className="text-coral-accent hover:text-coral-dark font-bold text-sm transition-colors flex items-center gap-1.5 bg-coral-accent/10 px-3 py-1.5 rounded-lg border border-coral-accent/25"
              >
                <Key className="w-4 h-4" />
                Admin Portal
              </Link>
            )}
            {(currentUser?.role === "artisan" || currentUser?.role === "admin") && (
              <Link
                href="/dashboard"
                className="text-sandstone-dark hover:text-foreground font-bold text-sm transition-colors flex items-center gap-1.5 bg-sandstone-dark/10 px-3 py-1.5 rounded-lg border border-sandstone-light/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Artisan Dashboard
              </Link>
            )}
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
            {currentUser ? (
              <div className="hidden sm:flex items-center space-x-3 border-l border-sandstone-light/30 pl-4">
                <Link
                  href="/settings"
                  title="Edit Settings"
                  className="w-9 h-9 rounded-full overflow-hidden bg-olive-dark hover:bg-olive-light text-cream-light font-archivo font-bold flex items-center justify-center text-sm border-2 border-sandstone-light/40 shadow-sm transition-all"
                >
                  {currentUser.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={currentUser.photo_url} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </Link>
                <div className="text-left">
                  <Link href="/settings" className="text-xs font-semibold text-foreground leading-tight hover:text-[#737851] transition-colors block">
                    {currentUser.name}
                  </Link>
                  <p className="text-[10px] text-olive-dark capitalize leading-tight">{currentUser.role} Profile</p>
                </div>
                <Link
                  href="/settings"
                  title="Account Settings"
                  className="p-1.5 rounded-md hover:bg-sandstone-light/10 text-sandstone-light hover:text-[#737851] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-md hover:bg-red-50 text-sandstone-light hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center border-l border-sandstone-light/30 pl-4">
                <Link
                  href="/login"
                  className="bg-[#43472E] text-white hover:bg-olive-dark font-archivo text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              </div>
            )}

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
          {currentUser && (
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-sandstone-light/10 font-medium text-foreground transition-colors"
            >
              Account Settings
            </Link>
          )}
          {currentUser?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md bg-coral-accent/10 font-bold text-coral-accent transition-colors"
            >
              Admin Portal
            </Link>
          )}
          {(currentUser?.role === "artisan" || currentUser?.role === "admin") && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md bg-sandstone-light/10 font-bold text-sandstone-dark transition-colors"
            >
              Artisan Dashboard
            </Link>
          )}
          {currentUser ? (
            <div className="pt-2 border-t border-sandstone-light/30 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-olive-dark text-cream-light font-bold flex items-center justify-center text-xs border border-sandstone-light/40">
                  {currentUser.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={currentUser.photo_url} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>
                <span className="text-xs font-semibold text-foreground">{currentUser.name}</span>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-red-500 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-[#43472E] text-white font-archivo text-xs uppercase tracking-wider font-bold py-2 rounded-xl"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};


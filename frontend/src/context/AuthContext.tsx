"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string; // customer, artisan, admin
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginPhone: (phone: string, code?: string) => Promise<{ otpSent: boolean; user?: User; message?: string }>;
  loginGoogle: (email: string, name: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone: string, acceptTerms: boolean) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem("jharokha_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("jharokha_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Invalid credentials");
    }

    const user: User = await res.json();
    setCurrentUser(user);
    localStorage.setItem("jharokha_user", JSON.stringify(user));
    return user;
  };

  const loginPhone = async (phone: string, code?: string): Promise<{ otpSent: boolean; user?: User; message?: string }> => {
    const res = await fetch("http://localhost:8000/api/auth/login-phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Authentication failed");
    }

    const data = await res.json();
    if (data.otp_sent) {
      return { otpSent: true, message: data.message };
    }

    const user: User = data;
    setCurrentUser(user);
    localStorage.setItem("jharokha_user", JSON.stringify(user));
    return { otpSent: false, user };
  };

  const loginGoogle = async (email: string, name: string): Promise<User> => {
    const res = await fetch("http://localhost:8000/api/auth/login-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Google authentication failed");
    }

    const user: User = await res.json();
    setCurrentUser(user);
    localStorage.setItem("jharokha_user", JSON.stringify(user));
    return user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    acceptTerms: boolean
  ): Promise<User> => {
    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, accept_terms: acceptTerms }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }

    const user: User = await res.json();
    setCurrentUser(user);
    localStorage.setItem("jharokha_user", JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("jharokha_user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, loginPhone, loginGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

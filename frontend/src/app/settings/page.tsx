"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Mail, Phone, MapPin, Lock, ShieldCheck, AlertCircle, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { currentUser, loading: authLoading, updateCurrentUser } = useAuth();
  
  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  
  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.shipping_address || "");
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch("http://localhost:8000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          name,
          email,
          phone: phone || null,
          shipping_address: address || null,
          password: password || null
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        updateCurrentUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          shipping_address: updatedUser.shipping_address,
          role: updatedUser.role
        });
        setFeedback({ type: "success", msg: "Profile settings updated successfully!" });
        setPassword(""); // Clear password field
      } else {
        const err = await res.json();
        setFeedback({ type: "error", msg: err.detail || "Failed to update profile." });
      }
    } catch (err) {
      setFeedback({ type: "error", msg: "A network error occurred. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-foreground">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-left w-full">
        {/* Header */}
        <div className="mb-10 border-b border-sandstone-light/20 pb-4">
          <h1 className="font-archivo text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-sandstone-dark" />
            Account Settings
          </h1>
          <p className="text-xs text-foreground/60 mt-1">
            Manage your personal profile, default shipping location, and system security credentials.
          </p>
        </div>

        {authLoading ? (
          <div className="text-center py-20 font-archivo text-sm text-foreground/50 uppercase">
            Loading authorization session...
          </div>
        ) : !currentUser ? (
          <div className="text-center py-20 bg-cream-dark/20 rounded-3xl border border-dashed border-sandstone-light/35 space-y-4 max-w-lg mx-auto">
            <Lock className="w-12 h-12 text-sandstone-light mx-auto" />
            <h3 className="font-archivo text-sm uppercase font-bold text-foreground">Sign In Required</h3>
            <p className="text-xs text-foreground/60 max-w-xs mx-auto leading-relaxed">
              Please sign in to update your profile settings and secure your marketplace dashboard.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#43472E] hover:bg-olive-dark text-white text-xs font-archivo font-extrabold uppercase px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-sandstone-light/20 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
            {feedback && (
              <div className={`mb-6 p-4 text-xs rounded-xl flex items-center gap-3 border ${
                feedback.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {feedback.type === "success" ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Group 1: Personal Info */}
              <div className="space-y-4">
                <h3 className="font-archivo text-xs uppercase tracking-wider font-extrabold text-foreground border-b border-sandstone-light/10 pb-2">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandstone-light" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandstone-light" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. aarav@jharokha.in"
                        className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandstone-light" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 99999 88888"
                        className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Shipping Settings */}
              <div className="space-y-4">
                <h3 className="font-archivo text-xs uppercase tracking-wider font-extrabold text-foreground border-b border-sandstone-light/10 pb-2">
                  Shipping Destination
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Default Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-sandstone-light" />
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your street address, building number, city, state, and pin code..."
                      className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-3.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Security */}
              <div className="space-y-4">
                <h3 className="font-archivo text-xs uppercase tracking-wider font-extrabold text-foreground border-b border-sandstone-light/10 pb-2">
                  Security & Authentication
                </h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Change Password (Leave blank to keep current)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandstone-light" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-sandstone-light/15 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#43472E] hover:bg-olive-dark text-white font-archivo text-xs font-extrabold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving Settings..." : "Save Settings"}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

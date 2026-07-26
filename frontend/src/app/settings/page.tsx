"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Mail, Phone, MapPin, Lock, ShieldCheck, AlertCircle, Save, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";

export default function SettingsPage() {
  const { currentUser, loading: authLoading, updateCurrentUser, logout } = useAuth();
  const router = useRouter();
  
  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneVal, setPhoneVal] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  
  // Deletion states
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        logout();
        router.push("/");
      } else {
        const err = await res.json();
        setFeedback({ type: "error", msg: err.detail || "Failed to delete account." });
        setDeleteConfirmStep(0);
      }
    } catch (err) {
      setFeedback({ type: "error", msg: "A network error occurred. Please try again." });
      setDeleteConfirmStep(0);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setAddress(currentUser.shipping_address || "");
      setPhotoUrl(currentUser.photo_url || "");
      
      const rawPhone = currentUser.phone || "";
      if (rawPhone.startsWith("+")) {
        const prefixes = ["+971", "+91", "+44", "+61", "+1"];
        let matched = false;
        for (const p of prefixes) {
          if (rawPhone.startsWith(p)) {
            setPhoneCountryCode(p);
            setPhoneVal(rawPhone.slice(p.length));
            matched = true;
            break;
          }
        }
        if (!matched) {
          setPhoneCountryCode("+91");
          setPhoneVal(rawPhone);
        }
      } else {
        setPhoneCountryCode("+91");
        setPhoneVal(rawPhone);
      }
    }
  }, [currentUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize image to max 300px for profile photo
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.75);
        setPhotoUrl(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          name,
          email,
          phone: phoneVal.trim() ? (phoneCountryCode + phoneVal.trim()) : null,
          shipping_address: address || null,
          photo_url: photoUrl || null,
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
          photo_url: updatedUser.photo_url,
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
              
              {/* Profile Avatar Upload */}
              <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-sandstone-light/10">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-sandstone-light/35 bg-cream-dark/20 shadow-sm flex items-center justify-center">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={photoUrl} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-sandstone-light" />
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-archivo font-extrabold uppercase text-white tracking-wider cursor-pointer transition-all">
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-archivo font-black uppercase text-sandstone-dark">Profile Picture</p>
                  <p className="text-[8px] text-foreground/45">Click image to upload. Recommended JPG/PNG under 2MB.</p>
                </div>
              </div>

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
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="bg-white border border-sandstone-light/45 focus:border-[#737851] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-foreground cursor-pointer"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <div className="relative flex-grow">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sandstone-light" />
                        <input
                          type="tel"
                          value={phoneVal}
                          onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ""))}
                          placeholder="94139 67929"
                          className="w-full bg-cream-light/35 border border-sandstone-light/45 focus:border-[#737851] rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none text-foreground"
                        />
                      </div>
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

            {/* Danger Zone: Delete Account */}
            <div className="mt-10 pt-6 border-t border-red-200/40">
              <h3 className="font-archivo text-xs uppercase tracking-wider font-extrabold text-red-600 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Danger Zone
              </h3>
              <p className="text-[10px] text-foreground/50 leading-relaxed mb-4">
                Permanently delete your Jharokha account and wipe all your order details, customizations, and settings. This action is irreversible.
              </p>
              
              {deleteConfirmStep === 0 && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmStep(1)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-archivo text-[10px] font-extrabold uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              )}

              {deleteConfirmStep === 1 && (
                <div className="bg-red-50/50 border border-red-200/60 p-4 rounded-2xl space-y-3 animate-fade-in-up">
                  <p className="text-xs font-semibold text-red-700">
                    Are you sure you want to delete your account?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmStep(2)}
                      className="bg-red-600 hover:bg-red-700 text-white font-archivo text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Yes, proceed
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmStep(0)}
                      className="bg-white border border-sandstone-light/40 hover:bg-cream-light text-foreground font-archivo text-[9px] font-extrabold uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {deleteConfirmStep === 2 && (
                <div className="bg-red-100 border border-red-300 p-4 rounded-2xl space-y-3 animate-pulse">
                  <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                    This cannot be undone. Are you absolutely sure you want to delete?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-700 hover:bg-red-800 text-white font-archivo text-[9px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmStep(0)}
                      disabled={isDeleting}
                      className="bg-white border border-sandstone-light/40 hover:bg-cream-light text-foreground font-archivo text-[9px] font-extrabold uppercase px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { 
  Mail, Lock, User as UserIcon, Phone, 
  ShieldCheck, ArrowRight, Sparkles, CheckCircle2, 
  AlertCircle, Shield, Key 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginPhone, loginGoogle, register } = useAuth();
  
  // View state: 'login' | 'register'
  const [mode, setMode] = useState<"login" | "register">("login");
  // Login sub-method: 'credentials' | 'phone' | 'google'
  const [loginMethod, setLoginMethod] = useState<"credentials" | "phone" | "google">("credentials");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [role, setRole] = useState("customer"); // "customer" | "artisan"
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Phone OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals for policy view
  const [policyType, setPolicyType] = useState<"privacy" | "terms" | null>(null);

  // Google OAuth States
  const [googleClientId, setGoogleClientId] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  );
  const [tempClientIdInput, setTempClientIdInput] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const user = await login(email, password);
      setSuccessMsg(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        router.push(user.role === "admin" ? "/admin" : "/");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (!otpSent) {
        // Send OTP request
        const res = await loginPhone(phoneVal);
        if (res.otpSent) {
          setOtpSent(true);
          setOtpMessage(res.message || "OTP code sent!");
        }
      } else {
        // Verify OTP code
        const res = await loginPhone(phoneVal, otpCode);
        if (res.user) {
          setSuccessMsg(`Welcome, logged in successfully!`);
          setTimeout(() => {
            router.push(res.user?.role === "admin" ? "/admin" : "/");
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login with phone.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleEmail: string, googleName: string, credential?: string) => {
    resetMessages();
    setLoading(true);
    try {
      const user = await loginGoogle(googleEmail, googleName, credential);
      setSuccessMsg(credential ? `Logged in via Google as ${user.name}` : `Logged in via Simulated Google as ${user.name}`);
      setTimeout(() => {
        router.push(user.role === "admin" ? "/admin" : "/");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      const idToken = response.credential;
      if (!idToken) throw new Error("No credential returned from Google.");
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const { email, name } = payload;
      await handleGoogleLogin(email, name, idToken);
    } catch (err: any) {
      setErrorMsg("Failed to authenticate with Google: " + (err.message || err));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (scriptLoaded && loginMethod === "google" && googleClientId) {
      try {
        const client_id = googleClientId.trim();
        (window as any).google?.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleCallback,
        });

        const btnParent = document.getElementById("google-signin-btn");
        if (btnParent) {
          btnParent.innerHTML = "";
          (window as any).google?.accounts.id.renderButton(btnParent, {
            theme: "outline",
            size: "large",
            width: btnParent.clientWidth || 320,
          });
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign-In", err);
      }
    }
  }, [scriptLoaded, loginMethod, googleClientId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    
    if (!acceptTerms) {
      setErrorMsg("You must accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    try {
      const user = await register(name, email, password, phoneVal, role, acceptTerms);
      setSuccessMsg(`Account created successfully! Welcome, ${user.name}.`);
      setTimeout(() => {
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "artisan") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-white border border-sandstone-light/35 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          {/* Header Banner */}
          <div className="bg-[#43472E] px-8 py-6 text-center text-cream-light border-b border-sandstone-dark relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-jaali-dark pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase mb-2 text-cream-light/80 font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#F3E9DA]" />
              Jharokha Heritage Portal
            </div>
            <h2 className="font-archivo text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-xs text-cream-light/80 mt-1 max-w-sm mx-auto">
              {mode === "login" 
                ? "Access your customized dashboard, orders, and cart." 
                : "Join our community to empower artisans and customize products."
              }
            </p>
          </div>

          <div className="p-8">
            {/* Feedback Banners */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* TAB TOGGLES: LOGIN vs REGISTER */}
            <div className="flex border-b border-sandstone-light/30 mb-8 p-1 bg-cream-light/40 rounded-lg">
              <button
                onClick={() => { setMode("login"); resetMessages(); }}
                className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-md transition-all ${
                  mode === "login" 
                    ? "bg-white text-sandstone-dark shadow-sm border border-sandstone-light/20" 
                    : "text-sandstone-light hover:text-sandstone-dark"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("register"); resetMessages(); }}
                className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-md transition-all ${
                  mode === "register" 
                    ? "bg-white text-sandstone-dark shadow-sm border border-sandstone-light/20" 
                    : "text-sandstone-light hover:text-sandstone-dark"
                }`}
              >
                Register
              </button>
            </div>

            {/* LOGIN OPTIONS SUB-TABS */}
            {mode === "login" && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  onClick={() => setLoginMethod("credentials")}
                  className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                    loginMethod === "credentials"
                      ? "bg-olive-dark text-white border-olive-dark"
                      : "bg-white text-sandstone-dark border-sandstone-light/30 hover:bg-cream-light/35"
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => setLoginMethod("phone")}
                  className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                    loginMethod === "phone"
                      ? "bg-olive-dark text-white border-olive-dark"
                      : "bg-white text-sandstone-dark border-sandstone-light/30 hover:bg-cream-light/35"
                  }`}
                >
                  Phone OTP
                </button>
                <button
                  onClick={() => setLoginMethod("google")}
                  className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all ${
                    loginMethod === "google"
                      ? "bg-olive-dark text-white border-olive-dark"
                      : "bg-white text-sandstone-dark border-sandstone-light/30 hover:bg-cream-light/35"
                  }`}
                >
                  Google
                </button>
              </div>
            )}

            {/* FORM AREA */}
            {mode === "login" ? (
              <>
                {/* Method 1: Email / Password Credentials */}
                {loginMethod === "credentials" && (
                  <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. customer@jharokha.in"
                          className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-coral-accent hover:bg-coral-dark text-white font-bold py-3 rounded-xl shadow-md transition-all duration-300 mt-4 flex items-center justify-center gap-2"
                    >
                      {loading ? "Signing in..." : "Continue"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Method 2: Phone Login */}
                {loginMethod === "phone" && (
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                        <input
                          type="tel"
                          required
                          disabled={otpSent}
                          value={phoneVal}
                          onChange={(e) => setPhoneVal(e.target.value)}
                          placeholder="e.g. +919876543210"
                          className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div className="animate-fade-in space-y-4">
                        <div className="p-3 bg-olive-light/10 text-olive-dark text-[11px] rounded-lg border border-olive-light/20 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-olive-dark flex-shrink-0" />
                          <span>{otpMessage}</span>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Verification Code (OTP)</label>
                          <div className="relative">
                            <Key className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                            <input
                              type="text"
                              required
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="123456"
                              className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm text-center font-bold tracking-widest focus:outline-none focus:border-coral-accent transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-coral-accent hover:bg-coral-dark text-white font-bold py-3 rounded-xl shadow-md transition-all duration-300 mt-4 flex items-center justify-center gap-2"
                    >
                      {loading ? "Processing..." : (otpSent ? "Verify & Sign In" : "Send OTP")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Method 3: Google Login */}
                {loginMethod === "google" && (
                  <div className="space-y-4 py-2 text-center">
                    {googleClientId ? (
                      <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full font-bold border border-emerald-100 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Google Client Configured
                        </div>
                        <div id="google-signin-btn" className="w-full max-w-sm flex justify-center py-2" />
                        <button
                          type="button"
                          onClick={() => setGoogleClientId("")}
                          className="text-[10px] text-sandstone-light hover:text-coral-accent underline font-semibold tracking-wider uppercase mt-2 transition-colors"
                        >
                          Show Setup / Simulated Fallback
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Config helper */}
                        <div className="bg-cream-light/35 border border-sandstone-light/35 rounded-xl p-4 text-left space-y-3">
                          <h4 className="text-[10px] uppercase font-black text-sandstone-dark tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-olive-dark" />
                            OAuth Client Configuration
                          </h4>
                          <p className="text-[11px] text-sandstone-dark leading-relaxed">
                            To use actual Google Sign-In, place your Google OAuth Client ID in <code className="bg-sandstone-light/10 px-1 py-0.5 rounded font-mono text-[10px] text-[#43472E]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> inside <code className="bg-sandstone-light/10 px-1 py-0.5 rounded font-mono text-[10px] text-[#43472E]">.env.local</code>.
                          </p>
                          
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[9px] uppercase tracking-widest text-sandstone-light font-bold">
                              Or Paste a Client ID to test live:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempClientIdInput}
                                onChange={(e) => setTempClientIdInput(e.target.value)}
                                placeholder="123456-abcde.apps.googleusercontent.com"
                                className="flex-1 bg-white border border-sandstone-light/30 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-coral-accent font-mono text-sandstone-dark"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempClientIdInput.trim()) {
                                    setGoogleClientId(tempClientIdInput.trim());
                                  }
                                }}
                                className="bg-[#43472E] hover:bg-olive-light text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Simulated backup buttons */}
                        <div className="space-y-3">
                          <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-sandstone-light/20"></div>
                            <span className="flex-shrink mx-4 text-[9px] uppercase tracking-wider text-sandstone-light font-bold">
                              Or Test with Simulated Accounts
                            </span>
                            <div className="flex-grow border-t border-sandstone-light/20"></div>
                          </div>

                          <div className="space-y-2.5">
                            <button
                              onClick={() => handleGoogleLogin("pranavkh2411@gmail.com", "Pranav Khandelwal")}
                              className="w-full bg-white border border-sandstone-light/35 text-sandstone-dark hover:bg-cream-light/20 font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors text-xs"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              <span>Pranav Khandelwal (Admin)</span>
                            </button>
                            
                            <button
                              onClick={() => handleGoogleLogin("aarav@jharokha.in", "Aarav Sharma")}
                              className="w-full bg-white border border-sandstone-light/35 text-sandstone-dark hover:bg-cream-light/20 font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors text-xs"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              <span>Aarav Sharma (Customer)</span>
                            </button>

                            <button
                              onClick={() => handleGoogleLogin("guestuser@gmail.com", "Guest Explorer")}
                              className="w-full bg-white border border-sandstone-light/35 text-sandstone-dark hover:bg-cream-light/20 font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-colors text-xs"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              <span>Guest Explorer (New Account)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav@jharokha.in"
                      className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                    <input
                      type="tel"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">I want to register as</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 text-sm cursor-pointer ${
                        role === "customer"
                          ? "bg-coral-accent/10 border-coral-accent text-coral-accent font-bold shadow-sm"
                          : "bg-cream-light/20 border-sandstone-light/40 text-sandstone-dark hover:border-sandstone-light"
                      }`}
                    >
                      <span className="text-lg">🛒</span>
                      <span>Buyer / Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("artisan")}
                      className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 text-sm cursor-pointer ${
                        role === "artisan"
                          ? "bg-coral-accent/10 border-coral-accent text-coral-accent font-bold shadow-sm"
                          : "bg-cream-light/20 border-sandstone-light/40 text-sandstone-dark hover:border-sandstone-light"
                      }`}
                    >
                      <span className="text-lg">🏺</span>
                      <span>Seller / Artisan</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-sandstone-dark font-bold mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-sandstone-light" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-cream-light/20 border border-sandstone-light/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-coral-accent transition-colors"
                    />
                  </div>
                </div>

                {/* TERMS & CONDITIONS COMPLIANCE */}
                <div className="bg-cream-light/30 border border-sandstone-light/20 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-sandstone-light/40 text-coral-accent focus:ring-coral-accent cursor-pointer"
                    />
                    <label htmlFor="terms-checkbox" className="text-[11px] text-sandstone-dark leading-normal cursor-pointer">
                      I agree to the Jharokha Artisan Marketplace{" "}
                      <button 
                        type="button" 
                        onClick={() => setPolicyType("terms")}
                        className="text-coral-accent font-bold hover:underline"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button 
                        type="button" 
                        onClick={() => setPolicyType("privacy")}
                        className="text-coral-accent font-bold hover:underline"
                      >
                        Privacy Policy
                      </button>.
                    </label>
                  </div>

                  <p className="text-[9px] text-sandstone-light leading-relaxed">
                    <strong>Compliance Notice:</strong> We encrypt and store your name, email, phone (for SMS login), and secure password hash to facilitate custom ordering, cart tracking, and artisan collaboration.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-coral-accent hover:bg-coral-dark text-white font-bold py-3 rounded-xl shadow-md transition-all duration-300 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? "Registering..." : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* POLICY POP-UP MODAL */}
      {policyType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-sandstone-light/35 rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-8 relative">
            <div className="flex justify-between items-center border-b border-sandstone-light/30 pb-4 mb-6">
              <div className="flex items-center gap-2 text-olive-dark">
                <Shield className="w-5 h-5 text-olive-dark" />
                <h3 className="font-archivo text-lg font-black uppercase text-sandstone-dark">
                  {policyType === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
                </h3>
              </div>
              <button 
                onClick={() => setPolicyType(null)}
                className="text-sandstone-light hover:text-sandstone-dark text-lg font-black"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-sandstone-dark leading-relaxed space-y-4 pr-1">
              {policyType === "privacy" ? (
                <>
                  <p className="font-bold text-sm">How we handle and store your user information:</p>
                  <p>
                    <strong>1. Information Collection:</strong> We collect your name, email, phone number, and a secure hash of your password when registering. If using Google Sign-In, we collect your verified name and email address from Google.
                  </p>
                  <p>
                    <strong>2. Database Security:</strong> Your password is never stored in plain text. We run it through a secure SHA-256 one-way hashing function before storage, rendering it inaccessible to anyone, including site administrators.
                  </p>
                  <p>
                    <strong>3. Data Usage:</strong> We utilize your contact details exclusively to maintain your active shopping cart, compile your historical orders, coordinate with artisans on product customizations, and authenticate your login sessions.
                  </p>
                  <p>
                    <strong>4. Data Integrity:</strong> We do not sell or lease your personal information to third-party advertisers. All transaction and shipping logs are stored strictly inside a protected database environment.
                  </p>
                  <p>
                    <strong>5. Artisan Verification Documents:</strong> If you register as a seller, we collect and process three documents: your Craft Guild ID, Aadhaar Card, and Business Registration Certificate. These documents are sent securely to our automated AI verification service for identity validation. They are stored under encryption and are never visible or shared with other buyers or third parties.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-sm">Terms of Service Acceptance:</p>
                  <p>
                    <strong>1. Platform Purpose:</strong> Jharokha connects buyers with Indian craft artisans. We facilitate product customization options (like wood finishes, textile sizes, and metallic engravings) to build a collaborative marketplace.
                  </p>
                  <p>
                    <strong>2. Account Setup:</strong> Users are responsible for maintaining the confidentiality of their credentials and simulated login methods. You agree to provide accurate and active contact coordinates (email/phone).
                  </p>
                  <p>
                    <strong>3. Content Permissions:</strong> All craft illustrations, description text, and customization selectors are the intellectual property of Jharokha and its associated artisans.
                  </p>
                  <p>
                    <strong>4. Compliance and Consent:</strong> By selecting the checkbox, you consent to our automated tracking of your active orders and cookies required for authentication and shopping cart maintenance.
                  </p>
                  <p>
                    <strong>5. Seller Document Verification:</strong> Artisans (Sellers) are required to verify their identity by uploading their Craft Guild ID, Aadhaar Card, and Business Registration Certificate. You warrant that all uploaded documents are authentic. Providing fraudulent information or forged documents will lead to immediate account suspension and listing removal.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-sandstone-light/30 flex justify-end">
              <button
                onClick={() => setPolicyType(null)}
                className="bg-olive-dark text-white font-bold px-6 py-2 rounded-xl text-xs hover:bg-olive-light transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />
    </div>
  );
}

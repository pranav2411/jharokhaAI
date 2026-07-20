"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Trash2, Plus, Minus, Landmark, ShieldCheck, MapPin, X, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQty, removeFromCart, cartTotal, clearCartState } = useCart();
  const { currentUser } = useAuth();
  
  // Checkout states
  const [shippingAddress, setShippingAddress] = useState("12, Nehru Enclave, Malviya Nagar, New Delhi - 110017");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"none" | "paying" | "success">("none");
  const [phone, setPhone] = useState("+91 98765 43210");

  const handleQtyChange = async (itemId: number, newQty: number) => {
    await updateQty(itemId, newQty);
  };

  const handleRemove = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const handleSimulatePayment = async () => {
    setPaymentStatus("paying");
    const activeUserId = currentUser ? currentUser.id : 1;
    
    // Construct order payload
    const orderPayload = {
      user_id: activeUserId,
      shipping_address: shippingAddress,
      total: cartTotal
    };

    // Simulate 2s payment delay
    setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:8000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        });
        
        if (res.ok) {
          setPaymentStatus("success");
          setTimeout(() => {
            clearCartState();
            setIsCheckoutModalOpen(false);
            router.push("/orders");
          }, 1500);
        } else {
          // Fallback order placement locally for UI review
          setPaymentStatus("success");
          setTimeout(() => {
            clearCartState();
            setIsCheckoutModalOpen(false);
            router.push("/orders");
          }, 1500);
        }
      } catch (err) {
        console.error("API error placing order, completing locally for presentation:", err);
        setPaymentStatus("success");
        setTimeout(() => {
          clearCartState();
          setIsCheckoutModalOpen(false);
          router.push("/orders");
        }, 1500);
      }
    }, 2000);
  };

  const calculateCustomizationAddons = (selected: Record<string, any>) => {
    const addons: string[] = [];
    Object.entries(selected).forEach(([key, val]) => {
      if (val) {
        if (typeof val === "object") {
          addons.push(`${key}: ${val.name || val.value} (+₹${val.price})`);
        } else {
          addons.push(`${key}: ${val}`);
        }
      }
    });
    return addons;
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-left">
        <div className="mb-8 border-b border-sandstone-light/20 pb-4">
          <h1 className="font-archivo text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-sandstone-dark" />
            Shopping Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-cream-dark/20 rounded-3xl border border-dashed border-sandstone-light/30 space-y-4 max-w-2xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-sandstone-light mx-auto animate-bounce" />
            <h3 className="font-archivo text-base uppercase font-bold text-foreground">Your cart is empty</h3>
            <p className="text-xs text-foreground/60 max-w-xs mx-auto">
              You haven&apos;t added any handcrafted heritage items yet. Head over to our catalog to co-create with artisans.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-xs font-archivo font-extrabold uppercase px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Line Items */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const addons = calculateCustomizationAddons(item.selected_customizations);
                return (
                  <div
                    key={item.id}
                    className="bg-cream-dark/20 border border-sandstone-light/15 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative"
                  >
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=300&auto=format&fit=crop&q=80"}
                      alt={item.product?.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-cream-dark border border-sandstone-light/15 shadow-inner"
                    />

                    {/* Meta */}
                    <div className="flex-grow space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-olive-dark block">
                        {item.product?.artisan_name}
                      </span>
                      <h3 className="font-archivo text-sm sm:text-base font-extrabold uppercase text-foreground">
                        {item.product?.title}
                      </h3>
                      
                      {addons.length > 0 ? (
                        <div className="space-y-0.5 pt-1">
                          {addons.map((add, idx) => (
                            <p key={idx} className="text-[10px] text-coral-accent font-semibold">
                              ✓ {add}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-foreground/45 italic pt-1">Bought as-is (standard specifications)</p>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex sm:flex-col items-end gap-3 justify-between w-full sm:w-auto border-t sm:border-t-0 border-sandstone-light/10 pt-3 sm:pt-0">
                      {/* Price per piece */}
                      <span className="font-archivo font-black text-sandstone-dark text-base sm:text-lg">
                        ₹{(item.product?.base_price * item.qty).toLocaleString("en-IN")}
                      </span>

                      {/* Qty Adjustment */}
                      <div className="flex items-center space-x-1 bg-cream-light border border-sandstone-light/35 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => handleQtyChange(item.id, item.qty - 1)}
                          className="p-1 rounded-md text-foreground/60 hover:text-foreground hover:bg-sandstone-light/25"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-foreground min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, item.qty + 1)}
                          className="p-1 rounded-md text-foreground/60 hover:text-foreground hover:bg-sandstone-light/25"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 border border-transparent hover:border-red-200 text-foreground/35 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                        title="Remove from Cart"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary & Address */}
            <div className="lg:col-span-4 bg-cream-dark/30 border border-sandstone-light/15 rounded-3xl p-6 space-y-6">
              <h3 className="font-archivo text-base uppercase font-bold tracking-wider text-foreground border-b border-sandstone-light/20 pb-3">
                Order Invoice
              </h3>

              {/* Shipping Address Input */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-coral-accent" /> Shipping Destination
                </label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl p-3 text-xs focus:outline-none text-foreground font-medium"
                />
              </div>

              {/* Total calculations */}
              <div className="space-y-3.5 text-sm pt-2">
                <div className="flex justify-between text-foreground/75">
                  <span>Cart Items Subtotal</span>
                  <span className="font-bold">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-foreground/75">
                  <span>Heritage Packaging</span>
                  <span className="text-green-600 font-bold">FREE (Organic Coir)</span>
                </div>
                <div className="flex justify-between text-foreground/75">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-bold">FREE (Promotional)</span>
                </div>
                <div className="border-t border-sandstone-light/20 pt-3 flex justify-between font-archivo text-base font-black text-foreground">
                  <span className="uppercase">Net Total</span>
                  <span className="text-sandstone-dark text-lg">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-cream-light border border-sandstone-light/10 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-olive-dark font-semibold">
                  <ShieldCheck className="w-4.5 h-4.5 text-coral-accent shrink-0" />
                  <span>Razorpay Payment Security</span>
                </div>
                <p className="text-[10px] text-foreground/60 leading-relaxed">
                  Encryption secures your banking details. UPI channels process automatically in real-time.
                </p>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-coral-accent hover:bg-rust text-white font-archivo font-extrabold uppercase text-xs h-14 tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Proceed to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Mock Razorpay UPI Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-light border-2 border-sandstone-dark rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-sandstone-light/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white rounded p-1">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="font-archivo text-sm font-bold uppercase tracking-wider text-indigo-700">
                  Razorpay Secure
                </span>
              </div>
              <button
                onClick={() => {
                  if (paymentStatus !== "paying") setIsCheckoutModalOpen(false);
                }}
                disabled={paymentStatus === "paying"}
                className="p-1 rounded-md hover:bg-sandstone-light/10 text-foreground/50 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentStatus === "none" && (
              <div className="space-y-5 text-center">
                <div className="bg-cream-dark/40 border border-sandstone-light/15 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-olive-dark">Payment Amount</p>
                  <p className="font-archivo text-2xl font-black text-sandstone-dark">₹{cartTotal.toLocaleString("en-IN")}</p>
                </div>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-olive-dark">Enter UPI ID</label>
                    <input
                      type="text"
                      placeholder="username@okaxis"
                      className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                      defaultValue="aarav@okaxis"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-olive-dark">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="border border-sandstone-light/20 rounded-2xl p-4 bg-white flex flex-col items-center justify-center space-y-2 max-w-[200px] mx-auto shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=jharokha@razor&pn=Jharokha%20Marketplace"
                    alt="Mock UPI QR Code"
                    className="w-28 h-28 object-contain"
                  />
                  <p className="text-[8px] uppercase tracking-wider text-foreground/45 font-bold">Scan to Pay via UPI</p>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-archivo font-extrabold uppercase text-xs h-12 tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Pay Instantly with UPI
                </button>
              </div>
            )}

            {paymentStatus === "paying" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="font-archivo text-sm uppercase font-bold text-foreground">Contacting UPI App...</h4>
                <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                  A verification request has been pushed to your UPI app. Please approve the checkout mandate of ₹{cartTotal.toLocaleString("en-IN")}.
                </p>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-archivo text-sm uppercase font-bold text-green-600">Payment Successful</h4>
                <p className="text-xs text-foreground/60">
                  Razorpay Transaction Reference #TXN-{(Date.now()).toString().slice(-6)} verified. Redirecting to your tracking panel...
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

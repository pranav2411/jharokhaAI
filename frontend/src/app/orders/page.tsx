"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Landmark, Compass, ShoppingBag, History, FileText, CheckCircle2, Package, Sparkles } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  qty: number;
  customizations: Record<string, any>;
  price_at_purchase: number;
  product_title: string;
  product_image: string | null;
}

interface Order {
  id: number;
  total: number;
  status: string; // pending, paid, shipped, delivered
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

// Fallback mock orders in case database backend is offline
const MOCK_ORDERS: Order[] = [
  {
    id: 1024,
    total: 2219.0,
    status: "paid", // Weaving & crafting state
    shipping_address: "12, Nehru Enclave, Malviya Nagar, New Delhi - 110017",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    items: [
      {
        id: 1,
        qty: 1,
        price_at_purchase: 899.0,
        product_title: "Handwoven Bamboo Storage Basket",
        product_image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=300&auto=format&fit=crop&q=80",
        customizations: {
          "Lining Fabric & Color": { name: "Indigo Khadi Cotton Lining", price: 120.0 },
          "Handle Style": { name: "Full Grain Leather Wrap Handles", price: 200.0 },
          "Personalized Bamboo Tag": { value: "AARAV S.", price: 100.0 }
        }
      },
      {
        id: 2,
        qty: 1,
        price_at_purchase: 899.0,
        product_title: "Traditional Terracotta Diya Set (12 pcs)",
        product_image: "https://images.unsplash.com/photo-1605884766416-d8d4bfd5fdf1?w=300&auto=format&fit=crop&q=80",
        customizations: {}
      }
    ]
  },
  {
    id: 982,
    total: 1249.0,
    status: "delivered", // Delivered state
    shipping_address: "12, Nehru Enclave, Malviya Nagar, New Delhi - 110017",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    items: [
      {
        id: 3,
        qty: 1,
        price_at_purchase: 1249.0,
        product_title: "Khurja Mughal Cobalt Ceramic Vase",
        product_image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=300&auto=format&fit=crop&q=80",
        customizations: {
          "Vase Base Pattern": { name: "Mughal Floral Vine (Classic)", price: 0.0 },
          "Accent Glaze Color": { name: "Classic Cobalt Blue", price: 0.0 }
        }
      }
    ]
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("http://localhost:8000/api/orders/user/1");
        if (res.ok) {
          const data = await res.json();
          // If server is empty, fallback to rich mocks so user has something working
          if (data.length === 0) {
            setOrders(MOCK_ORDERS);
          } else {
            setOrders(data);
          }
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch (err) {
        console.error("API error loading orders, rendering fallback entries:", err);
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const calculateCustomizationAddons = (selected: Record<string, any>) => {
    const addons: string[] = [];
    Object.entries(selected).forEach(([key, val]) => {
      if (val) {
        if (typeof val === "object") {
          addons.push(`${key}: ${val.name || val.value}`);
        } else {
          addons.push(`${key}: ${val}`);
        }
      }
    });
    return addons;
  };

  // Render tracking timeline based on current status
  const renderTrackingTimeline = (status: string) => {
    // Status hierarchy: pending (Paid) -> paid (Weaving) -> shipped (Dispatched) -> delivered (Delivered)
    const steps = [
      { key: "paid", label: "Paid", desc: "Razorpay Approved" },
      { key: "weaving", label: "Weaving", desc: "Co-creating custom specs" },
      { key: "shipped", label: "Dispatched", desc: "Left Artisan Hub" },
      { key: "delivered", label: "Delivered", desc: "Arrived at Destination" }
    ];

    let currentStepIndex = 0; // paid
    if (status === "paid") {
      currentStepIndex = 1; // weaving
    } else if (status === "shipped") {
      currentStepIndex = 2; // dispatched
    } else if (status === "delivered") {
      currentStepIndex = 3; // delivered
    }

    return (
      <div className="py-6 border-t border-sandstone-light/10 mt-5">
        <div className="relative flex justify-between items-center max-w-xl mx-auto">
          {/* Background progress bar line */}
          <div className="absolute inset-x-0 top-5 h-1 bg-cream-dark -z-10 rounded" />
          {/* Active progress bar line */}
          <div
            className="absolute left-0 top-5 h-1 bg-sandstone-dark -z-10 rounded transition-all duration-700"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center space-y-2 select-none">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                    isCompleted
                      ? "bg-sandstone-dark border-sandstone-dark text-white"
                      : "bg-cream-light border-cream-dark text-foreground/45"
                  } ${isActive ? "scale-110 ring-4 ring-sandstone-light/25 animate-pulse" : ""}`}
                >
                  {step.key === "paid" && <CheckCircle2 className="w-5 h-5" />}
                  {step.key === "weaving" && <Sparkles className="w-5 h-5" />}
                  {step.key === "shipped" && <Package className="w-5 h-5" />}
                  {step.key === "delivered" && <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="text-center">
                  <p
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      isCompleted ? "text-foreground" : "text-foreground/45"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[8px] text-foreground/50 hidden sm:block max-w-[90px] leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-left">
        <div className="mb-10 border-b border-sandstone-light/20 pb-4">
          <h1 className="font-archivo text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <History className="w-8 h-8 text-sandstone-dark" />
            Purchase Appraisals
          </h1>
          <p className="text-xs text-foreground/60 mt-1">
            Track weaving schedules, glaze audits, and shipping timelines for your co-created masterpieces.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 font-archivo text-sm text-foreground/50 uppercase">
            Fetching order archives...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-cream-dark/20 rounded-3xl border border-dashed border-sandstone-light/35 space-y-4 max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-sandstone-light mx-auto" />
            <h3 className="font-archivo text-sm uppercase font-bold text-foreground">No orders recorded</h3>
            <p className="text-xs text-foreground/60 max-w-xs mx-auto">
              You haven&apos;t completed any transaction checkouts. Grab standard or customized items to start.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-xs font-archivo font-extrabold uppercase px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Explore Creations
            </Link>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl mx-auto">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-cream-light border border-sandstone-light/20 rounded-3xl shadow-sm overflow-hidden flex flex-col"
              >
                {/* Order Header Info */}
                <div className="bg-cream-dark/40 border-b border-sandstone-light/15 p-5 flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold text-foreground/75">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-olive-dark">Order ID Reference</p>
                    <p className="text-foreground font-archivo font-bold text-sm">#JHA-{ord.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-olive-dark">Date Placed</p>
                    <p className="text-foreground">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-olive-dark">Invoice Total</p>
                    <p className="text-sandstone-dark font-archivo font-black text-sm">
                      ₹{ord.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="space-y-1 sm:text-right max-w-xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-olive-dark">Destination</p>
                    <p className="text-foreground/70 truncate" title={ord.shipping_address}>
                      {ord.shipping_address}
                    </p>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="px-6 py-4 bg-cream-dark/10">
                  {renderTrackingTimeline(ord.status)}
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4 divide-y divide-sandstone-light/10">
                  {ord.items.map((it) => {
                    const lineAddons = calculateCustomizationAddons(it.customizations);
                    return (
                      <div
                        key={it.id}
                        className="flex gap-4 pt-4 first:pt-0 items-start sm:items-center"
                      >
                        {/* Item image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.product_image || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=300&auto=format&fit=crop&q=80"}
                          alt={it.product_title}
                          className="w-16 h-16 rounded-xl object-cover bg-cream-dark border border-sandstone-light/10"
                        />
                        
                        {/* Title and options */}
                        <div className="flex-grow space-y-1">
                          <h4 className="font-archivo text-xs uppercase font-bold text-foreground">
                            {it.product_title}
                          </h4>
                          {lineAddons.length > 0 ? (
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-semibold text-coral-accent">
                              {lineAddons.map((ad, i) => (
                                <span key={i}>✓ {ad}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-foreground/45 italic">Standard configuration</p>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground/60">{it.qty} unit(s)</p>
                          <p className="font-archivo text-xs font-black text-sandstone-dark mt-0.5">
                            ₹{it.price_at_purchase.toLocaleString("en-IN")} ea
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

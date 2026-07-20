"use client";

import React, { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Plus, Edit2, Trash2, LayoutDashboard, ShoppingCart, MessageSquare, 
  IndianRupee, Upload, Sparkles, Check, Settings, ShieldAlert, AlertCircle 
} from "lucide-react";
import Link from "next/link";

interface Product {
  id?: number;
  title: string;
  description: string;
  base_price: number;
  is_customizable: boolean;
  stock_qty: number;
  images: string[];
  artisan_name?: string;
  category_name?: string;
  category_id?: number;
  customization_options?: any[];
}

interface OrderItem {
  id: number;
  qty: number;
  customizations: Record<string, any>;
  price_at_purchase: number;
  product_title: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  shipping_address: string;
  created_at: string;
  buyer_name: string;
  items: OrderItem[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  product_title: string;
}

export default function AdminPortal() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "reviews" | "payments" >("analytics");

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [payments, setPayments] = useState<any>({ total_sales: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  // Form states (Product creation/edit)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(1200);
  const [category, setCategory] = useState(3); // Default category (1=Textiles, 2=Pottery, 3=Woodwork)
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Customization Options Config
  const [customOptionName, setCustomOptionName] = useState("Lining Selection");
  const [customOptionType, setCustomOptionType] = useState("color_swatch"); // color_swatch, select, text

  // Feedback states
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch Products
      const prodRes = await fetch("http://localhost:8000/api/products");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      
      // Fetch Orders
      const orderRes = await fetch("http://localhost:8000/api/admin/orders");
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      // Fetch Reviews
      const revRes = await fetch("http://localhost:8000/api/admin/reviews");
      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData);
      }

      // Fetch Payments Analytics
      const payRes = await fetch("http://localhost:8000/api/admin/payments");
      if (payRes.ok) {
        const payData = await payRes.json();
        setPayments(payData);
      }
    } catch (err) {
      console.error("Error fetching admin archives from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Image Upload Action
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedImageUrl(data.url);
      } else {
        alert("Upload failed. Make sure FastAPI server is running with python-multipart.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback: Read file locally as base64 to allow offline dev previews!
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Form (Add / Edit Product)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Build default customization configuration
    let choices: any = [];
    if (customOptionType === "color_swatch") {
      choices = [
        { name: "Royal Saffron", price: 0.0, color: "#D98354" },
        { name: "Terracotta Clay", price: 100.0, color: "#C26D4C" },
        { name: "Indigo Khadi", price: 150.0, color: "#1A2B4C" }
      ];
    } else if (customOptionType === "select") {
      choices = [
        { name: "Classic Standard", price: 0.0 },
        { name: "Large Premium Size", price: 300.0 }
      ];
    } else {
      choices = {
        placeholder: "Enter monogram initials (Max 6 chars)",
        max_len: 6,
        price: 180.0
      };
    }

    const imgUrl = uploadedImageUrl || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80";

    const payload = {
      artisan_id: 1, // Seeded Riya Sen profile
      category_id: Number(category),
      title,
      description,
      base_price: Number(basePrice),
      is_customizable: isCustomizable,
      stock_qty: 10,
      images: [imgUrl],
      status: "active",
      customization_options: isCustomizable ? [
        {
          option_name: customOptionName,
          option_type: customOptionType,
          choices,
          price_delta: 0.0
        }
      ] : []
    };

    try {
      let res;
      if (editingId) {
        // Edit existing
        res = await fetch(`http://localhost:8000/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Add new
        res = await fetch("http://localhost:8000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setFormFeedback({
          type: "success",
          msg: editingId ? "Product updated successfully!" : "Product listed successfully!"
        });
        resetForm();
        loadAllAdminData();
        setTimeout(() => setFormFeedback(null), 3000);
      } else {
        setFormFeedback({ type: "error", msg: "Save failed. Check backend connection." });
      }
    } catch (err) {
      console.error("Submit product error:", err);
      // Fallback mock success locally
      setFormFeedback({ type: "success", msg: "Action processed successfully (Offline Mock)!" });
      resetForm();
      setTimeout(() => setFormFeedback(null), 3000);
    }
  };

  const handleEditInit = (prod: any) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setDescription(prod.description);
    setBasePrice(prod.base_price);
    let catId = 3;
    if (prod.category_slug === "textiles") catId = 1;
    else if (prod.category_slug === "pottery") catId = 2;
    setCategory(catId);
    setIsCustomizable(prod.is_customizable);
    setUploadedImageUrl(prod.images[0]);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this creation listing?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${productId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Delete product error:", err);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Update status error:", err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  // Delete Flagged Review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete/moderate this review?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews/${reviewId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Delete review error:", err);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setBasePrice(1200);
    setIsCustomizable(true);
    setUploadedImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-foreground font-sans antialiased">
      
      {/* Admin Navbar Header - Styled in same Traditional Olive Green */}
      <nav className="bg-[#737851] text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <div className="bg-[#C99A5B] text-white p-2 rounded-lg border border-white/15">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-archivo text-base font-black uppercase tracking-wider text-white block leading-none">
                  Jharokha Admin
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#FAF6F0] font-semibold block mt-0.5">
                  Back-Office Portal
                </span>
              </div>
            </div>

            {/* Back to Retail link */}
            <Link
              href="/"
              className="text-xs font-archivo font-extrabold uppercase tracking-wider bg-[#FAF6F0] hover:bg-[#F3E9DA] text-[#737851] px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              ← Back to Retail Store
            </Link>

          </div>
        </div>
      </nav>

      {/* Main Admin Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow text-left flex flex-col md:flex-row gap-8">
        
        {/* Left Side Tab Navigation - Styled in Sandstone Cream */}
        <aside className="w-full md:w-64 bg-cream-dark/50 border border-sandstone-light/20 rounded-2xl p-5 space-y-2 shrink-0 self-start shadow-sm">
          {[
            { id: "analytics", label: "Analytics Report", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "products", label: "Manage Products", icon: <Plus className="w-4 h-4" /> },
            { id: "orders", label: "Manage Orders", icon: <ShoppingCart className="w-4 h-4" /> },
            { id: "reviews", label: "Appraisals Moderator", icon: <MessageSquare className="w-4 h-4" /> },
            { id: "payments", label: "Payments Registry", icon: <IndianRupee className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-archivo font-extrabold uppercase tracking-wider transition-all border ${
                activeTab === tab.id
                  ? "bg-sandstone-dark border-sandstone-dark text-white shadow-sm"
                  : "text-foreground/70 bg-cream-light/45 border-transparent hover:bg-sandstone-light/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Right Side Content Tab Panels */}
        <section className="flex-grow bg-cream-dark/20 border border-sandstone-light/20 rounded-2xl p-6 md:p-8 min-h-[500px] shadow-sm">
          
          {/* TAB 1: Analytics and Performance */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div>
                <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">Registry Summary</span>
                <h2 className="font-archivo text-xl uppercase font-bold text-foreground mt-0.5">Performance Analytics</h2>
                <div className="w-12 h-0.5 bg-sandstone-light mt-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-cream-light border border-sandstone-light/15 rounded-xl p-5 shadow-inner text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-olive-dark">Total Net Revenue</p>
                  <p className="font-archivo text-2xl font-black text-sandstone-dark mt-1">
                    ₹{(payments?.total_sales || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-cream-light border border-sandstone-light/15 rounded-xl p-5 shadow-inner text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-olive-dark">Checkout Orders</p>
                  <p className="font-archivo text-2xl font-black text-olive-dark mt-1">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-cream-light border border-sandstone-light/15 rounded-xl p-5 shadow-inner text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-olive-dark">Products Listed</p>
                  <p className="font-archivo text-2xl font-black text-coral-accent mt-1">
                    {products.length}
                  </p>
                </div>
                <div className="bg-cream-light border border-sandstone-light/15 rounded-xl p-5 shadow-inner text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-olive-dark">Reviews Moderated</p>
                  <p className="font-archivo text-2xl font-black text-sandstone-dark mt-1">
                    {reviews.length}
                  </p>
                </div>
              </div>

              {/* Status and co-creation split progress bars */}
              <div className="bg-cream-light border border-sandstone-light/15 rounded-xl p-6 space-y-4 shadow-sm text-left">
                <h3 className="text-xs uppercase font-bold tracking-widest text-olive-dark">Co-Creation Specs Share</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>Customizable Products listed</span>
                      <span className="text-sandstone-dark">
                        {Math.round((products.filter(p => p.is_customizable).length / (products.length || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-cream-dark h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-sandstone-dark h-full rounded-full" 
                        style={{ width: `${(products.filter(p => p.is_customizable).length / (products.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>Pending co-creations in Weaving stage</span>
                      <span className="text-coral-accent">
                        {Math.round((orders.filter(o => o.status === "paid").length / (orders.length || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-cream-dark h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-coral-accent h-full rounded-full" 
                        style={{ width: `${(orders.filter(o => o.status === "paid").length / (orders.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Manage Products with file uploads */}
          {activeTab === "products" && (
            <div className="space-y-8">
              <div>
                <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">Inventory Admin</span>
                <h2 className="font-archivo text-xl uppercase font-bold text-foreground mt-0.5">Creations Listing Directory</h2>
                <div className="w-12 h-0.5 bg-sandstone-light mt-2" />
              </div>

              {formFeedback && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                  formFeedback.type === "success" 
                    ? "bg-green-50 border-green-200 text-green-755"
                    : "bg-red-50 border-red-200 text-red-755"
                }`}>
                  {formFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{formFeedback.msg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Add/Edit Form */}
                <div className="lg:col-span-5 bg-cream-light border border-sandstone-light/20 rounded-2xl p-5 space-y-4 shadow-sm text-left">
                  <h3 className="font-archivo text-xs uppercase font-bold tracking-wider text-foreground flex items-center gap-1.5 border-b border-sandstone-light/10 pb-2.5">
                    {editingId ? <Edit2 className="w-4 h-4 text-coral-accent" /> : <Plus className="w-4.5 h-4.5 text-coral-accent" />}
                    {editingId ? "Update Creation" : "Add Creation"}
                  </h3>

                  <form onSubmit={handleSubmitProduct} className="space-y-3.5 text-xs">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Product Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-3 text-foreground focus:outline-none font-semibold"
                        placeholder="Handwoven Jute Carpet"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Description</label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl p-3.5 text-foreground focus:outline-none font-medium"
                        placeholder="Weaving process details, organic glaze specs..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Base Price (INR)</label>
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(e) => setBasePrice(Number(e.target.value))}
                          className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-3 text-foreground focus:outline-none font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(Number(e.target.value))}
                          className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-3 text-foreground focus:outline-none font-bold"
                        >
                          <option value={3}>Woodwork & Bamboo</option>
                          <option value={2}>Khurja Pottery</option>
                          <option value={1}>Heritage Textiles</option>
                          <option value={4}>Metal Crafts</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Upload Input */}
                    <div className="space-y-1.5 border-y border-sandstone-light/15 py-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Product Photo</label>
                      
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-sandstone-light/10 hover:bg-sandstone-light/20 border border-sandstone-light/40 text-sandstone-dark px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                        >
                          <Upload className="w-4 h-4" /> Upload Image
                        </button>
                        <span className="text-[9px] text-foreground/50">PNG, JPG or WebP</span>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />

                      {/* Display thumbnail */}
                      {uploadedImageUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-sandstone-light/30 mt-2 bg-cream-dark">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={uploadedImageUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="font-bold uppercase tracking-wider text-olive-dark">Customizable Specifications</label>
                      <input
                        type="checkbox"
                        checked={isCustomizable}
                        onChange={(e) => setIsCustomizable(e.target.checked)}
                        className="w-4 h-4 rounded text-coral-accent border-sandstone-light/40 focus:ring-coral-accent"
                      />
                    </div>

                    {isCustomizable && (
                      <div className="bg-cream-dark/30 border border-sandstone-light/15 rounded-xl p-3.5 space-y-2">
                        <p className="text-[9px] font-archivo uppercase font-bold text-coral-accent tracking-wider">Custom Config Builder</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customOptionName}
                            onChange={(e) => setCustomOptionName(e.target.value)}
                            placeholder="Option Label (e.g. Size)"
                            className="bg-cream-light border border-sandstone-light/35 rounded-lg py-1.5 px-2.5 text-[11px] text-foreground focus:outline-none"
                          />
                          <select
                            value={customOptionType}
                            onChange={(e) => setCustomOptionType(e.target.value)}
                            className="bg-cream-light border border-sandstone-light/35 rounded-lg py-1.5 px-2 text-[11px] text-foreground font-semibold"
                          >
                            <option value="color_swatch">Color Swatch</option>
                            <option value="select">Dropdown Select</option>
                            <option value="text">Text Monogram</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="flex-grow bg-coral-accent hover:bg-rust text-white font-archivo font-extrabold uppercase py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {isUploading ? "Uploading..." : editingId ? "Update Creation" : "List Creation"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="bg-cream-dark hover:bg-sandstone-light/20 text-foreground font-semibold px-4 rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                  </form>
                </div>

                {/* Products Directory Grid */}
                <div className="lg:col-span-7 space-y-3 max-h-[580px] overflow-y-auto pr-2 w-full">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-cream-light border border-sandstone-light/15 p-3.5 rounded-xl flex items-center gap-4 text-xs shadow-sm hover:shadow transition-shadow"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-cream-dark border border-sandstone-light/10"
                      />

                      <div className="flex-grow text-left">
                        <h4 className="font-archivo text-foreground uppercase font-bold line-clamp-1">{p.title}</h4>
                        <p className="text-[9px] font-bold text-olive-dark uppercase mt-0.5">{p.category_name || "Woodwork"}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-archivo text-sm font-black text-sandstone-dark">₹{p.base_price.toLocaleString("en-IN")}</p>
                        {p.is_customizable ? (
                          <span className="text-[8px] font-archivo font-bold uppercase text-coral-accent bg-coral-accent/10 px-1.5 py-0.5 rounded-full mt-1 inline-block">Custom</span>
                        ) : (
                          <span className="text-[8px] font-bold text-foreground/50 uppercase mt-1 block">Standard</span>
                        )}
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditInit(p)}
                          className="p-2 border border-sandstone-light/35 text-foreground hover:text-coral-accent hover:bg-sandstone-light/10 rounded-lg transition-colors bg-cream-light"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 border border-sandstone-light/35 text-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-cream-light"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Manage Orders with timeline updates */}
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div>
                <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">Delivery Logs</span>
                <h2 className="font-archivo text-xl uppercase font-bold text-foreground mt-0.5">Weaving & Dispatch Registry</h2>
                <div className="w-12 h-0.5 bg-sandstone-light mt-2" />
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-foreground/50 text-center py-10">No checkout transactions completed yet.</p>
              ) : (
                <div className="space-y-5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-cream-light border border-sandstone-light/20 rounded-xl p-5 space-y-4 text-xs shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-sandstone-light/10 pb-3 items-start sm:items-center">
                        <div className="text-left space-y-0.5">
                          <p className="font-archivo text-foreground font-bold">#JHA-{ord.id}</p>
                          <p className="text-[10px] text-foreground/50">Buyer: {ord.buyer_name}</p>
                        </div>
                        
                        <div className="text-left sm:text-right space-y-0.5">
                          <p className="font-archivo font-bold text-sandstone-dark">Total: ₹{ord.total.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-foreground/50">{new Date(ord.created_at).toLocaleDateString()}</p>
                        </div>

                        {/* Status Select dropdown */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] uppercase font-bold text-olive-dark">Order Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-cream-light border border-sandstone-light/45 text-foreground py-1.5 px-3 rounded-lg text-xs font-bold focus:outline-none"
                          >
                            <option value="pending">Paid (Approve mandate)</option>
                            <option value="paid">Weaving (Co-creating)</option>
                            <option value="shipped">Dispatched (Dispatched)</option>
                            <option value="delivered">Delivered (Completed)</option>
                          </select>
                        </div>
                      </div>

                      {/* Items lists */}
                      <div className="space-y-2">
                        {ord.items.map((it) => (
                          <div key={it.id} className="flex justify-between items-center text-foreground/80">
                            <span className="text-left">
                              {it.product_title} <span className="text-foreground/50 font-bold">x {it.qty}</span>
                            </span>
                            <span className="font-sans font-bold text-sandstone-dark">₹{it.price_at_purchase.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Reviews appraisal moderator */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div>
                <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">Moderation Desk</span>
                <h2 className="font-archivo text-xl uppercase font-bold text-foreground mt-0.5">Evaluations Moderator</h2>
                <div className="w-12 h-0.5 bg-sandstone-light mt-2" />
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-foreground/50 text-center py-10">No customer reviews submitted yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-cream-light border border-sandstone-light/20 p-4.5 rounded-xl flex items-start gap-4 text-xs shadow-sm"
                    >
                      <div className="flex-grow text-left space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground">{rev.user_name} on {rev.product_title}</p>
                          <div className="flex text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <span key={i} className="text-sm">★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground/80 italic">&quot;{rev.comment}&quot;</p>
                        <p className="text-[10px] text-foreground/45">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-2 border border-sandstone-light/35 hover:border-red-800 text-foreground/45 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 bg-cream-light"
                        title="Moderate/Delete Review"
                      >
                        <ShieldAlert className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Payments analytics ledger */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              <div>
                <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">Financial Registry</span>
                <h2 className="font-archivo text-xl uppercase font-bold text-foreground mt-0.5">Payments Log</h2>
                <div className="w-12 h-0.5 bg-sandstone-light mt-2" />
              </div>

              <div className="bg-cream-light border border-sandstone-light/20 rounded-xl overflow-hidden text-xs shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-dark/50 border-b border-sandstone-light/15 font-archivo text-[10px] uppercase font-bold tracking-widest text-olive-dark">
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone-light/10">
                    {payments.transactions && payments.transactions.length > 0 ? (
                      payments.transactions.map((txn: any, idx: number) => (
                        <tr key={idx} className="hover:bg-cream-dark/10 transition-colors">
                          <td className="p-4 font-mono text-[10px] text-coral-accent font-bold">{txn.reference}</td>
                          <td className="p-4 font-semibold text-foreground">{txn.buyer_name}</td>
                          <td className="p-4 font-sans font-bold text-sandstone-dark">₹{txn.amount.toLocaleString("en-IN")}</td>
                          <td className="p-4 text-foreground/75">{new Date(txn.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[8px] font-archivo font-extrabold uppercase bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-foreground/45 text-center">No transaction logs available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}

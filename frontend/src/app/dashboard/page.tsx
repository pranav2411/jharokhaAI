"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Settings, 
  Plus, 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Sparkles, 
  Upload, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Megaphone, 
  Copy, 
  Check,
  RefreshCw,
  Trash2
} from "lucide-react";
import { API_URL } from "@/config";

interface Product {
  id: number;
  title: string;
  base_price: number;
  is_customizable: boolean;
  stock_qty: number;
  images: string[];
  artisan_name: string;
  category_name: string;
  quality_rating?: number;
  price_fairness?: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items: Array<{
    id: number;
    qty: number;
    customizations: any;
    price_at_purchase: number;
    product_title: string;
  }>;
}

export default function ArtisanDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Artisan Verification State
  const [artisanVerified, setArtisanVerified] = useState(false);
  const [verifyingDoc, setVerifyingDoc] = useState(false);
  const [verifFeedback, setVerifFeedback] = useState<any>(null);
  const [guildFile, setGuildFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [businessFile, setBusinessFile] = useState<File | null>(null);

  const [artisanBio, setArtisanBio] = useState("");
  const [artisanCity, setArtisanCity] = useState("");
  const [artisanCraft, setArtisanCraft] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [rawBioDetails, setRawBioDetails] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  const [rawDescDetails, setRawDescDetails] = useState("");
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const [replacingBackdrop, setReplacingBackdrop] = useState(false);
  const [backdropFeedback, setBackdropFeedback] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(1200);
  const [category, setCategory] = useState(2); // 2 = Khurja Pottery
  const [categories, setCategories] = useState<any[]>([]);
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [productImages, setProductImages] = useState<string[]>([]);

  // AI Suggestion State
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [suggestInputText, setSuggestInputText] = useState("");
  const [suggestPriceInput, setSuggestPriceInput] = useState(1200);
  const [suggestFile, setSuggestFile] = useState<File | null>(null);
  const [qualityMatchReport, setQualityMatchReport] = useState<any>(null);

  // Sandbox Code Generator State
  const [formulaInstructions, setFormulaInstructions] = useState("");
  const [testingSandbox, setTestingSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [compiledPricingFormula, setCompiledPricingFormula] = useState("");

  // Customization Options Builder State
  const [optName, setOptName] = useState("Glaze Accent");
  const [optType, setOptType] = useState("color_swatch"); // select, color_swatch, text

  // Marketing Assistant Widget State
  const [marketingProduct, setMarketingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [generatingMarketing, setGeneratingMarketing] = useState(false);
  const [marketingKit, setMarketingKit] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Feedback states
  const [submitStatus, setSubmitStatus] = useState<"none" | "success" | "error">("none");

  const loadData = async () => {
    try {
      // Load products
      const res = await fetch(`${API_URL}/api/products?artisan_id=1`); // Riya
      if (res.ok) {
        const data = await res.json();
        const parsedProducts = data.map((p: any) => {
          let imgs = p.images;
          if (typeof imgs === "string") {
            try {
              imgs = JSON.parse(imgs);
            } catch (e) {
              imgs = [];
            }
          }
          return {
            ...p,
            images: Array.isArray(imgs) ? imgs : []
          };
        });
        setProducts(parsedProducts);
      }
      
      // Load artisan details
      const artRes = await fetch(`${API_URL}/api/artisans/1`);
      if (artRes.ok) {
        const artData = await artRes.json();
        setArtisanVerified(artData.is_verified);
        setArtisanBio(artData.bio || "");
        setArtisanCity(artData.city || "");
        setArtisanCraft(artData.craft_type || "");
      }

      // Load categories from backend
      const catRes = await fetch(`${API_URL}/api/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0) {
          const hasDefault = catData.some((c: any) => c.id === category);
          if (!hasDefault) {
            setCategory(catData[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard products loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      // Fetch orders for customer / users to display for this artisan's items
      // Since it's local development, we load all orders from backend
      const res = await fetch(`${API_URL}/api/admin/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Dashboard orders loading error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadOrders();
  }, []);

  // Handle Document Verification Upload (Requires 3 files)
  const handleVerifyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guildFile || !aadhaarFile || !businessFile) {
      alert("Please select all three required documents.");
      return;
    }

    setVerifyingDoc(true);
    setVerifFeedback(null);
    const formData = new FormData();
    formData.append("artisan_id", "1");
    formData.append("guild_id", guildFile);
    formData.append("aadhaar", aadhaarFile);
    formData.append("business_reg", businessFile);

    try {
      const res = await fetch(`${API_URL}/api/ai/verify-seller`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        setVerifFeedback(result);
        if (result.is_verified) {
          setArtisanVerified(true);
        }
      } else {
        const err = await res.json();
        setVerifFeedback({
          is_verified: false,
          reason: err.detail || "Verification failed. Please check files."
        });
      }
    } catch (err) {
      console.error("Verification upload error:", err);
      setVerifFeedback({
        is_verified: false,
        reason: "Failed to connect to verification server."
      });
    } finally {
      setVerifyingDoc(false);
    }
  };

  const handleSaveArtisanProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/artisans/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisan_id: 1,
          bio: artisanBio,
          craft_type: artisanCraft,
          city: artisanCity
        })
      });
      if (res.ok) {
        setProfileFeedback("Profile updated successfully!");
        setTimeout(() => setProfileFeedback(null), 3000);
      } else {
        setProfileFeedback("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving artisan profile:", err);
      setProfileFeedback("Network error saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleGenerateBio = async () => {
    if (!rawBioDetails.trim()) {
      alert("Please enter some raw details for your bio.");
      return;
    }
    setGeneratingBio(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bio",
          raw_details: rawBioDetails
        })
      });
      if (res.ok) {
        const data = await res.json();
        setArtisanBio(data.copy);
      }
    } catch (err) {
      console.error("Error generating bio:", err);
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!rawDescDetails.trim()) {
      alert("Please enter some raw details for the product description.");
      return;
    }
    setGeneratingDesc(true);
    let categoryName = "Khurja Pottery";
    if (category === 3) categoryName = "Heritage Woodwork";
    if (category === 1) categoryName = "Heritage Textiles";
    if (category === 4) categoryName = "Metal Crafts";

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "description",
          raw_details: rawDescDetails,
          category: categoryName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDescription(data.copy);
      }
    } catch (err) {
      console.error("Error generating description:", err);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this creation?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete creation.");
      }
    } catch (err) {
      console.error("Error deleting creation:", err);
      alert("Error deleting creation.");
    }
  };

  const handleStartEdit = (p: any) => {
    setEditingProduct(p);
    setTitle(p.title);
    setDescription(p.description);
    setBasePrice(p.base_price);
    setCategory(p.category_id || 2);
    setIsCustomizable(p.is_customizable);
    setProductImages(p.images || []);
    
    setCompiledPricingFormula(p.pricing_formula || "");
    
    if (p.customization_options && p.customization_options.length > 0) {
      setOptName(p.customization_options[0].option_name);
      setOptType(p.customization_options[0].option_type);
    }
    
    const formEl = document.getElementById("add-creation-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setBasePrice(1200);
    setCategory(2);
    setIsCustomizable(true);
    setProductImages([]);
    setCompiledPricingFormula("");
    setFormulaInstructions("");
    setSandboxResult(null);
    setQualityMatchReport(null);
  };

  const handlePhotoUpload = async (file: File) => {

    if (productImages.length >= 6) {
      alert("Maximum 6 photos are allowed.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const absoluteUrl = data.url.startsWith("http") ? data.url : `${API_URL}${data.url}`;
        setProductImages(prev => [...prev, absoluteUrl]);
      } else {
        alert("Failed to upload photo.");
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Error uploading photo.");
    }
  };

  const handleRemovePhoto = (idxToRemove: number) => {
    setProductImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleReplaceBackdropAtIndex = async (idx: number) => {
    const imageUrl = productImages[idx];
    if (!imageUrl) return;

    setReplacingBackdrop(true);
    setBackdropFeedback(null);

    let categoryName = "pottery";
    if (category === 3) categoryName = "woodwork";
    if (category === 1) categoryName = "textile";
    if (category === 4) categoryName = "metal";

    const formData = new FormData();
    formData.append("category", categoryName);

    try {
      const res = await fetch(`${API_URL}/api/ai/replace-backdrop`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const absoluteUrl = data.image_url.startsWith("http") ? data.image_url : `${API_URL}${data.image_url}`;
        setProductImages(prev => {
          const updated = [...prev];
          updated[idx] = absoluteUrl;
          return updated;
        });
        setBackdropFeedback("Backdrop replaced with high-end studio setting!");
      } else {
        setBackdropFeedback("Failed to replace backdrop.");
      }
    } catch (err) {
      console.error("Error replacing backdrop:", err);
      setBackdropFeedback("Failed to replace backdrop.");
    } finally {
      setReplacingBackdrop(false);
    }
  };



  // Trigger AI product metadata suggestion and quality price validation
  const handleAiSuggest = async () => {
    if (!suggestFile) {
      alert("Please upload a product photo first to enable AI visual analysis.");
      return;
    }

    setAiSuggesting(true);
    setQualityMatchReport(null);
    const formData = new FormData();
    formData.append("description", suggestInputText || "Terracotta art piece");
    formData.append("requested_price", String(suggestPriceInput));
    formData.append("image", suggestFile);

    try {
      const res = await fetch(`${API_URL}/api/ai/suggest-product`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        // Populate form
        setTitle(result.title);
        setDescription(result.description);
        setBasePrice(result.suggested_price);
        setCategory(result.category_id);
        if (result.temp_image_url) {
          setProductImages([`${API_URL}${result.temp_image_url}`]);
        }
        setQualityMatchReport({
          quality_rating: result.quality_rating,
          price_fairness: result.price_fairness,
          price_fairness_reason: result.price_fairness_reason,
          customization_options: result.customization_options
        });
      }
    } catch (err) {
      console.error("AI suggestions failed:", err);
    } finally {
      setAiSuggesting(false);
    }
  };

  // Trigger self-healing sandbox test of custom pricing formula
  const handleSandboxCompile = async () => {
    if (!formulaInstructions.trim()) {
      alert("Please enter some pricing rules for the AI Sandbox compiler.");
      return;
    }

    setTestingSandbox(true);
    setSandboxResult(null);

    // Mock arguments matching product types
    const testCustoms = {
      "Glaze Accent": "Cobalt Blue",
      "Size": "12 inch"
    };

    try {
      const res = await fetch(`${API_URL}/api/ai/sandbox/test-formula`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: formulaInstructions,
          test_customizations: testCustoms,
          base_price: basePrice
        })
      });

      if (res.ok) {
        const result = await res.json();
        setSandboxResult(result);
        if (result.success) {
          setCompiledPricingFormula(result.code);
        }
      }
    } catch (err) {
      console.error("Sandbox compiler error:", err);
    } finally {
      setTestingSandbox(false);
    }
  };

  // Generate marketing campaign kits for copy paste
  const handleGenerateMarketing = async (prod: Product) => {
    setMarketingProduct(prod);
    setGeneratingMarketing(true);
    setMarketingKit(null);

    try {
      const res = await fetch(`${API_URL}/api/ai/marketing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: prod.id })
      });

      if (res.ok) {
        const result = await res.json();
        setMarketingKit(result);
      }
    } catch (err) {
      console.error("Marketing generator error:", err);
    } finally {
      setGeneratingMarketing(false);
    }
  };

  // Mark order ready for pickup and dispatch notification to admin
  const handleMarkReadyForPickup = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pickup`, {
        method: "PUT"
      });

      if (res.ok) {
        // Refresh orders list
        loadOrders();
        alert("Notification successfully sent to Administrator. Delivery pick-up is being routed!");
      }
    } catch (err) {
      console.error("Pickup flag error:", err);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Define choices depending on option type selected
    let choices: any = [];
    if (optType === "color_swatch") {
      choices = [
        { name: "Saffron Amber", price: 0.0, color: "#D98354" },
        { name: "Cobalt Blue", price: 150.0, color: "#1A2B4C" },
        { name: "Forest Olive", price: 100.0, color: "#5A5F3D" }
      ];
    } else if (optType === "select") {
      choices = [
        { name: "Classic Standard", price: 0.0 },
        { name: "Premium Engraved", price: 250.0 }
      ];
    } else {
      choices = {
        placeholder: "Enter custom monogram initials",
        max_len: 8,
        price: 150.0
      };
    }

    const payload = {
      artisan_id: 1, // Riya Sen
      category_id: Number(category),
      title,
      description,
      base_price: Number(basePrice),
      is_customizable: isCustomizable,
      stock_qty: 10,
      images: productImages,
      status: "active",
      pricing_formula: compiledPricingFormula || null,
      customization_options: isCustomizable ? [
        {
          option_name: optName,
          option_type: optType,
          choices,
          price_delta: 0.0
        }
      ] : []
    };

    try {
      const url = editingProduct 
        ? `${API_URL}/api/admin/products/${editingProduct.id}`
        : `${API_URL}/api/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitStatus("success");
        setTitle("");
        setDescription("");
        setBasePrice(1200);
        setCompiledPricingFormula("");
        setFormulaInstructions("");
        setSandboxResult(null);
        setQualityMatchReport(null);
        setProductImages([]);
        setEditingProduct(null);
        // Reload listings
        loadData();
        setTimeout(() => setSubmitStatus("none"), 3000);
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Dashboard error saving product:", err);
      setSubmitStatus("error");
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-cream-light text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow text-left">
        
        {/* Verification Status Banner */}
        <div className="mb-8">
          {artisanVerified ? (
            <div className="bg-emerald-50/80 backdrop-blur border border-emerald-500/20 text-emerald-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white rounded-full p-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-archivo font-black tracking-wider text-emerald-800">Verified Artisan Partner</h4>
                  <p className="text-[10px] text-emerald-900/60 font-medium mt-0.5">Your credentials are validated. You have unlocked live product uploads and AI pricing sandboxes.</p>
                </div>
              </div>
              <span className="text-[9px] uppercase font-archivo font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">Status: Active</span>
            </div>
          ) : (
            <form onSubmit={handleVerifyUpload} className="bg-amber-50/90 border border-amber-500/20 text-amber-900 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 text-white rounded-full p-2 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase font-archivo font-black tracking-wider text-amber-800">Identity Verification Required</h4>
                  <p className="text-[10px] text-amber-900/70 font-medium leading-relaxed">
                    To start listing and processing custom order requests, we must verify your artisan status. Upload your Craft Guild ID, Aadhaar and Business Registration certificate.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Craft Guild ID */}
                <div className="bg-white/50 border border-sandstone-light/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-sandstone-dark mb-2">1. Craft Guild ID</span>
                  <label className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-archivo font-bold uppercase py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    {guildFile ? "Selected ✓" : "Choose File"}
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setGuildFile(e.target.files?.[0] || null)} className="hidden" disabled={verifyingDoc} />
                  </label>
                  {guildFile && <span className="text-[9px] text-amber-900/70 mt-1 truncate max-w-full font-medium">{guildFile.name}</span>}
                </div>

                {/* 2. Aadhaar Card */}
                <div className="bg-white/50 border border-sandstone-light/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-sandstone-dark mb-2">2. Aadhaar Card</span>
                  <label className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-archivo font-bold uppercase py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    {aadhaarFile ? "Selected ✓" : "Choose File"}
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)} className="hidden" disabled={verifyingDoc} />
                  </label>
                  {aadhaarFile && <span className="text-[9px] text-amber-900/70 mt-1 truncate max-w-full font-medium">{aadhaarFile.name}</span>}
                </div>

                {/* 3. Business Registration */}
                <div className="bg-white/50 border border-sandstone-light/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-sandstone-dark mb-2">3. Business Reg.</span>
                  <label className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-archivo font-bold uppercase py-1.5 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    {businessFile ? "Selected ✓" : "Choose File"}
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setBusinessFile(e.target.files?.[0] || null)} className="hidden" disabled={verifyingDoc} />
                  </label>
                  {businessFile && <span className="text-[9px] text-amber-900/70 mt-1 truncate max-w-full font-medium">{businessFile.name}</span>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 border border-amber-900/10 rounded-xl p-3.5">
                <button
                  type="submit"
                  disabled={verifyingDoc || !guildFile || !aadhaarFile || !businessFile}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 disabled:bg-amber-500/40 text-white text-xs font-archivo font-bold uppercase py-2 px-5 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${verifyingDoc ? "animate-spin" : ""}`} />
                  {verifyingDoc ? "AI Verifying..." : "Verify All Documents"}
                </button>
                {verifFeedback && (
                  <span className={`text-[10px] font-semibold text-amber-850`}>
                    {verifFeedback.reason}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Artisan Profile Settings Card */}
          <div className="mt-8 bg-white border border-sandstone-light/20 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-archivo text-sm uppercase font-bold tracking-widest text-foreground">
                Artisan Profile Settings
              </h3>
              <p className="text-[10px] text-foreground/50 mt-1">
                Customize your bio, craft group, and location visible to buyers on product pages.
              </p>
            </div>

            <form onSubmit={handleSaveArtisanProfile} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Craft Type Group</label>
                  <input
                    type="text"
                    required
                    value={artisanCraft}
                    onChange={(e) => setArtisanCraft(e.target.value)}
                    placeholder="e.g. Blue Pottery & Ceramics"
                    className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Craft Center City</label>
                  <input
                    type="text"
                    required
                    value={artisanCity}
                    onChange={(e) => setArtisanCity(e.target.value)}
                    placeholder="e.g. Khurja"
                    className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                  />
                </div>
              </div>

              {/* AI Bio Writer Section */}
              <div className="bg-cream-light/30 border border-sandstone-light/20 p-4 rounded-2xl space-y-3">
                <label className="text-[9px] font-archivo font-black uppercase tracking-wider text-sandstone-dark block">AI Biography Writer</label>
                <p className="text-[8px] text-foreground/50 leading-relaxed">
                  Enter some raw highlights (e.g. your heritage lineage, years of experience, handcraft style) to let the AI draft a captivating description of your life as a creator.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rawBioDetails}
                    onChange={(e) => setRawBioDetails(e.target.value)}
                    placeholder="e.g. 15 years pottery, 5th generation artisan family, Mughal motifs"
                    className="flex-grow bg-white border border-sandstone-light/35 rounded-xl py-2 px-3 text-xs focus:outline-none text-foreground font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBio}
                    disabled={generatingBio}
                    className="bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-[10px] font-archivo font-extrabold uppercase px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generatingBio ? "Generating..." : "Generate Bio"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Artisan Biography</label>
                <textarea
                  rows={4}
                  required
                  value={artisanBio}
                  onChange={(e) => setArtisanBio(e.target.value)}
                  placeholder="Tell buyers about your craftsmanship journey..."
                  className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl p-3.5 text-xs focus:outline-none text-foreground font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sandstone-light/10">
                {profileFeedback && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/50 px-3 py-1 rounded">
                    {profileFeedback}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="ml-auto bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-xs font-archivo font-extrabold uppercase py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>


        {/* Title */}
        <div className="mb-10 border-b border-sandstone-light/20 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-archivo text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-sandstone-dark" />
              Artisan Portal
            </h1>
            <p className="text-xs text-foreground/60 mt-1">
              Superpowered with Gemini AI. Build self-healing price logic, get descriptions automatically, and track pickup orders.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-cream-dark/30 border border-sandstone-light/15 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-olive-dark">Active Creations</p>
            <p className="font-archivo text-3xl font-black text-sandstone-dark mt-1">
              {loading ? "..." : products.length}
            </p>
          </div>
          <div className="bg-cream-dark/30 border border-sandstone-light/15 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-olive-dark">Pending Admin Pickups</p>
            <p className="font-archivo text-3xl font-black text-coral-accent mt-1">
              {orders.filter(o => o.status === "ready_for_pickup").length}
            </p>
          </div>
          <div className="bg-cream-dark/30 border border-sandstone-light/15 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-olive-dark">Completed Deliveries</p>
            <p className="font-archivo text-3xl font-black text-emerald-700 mt-1 font-sans">
              {orders.filter(o => o.status === "delivered").length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Create/Edit Listing Form */}
          <section id="add-creation-form" className="lg:col-span-5 bg-cream-dark/30 border border-sandstone-light/15 rounded-3xl p-6 space-y-6">
            <h3 className="font-archivo text-base uppercase font-bold tracking-wider text-foreground flex items-center gap-1.5 border-b border-sandstone-light/20 pb-3">
              {editingProduct ? (
                <>
                  <Settings className="w-5 h-5 text-coral-accent animate-spin-slow" />
                  Edit Creation
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-coral-accent" />
                  List New Creation
                </>
              )}
            </h3>


            {/* AI Product Suggestions Panel */}
            <div className="bg-white/40 border border-sandstone-light/20 rounded-2xl p-4.5 space-y-4">
              <h4 className="text-[10px] uppercase font-archivo font-extrabold tracking-widest text-sandstone-dark flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-coral-accent" />
                AI Listing Enhancer
              </h4>
              
              <p className="text-[9px] text-foreground/50 leading-relaxed">
                Upload your product photo, enter key terms, and let Gemini compile descriptions, quality ratings, and fair pricing verification.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-olive-dark">Product Photo</label>
                    <label className="w-full bg-cream-light border border-dashed border-sandstone-light/40 rounded-xl py-2 px-3 text-[10px] font-semibold text-foreground flex items-center justify-center gap-1.5 cursor-pointer hover:border-sandstone-dark transition-all">
                      <Upload className="w-3.5 h-3.5 text-sandstone-dark" />
                      {suggestFile ? "Photo Selected" : "Upload File"}
                      <input type="file" accept="image/*" onChange={(e) => setSuggestFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-olive-dark">Listing Price (₹)</label>
                    <input 
                      type="number" 
                      value={suggestPriceInput} 
                      onChange={(e) => setSuggestPriceInput(Number(e.target.value))} 
                      className="w-full bg-cream-light border border-sandstone-light/35 rounded-xl py-1.5 px-3 text-[10px] font-semibold focus:outline-none focus:border-sandstone-dark"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-olive-dark">Simple Tags / Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. blue glazed terracotta vase, 12 inches"
                    value={suggestInputText} 
                    onChange={(e) => setSuggestInputText(e.target.value)} 
                    className="w-full bg-cream-light border border-sandstone-light/35 rounded-xl py-1.5 px-3 text-[10px] font-semibold focus:outline-none focus:border-sandstone-dark"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={aiSuggesting}
                  className="w-full bg-coral-accent/15 hover:bg-coral-accent text-coral-accent hover:text-white text-[10px] font-archivo font-extrabold uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  {aiSuggesting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing quality & price...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" /> Auto-Suggest Details & Verify Price
                    </>
                  )}
                </button>
              </div>

              {/* Quality Match Report display */}
              {qualityMatchReport && (
                <div className="bg-white/95 rounded-xl border border-sandstone-light/10 p-3 space-y-2 mt-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-sandstone-light/10 pb-1.5">
                    <span className="text-[9px] uppercase font-bold text-sandstone-dark">Quality Score:</span>
                    <span className="text-[10px] font-black text-coral-accent">{qualityMatchReport.quality_rating} / 5.0</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-sandstone-light/10 pb-1.5">
                    <span className="text-[9px] uppercase font-bold text-sandstone-dark">Pricing Check:</span>
                    <span className={`text-[10px] uppercase font-archivo font-black px-2 py-0.5 rounded-full ${
                      qualityMatchReport.price_fairness === "Fair" ? "bg-emerald-50 text-emerald-700" :
                      qualityMatchReport.price_fairness === "Overpriced" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {qualityMatchReport.price_fairness}
                    </span>
                  </div>

                  <p className="text-[9px] font-medium text-foreground/70 leading-relaxed italic">
                    💡 {qualityMatchReport.price_fairness_reason}
                  </p>
                </div>
              )}
            </div>

            {submitStatus === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3.5 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Creation uploaded successfully! Active immediately.</span>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Error uploading creation. Check backend connection.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Creation Title</label>
                <input
                  type="text"
                  placeholder="e.g. Handpainted Terracotta Urn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Description Summary</label>
                
                {/* AI Description Writer section */}
                <div className="bg-cream-light/40 border border-sandstone-light/20 p-3.5 rounded-2xl space-y-2 mb-2 text-left">
                  <span className="text-[9px] font-archivo font-black uppercase tracking-wider text-sandstone-dark block">AI Product Writer</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rawDescDetails}
                      onChange={(e) => setRawDescDetails(e.target.value)}
                      placeholder="e.g. blue clay pot, floral motif, baked 3 days in wood kiln"
                      className="flex-grow bg-white border border-sandstone-light/35 rounded-xl py-2 px-3 text-[10px] focus:outline-none text-foreground font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDesc}
                      className="bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-[10px] font-archivo font-extrabold uppercase px-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {generatingDesc ? "Writing..." : "Generate Copy"}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Describe material origin, clay baking temp, or silk threads count..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl p-3.5 text-xs focus:outline-none text-foreground font-medium"
                  required
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Base Price (INR)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none text-foreground"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Category Group</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(Number(e.target.value))}
                    className="w-full bg-cream-light border border-sandstone-light/45 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none text-foreground"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={3}>Heritage Woodwork</option>
                        <option value={2}>Khurja Pottery</option>
                        <option value={1}>Heritage Textiles</option>
                        <option value={4}>Metal Crafts</option>
                      </>
                    )}
                  </select>
                </div>
              </div>


              {/* Product Photos Grid (up to 6) */}
              <div className="space-y-3 border-t border-sandstone-light/10 pt-4 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Product Photographs (Up to 6)</label>
                  <span className="text-[9px] font-bold text-foreground/50">{productImages.length}/6 Uploaded</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {productImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-sandstone-light/20 bg-cream-dark/10 shadow-sm">
                      <img
                        src={imgUrl}
                        alt={`Product Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-archivo font-extrabold uppercase py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                        {idx === 0 && (
                          <button
                            type="button"
                            onClick={() => handleReplaceBackdropAtIndex(idx)}
                            disabled={replacingBackdrop}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-archivo font-extrabold uppercase py-1 px-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            {replacingBackdrop ? "Enhancing..." : "AI Backdrop"}
                          </button>
                        )}
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-sandstone-dark text-white text-[8px] font-archivo font-black uppercase px-2 py-0.5 rounded-md shadow">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}

                  {productImages.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-sandstone-light/40 hover:border-sandstone-dark rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-cream-light/30 hover:bg-cream-light/50">
                      <Upload className="w-5 h-5 text-sandstone-dark mb-1" />
                      <span className="text-[9px] font-archivo font-black uppercase tracking-wider text-sandstone-dark">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {backdropFeedback && (
                  <div className="text-[9px] font-bold text-emerald-800 bg-emerald-100/50 px-2.5 py-1.5 rounded-lg mt-2">
                    {backdropFeedback}
                  </div>
                )}
              </div>


              <div className="border-t border-sandstone-light/20 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Customization Options
                  </p>
                  <p className="text-[9px] text-foreground/50">Allow buyers to co-design specs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-cream-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral-accent"></div>
                </label>
              </div>

              {isCustomizable && (
                <div className="bg-cream-light border border-sandstone-light/20 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] uppercase font-archivo font-extrabold tracking-widest text-coral-accent">
                    Custom Option Config
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3.5 border-b border-sandstone-light/10 pb-3.5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-wider text-olive-dark">Option Label</label>
                      <input
                        type="text"
                        value={optName}
                        onChange={(e) => setOptName(e.target.value)}
                        className="w-full bg-cream-light border border-sandstone-light/35 rounded-lg py-2 px-3 text-[11px] focus:outline-none text-foreground font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-wider text-olive-dark">Selector UI</label>
                      <select
                        value={optType}
                        onChange={(e) => setOptType(e.target.value)}
                        className="w-full bg-cream-light border border-sandstone-light/35 rounded-lg py-2 px-3 text-[11px] focus:outline-none text-foreground font-semibold"
                      >
                        <option value="color_swatch">Color Swatch</option>
                        <option value="select">Dropdown Select</option>
                        <option value="text">Text Monogram</option>
                      </select>
                    </div>
                  </div>

                  {/* Self Healing Dynamic Pricing Sandbox Section */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-archivo font-extrabold uppercase tracking-wider text-sandstone-dark flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-coral-accent" />
                        AI Pricing Sandbox (Self-Healing)
                      </label>
                    </div>

                    <p className="text-[8px] text-foreground/50 leading-relaxed">
                      Describe pricing formulas in plain English (e.g., *"If Cobalt Blue option selected, add 150. If size chosen is 12 inches, add 300"*). AI generates, sandbox validates and corrects syntax errors.
                    </p>

                    <textarea
                      rows={2}
                      placeholder="Pricing instructions..."
                      value={formulaInstructions}
                      onChange={(e) => setFormulaInstructions(e.target.value)}
                      className="w-full bg-cream-light border border-sandstone-light/35 focus:border-sandstone-dark rounded-xl p-2.5 text-[10px] focus:outline-none font-medium"
                    />

                    <button
                      type="button"
                      onClick={handleSandboxCompile}
                      disabled={testingSandbox}
                      className="w-full bg-sandstone-dark text-white hover:bg-sandstone-light hover:text-foreground text-[10px] font-archivo font-extrabold uppercase py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      {testingSandbox ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Compiling & Self-Healing in Sandbox...
                        </>
                      ) : (
                        "Validate Pricing Code in Sandbox"
                      )}
                    </button>

                    {/* Compiler result stack */}
                    {sandboxResult && (
                      <div className="bg-zinc-950 text-zinc-100 rounded-xl p-3 font-mono text-[8px] space-y-2 border border-zinc-800">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5">
                          <span className="text-[7px] uppercase font-bold text-zinc-400">Sandbox Test Run:</span>
                          <span className={sandboxResult.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {sandboxResult.success ? "BUILD PASSED (100% OK)" : "COMPILER ERROR"}
                          </span>
                        </div>

                        {sandboxResult.attempts && (
                          <div className="space-y-1">
                            <span className="text-[6px] uppercase font-semibold text-zinc-500">Heal Attempts Loop:</span>
                            <div className="space-y-1">
                              {sandboxResult.attempts.map((att: any, index: number) => (
                                <div key={index} className="flex justify-between text-zinc-400">
                                  <span>Pass {index + 1}: Code Compiled</span>
                                  <span className={att.error ? "text-rose-400" : "text-emerald-400"}>
                                    {att.error ? "Failed (Self-Healing...)" : "Success"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1 pt-1.5 border-t border-zinc-900">
                          <span className="text-[6px] uppercase font-bold text-zinc-500">Sandboxed Python Formula:</span>
                          <pre className="overflow-x-auto bg-zinc-900/50 p-2 rounded text-zinc-300 select-all leading-normal whitespace-pre">
                            {sandboxResult.code}
                          </pre>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-emerald-400 pt-1">
                          <span>Verified Output Price (Base + Custom additions):</span>
                          <span className="font-extrabold text-xs">₹{sandboxResult.test_output_price}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-cream-dark/40 hover:bg-cream-dark text-foreground text-xs font-archivo font-extrabold uppercase py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-xs font-archivo font-extrabold uppercase py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>

          </section>

          {/* Right Column: Listings & Active Orders */}
          <section className="lg:col-span-7 space-y-8">
            
            {/* Active Orders Section */}
            <div className="space-y-4">
              <h3 className="font-archivo text-base uppercase font-bold tracking-wider text-foreground flex items-center gap-2 border-b border-sandstone-light/20 pb-3">
                <ShoppingBag className="w-5 h-5 text-coral-accent" />
                Fulfillment queue (Orders)
              </h3>

              {ordersLoading ? (
                <div className="animate-pulse bg-cream-dark/20 h-24 rounded-xl" />
              ) : orders.length === 0 ? (
                <div className="text-center py-10 bg-cream-dark/10 rounded-2xl border border-dashed border-sandstone-light/20">
                  <p className="text-xs text-foreground/50">No orders placed on your listings yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="bg-cream-dark/20 border border-sandstone-light/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-archivo font-extrabold uppercase text-sandstone-dark bg-cream-dark/50 px-2 py-0.5 rounded-md">Order #{ord.id}</span>
                          <span className={`text-[8px] font-archivo font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            ord.status === "ready_for_pickup" ? "bg-amber-100 text-amber-800" :
                            ord.status === "out_for_delivery" ? "bg-blue-100 text-blue-800" :
                            ord.status === "delivered" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-800"
                          }`}>
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-olive-dark uppercase">Products to pack:</span>
                          <ul className="text-xs font-semibold text-foreground/80 list-disc list-inside">
                            {ord.items.map((it, index) => (
                              <li key={index}>
                                {it.product_title} (x{it.qty})
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-[10px] font-medium text-foreground/60 leading-relaxed">
                          📍 Delivery Address: <span className="font-bold">{ord.shipping_address}</span>
                        </p>
                      </div>

                      <div className="flex flex-col justify-between items-end shrink-0">
                        <span className="text-sm font-archivo font-black text-sandstone-dark">₹{ord.total.toLocaleString("en-IN")}</span>
                        
                        {ord.status === "paid" && (
                          <button
                            onClick={() => handleMarkReadyForPickup(ord.id)}
                            className="bg-coral-accent hover:bg-coral-accent/80 text-white text-[9px] font-archivo font-extrabold uppercase py-2 px-3 rounded-lg transition-all shadow"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}
                        {ord.status === "ready_for_pickup" && (
                          <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 p-1.5 rounded-md text-center max-w-[130px] leading-tight">
                            Pickup requested. Admin courier dispatched.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Directory Section */}
            <div className="space-y-4">
              <h3 className="font-archivo text-base uppercase font-bold tracking-wider text-foreground flex items-center gap-2 border-b border-sandstone-light/20 pb-3">
                <FileText className="w-5 h-5 text-sandstone-dark" />
                Creations Directory
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-cream-dark/20 h-20 rounded-xl" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-cream-dark/10 rounded-2xl border border-dashed border-sandstone-light/20 space-y-3">
                  <ShoppingBag className="w-8 h-8 text-sandstone-light mx-auto" />
                  <p className="text-xs text-foreground/60">No active creations listed by you yet.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-cream-dark/15 border border-sandstone-light/10 p-4.5 rounded-2xl flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-cream-dark border border-sandstone-light/10 shrink-0"
                        />
                        
                        <div className="flex-grow text-left">
                          <h4 className="font-archivo text-xs sm:text-sm uppercase font-bold text-foreground line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-[10px] text-foreground/50 font-semibold uppercase mt-0.5">
                            {p.category_name || "Woodwork"}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-archivo text-sm font-black text-sandstone-dark">
                            ₹{p.base_price.toLocaleString("en-IN")}
                          </p>
                          
                          {p.is_customizable ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-archivo font-extrabold uppercase text-coral-accent bg-coral-accent/10 py-0.5 px-1.5 rounded-full mt-1">
                              <Settings className="w-2 h-2" /> Customizable
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-foreground/45 uppercase mt-1 block">Standard</span>
                          )}
                        </div>
                      </div>

                      {/* Marketing Panel Toggle */}
                      <div className="border-t border-sandstone-light/10 pt-3 flex items-center justify-between">
                        <span className="text-[9px] text-foreground/40 font-medium">Auto-generated tags verified</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="bg-cream-dark/50 hover:bg-sandstone-dark text-sandstone-dark hover:text-white text-[9px] font-archivo font-extrabold uppercase py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-[9px] font-archivo font-extrabold uppercase py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateMarketing(p)}
                            className="bg-sandstone-dark/10 hover:bg-coral-accent text-sandstone-dark hover:text-white text-[9px] font-archivo font-extrabold uppercase py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Megaphone className="w-3.5 h-3.5" /> AI Marketing Kit
                          </button>
                        </div>
                      </div>


                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Marketing Campaign Kit Modal */}
        {marketingProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cream-light border border-sandstone-light/20 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-left">
              <div className="flex justify-between items-center border-b border-sandstone-light/20 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-archivo text-base uppercase font-black text-foreground flex items-center gap-1.5">
                    <Megaphone className="w-5 h-5 text-coral-accent" />
                    AI Marketing Kit
                  </h3>
                  <p className="text-[10px] text-foreground/50">Campaign materials for "{marketingProduct.title}"</p>
                </div>
                <button 
                  onClick={() => { setMarketingProduct(null); setMarketingKit(null); }}
                  className="bg-cream-dark/50 hover:bg-cream-dark p-1.5 rounded-full text-foreground/60 transition-all text-xs font-bold font-mono px-3"
                >
                  Close
                </button>
              </div>

              {generatingMarketing ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-coral-accent" />
                  <p className="text-xs font-bold text-sandstone-dark">Gemini AI copywriting social copy & newsletter templates...</p>
                </div>
              ) : marketingKit ? (
                <div className="space-y-5">
                  {/* Instagram copy */}
                  <div className="space-y-1.5 bg-white/50 border border-sandstone-light/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center border-b border-sandstone-light/10 pb-1.5 mb-2">
                      <span className="text-[10px] font-archivo font-extrabold uppercase text-coral-accent">Instagram Post Caption</span>
                      <button 
                        onClick={() => handleCopyText(marketingKit.instagram_post, 'insta')}
                        className="text-[9px] font-archivo font-bold text-sandstone-dark hover:text-coral-accent flex items-center gap-0.5"
                      >
                        {copiedKey === 'insta' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'insta' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {marketingKit.instagram_post}
                    </p>
                  </div>

                  {/* Facebook copy */}
                  <div className="space-y-1.5 bg-white/50 border border-sandstone-light/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center border-b border-sandstone-light/10 pb-1.5 mb-2">
                      <span className="text-[10px] font-archivo font-extrabold uppercase text-coral-accent">Facebook Post Text</span>
                      <button 
                        onClick={() => handleCopyText(marketingKit.facebook_post, 'fb')}
                        className="text-[9px] font-archivo font-bold text-sandstone-dark hover:text-coral-accent flex items-center gap-0.5"
                      >
                        {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'fb' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {marketingKit.facebook_post}
                    </p>
                  </div>

                  {/* Newsletter */}
                  <div className="space-y-1.5 bg-white/50 border border-sandstone-light/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center border-b border-sandstone-light/10 pb-1.5 mb-2">
                      <span className="text-[10px] font-archivo font-extrabold uppercase text-coral-accent">Email Newsletter Template</span>
                      <button 
                        onClick={() => handleCopyText(`Subject: ${marketingKit.newsletter_subject}\n\n${marketingKit.newsletter_body}`, 'email')}
                        className="text-[9px] font-archivo font-bold text-sandstone-dark hover:text-coral-accent flex items-center gap-0.5"
                      >
                        {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'email' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="space-y-2 text-xs font-medium text-foreground/80 leading-relaxed">
                      <p><span className="font-bold text-sandstone-dark">Subject:</span> {marketingKit.newsletter_subject}</p>
                      <pre className="whitespace-pre-wrap font-sans mt-2 bg-cream-dark/10 p-3 rounded-lg leading-relaxed">
                        {marketingKit.newsletter_body}
                      </pre>
                    </div>
                  </div>

                  {/* Search Ad copy */}
                  <div className="space-y-1.5 bg-white/50 border border-sandstone-light/10 rounded-2xl p-4">
                    <div className="flex justify-between items-center border-b border-sandstone-light/10 pb-1.5 mb-2">
                      <span className="text-[10px] font-archivo font-extrabold uppercase text-coral-accent">Google Search Ad Text</span>
                      <button 
                        onClick={() => handleCopyText(marketingKit.search_ad_copy, 'ad')}
                        className="text-[9px] font-archivo font-bold text-sandstone-dark hover:text-coral-accent flex items-center gap-0.5"
                      >
                        {copiedKey === 'ad' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'ad' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs font-medium font-mono text-foreground/80">
                      {marketingKit.search_ad_copy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-foreground/50">Error generating marketing campaign.</div>
              )}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

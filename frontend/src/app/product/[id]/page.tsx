"use client";

import React, { useEffect, useState, use } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Star, Settings, ShoppingBag, ArrowLeft, Heart, Check, MapPin, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductStudio from "@/components/ProductStudio";
import { API_URL } from "@/config";

// Local fallbacks in case FastAPI is offline
const MOCK_PRODUCTS: Record<number, any> = {
  1: {
    id: 1,
    title: "Handwoven Bamboo Storage Basket",
    description: "Our signature basket is handwoven from wild bamboo splits, showcasing natural brown and golden tones. It features a sturdy construction perfect for logs, blankets, toys, or as a decorative planter sleeve.",
    base_price: 899.0,
    is_customizable: true,
    stock_qty: 15,
    images: [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80"
    ],
    artisan: {
      id: 1,
      name: "Riya Sen",
      bio: "Riya Sen is a master basket weaver from Jaipur. She has spent over 15 years preserving the traditional bamboo and cane weaving techniques of Rajasthan. Each basket is hand-braided and uses organic, sustainably harvested fibers.",
      craft_type: "Basketry & Bamboo Weaving",
      city: "Jaipur",
      rating: 4.8,
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
    },
    category: { name: "Bamboo & Woodwork", slug: "woodwork", jharokha_style: "default-jharokha" },
    customization_options: [
      {
        id: 1,
        option_name: "Lining Fabric & Color",
        option_type: "color_swatch",
        choices: [
          { name: "No Lining / Natural Cane", price: 0.0, color: "#E6C280" },
          { name: "Indigo Khadi Cotton Lining", price: 120.0, color: "#1A2B4C" },
          { name: "Terracotta Linen Lining", price: 150.0, color: "#C26D4C" },
          { name: "Mustard Yellow Canvas Lining", price: 150.0, color: "#E5A93C" }
        ]
      },
      {
        id: 2,
        option_name: "Handle Style",
        option_type: "select",
        choices: [
          { name: "Classic Integrated Handles", price: 0.0 },
          { name: "Full Grain Leather Wrap Handles", price: 200.0 },
          { name: "Double-Braided Rope Handles", price: 150.0 }
        ]
      },
      {
        id: 3,
        option_name: "Personalized Bamboo Tag",
        option_type: "text",
        choices: {
          placeholder: "Enter name or initials (Max 12 chars)",
          max_len: 12,
          price: 100.0
        }
      }
    ],
    reviews: [
      { id: 1, rating: 5, comment: "Absolutely gorgeous! The lining color is rich, and the leather handles are extremely sturdy. A premium craft piece.", user_name: "Aarav Sharma" }
    ]
  },
  2: {
    id: 2,
    title: "Khurja Mughal Cobalt Ceramic Vase",
    description: "Adorned with traditional hand-painted floral motifs in vibrant cobalt blue, turquoise, and mustard, this earthenware vase is glazed to a high gloss. Represents centuries-old Mughal design aesthetics.",
    base_price: 1249.0,
    is_customizable: true,
    stock_qty: 8,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80"
    ],
    artisan: {
      id: 2,
      name: "Mohan Lal",
      bio: "Mohan Lal belongs to a family of fifth-generation potters from Khurja. He specializes in the famous Mughal-inspired Blue Pottery, which is completely handmade, glazed, and fired in traditional kilns.",
      craft_type: "Blue Pottery & Ceramics",
      city: "Khurja",
      rating: 4.9,
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
    },
    category: { name: "Khurja Pottery", slug: "pottery", jharokha_style: "round-jharokha" },
    customization_options: [
      {
        id: 4,
        option_name: "Vase Base Pattern",
        option_type: "select",
        choices: [
          { name: "Mughal Floral Vine (Classic)", price: 0.0 },
          { name: "Geometrical Jaali Pattern", price: 150.0 },
          { name: "Royal Peacock Medallion", price: 300.0 }
        ]
      },
      {
        id: 5,
        option_name: "Accent Glaze Color",
        option_type: "color_swatch",
        choices: [
          { name: "Classic Cobalt Blue", price: 0.0, color: "#002fa7" },
          { name: "Turquoise Green", price: 0.0, color: "#30d5c8" },
          { name: "Royal Saffron Ochre", price: 100.0, color: "#f4c430" }
        ]
      }
    ],
    reviews: [
      { id: 3, rating: 5, comment: "Stunning glaze, standard Khurja excellence. It sits as a centerpiece in our living room. Package was safely packed.", user_name: "Aarav Sharma" }
    ]
  },
  3: {
    id: 3,
    title: "Handspun Katan Silk Banarasi Dupatta",
    description: "Woven with pure Katan silk warp and weft, this dupatta is intricately decorated with gold (Sona) and silver (Rupa) zari work in a traditional shikargah design. Drapes beautifully and shimmers in changing light.",
    base_price: 4500.0,
    is_customizable: true,
    stock_qty: 5,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"],
    artisan: {
      id: 3,
      name: "Kavitha Prasad",
      bio: "Kavitha Prasad is a national award-winning master weaver from the sacred city of Varanasi. She leads a small co-operative of women artisans spinning authentic silk and gold zari thread into heirloom Banarasi textiles.",
      craft_type: "Handloom Silk Weaving",
      city: "Varanasi",
      rating: 5.0,
      photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
    },
    category: { name: "Heritage Textiles", slug: "textiles", jharokha_style: "arched-jharokha" },
    customization_options: [
      {
        id: 6,
        option_name: "Zari Thread Combination",
        option_type: "select",
        choices: [
          { name: "Sona Zari (Pure Gold Thread)", price: 0.0 },
          { name: "Rupa Zari (Pure Silver Thread)", price: 200.0 },
          { name: "Sona-Rupa Ganga Jamuna Zari", price: 500.0 }
        ]
      },
      {
        id: 7,
        option_name: "Tassel Finishes",
        option_type: "select",
        choices: [
          { name: "Standard Knotted Fringes", price: 0.0 },
          { name: "Heavy Silk Thread Tassels", price: 250.0 },
          { name: "Beaded Zari Tassels", price: 400.0 }
        ]
      }
    ],
    reviews: []
  },
  4: {
    id: 4,
    title: "Hand-Engraved Brass Tea Kettle",
    description: "Made from heavy-gauge pure brass, this tea kettle is completely hand-engraved with floral creepers and features an insulated wood-wrapped handle. Tin-lined inside (kalai) to be food safe.",
    base_price: 2899.0,
    is_customizable: false,
    stock_qty: 4,
    images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"],
    artisan: {
      id: 2,
      name: "Mohan Lal",
      bio: "Mohan Lal belongs to a family of fifth-generation potters from Khurja. He specializes in the famous Mughal-inspired Blue Pottery.",
      craft_type: "Blue Pottery & Ceramics",
      city: "Khurja",
      rating: 4.9,
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
    },
    category: { name: "Metal Crafts", slug: "metal", jharokha_style: "default-jharokha" },
    customization_options: [],
    reviews: []
  },
  6: {
    id: 6,
    title: "Jaipur Rosewood Inlay Jewellery Box",
    description: "Crafted from premium Sheesham wood (Indian Rosewood) and inlaid with delicate acrylic and brass wire motifs, this box features red velvet lining and a secret brass latch.",
    base_price: 1650.0,
    is_customizable: true,
    stock_qty: 6,
    images: ["https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80"],
    artisan: {
      id: 1,
      name: "Riya Sen",
      bio: "Riya Sen is a master basket weaver from Jaipur.",
      craft_type: "Basketry & Bamboo Weaving",
      city: "Jaipur",
      rating: 4.8,
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
    },
    category: { name: "Bamboo & Woodwork", slug: "woodwork", jharokha_style: "default-jharokha" },
    customization_options: [
      {
        id: 8,
        option_name: "Inner Lining Velvet",
        option_type: "color_swatch",
        choices: [
          { name: "Royal Crimson Red", price: 0.0, color: "#800020" },
          { name: "Emerald Green", price: 0.0, color: "#046307" },
          { name: "Deep Royal Blue", price: 50.0, color: "#0b1075" }
        ]
      },
      {
        id: 9,
        option_name: "Engraved Monogram Brass Plate",
        option_type: "text",
        choices: {
          placeholder: "Enter initials (e.g. R.S.)",
          max_len: 4,
          price: 180.0
        }
      }
    ],
    reviews: []
  }
};

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const idStr = resolvedParams.id;
  const productId = parseInt(idStr) || 1;

  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Special Custom Requirements & Feasibility check
  const [customRequirements, setCustomRequirements] = useState("");
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);
  const [feasibilityReport, setFeasibilityReport] = useState<any>(null);

  // Gallery
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Customization selection state
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [studioActive, setStudioActive] = useState(false);

  // AI Co-Creation Assistant Chat States
  const [chatMessages, setChatMessages] = useState<Array<{role: "user" | "bot", message: string}>>([
    {role: "bot", message: "Namaste! I am the virtual Artisan Assistant. Would you like to check custom dimensions, paint colors, materials, or configure a customized request? Just describe what you want!"}
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [aiCustomConfig, setAiCustomConfig] = useState<any>(null);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", message: userMsg }]);
    setChatSending(true);
    
    // Construct chat history for Gemini endpoint
    const history = chatMessages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      message: m.message
    }));

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_history: history,
          user_message: userMsg,
          product_id: productId
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        setChatMessages(prev => [...prev, { role: "bot", message: result.reply }]);
        if (result.customization_detected && result.customizations && Object.keys(result.customizations).length > 0) {
          setAiCustomConfig(result);
        }
      } else {
        setChatMessages(prev => [...prev, { role: "bot", message: "Sorry, I am having trouble connecting to the artisan assistant right now." }]);
      }
    } catch (err) {
      console.error("Chatbot api error:", err);
      setChatMessages(prev => [...prev, { role: "bot", message: "I apologize, I am temporarily offline." }]);
    } finally {
      setChatSending(false);
    }
  };

  const handleApplyAiConfig = () => {
    if (!aiCustomConfig || !aiCustomConfig.customizations) return;
    
    const nextSelections = { ...selections };
    const nextTexts = { ...textInputs };
    
    Object.entries(aiCustomConfig.customizations).forEach(([optName, val]: [string, any]) => {
      const optionDef = product.customization_options.find((o: any) => o.option_name === optName);
      if (optionDef) {
        if (optionDef.option_type === "text") {
          nextTexts[optName] = String(val);
        } else if (Array.isArray(optionDef.choices)) {
          const matchedChoice = optionDef.choices.find((c: any) => c.name === val);
          if (matchedChoice) {
            nextSelections[optName] = matchedChoice;
          }
        }
      }
    });
    
    setSelections(nextSelections);
    setTextInputs(nextTexts);
    setAiCustomConfig(null);
    alert("AI custom configurations applied successfully!");
  };

  // Review writing state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage1, setReviewImage1] = useState("");
  const [reviewImage2, setReviewImage2] = useState("");
  const [reviewImage3, setReviewImage3] = useState("");
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // UI state
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function getDetails() {
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setReviewsList(data.reviews || []);
          setSelectedImage(data.images[0]);

          // Seed default selections
          const defaults: Record<string, any> = {};
          data.customization_options.forEach((opt: any) => {
            if (opt.option_type === "select" || opt.option_type === "color_swatch") {
              defaults[opt.option_name] = opt.choices[0]; // pick first choice
            }
          });
          setSelections(defaults);
        } else {
          loadFallback();
        }
      } catch (err) {
        console.error("Failed to load product from API, loading mock data:", err);
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      const fb = MOCK_PRODUCTS[productId] || MOCK_PRODUCTS[1];
      setProduct(fb);
      setReviewsList(fb.reviews || []);
      setSelectedImage(fb.images[0]);

      const defaults: Record<string, any> = {};
      fb.customization_options.forEach((opt: any) => {
        if (opt.option_type === "select" || opt.option_type === "color_swatch") {
          defaults[opt.option_name] = opt.choices[0];
        }
      });
      setSelections(defaults);
    }

    getDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-light">
        <Navbar />
        <div className="flex-grow flex items-center justify-center font-archivo text-sm uppercase text-foreground/50 tracking-wider">
          Loading creation details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-light">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <h2 className="font-archivo text-xl uppercase font-bold text-foreground">Creation Not Found</h2>
          <Link href="/catalog" className="text-coral-accent text-xs font-archivo uppercase font-bold tracking-widest">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate live total price
  let totalPrice = product.base_price;

  // Customization selection upcharges
  Object.values(selections).forEach((sel) => {
    if (sel && typeof sel === "object" && "price" in sel) {
      totalPrice += sel.price;
    }
  });

  // Text inputs upcharges
  product.customization_options.forEach((opt: any) => {
    if (opt.option_type === "text" && textInputs[opt.option_name]) {
      const config = opt.choices; // contains placeholder, max_len, price
      totalPrice += config.price || 0.0;
    }
  });

  const handleSelectSwatch = (optName: string, choice: any) => {
    setSelections((prev) => ({
      ...prev,
      [optName]: choice,
    }));
  };

  const handleTextChange = (optName: string, text: string, maxLen: number) => {
    if (text.length <= maxLen) {
      setTextInputs((prev) => ({
        ...prev,
        [optName]: text,
      }));
      setSelections((prev) => ({
        ...prev,
        [optName]: text ? { value: text, price: product.customization_options.find((o: any) => o.option_name === optName)?.choices.price || 100 } : null
      }));
    }
  };

  const handleCheckFeasibility = async () => {
    if (!customRequirements.trim()) {
      alert("Please enter some custom design requirements first.");
      return;
    }
    setCheckingFeasibility(true);
    setFeasibilityReport(null);

    try {
      const res = await fetch(`${API_URL}/api/ai/check-feasibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_title: product.title,
          product_desc: product.description,
          custom_request: customRequirements
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFeasibilityReport(data);
      } else {
        alert("Failed to analyze feasibility. Please verify backend connection.");
      }
    } catch (err) {
      console.error("Error checking feasibility:", err);
    } finally {
      setCheckingFeasibility(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Construct final customizations object for cart storage
    const finalCustomizations: Record<string, any> = {};
    Object.entries(selections).forEach(([key, val]) => {
      if (val) {
        finalCustomizations[key] = val;
      }
    });

    if (customRequirements.trim()) {
      finalCustomizations["Special Requirements"] = { value: customRequirements, price: 0.0 };
    }

    await addToCart(product.id, 1, finalCustomizations);

    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const activeUserId = currentUser ? currentUser.id : 1;
    const activeUserName = currentUser ? currentUser.name : "Aarav Sharma";

    // Gather images
    const images: string[] = [];
    if (reviewImage1.trim()) images.push(reviewImage1.trim());
    if (reviewImage2.trim()) images.push(reviewImage2.trim());
    if (reviewImage3.trim()) images.push(reviewImage3.trim());

    const newRev = {
      product_id: product.id,
      user_id: activeUserId,
      rating: reviewRating,
      comment: reviewComment,
      images: images
    };

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRev),
      });
      if (res.ok) {
        const savedReview = await res.json();
        setReviewsList((prev) => [
          ...prev,
          {
            id: savedReview.id,
            rating: savedReview.rating,
            comment: savedReview.comment,
            images: savedReview.images || [],
            user_name: activeUserName,
            created_at: new Date().toISOString(),
          },
        ]);
        setReviewComment("");
        setReviewImage1("");
        setReviewImage2("");
        setReviewImage3("");
      } else {
        // Fallback local append
        setReviewsList((prev) => [
          ...prev,
          {
            id: Date.now(),
            rating: reviewRating,
            comment: reviewComment,
            images: images,
            user_name: activeUserName,
            created_at: new Date().toISOString(),
          },
        ]);
        setReviewComment("");
        setReviewImage1("");
        setReviewImage2("");
        setReviewImage3("");
      }
    } catch (err) {
      console.error("Failed to submit review to server, updating state locally:", err);
      setReviewsList((prev) => [
        ...prev,
        {
          id: Date.now(),
          rating: reviewRating,
          comment: reviewComment,
          images: images,
          user_name: activeUserName,
          created_at: new Date().toISOString(),
        },
      ]);
      setReviewComment("");
      setReviewImage1("");
      setReviewImage2("");
      setReviewImage3("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-light">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">

        {/* Breadcrumbs */}
        <div className="mb-6 flex justify-between items-center text-xs">
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-foreground/60 hover:text-coral-accent transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          <span className="bg-cream-dark text-olive-dark py-1 px-3.5 rounded-full font-bold uppercase tracking-wider">
            {product.category?.name || "General Collection"}
          </span>
        </div>

        {/* Core Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Images or Customizer Studio */}
          <div className="lg:col-span-6 space-y-4">

            {/* Customizer Studio Mode Selector */}
            {product.is_customizable && (
              <div className="flex bg-cream-dark/50 border border-sandstone-light/15 rounded-2xl p-1 max-w-xs mx-auto mb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStudioActive(false)}
                  className={`flex-grow py-2 px-4 rounded-xl font-bold transition-all uppercase font-archivo text-[10px] tracking-wider cursor-pointer ${!studioActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                    }`}
                >
                  Photos
                </button>
                <button
                  type="button"
                  onClick={() => setStudioActive(true)}
                  className={`flex-grow py-2 px-4 rounded-xl font-bold transition-all uppercase font-archivo text-[10px] tracking-wider cursor-pointer ${studioActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                    }`}
                >
                  Studio Live
                </button>
              </div>
            )}

            {studioActive && product.is_customizable ? (
              <ProductStudio
                product={product}
                selections={selections}
                textInputs={textInputs}
              />
            ) : (
              <>
                <div className="bg-cream-dark/40 border border-sandstone-light/15 rounded-3xl overflow-hidden aspect-square shadow-sm flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage}
                    alt={product.title}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />

                  {product.is_customizable && (
                    <div className="absolute top-4 left-4 bg-coral-accent text-white py-1 px-2.5 rounded-full text-[9px] font-archivo font-bold uppercase tracking-widest flex items-center gap-1 shadow-md">
                      <Settings className="w-3 h-3 animate-spin-slow" />
                      Customized Preview
                    </div>
                  )}
                </div>

                {/* Gallery Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img
                          ? "border-sandstone-dark scale-105 shadow-sm"
                          : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img} 
                          alt="" 
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}


                {/* Disclaimer warning */}
                <p className="text-[9px] text-foreground/45 italic text-center max-w-xs mx-auto mt-3 leading-relaxed border-t border-sandstone-light/10 pt-2.5 w-full">
                  *Disclaimer: Real products are individually made by local artisans. The final item may have unique textures or shades differing from photos.
                </p>
              </>
            )}
          </div>

          {/* Right Side: Product Details & Configurator */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-coral-accent block">
                {product.category?.name}
              </span>
              <h1 className="font-archivo text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-foreground ml-1">{product.artisan?.rating || 4.8}</span>
                </div>
                <span className="text-foreground/30">•</span>
                <span className="text-foreground/70 font-medium">{reviewsList.length} verified review(s)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-cream-dark/50 border border-sandstone-light/15 rounded-2xl p-5 flex items-center justify-between shadow-inner">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Calculated Value</p>
                <p className="font-archivo text-2xl font-black text-sandstone-dark">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
              {product.is_customizable && (
                <div className="text-right text-[10px] text-olive-dark font-medium max-w-[200px]">
                  Includes custom choices and tag engravings upcharges
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {!product.is_customizable && (
              <div className="bg-sandstone-light/10 border border-sandstone-light/20 rounded-xl p-3.5 text-xs text-foreground/50 font-semibold italic text-left">
                Customization is not available for this unique item.
              </div>
            )}

            {/* Artisan Card Box */}
            <div className="border border-sandstone-light/25 bg-cream-dark/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center">
              {product.artisan?.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.artisan.photo_url}
                  alt={product.artisan.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-sandstone-light"
                />
              )}
              <div className="flex-grow text-center sm:text-left space-y-1">
                <span className="text-[9px] uppercase font-archivo font-extrabold tracking-wider bg-olive-dark text-cream-light px-2 py-0.5 rounded">
                  Master Artisan
                </span>
                <h4 className="font-archivo text-sm uppercase tracking-wide font-bold text-foreground">
                  {product.artisan?.name}
                </h4>
                <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                  {product.artisan?.bio}
                </p>
                <p className="text-[10px] text-olive-light font-bold flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="w-3.5 h-3.5 text-coral-accent" />
                  Specialist from {product.artisan?.city}
                </p>
              </div>
            </div>

            {/* Configurator Box (Only if customizable) */}
            {product.is_customizable && product.customization_options && product.customization_options.length > 0 && (
              <div className="border-t border-sandstone-light/20 pt-6 space-y-6">
                <h3 className="font-archivo text-sm uppercase font-bold tracking-widest text-foreground flex items-center gap-1.5 border-b border-sandstone-light/10 pb-3">
                  <Settings className="w-4 h-4 text-coral-accent animate-spin-slow" />
                  Customize Your Creation
                </h3>

                {product.customization_options.map((opt: any) => {

                  // Text Monogram Input Type
                  if (opt.option_type === "text") {
                    const textConfig = opt.choices; // placeholder, max_len, price
                    const enteredText = textInputs[opt.option_name] || "";

                    return (
                      <div key={opt.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold uppercase tracking-wider text-olive-dark">
                            {opt.option_name}
                          </label>
                          <span className="text-[10px] text-foreground/50">
                            (+₹{textConfig.price}) • {enteredText.length}/{textConfig.max_len} chars
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder={textConfig.placeholder}
                          value={enteredText}
                          onChange={(e) => handleTextChange(opt.option_name, e.target.value, textConfig.max_len)}
                          className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs focus:outline-none text-foreground font-medium"
                        />
                      </div>
                    );
                  }

                  // Color Swatch Swapping Input Type
                  if (opt.option_type === "color_swatch") {
                    return (
                      <div key={opt.id} className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold uppercase tracking-wider text-olive-dark">
                            {opt.option_name}
                          </label>
                          <span className="text-[10px] font-bold text-sandstone-dark">
                            {selections[opt.option_name]?.name || "Select options"}
                            {selections[opt.option_name]?.price > 0 && ` (+₹${selections[opt.option_name].price})`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {opt.choices.map((choice: any, idx: number) => {
                            const isSelected = selections[opt.option_name]?.name === choice.name;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSelectSwatch(opt.option_name, choice)}
                                className={`w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center hover:scale-105 shadow-inner`}
                                style={{
                                  backgroundColor: choice.color || "#ccc",
                                  borderColor: isSelected ? "var(--color-foreground)" : "transparent",
                                }}
                                title={`${choice.name} (+₹${choice.price})`}
                              >
                                {isSelected && (
                                  <Check className="w-4 h-4 text-white drop-shadow-md mix-blend-difference" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Dropdowns Selection Input Type
                  if (opt.option_type === "select") {
                    return (
                      <div key={opt.id} className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-olive-dark">
                          {opt.option_name}
                        </label>
                        <select
                          value={selections[opt.option_name]?.name || ""}
                          onChange={(e) => {
                            const choiceObj = opt.choices.find((c: any) => c.name === e.target.value);
                            handleSelectSwatch(opt.option_name, choiceObj);
                          }}
                          className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2.5 px-4 text-xs focus:outline-none text-foreground font-semibold"
                        >
                          {opt.choices.map((choice: any, idx: number) => (
                            <option key={idx} value={choice.name}>
                              {choice.name} {choice.price > 0 ? `(+₹${choice.price})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* AI Co-Creation Assistant Widget */}
            {product && product.is_customizable && (
              <div className="bg-cream-dark/20 border border-sandstone-light/15 rounded-2xl p-4.5 space-y-3.5 my-6">
                <div className="flex items-center gap-1.5 border-b border-sandstone-light/15 pb-2">
                  <Sparkles className="w-4 h-4 text-coral-accent animate-pulse" />
                  <h4 className="text-[10px] uppercase font-archivo font-extrabold tracking-wider text-foreground">AI Co-Creation Assistant</h4>
                </div>

                {/* Message display log */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-2xl text-[10px] leading-relaxed max-w-[85%] font-medium ${
                        msg.role === "user" 
                          ? "bg-sandstone-dark text-white rounded-tr-none" 
                          : "bg-cream-light text-foreground/80 border border-sandstone-light/10 rounded-tl-none"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestion config card */}
                {aiCustomConfig && (
                  <div className="bg-white/95 rounded-xl border border-coral-accent/30 p-3 space-y-2 shadow-sm animate-fade-in-up">
                    <p className="text-[9px] uppercase font-archivo font-extrabold tracking-wider text-coral-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-coral-accent" /> AI Customization Configured
                    </p>
                    <div className="text-[9px] font-semibold text-foreground/80 space-y-1 pl-1">
                      {Object.entries(aiCustomConfig.customizations).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex justify-between">
                          <span>{k}:</span>
                          <span className="font-bold text-sandstone-dark">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-coral-accent pt-1.5 border-t border-sandstone-light/10">
                      <span>Evaluated Price:</span>
                      <span className="font-black text-xs">₹{aiCustomConfig.custom_price}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyAiConfig}
                      className="w-full bg-coral-accent hover:bg-coral-accent/85 text-white text-[9px] font-archivo font-black uppercase py-2 rounded-lg transition-all"
                    >
                      Apply AI Custom Setup
                    </button>
                  </div>
                )}

                {/* Input box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe custom features (e.g. Cobalt Blue)..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    disabled={chatSending}
                    className="flex-grow bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2 px-3 text-[10px] focus:outline-none text-foreground font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSendChatMessage}
                    disabled={chatSending}
                    className="bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-[10px] font-archivo font-black uppercase px-3.5 py-2 rounded-xl transition-all shrink-0"
                  >
                    {chatSending ? "..." : "Send"}
                  </button>
                </div>

                {/* Special Custom Design Requirements & Feasibility check */}
                <div className="border-t border-sandstone-light/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold uppercase tracking-wider text-olive-dark">
                      Special Custom Requirements (Optional)
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Describe custom clay colors, size limits, or special engraving ideas..."
                    value={customRequirements}
                    onChange={(e) => setCustomRequirements(e.target.value)}
                    className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl p-3.5 text-xs focus:outline-none text-foreground font-medium"
                  />
                  
                  <button
                    type="button"
                    onClick={handleCheckFeasibility}
                    disabled={checkingFeasibility || !customRequirements.trim()}
                    className="w-full bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-[10px] font-archivo font-extrabold uppercase py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {checkingFeasibility ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Feasibility...
                      </>
                    ) : (
                      "Check Feasibility with AI"
                    )}
                  </button>

                  {feasibilityReport && (
                    <div className={`p-4 rounded-2xl border text-xs space-y-1.5 text-left ${
                      feasibilityReport.is_feasible 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider">
                        {feasibilityReport.is_feasible ? (
                          <span className="text-emerald-600">✓ Feasible Structure</span>
                        ) : (
                          <span className="text-rose-600">✗ Structural Risk Detected</span>
                        )}
                      </div>
                      <p className="text-[10px] font-medium leading-relaxed">
                        {feasibilityReport.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Cart Button and Call To Actions */}
            <div className="flex gap-4 pt-4 border-t border-sandstone-light/10">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-grow h-14 rounded-2xl font-archivo font-extrabold uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${isAdded
                  ? "bg-green-600 text-white"
                  : "bg-coral-accent hover:bg-rust text-white hover:shadow-lg"
                  }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 animate-pulse" /> Add to Cart
                  </>
                )}
              </button>

              <button
                className="w-14 h-14 border border-sandstone-light/40 rounded-2xl hover:bg-red-50 hover:border-red-200 text-foreground/45 hover:text-red-500 transition-colors flex items-center justify-center"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Craft Note */}
            <div className="bg-cream-dark/30 rounded-xl p-4 flex gap-3 border border-sandstone-light/10 text-xs text-foreground/75 leading-relaxed">
              <Sparkles className="w-5 h-5 text-coral-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Co-Created Heritage Craft</p>
                <p className="mt-0.5">Please allow 2-4 additional days for weaving, painting, or carving your customized specifications before shipment.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Community Section */}
        <section className="mt-20 border-t border-sandstone-light/20 pt-12 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Reviews list */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-archivo text-lg uppercase font-bold tracking-wider text-foreground">
                Artisan Work Appraisals ({reviewsList.length})
              </h3>

              {reviewsList.length === 0 ? (
                <p className="text-xs text-foreground/50">No evaluations written yet. Be the first to share your purchase co-creation review!</p>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="bg-cream-dark/20 border border-sandstone-light/10 p-5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold uppercase text-foreground">{rev.user_name}</p>
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-current" : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {rev.comment}
                      </p>
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 mt-2.5">
                          {rev.images.map((imgUrl: string, imgIdx: number) => (
                            <a key={imgIdx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-sandstone-light/20 bg-cream-dark/30 hover:scale-105 transition-all">
                              <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-foreground/40">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review form */}
            <div className="lg:col-span-5 bg-cream-dark/30 border border-sandstone-light/15 rounded-3xl p-6 h-fit space-y-4">
              <h4 className="font-archivo text-sm uppercase font-bold tracking-wider text-foreground">
                Write an Appraisal
              </h4>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Rating</label>
                  <div className="flex space-x-1.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 rounded hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-current" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark">Review Details</label>
                  <textarea
                    rows={4}
                    placeholder="Describe design glaze, bamboo splits weave, or wool textures..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl p-3.5 text-xs focus:outline-none text-foreground font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-olive-dark block">Attach Photos (Optional URLs)</label>
                  <input
                    type="text"
                    placeholder="Photo URL 1 (e.g. https://...)"
                    value={reviewImage1}
                    onChange={(e) => setReviewImage1(e.target.value)}
                    className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2 px-3 text-xs focus:outline-none text-foreground font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL 2 (e.g. https://...)"
                    value={reviewImage2}
                    onChange={(e) => setReviewImage2(e.target.value)}
                    className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2 px-3 text-xs focus:outline-none text-foreground font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL 3 (e.g. https://...)"
                    value={reviewImage3}
                    onChange={(e) => setReviewImage3(e.target.value)}
                    className="w-full bg-cream-light border border-sandstone-light/40 focus:border-sandstone-dark rounded-xl py-2 px-3 text-xs focus:outline-none text-foreground font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-olive-dark hover:bg-olive-light text-white text-xs font-archivo font-extrabold uppercase py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

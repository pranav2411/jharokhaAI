"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, Settings, SlidersHorizontal, Grid, RotateCcw } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/config";

interface Product {
  id: number;
  title: string;
  description: string;
  base_price: number;
  is_customizable: boolean;
  stock_qty: number;
  images: string[];
  artisan_name: string;
  artisan_rating: number;
  category_name: string;
  category_slug: string;
}

// Fallback products
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Handwoven Bamboo Storage Basket",
    description: "Our signature basket is handwoven from wild bamboo splits, showcasing natural brown and golden tones.",
    base_price: 899.0,
    is_customizable: true,
    stock_qty: 15,
    images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Riya Crafts",
    artisan_rating: 4.8,
    category_name: "Bamboo & Woodwork",
    category_slug: "woodwork"
  },
  {
    id: 2,
    title: "Khurja Mughal Cobalt Ceramic Vase",
    description: "Adorned with traditional hand-painted floral motifs in vibrant cobalt blue, turquoise, and mustard.",
    base_price: 1249.0,
    is_customizable: true,
    stock_qty: 8,
    images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Mohan Clay Arts",
    artisan_rating: 4.9,
    category_name: "Khurja Pottery",
    category_slug: "pottery"
  },
  {
    id: 3,
    title: "Handspun Katan Silk Banarasi Dupatta",
    description: "Woven with pure Katan silk warp and weft, this dupatta is intricately decorated with gold (Sona) and silver (Rupa) zari work.",
    base_price: 4500.0,
    is_customizable: true,
    stock_qty: 5,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Kavitha Weaves",
    artisan_rating: 5.0,
    category_name: "Heritage Textiles",
    category_slug: "textiles"
  },
  {
    id: 4,
    title: "Hand-Engraved Brass Tea Kettle",
    description: "Made from heavy-gauge pure brass, this tea kettle is completely hand-engraved with floral creepers.",
    base_price: 2899.0,
    is_customizable: false,
    stock_qty: 4,
    images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Mohan Clay Arts",
    artisan_rating: 4.5,
    category_name: "Metal Crafts",
    category_slug: "metal"
  },
  {
    id: 5,
    title: "Traditional Terracotta Diya Set (12 pcs)",
    description: "Organic clay diyas handcrafted by local potters, baked in traditional wood fire.",
    base_price: 199.0,
    is_customizable: false,
    stock_qty: 50,
    images: ["https://images.unsplash.com/photo-1605884766416-d8d4bfd5fdf1?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Mohan Clay Arts",
    artisan_rating: 4.7,
    category_name: "Khurja Pottery",
    category_slug: "pottery"
  },
  {
    id: 6,
    title: "Jaipur Rosewood Inlay Jewellery Box",
    description: "Crafted from premium Sheesham wood and inlaid with delicate acrylic and brass wire motifs.",
    base_price: 1650.0,
    is_customizable: true,
    stock_qty: 6,
    images: ["https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Riya Crafts",
    artisan_rating: 4.6,
    category_name: "Bamboo & Woodwork",
    category_slug: "woodwork"
  }
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(6000);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`);
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
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error("API error loading catalog, rendering local items:", err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Synchronize category selection if URL searchParams changes
  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category_slug === categoryFilter);
    }

    // Customizable Filter
    if (customizableOnly) {
      result = result.filter((p) => p.is_customizable);
    }

    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.artisan_name.toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter((p) => p.base_price <= maxPrice);

    setFilteredProducts(result);
  }, [products, categoryFilter, customizableOnly, searchQuery, maxPrice]);

  const resetFilters = () => {
    setCategoryFilter("all");
    setCustomizableOnly(false);
    setSearchQuery("");
    setMaxPrice(6000);
    router.push("/catalog");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-3 bg-cream-dark/30 border border-sandstone-light/15 rounded-3xl p-6 h-fit space-y-6">
        <div className="flex items-center justify-between border-b border-sandstone-light/20 pb-4">
          <h3 className="font-archivo text-sm uppercase font-bold tracking-wider flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="w-4 h-4 text-sandstone-dark" />
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-[10px] uppercase font-bold tracking-widest text-coral-accent hover:text-rust transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-olive-dark">
            Search Crafts
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Vases, baskets, silks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-light border border-sandstone-light/35 focus:border-sandstone-dark rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none text-foreground"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-foreground/45" />
          </div>
        </div>

        {/* Category select */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-widest text-olive-dark">
            Category
          </label>
          <div className="space-y-1.5">
            {[
              { name: "All Collections", slug: "all" },
              { name: "Heritage Textiles", slug: "textiles" },
              { name: "Khurja Pottery", slug: "pottery" },
              { name: "Bamboo & Woodwork", slug: "woodwork" },
              { name: "Metal Crafts", slug: "metal" },
            ].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setCategoryFilter(cat.slug);
                  router.push(`/catalog?category=${cat.slug}`);
                }}
                className={`w-full text-left text-xs py-2 px-3.5 rounded-lg border font-medium transition-all ${
                  categoryFilter === cat.slug
                    ? "bg-sandstone-dark border-sandstone-dark text-white shadow-sm"
                    : "bg-cream-light/30 border-sandstone-light/20 hover:bg-sandstone-light/10 text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold uppercase tracking-widest text-olive-dark">
              Max Price
            </label>
            <span className="font-archivo font-bold text-sandstone-dark">
              ₹{maxPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="6000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1 bg-sandstone-light/30 rounded-lg appearance-none cursor-pointer accent-sandstone-dark"
          />
          <div className="flex justify-between text-[10px] text-foreground/45">
            <span>₹100</span>
            <span>₹6,000</span>
          </div>
        </div>

        {/* Customization Toggle */}
        <div className="border-t border-sandstone-light/20 pt-4 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Customizable Only
            </p>
            <p className="text-[10px] text-foreground/60">Configure colors & tag engravings</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={customizableOnly}
              onChange={(e) => setCustomizableOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-cream-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral-accent"></div>
          </label>
        </div>
      </aside>

      {/* Catalog Grid */}
      <section className="lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground/70 font-medium">
            Showing <span className="font-bold">{filteredProducts.length}</span> unique crafts
          </p>
          <div className="flex items-center space-x-2 text-foreground/45">
            <Grid className="w-4 h-4 text-sandstone-dark" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-cream-dark/20 border border-sandstone-light/10 h-80 rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-cream-dark/10 rounded-3xl border border-dashed border-sandstone-light/40 space-y-4">
            <Settings className="w-12 h-12 text-sandstone-light mx-auto" />
            <h4 className="font-archivo text-base uppercase font-bold text-foreground">No crafts found</h4>
            <p className="text-xs text-foreground/60 max-w-xs mx-auto">
              We couldn&apos;t find any items matching your selected filters. Try resetting filters or search queries.
            </p>
            <button
              onClick={resetFilters}
              className="bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-xs font-archivo font-extrabold uppercase px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group bg-cream-light hover:bg-cream-dark/20 border border-sandstone-light/15 rounded-2xl overflow-hidden transition-all duration-300 relative shadow-sm hover:shadow-md flex flex-col h-full"
              >
                {/* Image Container with Custom Jaali Corner Borders */}
                <div className="relative h-64 overflow-hidden bg-cream-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0] || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80"}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Top-left decorative lattice accent corner */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sandstone-light/60 pointer-events-none rounded-tl-md" />
                  {/* Bottom-right decorative lattice accent corner */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sandstone-light/60 pointer-events-none rounded-br-md" />

                  {/* Customizable Ribbon overlay */}
                  {p.is_customizable && (
                    <span className="absolute top-3 right-3 bg-coral-accent text-white py-1 px-2.5 rounded-full text-[9px] font-archivo font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Settings className="w-2.5 h-2.5 animate-spin-slow" />
                      Customizable
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-5 flex flex-col flex-grow text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-olive-dark block mb-1">
                    {p.artisan_name}
                  </span>
                  <h4 className="font-archivo text-base text-foreground font-extrabold uppercase line-clamp-1 group-hover:text-coral-accent transition-colors leading-tight mb-2">
                    {p.title}
                  </h4>
                  <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed flex-grow mb-4">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-sandstone-light/10 pt-3 mt-auto">
                    <span className="text-xs font-bold text-foreground/50">{p.category_name}</span>
                    <span className="font-archivo font-black text-sandstone-dark text-base">
                      ₹{p.base_price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Catalog() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-light">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-10 text-left border-b border-sandstone-light/20 pb-6">
          <h1 className="font-archivo text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Explore Handcrafted Collections
          </h1>
          <p className="text-xs sm:text-sm text-foreground/75 mt-1">
            Browse through generations of Indian heritage. Select custom specifications for customizable products to fit your home.
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-20 font-archivo text-sm text-foreground/70 uppercase">
            Loading Catalog...
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JharokhaCard } from "@/components/JharokhaCard";
import { TrustBar } from "@/components/TrustBar";
import Link from "next/link";
import { ArrowRight, Sparkles, Landmark, Compass } from "lucide-react";

// Mock fallbacks in case FastAPI is offline during initial load
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Handwoven Bamboo Storage Basket",
    base_price: 899.0,
    is_customizable: true,
    images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Riya Crafts",
    artisan_rating: 4.8,
    category_slug: "woodwork",
    jharokha_style: "default-jharokha"
  },
  {
    id: 2,
    title: "Khurja Mughal Cobalt Ceramic Vase",
    base_price: 1249.0,
    is_customizable: true,
    images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Mohan Clay Arts",
    artisan_rating: 4.9,
    category_slug: "pottery",
    jharokha_style: "round-jharokha"
  },
  {
    id: 3,
    title: "Handspun Katan Silk Banarasi Dupatta",
    base_price: 4500.0,
    is_customizable: true,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Kavitha Weaves",
    artisan_rating: 5.0,
    category_slug: "textiles",
    jharokha_style: "arched-jharokha"
  },
  {
    id: 6,
    title: "Jaipur Rosewood Inlay Jewellery Box",
    base_price: 1650.0,
    is_customizable: true,
    images: ["https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80"],
    artisan_name: "Riya Crafts",
    artisan_rating: 4.6,
    category_slug: "woodwork",
    jharokha_style: "default-jharokha"
  }
];

const CATEGORIES = [
  {
    name: "Heritage Textiles",
    slug: "textiles",
    style: "arched-jharokha",
    desc: "Banarasi Silks & Phulkari weaves",
    count: "40+ items",
    bg: "bg-gradient-to-br from-coral-accent/20 to-rust/10",
  },
  {
    name: "Khurja Pottery",
    slug: "pottery",
    style: "round-jharokha",
    desc: "Traditional glazed cobalt ceramics",
    count: "28+ items",
    bg: "bg-gradient-to-br from-olive-light/20 to-olive-dark/10",
  },
  {
    name: "Bamboo & Woodwork",
    slug: "woodwork",
    style: "default-jharokha",
    desc: "Rosewood inlays & cane weaving",
    count: "35+ items",
    bg: "bg-gradient-to-br from-sandstone-light/20 to-sandstone-dark/10",
  },
  {
    name: "Metal Crafts",
    slug: "metal",
    style: "default-jharokha",
    desc: "Brass engravings & silver meenakari",
    count: "15+ items",
    bg: "bg-gradient-to-br from-[#D98354]/10 to-[#8B5E34]/15",
  }
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("http://localhost:8000/api/products/featured");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load products from API, rendering fallback products:", err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream-light">
      <Navbar />

      {/* Hero Section */}
      <header className="relative bg-[#C99A5B] overflow-hidden text-white flex items-center min-h-[500px] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 py-1.5 px-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#FAF6F0]">
              <Sparkles className="w-4 h-4 text-[#F3E9DA]" />
              Authentic Indian Craftsmanship
            </div>
            
            <h1 className="font-archivo text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white">
              Discover Unique Crafts.<br />
              <span className="text-cream-light font-extrabold">Empower Local Artisans.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-cream-light/95 leading-relaxed max-w-xl">
              Discover authentic handmade creations from talented artisans. Support local creators, explore unique crafts, and shop one-of-a-kind customizable products all in one marketplace.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/catalog"
                className="bg-olive-dark hover:bg-olive-light text-cream-light px-8 py-4 rounded-xl font-archivo font-extrabold uppercase text-xs tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 border border-olive-light/20"
              >
                <Compass className="w-4.5 h-4.5" />
                Browse Catalog
              </Link>
              <Link
                href="#featured"
                className="bg-transparent hover:bg-white/15 text-white border border-white/45 hover:border-white px-8 py-4 rounded-xl font-archivo font-extrabold uppercase text-xs tracking-wider transition-all duration-300"
              >
                Featured Collections
              </Link>
            </div>
          </div>

          {/* Hero Right Visuals - Matching User's Reference Collage */}
          <div className="lg:col-span-6 relative w-full h-[380px] sm:h-[450px]">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-3 select-none pointer-events-none">
              
              {/* Photo 1: Elephant Palace Entry */}
              <div className="col-span-4 row-span-3 rounded-2xl overflow-hidden shadow-md relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/elephant_gate.png"
                  alt="Jaipur Palace Gateway"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-sandstone-dark/10" />
              </div>

              {/* Photo 2: Jal Mahal Water Palace */}
              <div className="col-span-5 row-span-3 rounded-2xl overflow-hidden shadow-md relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/jal_mahal.jpg"
                  alt="Jaipur Heritage Site"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-sandstone-dark/10" />
              </div>

              {/* Photo 3: Traditional Craft Puppet Shop */}
              <div className="col-span-3 row-span-6 rounded-2xl overflow-hidden shadow-lg border border-sandstone-light/10 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/craft_shop.jpg"
                  alt="Heritage Puppets & Slippers stall"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-sandstone-dark/5" />
              </div>

              {/* Photo 4: Amber Fort Sandstone Walls */}
              <div className="col-span-9 row-span-3 rounded-2xl overflow-hidden shadow-md relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/amber_fort.png"
                  alt="Sandstone Fort Palace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-sandstone-dark/10" />
              </div>

            </div>
          </div>
        </div>
        
        {/* Subtle Bottom Wave Accent */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-cream-light rounded-t-[32px] z-10" />
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Explore Collections / Category tiles */}
        <section className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-1">
              <Landmark className="w-4 h-4" /> Traditional Guilds
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground mt-2">
              Explore Our Collections
            </h2>
            <div className="w-16 h-1 bg-sandstone-light mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={idx}
                href={`/catalog?category=${cat.slug}`}
                className={`group block p-8 rounded-3xl ${cat.bg} border border-sandstone-light/10 hover:border-sandstone-light/35 shadow-sm hover:shadow-md transition-all duration-300 text-center relative overflow-hidden`}
              >
                {/* Decorative background Jharokha motif */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 border border-sandstone-dark/10 rounded-full group-hover:scale-110 transition-transform opacity-30" />
                
                <h3 className="font-archivo text-base font-bold uppercase tracking-wider text-foreground mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-foreground/70 mb-4">{cat.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-archivo font-extrabold uppercase text-sandstone-dark group-hover:text-coral-accent transition-colors">
                  {cat.count} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Jharokha Products */}
        <section id="featured" className="py-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-coral-accent font-archivo text-xs uppercase tracking-widest font-extrabold">
              Curated Masterpieces
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground mt-2">
              Featured Creations
            </h2>
            <div className="w-16 h-1 bg-sandstone-light mx-auto mt-4 rounded-full" />
            <p className="text-xs text-foreground/75 mt-3">
              Crafts displayed inside custom-framed heritage windows. Click a product to co-create and customize its specifications.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 justify-items-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse text-center">
                  <div className="w-[280px] h-[360px] bg-cream-dark rounded-t-full" />
                  <div className="w-[180px] h-4 bg-cream-dark mx-auto rounded" />
                  <div className="w-[100px] h-3 bg-cream-dark mx-auto rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 justify-items-center">
              {products.map((prod) => (
                <JharokhaCard
                  key={prod.id}
                  id={prod.id}
                  title={prod.title}
                  base_price={prod.base_price}
                  images={prod.images}
                  is_customizable={prod.is_customizable}
                  artisan_name={prod.artisan_name}
                  artisan_rating={prod.artisan_rating}
                  category_slug={prod.category_slug}
                  jharokha_style={
                    prod.category_slug === "textiles"
                      ? "arched-jharokha"
                      : prod.category_slug === "pottery"
                      ? "round-jharokha"
                      : "default-jharokha"
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Trust bar element */}
        <TrustBar />

        {/* Artisan Spotlight Banner */}
        <section className="bg-olive-dark text-cream-light rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-10 shadow-lg relative overflow-hidden bg-jaali-dark">
          <div className="lg:w-7/12 space-y-5 text-left relative z-10">
            <span className="text-sandstone-light font-archivo text-xs uppercase tracking-widest font-extrabold">
              Meet the Masters
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-cream-light">
              Crafting Stories, One Knot & Glaze at a Time
            </h2>
            <p className="text-xs sm:text-sm text-cream-light/80 leading-relaxed">
              When you purchase from Jharokha, you are ordering directly from generational artisans in Rajasthan, Uttar Pradesh, and Banaras. We enable custom tailoring so you can adapt standard craft sizes to modern spaces while maintaining absolute heritage authenticity.
            </p>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-sandstone-light hover:bg-sandstone-dark text-foreground hover:text-white px-6 py-3 rounded-xl font-archivo font-extrabold uppercase text-xs tracking-wider transition-all duration-300"
              >
                Meet Our Artisans
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="lg:w-5/12 flex gap-4 w-full justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
              alt="Riya Sen - Basket Weaver"
              className="w-36 h-48 object-cover rounded-2xl border-4 border-sandstone-light/30 shadow-md rotate-[-3deg]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
              alt="Mohan Lal - Blue Potter"
              className="w-36 h-48 object-cover rounded-2xl border-4 border-sandstone-light/30 shadow-md translate-y-6 rotate-[3deg]"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

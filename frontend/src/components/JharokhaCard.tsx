"use client";

import React from "react";
import Link from "next/link";
import { Star, Settings } from "lucide-react";

export interface ProductCardProps {
  id: number;
  title: string;
  base_price: number;
  images: string[];
  is_customizable: boolean;
  artisan_name: string;
  artisan_rating: number;
  category_slug: string;
  jharokha_style?: string; // arched-jharokha, round-jharokha, default-jharokha
}

export const JharokhaCard: React.FC<ProductCardProps> = ({
  id,
  title,
  base_price,
  images,
  is_customizable,
  artisan_name,
  artisan_rating,
  category_slug,
  jharokha_style = "default-jharokha",
}) => {
  const imageUrl = images[0] || "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80";

  // Determine clip-path class based on style
  let clipClass = "jharokha-clip-default";
  if (jharokha_style === "arched-jharokha") {
    clipClass = "jharokha-clip-arch";
  } else if (jharokha_style === "round-jharokha") {
    clipClass = "jharokha-clip-round";
  }

  // Render matching SVG frame outline overlay
  const renderSvgFrame = () => {
    if (jharokha_style === "arched-jharokha") {
      return (
        <svg viewBox="0 0 300 390" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
          {/* Main carved wooden frame border */}
          <path
            d="M 15 380 L 15 110 C 15 50, 70 15, 150 15 C 230 15, 285 50, 285 110 L 285 380 Z"
            fill="none"
            stroke="var(--color-sandstone-dark)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Decorative inner dotted ivory trim */}
          <path
            d="M 21 377 L 21 112 C 21 56, 74 21, 150 21 C 226 21, 279 56, 279 112 L 279 377 Z"
            fill="none"
            stroke="var(--color-cream-dark)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
          {/* Top arch floral centerpiece */}
          <circle cx="150" cy="15" r="4" fill="var(--color-coral-accent)" />
          <path d="M 140 15 C 145 10, 155 10, 160 15" fill="none" stroke="var(--color-sandstone-dark)" strokeWidth="2" />
        </svg>
      );
    } else if (jharokha_style === "round-jharokha") {
      return (
        <svg viewBox="0 0 300 390" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
          {/* Main pottery/circular arched frame */}
          <path
            d="M 15 380 L 15 190 C 15 100, 75 25, 150 25 C 225 25, 285 100, 285 190 L 285 380 Z"
            fill="none"
            stroke="var(--color-olive-dark)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Inner bead/pearl style carving */}
          <path
            d="M 21 377 L 21 192 C 21 106, 78 31, 150 31 C 222 31, 279 106, 279 192 L 279 377 Z"
            fill="none"
            stroke="var(--color-sandstone-light)"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
          {/* Medallion decoration at apex */}
          <polygon points="150,18 154,26 146,26" fill="var(--color-sandstone-dark)" />
        </svg>
      );
    } else {
      // default-jharokha (multi-faceted angular Rajput-style window)
      return (
        <svg viewBox="0 0 300 390" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
          {/* Angular frame */}
          <path
            d="M 15 380 L 15 120 L 70 65 L 150 15 L 230 65 L 285 120 L 285 380 Z"
            fill="none"
            stroke="var(--color-sandstone-dark)"
            strokeWidth="6.5"
            strokeLinejoin="round"
          />
          {/* Inner details */}
          <path
            d="M 21 376 L 21 122 L 73 70 L 150 22 L 227 70 L 279 122 L 279 376 Z"
            fill="none"
            stroke="var(--color-coral-accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Little jaali hangings */}
          <circle cx="70" cy="65" r="3.5" fill="var(--color-sandstone-dark)" />
          <circle cx="230" cy="65" r="3.5" fill="var(--color-sandstone-dark)" />
          <circle cx="150" cy="15" r="4.5" fill="var(--color-sandstone-dark)" />
        </svg>
      );
    }
  };

  return (
    <Link href={`/product/${id}`} className="group block">
      <div className="flex flex-col items-center">
        {/* Jharokha Window Wrapper */}
        <div className="jharokha-card-container drop-shadow-[0_12px_15px_rgba(44,32,23,0.18)]">
          
          {/* Masked Image Frame */}
          <div className={`${clipClass} w-full h-full bg-cream-dark relative overflow-hidden transition-all duration-500`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-110 filter brightness-[0.97]"
            />
            {/* Shadow overlay inside the window for realistic depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 mix-blend-multiply pointer-events-none" />
          </div>

          {/* SVG Carved Frame Overlay */}
          {renderSvgFrame()}

          {/* Customizable Badge overlay */}
          {is_customizable && (
            <div className="absolute top-24 right-6 bg-coral-accent text-white py-1 px-2.5 rounded-full text-[9px] font-archivo font-bold uppercase tracking-widest flex items-center gap-1 shadow-md z-10 transition-transform duration-300 group-hover:scale-105">
              <Settings className="w-3 h-3 animate-spin-slow" />
              Customize
            </div>
          )}
        </div>

        {/* Chhajja (Overhang/Ledge) Shadow Block */}
        <div className="w-[240px] h-3 bg-gradient-to-b from-sandstone-dark/30 to-transparent blur-[2px] -mt-1 rounded-full opacity-80" />

        {/* Product Meta Details */}
        <div className="mt-4 text-center px-2 max-w-[270px]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-olive-dark block mb-1">
            {artisan_name}
          </span>
          <h4 className="font-archivo text-base text-foreground leading-tight line-clamp-1 group-hover:text-coral-accent transition-colors font-extrabold uppercase">
            {title}
          </h4>
          
          <div className="flex items-center justify-center space-x-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-foreground/80">{artisan_rating}</span>
            <span className="text-foreground/30">•</span>
            <span className="text-sm font-archivo font-black text-sandstone-dark">₹{base_price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

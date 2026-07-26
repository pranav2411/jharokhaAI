"use client";

import React, { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { API_URL } from "@/config";

interface ProductStudioProps {
  product: {
    id: number;
    title: string;
    description: string;
    images?: string[];
    category?: {
      id: number;
      name: string;
      slug: string;
    };
    customization_options?: any[];
  };
  selections: Record<string, any>;
  textInputs: Record<string, string>;
}

export default function ProductStudio({ product, selections, textInputs }: ProductStudioProps) {
  const categorySlug = product.category?.slug || "";
  const titleLower = product.title.toLowerCase();

  const [viewMode, setViewMode] = useState<"photo" | "svg">("photo");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // -------------------------------------------------------------------------
  // DYNAMIC SELECTION PARSER (Extracts colors, texts, and dropdown options)
  // -------------------------------------------------------------------------
  
  // 1. Gather all color swatches selections
  const colorSelections = Object.entries(selections)
    .filter(([_, val]) => val && typeof val === "object" && "color" in val)
    .map(([key, val]) => ({ optionName: key, name: val.name, color: val.color }));

  // Primary color: usually body color or first color swatch option
  const primaryColor = colorSelections[0]?.color || "#ffd700"; // default gold
  const primaryName = colorSelections[0]?.name || "Natural finish";

  // Secondary color: accent lining or second color swatch option
  const secondaryColor = colorSelections[1]?.color || "#800020"; // default crimson
  const secondaryName = colorSelections[1]?.name || "Accent details";

  // 2. Gather text inputs
  const enteredTexts = Object.entries(textInputs)
    .map(([key, val]) => ({ optionName: key, value: val }));
  const mainText = (enteredTexts[0]?.value || "").toUpperCase().slice(0, 8);

  // 3. Gather dropdown select choices
  const selectSelections = Object.entries(selections)
    .filter(([_, val]) => val && (typeof val === "string" || !("color" in val)))
    .map(([key, val]) => ({
      optionName: key,
      choiceName: typeof val === "object" ? val.name : val
    }));

  const allChoicesString = selectSelections.map(s => s.choiceName.toLowerCase()).join(" ");

  const handleAiAnalysis = async () => {
    setAnalyzing(true);
    setAiAnalysis(null);

    const selectionsText = Object.entries(selections)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? v.name : v}`)
      .join(", ");
    const textsText = Object.entries(textInputs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    const requestText = `Glaze/Finish: ${primaryName}. Pattern/Styling: ${selectionsText}. Monogram/Engraving: ${textsText || "None"}.`;

    try {
      const res = await fetch(`${API_URL}/api/ai/check-feasibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_title: product.title,
          product_desc: product.description,
          custom_request: requestText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.reason);
      } else {
        setAiAnalysis("Failed to obtain live visualizer advice. Please verify API connection.");
      }
    } catch (err) {
      console.error("Error analyzing customizations:", err);
      setAiAnalysis("Network error loading dynamic preview description.");
    } finally {
      setAnalyzing(false);
    }
  };

  // -------------------------------------------------------------------------
  // GENERATIVE TEMPLATE 1: Ceramic & Pottery Vessels
  // -------------------------------------------------------------------------
  const renderPotteryTemplate = () => {
    // Primary Color maps to base glaze color
    const baseGlaze = colorSelections[0]?.color || "#002fa7"; // fallback Cobalt Blue
    
    const patternOption = selections["Vase Base Pattern"] || selections["Base Pattern"] || selections["Pattern Selection"];
    const patternName = patternOption?.name || "Mughal Floral Vine (Classic)";

    // Check pattern select keyword matches
    const hasPeacock = allChoicesString.includes("peacock");
    const hasJaali = allChoicesString.includes("jaali") || allChoicesString.includes("geo");
    const hasFloral = !hasPeacock && !hasJaali; // default floral vines

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <radialGradient id="potteryGlaze" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
              <stop offset="35%" stopColor={baseGlaze} />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
            <linearGradient id="potteryGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="200" cy="300" rx="90" ry="18" fill="rgba(0, 0, 0, 0.22)" />

          {/* Base */}
          <ellipse cx="200" cy="285" rx="55" ry="10" fill="#2b1a0d" stroke="#111" />

          {/* Vessel Main Body */}
          <path d="M 140,240 Q 110,180 145,130 Q 155,115 155,100 L 245,100 Q 245,115 255,130 Q 290,180 260,240 C 240,285 160,285 140,240 Z" fill="url(#potteryGlaze)" stroke="#111" strokeWidth="1.5" />
          
          {/* Vessel Neck & Rim */}
          <path d="M 155,100 Q 200,105 245,100 L 250,75 Q 200,80 150,75 Z" fill={baseGlaze} stroke="#111" strokeWidth="1.5" />
          <ellipse cx="200" cy="75" rx="50" ry="8" fill="#1a1a1a" />

          {/* Decorative Gold Handles */}
          <path d="M 138,140 C 100,150 110,210 135,220" fill="none" stroke="url(#potteryGold)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 262,140 C 300,150 290,210 265,220" fill="none" stroke="url(#potteryGold)" strokeWidth="6" strokeLinecap="round" />

          {/* live Monogram Label hanging tag (if text is supplied) */}
          {mainText && (
            <g transform="translate(200, 100)">
              <line x1="0" y1="0" x2="-15" y2="40" stroke="#ffd700" strokeWidth="1.5" />
              <rect x="-35" y="40" width="40" height="20" fill="#f5e0bb" stroke="#8b5a2b" strokeWidth="1" rx="2" />
              <text x="-15" y="54" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fontWeight="black" fill="#5c3816">
                {mainText.slice(0, 4)}
              </text>
            </g>
          )}

          {/* Live Painted Patterns */}
          {hasFloral && (
            <g stroke="url(#potteryGold)" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round">
              <path d="M 200,260 Q 180,210 200,160 Q 220,130 200,110" />
              <path d="M 193,210 Q 165,190 180,180" />
              <path d="M 207,210 Q 235,190 220,180" />
              <circle cx="180" cy="180" r="3.5" fill="#ffd700" stroke="none" />
              <circle cx="220" cy="180" r="3.5" fill="#ffd700" stroke="none" />
            </g>
          )}

          {hasJaali && (
            <g stroke="#ffd700" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round">
              <path d="M 150,150 L 250,230 M 150,170 L 230,235 M 170,140 L 250,210" />
              <path d="M 250,150 L 150,230 M 250,170 L 170,235 M 230,140 L 150,210" />
            </g>
          )}

          {hasPeacock && (
            <g opacity="0.9">
              <circle cx="200" cy="185" r="28" fill="url(#potteryGold)" stroke="#ffd700" strokeWidth="1" />
              <circle cx="200" cy="185" r="18" fill="#008080" />
              <circle cx="200" cy="185" r="8" fill="#000080" />
              <path d="M 200,157 L 200,150 M 200,213 L 200,220 M 172,185 L 165,185 M 228,185 L 235,185" stroke="#ffd700" strokeWidth="2" />
            </g>
          )}
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Pottery Customizer Active</p>
            <p className="mt-0.5">
              Glazing vessel with <strong>{primaryName}</strong>. 
              Decorating with custom <strong>{patternName}</strong> pattern structure.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // GENERATIVE TEMPLATE 2: Textiles & Handloom Looms (Saree/Dupatta/Stoles)
  // -------------------------------------------------------------------------
  const renderTextileTemplate = () => {
    // Primary Color is the base fabric color
    const baseFabricColor = colorSelections[0]?.color || "#900c3f"; // default crimson

    const borderOption = selections["Zari Border Style"] || selections["Border Selection"] || selections["Zari Thread Combination"] || selections["Border Style"];
    const borderName = borderOption?.name || "Classic Temple Zari";

    // Check thread select keywords (Silver, Gold etc.)
    const hasSilverBorder = allChoicesString.includes("silver") || allChoicesString.includes("rupa");
    const zariColor = hasSilverBorder ? "#d3d3d3" : "#ffd700";

    const hasTassels = allChoicesString.includes("tassel") || allChoicesString.includes("fringes");

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <linearGradient id="textileSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={baseFabricColor} />
              <stop offset="40%" stopColor={baseFabricColor} />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="100%" stopColor={baseFabricColor} />
            </linearGradient>
            <pattern id="textileZari" width="10" height="20" patternUnits="userSpaceOnUse">
              <rect width="10" height="20" fill={zariColor} />
              <path d="M 0,0 L 5,10 L 0,20 M 10,0 L 5,10 L 10,20" stroke="#9b720b" strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="200" cy="290" rx="130" ry="15" fill="rgba(0, 0, 0, 0.16)" />

          {/* Textile Drape Body */}
          <path d="M 90,80 C 120,70 280,70 310,80 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#textileSheen)" stroke="#600" strokeWidth="0.5" />

          {/* Loom Pleat Lines */}
          <path d="M 120,80 L 110,265" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
          <path d="M 160,78 L 150,270" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
          <path d="M 200,76 L 195,272" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
          <path d="M 240,78 L 245,270" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
          <path d="M 280,80 L 290,265" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />

          {/* Left Borders */}
          <path d="M 90,80 L 105,80 L 95,261 L 80,260 Z" fill="url(#textileZari)" />
          {/* Right Borders */}
          <path d="M 310,80 L 295,80 L 305,261 L 320,260 Z" fill="url(#textileZari)" />
          {/* Bottom Hem Border */}
          <path d="M 95,250 C 150,275 250,275 305,250 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#textileZari)" />

          {/* Zari Gold accents lines */}
          <path d="M 105,80 Q 200,95 295,80" fill="none" stroke={zariColor} strokeWidth="2.5" />
          <path d="M 105,85 Q 200,100 295,85" fill="none" stroke={zariColor} strokeWidth="1" />

          {/* Render hanging tassels if selected */}
          {hasTassels && (
            <g stroke={zariColor} strokeWidth="3" strokeLinecap="round" opacity="0.9">
              {/* Tassel hangers */}
              <line x1="95" y1="262" x2="95" y2="274" />
              <line x1="125" y1="268" x2="125" y2="280" />
              <line x1="155" y1="272" x2="155" y2="284" />
              <line x1="185" y1="274" x2="185" y2="286" />
              <line x1="215" y1="274" x2="215" y2="286" />
              <line x1="245" y1="272" x2="245" y2="284" />
              <line x1="275" y1="268" x2="275" y2="280" />
              <line x1="305" y1="262" x2="305" y2="274" />
            </g>
          )}

          {/* Monogram tag stitching (if text is supplied) */}
          {mainText && (
            <g transform="translate(180, 130) rotate(-5)">
              <rect x="0" y="0" width="50" height="22" fill="#fff" stroke="#ffd700" strokeWidth="1" strokeDasharray="2,2" />
              <text x="25" y="14" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#000">
                {mainText}
              </text>
            </g>
          )}
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Textiles Handloom Active</p>
            <p className="mt-0.5">
              Weaving base fabric threads in <strong>{primaryName}</strong>. 
              Detailing borders with premium <strong>{borderName}</strong> configurations.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // GENERATIVE TEMPLATE 2.5: Handwoven Baskets
  // -------------------------------------------------------------------------
  const renderJuteBasket = () => {
    const liningOption = selections["Lining Fabric Selection"] || selections["Lining Fabric & Color"] || selections["Lining Selection"];
    const liningName = liningOption?.name || "Natural Cane / No Lining";
    const liningColor = liningOption?.color || "#E6C280";

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <pattern id="weave" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#dfbe9b" />
              <path d="M 0,10 L 20,10 M 10,0 L 10,20" stroke="#b28d65" strokeWidth="2" />
            </pattern>
          </defs>

          <ellipse cx="200" cy="290" rx="120" ry="20" fill="rgba(0, 0, 0, 0.2)" />

          {/* Leather Handle Straps */}
          <path d="M 120,130 C 110,60 150,60 140,130" fill="none" stroke="#7a421b" strokeWidth="12" strokeLinecap="round" />
          <path d="M 280,130 C 290,60 250,60 260,130" fill="none" stroke="#7a421b" strokeWidth="12" strokeLinecap="round" />
          <circle cx="130" cy="122" r="4" fill="#ffd700" />
          <circle cx="270" cy="122" r="4" fill="#ffd700" />

          {/* Basket Body */}
          <path d="M 110,130 L 290,130 L 270,280 L 130,280 Z" fill="url(#weave)" stroke="#8e6a45" strokeWidth="2" />

          {/* Fabric Lining Overhang */}
          <path d="M 100,130 C 120,150 160,150 180,130 C 200,150 240,150 260,130 C 280,150 295,140 300,130 C 300,120 100,120 100,130 Z" 
            fill={liningColor} 
            stroke="#b39d82" 
            strokeWidth="1" 
          />
          
          <path d="M 110,130 Q 200,140 290,130" fill="none" stroke="#66492e" strokeWidth="2" strokeDasharray="3,3" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Handwoven Basket</p>
            <p className="mt-0.5">
              Visualizing the interior lined with <strong>{liningName}</strong> fabric. 
              The basket handles are reinforced with tanned bridle leather.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // GENERATIVE TEMPLATE 3: Woodwork & Bamboo (Boxes, Trays, Furniture)
  // -------------------------------------------------------------------------
  const renderWoodworkTemplate = () => {
    // If the wood finish color is configured
    const polishOption = colorSelections.find(s => s.optionName.toLowerCase().includes("polish") || s.optionName.toLowerCase().includes("wood"));
    const woodColor = polishOption?.color || "#5c3826"; // fallback walnut sheesham
    const woodName = polishOption?.name || "Natural Honey Sheesham";

    // Velvet interior fabric color
    const velvetOption = colorSelections.find(s => s.optionName.toLowerCase().includes("velvet") || s.optionName.toLowerCase().includes("lining"));
    const liningColor = velvetOption?.color || "#800020"; // default crimson red
    const liningName = velvetOption?.name || "Crimson Felt";

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <radialGradient id="boxLining" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={liningColor} />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
            <linearGradient id="brassPlaque" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="200" cy="300" rx="140" ry="25" fill="rgba(0, 0, 0, 0.22)" />

          {/* Opened Wood Lid */}
          <path d="M 90,130 L 90,40 L 310,40 L 310,130 Z" fill={woodColor} stroke="#222" strokeWidth="2" />
          <path d="M 105,115 L 105,52 L 295,52 L 295,115 Z" fill="#241209" />
          <rect x="130" y="122" width="16" height="12" fill="#d4af37" rx="1" />
          <rect x="254" y="122" width="16" height="12" fill="#d4af37" rx="1" />

          {/* Main Chassis Base */}
          <path d="M 80,130 L 320,130 L 330,280 L 70,280 Z" fill={woodColor} stroke="#111" strokeWidth="2.5" />
          
          {/* Brass Metal Brackets */}
          <path d="M 80,130 L 95,130 L 80,150 Z" fill="#d4af37" />
          <path d="M 320,130 L 305,130 L 320,150 Z" fill="#d4af37" />
          <path d="M 70,280 L 90,280 L 72,250 Z" fill="#d4af37" />
          <path d="M 330,280 L 310,280 L 328,250 Z" fill="#d4af37" />

          {/* Felt Compartment lined inside */}
          <path d="M 100,145 L 300,145 L 312,265 L 88,265 Z" fill="url(#boxLining)" stroke="#222" strokeWidth="1" />
          <line x1="200" y1="145" x2="200" y2="265" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="94" y1="205" x2="306" y2="205" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />

          {/* Brass Monogram Plaque */}
          {mainText && (
            <g>
              <path d="M 150,225 L 250,225 L 252,255 L 148,255 Z" fill="url(#brassPlaque)" stroke="#8b6508" strokeWidth="1" />
              <circle cx="153" cy="240" r="1.5" fill="#444" />
              <circle cx="247" cy="240" r="1.5" fill="#444" />
              <text
                x="200"
                y="246"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontSize="14"
                fontWeight="bold"
                letterSpacing="3"
                fill="#3a2307"
              >
                {mainText.slice(0, 4)}
              </text>
            </g>
          )}
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Woodwork Customizer Active</p>
            <p className="mt-0.5">
              Polishing cabinet in <strong>{woodName}</strong>. 
              Adding interior partitions lined with <strong>{liningName}</strong> fabric.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // GENERATIVE TEMPLATE 4: Metal Crafts (Brass Kettles, Plates, Sculptures)
  // -------------------------------------------------------------------------
  const renderMetalcraftTemplate = () => {
    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <radialGradient id="metalShine" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffe8aa" />
              <stop offset="60%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#554411" />
            </radialGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="200" cy="280" rx="110" ry="18" fill="rgba(0, 0, 0, 0.25)" />

          {/* Hammered Metal Platter Base */}
          <circle cx="200" cy="180" r="100" fill="url(#metalShine)" stroke="#8e7018" strokeWidth="2" />
          <circle cx="200" cy="180" r="85" fill="none" stroke="#aa851c" strokeWidth="1" strokeDasharray="3,4" />

          {/* Engraved Floral Center medallion */}
          <circle cx="200" cy="180" r="45" fill="none" stroke="#ffe8aa" strokeWidth="1.5" opacity="0.6" />
          <path d="M 200,135 Q 185,180 200,225 M 155,180 Q 200,165 245,180" fill="none" stroke="#ffe8aa" strokeWidth="1.2" opacity="0.4" />

          {/* Engraving plaque inscription text (if text is supplied) */}
          {mainText && (
            <g>
              <rect x="150" y="170" width="100" height="20" fill="none" stroke="#ffe8aa" strokeWidth="1" />
              <text x="200" y="184" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fontStyle="italic" fill="#ffe8aa" opacity="0.8">
                {mainText}
              </text>
            </g>
          )}
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Metal Crafts Engraving Active</p>
            <p className="mt-0.5">
              Polishing brass platter surface. 
              Live engraving script will reflect: <strong className="font-mono text-coral-accent bg-white px-1 py-0.5 border border-sandstone-light/10 rounded">{mainText || "None"}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // DEFAULT FALLBACK: Generics Co-Creation Blueprint
  // -------------------------------------------------------------------------
  const renderFallback = () => {
    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <div className="w-full max-h-[350px] aspect-square bg-gradient-to-br from-[#737851]/10 to-[#C99A5B]/10 border border-sandstone-light/20 rounded-3xl p-6 flex flex-col justify-between text-left relative overflow-hidden shadow-inner w-full">
          <div className="absolute top-0 right-0 bg-[#C99A5B] text-white py-1 px-3 text-[9px] font-archivo font-extrabold uppercase tracking-widest rounded-bl-2xl">
            Co-Design Studio
          </div>

          <div className="space-y-2">
            <h4 className="font-archivo text-xs uppercase tracking-widest font-black text-olive-dark">Active Configurations</h4>
            <div className="w-10 h-0.5 bg-coral-accent" />
          </div>

          <div className="space-y-3.5 my-6 flex-grow flex flex-col justify-center">
            {Object.entries(selections).map(([key, val]) => {
              if (!val) return null;
              return (
                <div key={key} className="flex items-center gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-coral-accent shrink-0" />
                  <div>
                    <span className="text-foreground/50 block text-[9px] uppercase font-bold tracking-wider">{key}</span>
                    <span className="font-bold text-foreground capitalize">
                      {typeof val === "object" ? val.name || val.value : val}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/85 border border-sandstone-light/25 p-3 rounded-2xl flex gap-2.5 items-center">
            <Info className="w-4 h-4 text-olive-dark shrink-0" />
            <span className="text-[10px] text-foreground/75 leading-relaxed font-medium">
              We are dynamically building your {product.title}. Ready to be individually handcrafted by remote artisans.
            </span>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // GENERATIVE SWITCH ROUTER (Routes based on category slugs or title terms)
  // -------------------------------------------------------------------------
  const renderContent = () => {
    // Route matching Pottery products
    if (
      categorySlug === "pottery" || 
      titleLower.includes("vase") || 
      titleLower.includes("urn") || 
      titleLower.includes("pottery") || 
      titleLower.includes("ceramic") || 
      titleLower.includes("diya")
    ) {
      return renderPotteryTemplate();
    }
    
    // Route matching Textile products
    if (
      categorySlug === "textiles" || 
      titleLower.includes("saree") || 
      titleLower.includes("dupatta") || 
      titleLower.includes("silk") || 
      titleLower.includes("khadi") || 
      titleLower.includes("stole")
    ) {
      return renderTextileTemplate();
    }
    
    // Route matching Basket products
    if (
      titleLower.includes("basket") || 
      titleLower.includes("bamboo") || 
      titleLower.includes("jute")
    ) {
      return renderJuteBasket();
    }
    
    // Route matching Woodwork products
    if (
      categorySlug === "woodwork" || 
      titleLower.includes("box") || 
      titleLower.includes("table") || 
      titleLower.includes("wood")
    ) {
      return renderWoodworkTemplate();
    }
    
    // Route matching Metal products
    if (
      categorySlug === "metal" || 
      titleLower.includes("brass") || 
      titleLower.includes("kettle") || 
      titleLower.includes("bronze") || 
      titleLower.includes("metal")
    ) {
      return renderMetalcraftTemplate();
    }

    return renderFallback();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle View Mode */}
      <div className="flex bg-cream-dark/40 border border-sandstone-light/15 rounded-xl p-1 max-w-xs mx-auto mb-2 text-xs">
        <button
          type="button"
          onClick={() => setViewMode("photo")}
          className={`flex-grow py-1.5 px-3 rounded-lg font-bold transition-all uppercase font-archivo text-[9px] tracking-wider cursor-pointer ${viewMode === "photo"
            ? "bg-white text-foreground shadow-sm"
            : "text-foreground/60 hover:text-foreground"
            }`}
        >
          Photo + AI Customizations
        </button>
        <button
          type="button"
          onClick={() => setViewMode("svg")}
          className={`flex-grow py-1.5 px-3 rounded-lg font-bold transition-all uppercase font-archivo text-[9px] tracking-wider cursor-pointer ${viewMode === "svg"
            ? "bg-white text-foreground shadow-sm"
            : "text-foreground/60 hover:text-foreground"
            }`}
        >
          Interactive SVG Mockup
        </button>
      </div>

      {viewMode === "photo" ? (
        <div className="w-full space-y-4">
          <div className="bg-cream-dark/30 border border-sandstone-light/15 rounded-3xl overflow-hidden aspect-square relative shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images?.[0] || "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80"}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80";
              }}
              className="w-full h-full object-cover"
            />
            {/* Custom options glassmorphic badge grid */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow space-y-1.5 text-left">
              <span className="text-[8px] font-archivo font-black uppercase tracking-wider text-sandstone-dark block">
                Active Configurations Overlay
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] font-semibold text-foreground/80">
                {colorSelections.slice(0, 2).map((col, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: col.color }} />
                    <span className="truncate">{col.optionName}: <strong>{col.name}</strong></span>
                  </div>
                ))}
                {mainText && (
                  <div className="truncate">
                    <span>Engraving: <strong>"{mainText}"</strong></span>
                  </div>
                )}
                {selectSelections.slice(0, 2).map((sel, idx) => (
                  <div key={idx} className="truncate">
                    <span>{sel.optionName}: <strong>{sel.choiceName}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Preview Assistant */}
          <div className="bg-cream-light border border-sandstone-light/10 p-4 rounded-3xl text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-archivo font-black uppercase tracking-wider text-olive-dark flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-coral-accent" /> AI Custom Visualizer
              </span>
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={analyzing}
                className="bg-sandstone-dark hover:bg-sandstone-light text-white hover:text-foreground text-[8px] font-archivo font-extrabold uppercase py-1 px-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {analyzing ? "AI Analyzing..." : "Describe Custom Look"}
              </button>
            </div>
            
            {aiAnalysis ? (
              <p className="text-[10px] font-medium leading-relaxed text-foreground/80 bg-white/50 border border-sandstone-light/10 p-3 rounded-2xl animate-fade-in-up">
                {aiAnalysis}
              </p>
            ) : (
              <p className="text-[9px] text-foreground/45 leading-relaxed">
                Click "Describe Custom Look" to let the AI analyze your selected options against the uploaded photo structure and detail the expected final handcrafted look.
              </p>
            )}
          </div>
        </div>
      ) : (
        renderContent()
      )}
      
      {/* Disclaimer warning */}
      <p className="text-[9px] text-foreground/45 italic text-center max-w-xs mt-3 leading-relaxed border-t border-sandstone-light/10 pt-2.5 w-full select-none">
        *Disclaimer: Handcrafted items are individually made. The final product may differ slightly from the digital SVG mockup and photos uploaded.
      </p>
    </div>
  );
}

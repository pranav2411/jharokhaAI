"use client";

import React from "react";
import { Sparkles, Info } from "lucide-react";

interface ProductStudioProps {
  product: {
    id: number;
    title: string;
    customization_options?: any[];
  };
  selections: Record<string, any>;
  textInputs: Record<string, string>;
}

export default function ProductStudio({ product, selections, textInputs }: ProductStudioProps) {
  const productId = product.id;

  // ----------------------------------------------------
  // PRODUCT ID 6: Rosewood Jewellery Box Customizer
  // ----------------------------------------------------
  const renderJewelleryBox = () => {
    // Extract selected color
    const velvetOption = selections["Inner Lining Velvet"];
    const velvetColor = velvetOption?.color || "#800020"; // default Crimson Red
    const velvetName = velvetOption?.name || "Royal Crimson Red";

    // Extract monogram
    const monogramText = (textInputs["Engraved Monogram Brass Plate"] || "").toUpperCase().slice(0, 4);

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          {/* Gradients */}
          <defs>
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5c3826" />
              <stop offset="50%" stopColor="#3d2314" />
              <stop offset="100%" stopColor="#241209" />
            </linearGradient>
            <linearGradient id="plaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#8b6508" />
            </linearGradient>
            <radialGradient id="feltShade" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={velvetColor} />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Shadows */}
          <ellipse cx="200" cy="300" rx="140" ry="25" fill="rgba(0, 0, 0, 0.25)" />

          {/* Opened Box Lid (Background) */}
          <path d="M 90,130 L 90,40 L 310,40 L 310,130 Z" fill="url(#woodGrad)" stroke="#1a0c06" strokeWidth="2" />
          {/* Lid Inner Wood Trim */}
          <path d="M 105,115 L 105,52 L 295,52 L 295,115 Z" fill="#2d170b" />
          {/* Lid Brass Hinges */}
          <rect x="130" y="122" width="16" height="12" fill="#d4af37" rx="1" />
          <rect x="254" y="122" width="16" height="12" fill="#d4af37" rx="1" />

          {/* Box Bottom Base (Main Outer Chassis) */}
          <path d="M 80,130 L 320,130 L 330,280 L 70,280 Z" fill="url(#woodGrad)" stroke="#1a0c06" strokeWidth="3" />
          {/* Corner Protectors (Metal accents) */}
          <path d="M 80,130 L 95,130 L 80,150 Z" fill="#d4af37" />
          <path d="M 320,130 L 305,130 L 320,150 Z" fill="#d4af37" />
          <path d="M 70,280 L 90,280 L 72,250 Z" fill="#d4af37" />
          <path d="M 330,280 L 310,280 L 328,250 Z" fill="#d4af37" />

          {/* Felt Compartment (Inside Open Cavity) */}
          <path d="M 100,145 L 300,145 L 312,265 L 88,265 Z" fill="url(#feltShade)" stroke="#222" strokeWidth="1.5" />
          {/* Inner Dividers Grid */}
          <line x1="200" y1="145" x2="200" y2="265" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="94" y1="205" x2="306" y2="205" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />

          {/* Brass Monogram Plaque on the Front Chassis */}
          <path d="M 150,225 L 250,225 L 252,255 L 148,255 Z" fill="url(#plaqueGrad)" stroke="#8b6508" strokeWidth="1" />
          {/* Tiny plaque screws */}
          <circle cx="153" cy="240" r="1.5" fill="#444" />
          <circle cx="247" cy="240" r="1.5" fill="#444" />

          {/* Live Monogram Text Display */}
          <text
            x="200"
            y="246"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="15"
            fontWeight="bold"
            letterSpacing="3"
            fill="#3a2307"
            className="select-none"
          >
            {monogramText || "R.S."}
          </text>
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Jewellery Box</p>
            <p className="mt-0.5">
              Visualizing <strong>{velvetName}</strong> velvet partition inserts. 
              Monogram engraving plate reflects: <strong className="font-mono bg-white px-1 py-0.5 rounded border border-sandstone-light/20 text-coral-accent">{monogramText || "None"}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // PRODUCT ID 1: Handwoven Jute Basket Customizer
  // ----------------------------------------------------
  const renderJuteBasket = () => {
    const liningOption = selections["Lining Fabric Selection"];
    const liningName = liningOption?.name || "Organic Khadi Cotton";
    
    // Choose fill color and pattern overlays for lining
    let liningColor = "#f5ebe0"; // Khadi beige
    let hasPrint = false;
    let printColor = "#3d2314";

    if (liningName.includes("Indigo")) {
      liningColor = "#1e2e4a"; // Indigo blue
      hasPrint = true;
      printColor = "#ffffff";
    } else if (liningName.includes("Saffron")) {
      liningColor = "#d66c33"; // Saffron orange
      hasPrint = true;
      printColor = "#e6ca7b";
    }

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            {/* Basket Weave Pattern */}
            <pattern id="weave" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#dfbe9b" />
              <path d="M 0,10 L 20,10 M 10,0 L 10,20" stroke="#b28d65" strokeWidth="2" />
              <path d="M 0,0 L 20,20 M 20,0 L 0,20" stroke="#a27c54" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Shadows */}
          <ellipse cx="200" cy="290" rx="120" ry="20" fill="rgba(0, 0, 0, 0.2)" />

          {/* Leather Handle Straps (Behind) */}
          <path d="M 120,130 C 110,60 150,60 140,130" fill="none" stroke="#7a421b" strokeWidth="12" strokeLinecap="round" />
          <path d="M 280,130 C 290,60 250,60 260,130" fill="none" stroke="#7a421b" strokeWidth="12" strokeLinecap="round" />
          {/* Handle Brass studs */}
          <circle cx="130" cy="122" r="4" fill="#ffd700" />
          <circle cx="270" cy="122" r="4" fill="#ffd700" />

          {/* Basket Body (Back layer) */}
          <path d="M 110,130 L 290,130 L 270,280 L 130,280 Z" fill="url(#weave)" stroke="#8e6a45" strokeWidth="2" />

          {/* Draped Textile Lining (Front overhang overlay) */}
          <path d="M 100,130 C 120,150 160,150 180,130 C 200,150 240,150 260,130 C 280,150 295,140 300,130 C 300,120 100,120 100,130 Z" 
            fill={liningColor} 
            stroke="#b39d82" 
            strokeWidth="1" 
          />

          {/* Prints overlay inside fabric lining */}
          {hasPrint && (
            <g fill={printColor} opacity="0.65">
              {/* Simple flower print dots */}
              <circle cx="120" cy="138" r="2" />
              <circle cx="125" cy="135" r="1.5" />
              <circle cx="115" cy="136" r="1.5" />
              
              <circle cx="150" cy="140" r="2" />
              <circle cx="156" cy="136" r="1.5" />
              <circle cx="144" cy="137" r="1.5" />

              <circle cx="210" cy="139" r="2" />
              <circle cx="215" cy="136" r="1.5" />
              <circle cx="205" cy="137" r="1.5" />

              <circle cx="250" cy="140" r="2" />
              <circle cx="256" cy="136" r="1.5" />
              <circle cx="244" cy="137" r="1.5" />
            </g>
          )}

          {/* Basket Weave Highlights (Front details) */}
          <path d="M 110,130 Q 200,140 290,130" fill="none" stroke="#66492e" strokeWidth="2" strokeDasharray="3,3" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Craft Basket</p>
            <p className="mt-0.5">
              Visualizing the interior lined with <strong>{liningName}</strong> fabric. 
              The basket handles are reinforced with tanned bridle leather.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // PRODUCT ID 3: Carved Sheesham Coffee Table
  // ----------------------------------------------------
  const renderCoffeeTable = () => {
    // Options
    const polishOption = selections["Wood Polish Finish"] || selections["Polish Finish"];
    const polishName = polishOption?.name || "Natural Sheesham Honey";

    let woodColor = "#bd824d"; // Natural light honey
    let shadowColor = "#8f5729";

    if (polishName.includes("Walnut") || polishName.includes("Dark")) {
      woodColor = "#472c1c"; // Dark Walnut
      shadowColor = "#26150a";
    } else if (polishName.includes("Mahogany") || polishName.includes("Rosewood")) {
      woodColor = "#782c1e"; // Mahogany reddish
      shadowColor = "#4f160d";
    }

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          {/* Ground shadow */}
          <ellipse cx="200" cy="270" rx="150" ry="30" fill="rgba(0, 0, 0, 0.2)" />

          {/* Far Legs */}
          <path d="M 100,180 L 105,250 L 115,250 L 115,180 Z" fill={shadowColor} />
          <path d="M 285,180 L 285,250 L 295,250 L 300,180 Z" fill={shadowColor} />

          {/* Near Legs */}
          <path d="M 75,180 L 70,265 L 85,265 L 90,180 Z" fill={woodColor} stroke="#222" strokeWidth="0.5" />
          <path d="M 310,180 L 310,265 L 325,265 L 320,180 Z" fill={woodColor} stroke="#222" strokeWidth="0.5" />

          {/* Lower Carved Shelf structure */}
          <polygon points="105,230 290,230 280,240 115,240" fill={shadowColor} />

          {/* Table Top Rim / Edge */}
          <path d="M 50,165 L 350,165 L 340,185 L 60,185 Z" fill={shadowColor} stroke="#111" strokeWidth="0.5" />

          {/* Table Top surface */}
          <path d="M 60,135 L 340,135 L 350,165 L 50,165 Z" fill={woodColor} stroke="#222" strokeWidth="1" />

          {/* Wood Grain markings on surface */}
          <path d="M 80,145 C 130,150 270,140 320,145" fill="none" stroke={shadowColor} strokeWidth="1.5" opacity="0.4" />
          <path d="M 120,155 C 160,160 220,152 280,155" fill="none" stroke={shadowColor} strokeWidth="1" opacity="0.3" />

          {/* Carving details badge */}
          <rect x="180" y="169" width="40" height="12" fill="#ffd700" opacity="0.8" rx="2" />
          <line x1="185" y1="175" x2="215" y2="175" stroke="#333" strokeWidth="1" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Coffee Table</p>
            <p className="mt-0.5">
              Configured with premium <strong>{polishName}</strong> wood polish. 
              The grain layout highlights natural Sheesham growth patterns.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // PRODUCT ID 4: Kanchipuram Silk Loom Saree Customizer
  // ----------------------------------------------------
  const renderSilkSaree = () => {
    // Options
    const colorOption = selections["Base Body Color"] || selections["Color Swatch"];
    const colorName = colorOption?.name || "Kanjeevaram Crimson Red";
    const bodyColorHex = colorOption?.color || "#900c3f"; // default crimson

    const borderOption = selections["Zari Border Style"] || selections["Border Selection"];
    const borderName = borderOption?.name || "Classic Temple Zari";

    // Border highlights
    let borderColor = "#ffd700"; // gold zari
    if (borderName.includes("Silver")) {
      borderColor = "#d3d3d3"; // silver zari
    }

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            {/* Silk Sheen Gradient */}
            <linearGradient id="silkSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={bodyColorHex} />
              <stop offset="40%" stopColor={bodyColorHex} />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="100%" stopColor={bodyColorHex} />
            </linearGradient>
            {/* Zari Gold Pattern */}
            <pattern id="zariPattern" width="10" height="20" patternUnits="userSpaceOnUse">
              <rect width="10" height="20" fill={borderColor} />
              <path d="M 0,0 L 5,10 L 0,20 M 10,0 L 5,10 L 10,20" stroke="#b8860b" strokeWidth="1" strokeOpacity="0.5" />
            </pattern>
          </defs>

          {/* Shadows */}
          <ellipse cx="200" cy="290" rx="130" ry="15" fill="rgba(0, 0, 0, 0.15)" />

          {/* Saree folds illustration */}
          {/* Main Body block */}
          <path d="M 90,80 C 120,70 280,70 310,80 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#silkSheen)" stroke="#600" strokeWidth="0.5" />

          {/* Draped Pleats shadow dividers */}
          <path d="M 120,80 L 110,265" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 160,78 L 150,270" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 200,76 L 195,272" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 240,78 L 245,270" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 280,80 L 290,265" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />

          {/* Left Embroidered Border */}
          <path d="M 90,80 L 105,80 L 95,261 L 80,260 Z" fill="url(#zariPattern)" />

          {/* Right Embroidered Border */}
          <path d="M 310,80 L 295,80 L 305,261 L 320,260 Z" fill="url(#zariPattern)" />

          {/* Bottom Zari border header */}
          <path d="M 95,250 C 150,275 250,275 305,250 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#zariPattern)" />

          {/* Border Zari wave line accents */}
          <path d="M 105,80 Q 200,95 295,80" fill="none" stroke={borderColor} strokeWidth="2.5" />
          <path d="M 105,85 Q 200,100 295,85" fill="none" stroke={borderColor} strokeWidth="1" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Silk Loom Saree</p>
            <p className="mt-0.5">
              Rendered with <strong>{colorName}</strong> silk colors. 
              The saree border reflects the gold-wound <strong>{borderName}</strong> design.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // DEFAULT FALLBACK: Generics Co-Creation Plate
  // ----------------------------------------------------
  const renderFallback = () => {
    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <div className="w-full max-h-[350px] aspect-square bg-gradient-to-br from-[#737851]/10 to-[#C99A5B]/10 border border-sandstone-light/20 rounded-3xl p-6 flex flex-col justify-between text-left relative overflow-hidden shadow-inner">
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

  // Render appropriate visualizer matching product ID
  switch (productId) {
    case 6:
      return renderJewelleryBox();
    case 1:
      return renderJuteBasket();
    case 3:
      return renderCoffeeTable();
    case 4:
      return renderSilkSaree();
    default:
      return renderFallback();
  }
}

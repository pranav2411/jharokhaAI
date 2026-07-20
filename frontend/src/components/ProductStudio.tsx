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
  const titleLower = product.title.toLowerCase();

  // ----------------------------------------------------
  // PRODUCT: Ceramic Vase
  // ----------------------------------------------------
  const renderCeramicVase = () => {
    const glazeOption = selections["Accent Glaze Color"] || selections["Glaze Color"];
    const glazeColor = glazeOption?.color || "#002fa7"; // default Cobalt Blue
    const glazeName = glazeOption?.name || "Classic Cobalt Blue";

    const patternOption = selections["Vase Base Pattern"] || selections["Base Pattern"];
    const patternName = patternOption?.name || "Mughal Floral Vine (Classic)";

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <radialGradient id="glazeGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="40%" stopColor={glazeColor} />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="200" cy="300" rx="90" ry="18" fill="rgba(0, 0, 0, 0.2)" />

          {/* Vase Base */}
          <ellipse cx="200" cy="285" rx="55" ry="10" fill="#2b1a0d" stroke="#111" />

          {/* Vase Main Body */}
          <path d="M 140,240 Q 110,180 145,130 Q 155,115 155,100 L 245,100 Q 245,115 255,130 Q 290,180 260,240 C 240,285 160,285 140,240 Z" fill="url(#glazeGrad)" stroke="#111" strokeWidth="1.5" />
          
          {/* Vase Neck & Rim */}
          <path d="M 155,100 Q 200,105 245,100 L 250,75 Q 200,80 150,75 Z" fill={glazeColor} stroke="#111" strokeWidth="1.5" />
          <ellipse cx="200" cy="75" rx="50" ry="8" fill="#1a1a1a" />

          {/* Decorative handles */}
          <path d="M 138,140 C 100,150 110,210 135,220" fill="none" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 262,140 C 300,150 290,210 265,220" fill="none" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" />

          {/* Hand-painted Patterns Overlay */}
          {patternName.includes("Floral") && (
            <g stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round">
              <path d="M 200,260 Q 180,210 200,160 Q 220,130 200,110" />
              <path d="M 193,210 Q 165,190 180,180" />
              <path d="M 207,210 Q 235,190 220,180" />
              <circle cx="180" cy="180" r="3" fill="#fff" stroke="none" />
              <circle cx="220" cy="180" r="3" fill="#fff" stroke="none" />
            </g>
          )}

          {patternName.includes("Jaali") && (
            <g stroke="#ffd700" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round">
              <path d="M 150,150 L 250,230 M 150,170 L 230,235 M 170,140 L 250,210" />
              <path d="M 250,150 L 150,230 M 250,170 L 170,235 M 230,140 L 150,210" />
            </g>
          )}

          {patternName.includes("Peacock") && (
            <g opacity="0.9">
              <circle cx="200" cy="185" r="28" fill="url(#goldGrad)" stroke="#ffd700" strokeWidth="1" />
              <circle cx="200" cy="185" r="18" fill="#008080" />
              <circle cx="200" cy="185" r="8" fill="#000080" />
              <path d="M 200,157 L 200,150 M 200,213 L 200,220 M 172,185 L 165,185 M 228,185 L 235,185" stroke="#ffd700" strokeWidth="2" />
            </g>
          )}
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Ceramic Vase</p>
            <p className="mt-0.5">
              Hand-painted with <strong>{glazeName}</strong> glaze. 
              The surface illustrates the <strong>{patternName}</strong> design theme.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // PRODUCT: Rosewood Jewellery Box
  // ----------------------------------------------------
  const renderJewelleryBox = () => {
    const velvetOption = selections["Inner Lining Velvet"] || selections["Lining Velvet"];
    const velvetColor = velvetOption?.color || "#800020";
    const velvetName = velvetOption?.name || "Royal Crimson Red";

    const monogramText = (textInputs["Engraved Monogram Brass Plate"] || "").toUpperCase().slice(0, 4);

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
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

          <ellipse cx="200" cy="300" rx="140" ry="25" fill="rgba(0, 0, 0, 0.25)" />

          <path d="M 90,130 L 90,40 L 310,40 L 310,130 Z" fill="url(#woodGrad)" stroke="#1a0c06" strokeWidth="2" />
          <path d="M 105,115 L 105,52 L 295,52 L 295,115 Z" fill="#2d170b" />
          <rect x="130" y="122" width="16" height="12" fill="#d4af37" rx="1" />
          <rect x="254" y="122" width="16" height="12" fill="#d4af37" rx="1" />

          <path d="M 80,130 L 320,130 L 330,280 L 70,280 Z" fill="url(#woodGrad)" stroke="#1a0c06" strokeWidth="3" />
          <path d="M 80,130 L 95,130 L 80,150 Z" fill="#d4af37" />
          <path d="M 320,130 L 305,130 L 320,150 Z" fill="#d4af37" />
          <path d="M 70,280 L 90,280 L 72,250 Z" fill="#d4af37" />
          <path d="M 330,280 L 310,280 L 328,250 Z" fill="#d4af37" />

          <path d="M 100,145 L 300,145 L 312,265 L 88,265 Z" fill="url(#feltShade)" stroke="#222" strokeWidth="1.5" />
          <line x1="200" y1="145" x2="200" y2="265" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="94" y1="205" x2="306" y2="205" stroke="#111" strokeWidth="2" strokeOpacity="0.4" />

          <path d="M 150,225 L 250,225 L 252,255 L 148,255 Z" fill="url(#plaqueGrad)" stroke="#8b6508" strokeWidth="1" />
          <circle cx="153" cy="240" r="1.5" fill="#444" />
          <circle cx="247" cy="240" r="1.5" fill="#444" />

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

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
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
  // PRODUCT: Handwoven Basket
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // PRODUCT: Handspun Silk Saree / Dupatta / Textiles
  // ----------------------------------------------------
  const renderSilkSaree = () => {
    const colorOption = selections["Base Body Color"] || selections["Color Swatch"] || selections["Base Saree Color"];
    const colorName = colorOption?.name || "Kanjeevaram Crimson Red";
    const bodyColorHex = colorOption?.color || "#900c3f";

    const borderOption = selections["Zari Border Style"] || selections["Border Selection"] || selections["Zari Thread Combination"];
    const borderName = borderOption?.name || "Classic Temple Zari";

    let borderColor = "#ffd700";
    if (borderName.includes("Silver") || borderName.includes("Rupa")) {
      borderColor = "#d3d3d3";
    }

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <defs>
            <linearGradient id="silkSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={bodyColorHex} />
              <stop offset="40%" stopColor={bodyColorHex} />
              <stop offset="70%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="100%" stopColor={bodyColorHex} />
            </linearGradient>
            <pattern id="zariPattern" width="10" height="20" patternUnits="userSpaceOnUse">
              <rect width="10" height="20" fill={borderColor} />
              <path d="M 0,0 L 5,10 L 0,20 M 10,0 L 5,10 L 10,20" stroke="#b8860b" strokeWidth="1" strokeOpacity="0.5" />
            </pattern>
          </defs>

          <ellipse cx="200" cy="290" rx="130" ry="15" fill="rgba(0, 0, 0, 0.15)" />

          <path d="M 90,80 C 120,70 280,70 310,80 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#silkSheen)" stroke="#600" strokeWidth="0.5" />

          <path d="M 120,80 L 110,265" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 160,78 L 150,270" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 200,76 L 195,272" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 240,78 L 245,270" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
          <path d="M 280,80 L 290,265" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />

          <path d="M 90,80 L 105,80 L 95,261 L 80,260 Z" fill="url(#zariPattern)" />
          <path d="M 310,80 L 295,80 L 305,261 L 320,260 Z" fill="url(#zariPattern)" />
          <path d="M 95,250 C 150,275 250,275 305,250 L 320,260 C 270,280 130,280 80,260 Z" fill="url(#zariPattern)" />

          <path d="M 105,80 Q 200,95 295,80" fill="none" stroke={borderColor} strokeWidth="2.5" />
          <path d="M 105,85 Q 200,100 295,85" fill="none" stroke={borderColor} strokeWidth="1" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
          <Sparkles className="w-4 h-4 text-coral-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Preview: Banarasi Loom Silk</p>
            <p className="mt-0.5">
              Rendered with <strong>{colorName}</strong> base silk colors. 
              The border weave reflects the custom <strong>{borderName}</strong> thread choice.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // PRODUCT: Coffee Table / Wood Furniture
  // ----------------------------------------------------
  const renderCoffeeTable = () => {
    const polishOption = selections["Wood Polish Finish"] || selections["Polish Finish"] || selections["Wood Finish"];
    const polishName = polishOption?.name || "Natural Sheesham Honey";

    let woodColor = "#bd824d";
    let shadowColor = "#8f5729";

    if (polishName.includes("Walnut") || polishName.includes("Dark")) {
      woodColor = "#472c1c";
      shadowColor = "#26150a";
    } else if (polishName.includes("Mahogany") || polishName.includes("Rosewood")) {
      woodColor = "#782c1e";
      shadowColor = "#4f160d";
    }

    return (
      <div className="space-y-4 w-full flex flex-col items-center">
        <svg viewBox="0 0 400 350" className="w-full max-h-[350px] drop-shadow-2xl">
          <ellipse cx="200" cy="270" rx="150" ry="30" fill="rgba(0, 0, 0, 0.2)" />

          <path d="M 100,180 L 105,250 L 115,250 L 115,180 Z" fill={shadowColor} />
          <path d="M 285,180 L 285,250 L 295,250 L 300,180 Z" fill={shadowColor} />

          <path d="M 75,180 L 70,265 L 85,265 L 90,180 Z" fill={woodColor} stroke="#222" strokeWidth="0.5" />
          <path d="M 310,180 L 310,265 L 325,265 L 320,180 Z" fill={woodColor} stroke="#222" strokeWidth="0.5" />

          <polygon points="105,230 290,230 280,240 115,240" fill={shadowColor} />
          <path d="M 50,165 L 350,165 L 340,185 L 60,185 Z" fill={shadowColor} stroke="#111" strokeWidth="0.5" />
          <path d="M 60,135 L 340,135 L 350,165 L 50,165 Z" fill={woodColor} stroke="#222" strokeWidth="1" />

          <path d="M 80,145 C 130,150 270,140 320,145" fill="none" stroke={shadowColor} strokeWidth="1.5" opacity="0.4" />
          <path d="M 120,155 C 160,160 220,152 280,155" fill="none" stroke={shadowColor} strokeWidth="1" opacity="0.3" />

          <rect x="180" y="169" width="40" height="12" fill="#ffd700" opacity="0.8" rx="2" />
          <line x1="185" y1="175" x2="215" y2="175" stroke="#333" strokeWidth="1" />
        </svg>

        <div className="bg-cream-dark/30 rounded-xl p-3 border border-sandstone-light/10 text-[10px] text-foreground/80 max-w-sm flex items-start gap-2 text-left w-full">
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
  // DEFAULT FALLBACK: Generics Co-Creation Plate
  // ----------------------------------------------------
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

  const renderContent = () => {
    if (titleLower.includes("box") || titleLower.includes("jeweller")) {
      return renderJewelleryBox();
    }
    if (titleLower.includes("basket") || titleLower.includes("bamboo") || titleLower.includes("jute")) {
      return renderJuteBasket();
    }
    if (titleLower.includes("vase") || titleLower.includes("urn") || titleLower.includes("ceramic") || titleLower.includes("pottery")) {
      return renderCeramicVase();
    }
    if (titleLower.includes("saree") || titleLower.includes("dupatta") || titleLower.includes("silk") || titleLower.includes("textile")) {
      return renderSilkSaree();
    }
    if (titleLower.includes("table") || titleLower.includes("desk") || titleLower.includes("furniture")) {
      return renderCoffeeTable();
    }
    return renderFallback();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {renderContent()}
      
      {/* Disclaimer warning */}
      <p className="text-[9px] text-foreground/45 italic text-center max-w-xs mt-3 leading-relaxed border-t border-sandstone-light/10 pt-2.5 w-full">
        *Disclaimer: Handcrafted items are individually made. The final product may differ slightly from the digital SVG mockup and photos uploaded.
      </p>
    </div>
  );
}

import React from "react";
import { Award, HeartHandshake, ShieldCheck, Zap } from "lucide-react";

export const TrustBar: React.FC = () => {
  const items = [
    {
      icon: <Award className="w-8 h-8 text-coral-accent" />,
      title: "Authentic Heritage",
      description: "100% genuine GI-tagged or state-council certified Indian craft.",
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-coral-accent" />,
      title: "Direct Support",
      description: "Direct revenue sharing with local artisans and rural co-ops.",
    },
    {
      icon: <Zap className="w-8 h-8 text-coral-accent" />,
      title: "Custom Built",
      description: "Co-create with artisans by tailoring sizes, colors, and monograms.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-coral-accent" />,
      title: "Secure Checkouts",
      description: "UPI-first and encrypted transactions backed by Razorpay.",
    },
  ];

  return (
    <div className="bg-cream-dark/40 border-y border-sandstone-light/10 py-10 my-16 bg-jaali">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 bg-cream-light/65 rounded-2xl border border-sandstone-light/15 hover:border-sandstone-light/35 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-3 bg-cream-light border border-sandstone-light/20 rounded-full shadow-inner mb-4">
                {item.icon}
              </div>
              <h4 className="font-archivo text-sm uppercase font-bold text-foreground tracking-wider mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-foreground/75 max-w-[220px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

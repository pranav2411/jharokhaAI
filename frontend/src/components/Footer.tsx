import React from "react";
import Link from "next/link";
import { Landmark, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#43472E] text-[#F3E9DA] border-t-4 border-sandstone-dark bg-jaali-dark py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Info Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-10 flex items-center justify-center border border-[#FAF6F0] rounded-t-full bg-white/10">
              <Landmark className="w-4 h-4 text-[#FAF6F0]" />
            </div>
            <div>
              <span className="font-archivo text-lg font-black uppercase tracking-wider text-[#FAF6F0] block leading-none">
                Jharokha
              </span>
              <span className="text-[8px] uppercase tracking-widest text-[#FAF6F0]/80 font-semibold block mt-0.5">
                Heritage Marketplace
              </span>
            </div>
          </Link>
          <p className="text-xs text-[#FAF6F0]/70 leading-relaxed">
            Preserving India&apos;s rich cultural legacy by bringing handcrafted, custom-made creations directly from village kilns, looms, and workshops to your home.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-archivo text-sm uppercase tracking-wider text-sandstone-light mb-4 font-bold">
            Explore
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog" className="hover:text-coral-accent transition-colors">Heritage Textiles</Link>
            </li>
            <li>
              <Link href="/catalog?category=pottery" className="hover:text-coral-accent transition-colors">Khurja Pottery</Link>
            </li>
            <li>
              <Link href="/catalog?category=woodwork" className="hover:text-coral-accent transition-colors">Bamboo & Woodwork</Link>
            </li>
            <li>
              <Link href="/catalog?category=metal" className="hover:text-coral-accent transition-colors">Metal Crafts</Link>
            </li>
          </ul>
        </div>

        {/* Story */}
        <div>
          <h4 className="font-archivo text-sm uppercase tracking-wider text-sandstone-light mb-4 font-bold">
            Our Mission
          </h4>
          <p className="text-xs text-[#FAF6F0]/70 leading-relaxed">
            By enabling product customization, we create a deeper connection between buyer and maker. Every purchase directly empowers local artisan communities and supports family craft lines.
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-archivo text-sm uppercase tracking-wider text-sandstone-light mb-4 font-bold">
            Contact
          </h4>
          <ul className="space-y-2.5 text-xs text-[#FAF6F0]/80">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sandstone-light" />
              <span>support@jharokha.in</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sandstone-light" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sandstone-light" />
              <span>Jaipur Heritage Block, Rajasthan, India</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-cream-light/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#FAF6F0]/65">
        <p>© 2026 Jharokha Artisan Marketplace. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Made in partnership with Indian Heritage Councils
          <ExternalLink className="w-3 h-3" />
        </p>
      </div>
    </footer>
  );
};

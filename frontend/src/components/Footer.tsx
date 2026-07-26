"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Landmark, Mail, Phone, MapPin, ExternalLink, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="bg-[#43472E] text-[#F3E9DA] border-t-4 border-sandstone-dark bg-jaali-dark py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Info Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center border border-[#FAF6F0]/30 rounded-xl bg-white overflow-hidden p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jharokha_logo.jpg"
                alt="Jharokha Logo"
                className="w-full h-full object-contain"
              />
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
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <p>© 2026 Jharokha Artisan Marketplace. All rights reserved.</p>
          <div className="flex gap-3 mt-1.5 sm:mt-0">
            <button 
              onClick={() => setShowPrivacy(true)}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => setShowTerms(true)}
              className="hover:underline hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
        <p className="flex items-center gap-1 mt-3 sm:mt-0">
          Made in partnership with Indian Heritage Councils
          <ExternalLink className="w-3 h-3" />
        </p>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-sandstone-light/35 rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-8 text-left text-sandstone-dark">
            <div className="flex justify-between items-center border-b border-sandstone-light/30 pb-4 mb-6">
              <div className="flex items-center gap-2 text-olive-dark">
                <Shield className="w-5 h-5" />
                <h3 className="font-archivo text-lg font-black uppercase text-sandstone-dark">Privacy Policy</h3>
              </div>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="text-sandstone-light hover:text-sandstone-dark text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="text-xs space-y-4 leading-relaxed">
              <p className="font-bold text-sm">How we handle and store your user information:</p>
              <p>
                <strong>1. Data Collection:</strong> We collect your name, email, phone number, and password hashes for core functionality (registering and logging in).
              </p>
              <p>
                <strong>2. Database Storage:</strong> Your passwords are never stored in clear text. They are hashed using a secure one-way encryption method.
              </p>
              <p>
                <strong>3. Usage Limits:</strong> Personal info is used strictly for fulfilling orders, managing customizations, tracking active shopping carts, and verifying user roles (buyer vs. artisan vs. admin).
              </p>
              <p>
                <strong>4. Protection:</strong> We do not share your private account database details with any third parties or external advertising networks.
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-sandstone-light/30 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="bg-[#43472E] text-white hover:bg-olive-dark font-bold px-6 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-sandstone-light/35 rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-8 text-left text-sandstone-dark">
            <div className="flex justify-between items-center border-b border-sandstone-light/30 pb-4 mb-6">
              <div className="flex items-center gap-2 text-olive-dark">
                <Shield className="w-5 h-5" />
                <h3 className="font-archivo text-lg font-black uppercase text-sandstone-dark">Terms & Conditions</h3>
              </div>
              <button 
                onClick={() => setShowTerms(false)}
                className="text-sandstone-light hover:text-sandstone-dark text-lg font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="text-xs space-y-4 leading-relaxed">
              <p className="font-bold text-sm">Terms of Platform Use:</p>
              <p>
                <strong>1. General Conditions:</strong> By creating an account on Jharokha, you authorize the platform to save and maintain your shopping history and design customization specifications.
              </p>
              <p>
                <strong>2. User Accounts:</strong> You are responsible for protecting your secure credentials. Creating fake profiles or impersonating other artisans or administrators is strictly prohibited.
              </p>
              <p>
                <strong>3. Customizations:</strong> Customization parameters entered on product pages are sent directly to the local artisan. Users are expected to fulfill payments for custom items.
              </p>
              <p>
                <strong>4. Policy Consent:</strong> Consenting to the terms means you acknowledge the storage of basic tracking cookies to verify your login session and secure your user session ID.
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-sandstone-light/30 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-[#43472E] text-white hover:bg-olive-dark font-bold px-6 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};


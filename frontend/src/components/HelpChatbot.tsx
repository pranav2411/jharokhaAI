"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, X, Send, PhoneCall, Check, ArrowRight } from "lucide-react";

interface Message {
  sender: "bot" | "user";
  text: string;
  isCallbackForm?: boolean;
}

export default function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Namaste! Welcome to Jharokha Support. How may we assist your co-creation journey today?"
    }
  ]);
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || "");
  const [customMsg, setCustomMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const simulateBotReply = (replyText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
      setIsTyping(false);
    }, 800);
  };

  const handleMenuOption = (option: string) => {
    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: option }]);

    if (option === "Track My Order Status") {
      simulateBotReply("You can track all active weaving/glazing stages under the 'My Orders' portal in the navbar. We update statuses in real-time as artisans complete crafting!");
    } else if (option === "Customization Guidelines") {
      simulateBotReply("Every customizable product allows choosing linings, handle types, size variants, or text monograms. Simply configure options directly on the product's details page before adding it to the cart!");
    } else if (option === "Shipping & Delivery Times") {
      simulateBotReply("Since Jharokha products are handmade by remote artisans, standard shipping takes 5-7 business days. Custom orders can take up to 10-14 days depending on weaving and glaze curing cycles.");
    } else if (option === "Request Executive Call Back") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "We will arrange for a support executive to call you back. Please confirm or enter your callback phone number below:",
          isCallbackForm: true
        }
      ]);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser ? currentUser.id : null,
          user_name: currentUser ? currentUser.name : "Guest Visitor",
          phone: phoneInput.trim()
        })
      });

      if (res.ok) {
        setCallbackSubmitted(true);
        simulateBotReply("Thank you! A callback request has been logged. An executive will dial +91 " + phoneInput + " shortly.");
      } else {
        simulateBotReply("Apologies, we could not log your callback request. Please try again or check back later.");
      }
    } catch (err) {
      // Offline fallback
      setCallbackSubmitted(true);
      simulateBotReply("Callback request queued! Our executive will call you back shortly at " + phoneInput + ".");
    }
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: customMsg }]);
    const query = customMsg.toLowerCase();
    setCustomMsg("");

    if (query.includes("order") || query.includes("track")) {
      simulateBotReply("To view your order archives, click 'My Orders' in the navigation bar. You must be signed in to see your orders.");
    } else if (query.includes("admin") || query.includes("seller")) {
      simulateBotReply("If you are an admin or artisan, you can manage items, checkouts, and requests inside the restricted portals.");
    } else if (query.includes("hello") || query.includes("hi")) {
      simulateBotReply("Hello! Choose one of the options in our menu or ask about shipping, customization, and executive call requests.");
    } else {
      simulateBotReply("I've logged your query. If you'd like direct support, please select 'Request Executive Call Back' from our menu for assistance.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-coral-accent hover:bg-coral-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          aria-label="Launch Help Chatbot"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-md border border-sandstone-light/30 w-80 sm:w-96 h-[480px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left text-foreground">
          {/* Header */}
          <div className="bg-[#737851] text-white p-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#C99A5B] p-1.5 rounded-lg">
                <PhoneCall className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-archivo text-xs uppercase font-black tracking-widest">Jharokha Helpdesk</h4>
                <span className="text-[9px] uppercase tracking-wider text-cream-light/80 font-bold block mt-0.5">Online Support Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-cream-light/20 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <div
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#43472E] text-white rounded-tr-none"
                        : "bg-white border border-sandstone-light/20 text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Callback Form Rendering */}
                {msg.isCallbackForm && !callbackSubmitted && (
                  <form onSubmit={handlePhoneSubmit} className="mt-2 ml-4 flex gap-2 max-w-[80%]">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9999988888"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="bg-white border border-sandstone-light/45 rounded-xl px-3 py-1.5 text-xs flex-grow focus:outline-none focus:border-coral-accent"
                    />
                    <button
                      type="submit"
                      className="bg-coral-accent hover:bg-coral-dark text-white p-2 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-sandstone-light/20 rounded-2xl rounded-tl-none p-3 text-xs text-foreground/50 tracking-wider flex gap-1 items-center select-none shadow-sm">
                  <span className="w-1.5 h-1.5 bg-foreground/45 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-foreground/45 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-foreground/45 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Menu Options (Fixed buttons) */}
          <div className="p-3 bg-cream-light/35 border-t border-sandstone-light/20 flex flex-wrap gap-1.5 shrink-0">
            {["Track My Order Status", "Customization Guidelines", "Shipping & Delivery Times", "Request Executive Call Back"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleMenuOption(opt)}
                className="text-[9px] font-archivo font-extrabold uppercase tracking-wider bg-white hover:bg-cream-light border border-sandstone-light/35 text-[#43472E] px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Custom chat input */}
          <form
            onSubmit={handleCustomSend}
            className="p-3 border-t border-sandstone-light/20 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask anything else..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="flex-grow bg-cream-light/40 border border-sandstone-light/35 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#737851] text-foreground font-medium"
            />
            <button
              type="submit"
              className="bg-[#737851] hover:bg-olive-dark text-white p-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

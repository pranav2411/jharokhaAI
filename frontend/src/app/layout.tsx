import type { Metadata } from "next";
import { Archivo, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import HelpChatbot from "@/components/HelpChatbot";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jharokha | Handcrafted Heritage & Custom Artisan Creations",
  description: "Discover unique, customizable crafts directly from local Indian artisans. Built on heritage, powered by customization. Explore handwoven baskets, pottery, and silk looms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-light text-foreground">
        <AuthProvider>
          <CartProvider>
            {children}
            <HelpChatbot />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


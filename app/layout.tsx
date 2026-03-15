import { Inter, DM_Serif_Display, Hind_Siliguri } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import BengaliFontDetector from "@/components/shared/BengaliFontDetector";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${dmSerif.variable} ${hindSiliguri.variable} font-sans`}
        >
          <BengaliFontDetector />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
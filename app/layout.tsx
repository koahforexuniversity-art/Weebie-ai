import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ForgeAgent v4 — Autonomous Multi-Modal AI Web Platform",
  description:
    "Forge complete production-grade web apps from text, voice, image, and video. Real-time human + AI collaboration, autonomous self-deployment.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ForgeAgent v4",
    description: "Sci-fi level autonomous AI web development platform.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: "#05060a",
          colorText: "#e5e7eb",
          colorInputBackground: "#0b0d14",
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-[#05060a] text-slate-100 selection:bg-fuchsia-500/30 selection:text-white">
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

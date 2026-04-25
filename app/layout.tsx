import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FireTrace Pro — Fire Investigation Platform",
  description: "NFPA 921 compliant fire investigation management for firefighters, investigators, and insurance professionals.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  applicationName: "FireTrace Pro",
  keywords: ["fire investigation", "NFPA 921", "NFPA 1033", "fire origin", "fire cause", "arson investigation"],
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

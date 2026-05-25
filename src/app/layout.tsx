import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "La TWALE — Tournoi & Village Santé",
    template: "%s · La TWALE",
  },
  description:
    "Tournoi sportif et forum santé de l'association La TWALE — 14 juin 2026. Scores en direct, planning, village santé et plus.",
  applicationName: "La TWALE",
  openGraph: {
    title: "La TWALE — Tournoi & Village Santé",
    description: "14 juin 2026 · Foot, volley, athlétisme et village santé.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5B2A8C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        {children}
      </body>
    </html>
  );
}

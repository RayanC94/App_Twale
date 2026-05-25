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
    default: "Tournoi OMAS — Sport, Santé, Prévention",
    template: "%s · OMAS",
  },
  description:
    "Tournoi multisports de l'OMAS (Organisation Musulmane des Acteurs de Santé) — dimanche 14 juin 2026, Stade Jean Bouin (Choisy). Foot, volley, athlétisme et village santé.",
  applicationName: "Tournoi OMAS",
  openGraph: {
    title: "Tournoi OMAS — Sport, Santé, Prévention",
    description: "Dimanche 14 juin 2026 · Stade Jean Bouin, Choisy · Foot, volley, athlétisme et village santé.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F9E94",
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

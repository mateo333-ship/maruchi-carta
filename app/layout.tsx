import type { Metadata, Viewport } from "next";
import Script from "next/script";
// Fuentes autoalojadas (no dependen de Google Fonts en el build)
import "@fontsource/bowlby-one/400.css";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maruchi · Carta · Castelldefels",
  description: "Café de especialidad, matcha, chai y tostadas en Castelldefels. Carta interactiva de Maruchi.",
  openGraph: {
    title: "Maruchi · Carta",
    description: "Café, matcha & tostadas en Castelldefels. Descubre la carta en 3D.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a1a12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body data-season="summer">
        {children}
        {/* Chatbot "Maru" (widget en /public/maruchi-chat.js, responde vía /api/chat) */}
        <Script src="/maruchi-chat.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

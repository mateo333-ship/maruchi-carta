"use client";

import { motion } from "motion/react";
import { SITE } from "@/data/site";

/* Iconos genéricos (sin logotipos de marca) */
export const IconCamera = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5.5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconCard = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <circle cx="7.5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="12" r="1.6" />
  </svg>
);
export const IconStar = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />
  </svg>
);

const LINKS = [
  {
    key: "instagram",
    href: SITE.instagram,
    icon: <IconCamera size={26} />,
    eyebrow: "Instagram",
    title: "Síguenos",
    text: "Novedades, la carta de temporada y lo que sale del horno cada día.",
    cta: SITE.instagramHandle,
    bg: "bg-[#2a1a12] text-[#f5ede0]",
    chip: "bg-[#f5ede0]/12",
  },
  {
    key: "loyalty",
    href: SITE.loyaltyUrl,
    icon: <IconCard size={26} />,
    eyebrow: "Tarjeta de fidelidad",
    title: "Suma sellos",
    text: "Tu tarjeta digital en el móvil: acumula sellos con cada visita y consigue premios.",
    cta: "Abrir mi tarjeta",
    bg: "bg-[var(--accent)] text-white",
    chip: "bg-white/15",
  },
  {
    key: "review",
    href: SITE.reviewUrl,
    icon: <IconStar size={26} />,
    eyebrow: "Google",
    title: "Déjanos tu reseña",
    text: "¿Te ha gustado? Cuéntalo en Google: nos ayuda muchísimo a seguir creciendo.",
    cta: "Escribir reseña",
    bg: "bg-[#efe3d0] text-[#2a1a12]",
    chip: "bg-[#2a1a12]/8",
  },
];

/** Sección "Quédate con nosotros": Instagram, tarjeta de fidelidad y reseñas */
export function ConnectSection() {
  return (
    <section aria-labelledby="connect-title" className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-5 sm:pb-24 md:px-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#2a1a12]/12 pb-4 sm:mb-8 sm:pb-6">
        <h2 id="connect-title" className="font-display text-[clamp(30px,9vw,92px)] uppercase leading-[0.88] tracking-[-0.02em] sm:text-[clamp(44px,7vw,92px)]">
          Quédate cerca
        </h2>
        <p className="max-w-[320px] font-serif text-[15.5px] italic leading-snug text-[#6d5645] sm:text-[19px] md:text-right">
          Síguenos, suma sellos y cuéntanos qué tal.
        </p>
      </div>
      <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
        {LINKS.map((l, i) => (
          <motion.a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 24 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative flex items-center gap-4 overflow-hidden rounded-[22px] p-4 shadow-[0_18px_36px_-26px_rgba(42,26,18,.6)] sm:rounded-[28px] md:flex-col md:items-start md:gap-6 md:p-7 ${l.bg}`}
          >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl md:h-16 md:w-16 ${l.chip}`}>{l.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.2em] opacity-70">{l.eyebrow}</span>
              <span className="mt-0.5 block font-display text-[20px] uppercase leading-none md:mt-2 md:text-[30px]">{l.title}</span>
              <span className="mt-2 hidden text-[14px] leading-snug opacity-80 md:block">{l.text}</span>
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold md:mt-5">
                {l.cta}
                <svg className="transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

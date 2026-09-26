"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Product } from "@/data/menu";
import { formatPrice } from "@/data/menu";
import { ProductGlyph } from "./ProductGlyph";

/**
 * Producto de la carta.
 * · Móvil (< 640px): fila compacta tipo carta (miniatura + nombre + precio) → se ven muchos más productos por pantalla.
 * · Tablet / escritorio: tarjeta con ilustración grande e inclinación 3D al pasar el ratón.
 */
export function ProductCard({ product, onOpen, index }: { product: Product; onOpen: () => void; index: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-11, 11]), { stiffness: 220, damping: 20 });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.55), transparent 55%)`);

  const seasonal = product.season !== "all";
  const favorite = product.tags?.includes("Favorito");

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: Math.min(index * 0.025, 0.2) }}
      style={{ perspective: 900 }}
      className="list-none"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return; // en táctil sin inclinación
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileTap={{ scale: 0.98 }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative flex h-full w-full flex-row items-center gap-3 overflow-hidden rounded-[18px] border border-[#e6d6bf] bg-[#fbf6ee] p-2.5 pr-4 text-left shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_14px_28px_-24px_rgba(42,26,18,.5)] outline-none transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-[26px] sm:p-5 sm:shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_22px_40px_-28px_rgba(42,26,18,.45)] sm:hover:shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_34px_60px_-30px_rgba(42,26,18,.55)]"
        aria-label={`${product.name}, ${formatPrice(product.price)}. Ver detalle`}
      >
        {/* ilustración */}
        <div
          className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] sm:mb-4 sm:aspect-[5/4] sm:h-auto sm:w-full sm:rounded-[18px]"
          style={{ transform: "translateZ(30px)", background: "radial-gradient(120% 90% at 50% 100%, #efe0c8 0%, #f6ecdd 55%, #fbf6ee 100%)" }}
        >
          <span className="pointer-events-none absolute inset-x-6 bottom-3 hidden h-3 rounded-full bg-[#2a1a12]/10 blur-md transition-all duration-500 group-hover:inset-x-10 group-hover:bg-[#2a1a12]/15 sm:block" />
          <ProductGlyph
            visual={product.visual}
            className="relative h-[92%] w-[92%] drop-shadow-[0_6px_8px_rgba(42,26,18,.16)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] sm:drop-shadow-[0_10px_12px_rgba(42,26,18,.18)] sm:group-hover:-translate-y-2 sm:group-hover:scale-[1.06] sm:group-hover:-rotate-3"
          />
          {seasonal && (
            <span className="absolute left-3 top-3 hidden rounded-full bg-[#2a1a12] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0] sm:block">
              {product.season === "summer" ? "☀ Verano" : "❄ Invierno"}
            </span>
          )}
          {favorite && (
            <span className="absolute right-3 top-3 hidden rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:block">
              Favorito
            </span>
          )}
          <span className="absolute bottom-3 right-3 hidden h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[#2a1a12] text-[#f5ede0] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </div>

        {/* texto */}
        <div style={{ transform: "translateZ(18px)" }} className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-3 sm:items-end sm:justify-start sm:gap-2">
            <h3 className="min-w-0 font-display text-[15px] uppercase leading-[1.05] tracking-tight text-[#2a1a12] [overflow-wrap:anywhere] sm:text-[19px]">
              {product.name}
            </h3>
            <span className="dotted-leader hidden sm:block" aria-hidden />
            <span className="shrink-0 whitespace-nowrap font-display text-[15px] text-[var(--accent)] sm:text-[17px]">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-[#6d5645] sm:mt-2 sm:line-clamp-none sm:text-[13.5px]">{product.short}</p>
          {/* etiquetas compactas (solo móvil) */}
          {(seasonal || favorite) && (
            <div className="mt-1.5 flex gap-1.5 sm:hidden">
              {seasonal && (
                <span className="rounded-full bg-[#2a1a12] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#f5ede0]">
                  {product.season === "summer" ? "☀ Verano" : "❄ Invierno"}
                </span>
              )}
              {favorite && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white">Favorito</span>
              )}
            </div>
          )}
        </div>

        {/* flecha (solo móvil) */}
        <svg className="shrink-0 text-[#2a1a12]/35 sm:hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>

        <motion.span aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100 sm:block" style={{ background: glare }} />
      </motion.button>
    </motion.li>
  );
}

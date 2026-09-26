"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Product } from "@/data/menu";
import { formatPrice } from "@/data/menu";
import { ProductGlyph } from "./ProductGlyph";

export function ProductCard({ product, onOpen, index }: { product: Product; onOpen: () => void; index: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-11, 11]), { stiffness: 220, damping: 20 });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.55), transparent 55%)`);

  const seasonal = product.season !== "all";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: Math.min(index * 0.035, 0.3) }}
      style={{ perspective: 900 }}
      className="list-none"
    >
      <motion.button
        type="button"
        onClick={onOpen}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileTap={{ scale: 0.97 }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-[#e6d6bf] bg-[#fbf6ee] p-3 sm:rounded-[26px] sm:p-5 text-left shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_22px_40px_-28px_rgba(42,26,18,.45)] outline-none transition-shadow duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_34px_60px_-30px_rgba(42,26,18,.55)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label={`${product.name}, ${formatPrice(product.price)}. Ver detalle`}
      >
        {/* fondo de la ilustración */}
        <div
          className="relative mb-4 flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[18px]"
          style={{ transform: "translateZ(30px)", background: "radial-gradient(120% 90% at 50% 100%, #efe0c8 0%, #f6ecdd 55%, #fbf6ee 100%)" }}
        >
          <span className="pointer-events-none absolute inset-x-6 bottom-3 h-3 rounded-full bg-[#2a1a12]/10 blur-md transition-all duration-500 group-hover:inset-x-10 group-hover:bg-[#2a1a12]/15" />
          <ProductGlyph
            visual={product.visual}
            className="relative h-[92%] w-[92%] drop-shadow-[0_10px_12px_rgba(42,26,18,.18)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 group-hover:scale-[1.06] group-hover:-rotate-3"
          />
          {seasonal && (
            <span className="absolute left-3 top-3 rounded-full bg-[#2a1a12] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0]">
              {product.season === "summer" ? "☀ Verano" : "☾ Invierno"}
            </span>
          )}
          {product.tags?.includes("Favorito") && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Favorito
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-[#2a1a12] text-[#f5ede0] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </div>

        <div style={{ transform: "translateZ(18px)" }} className="flex flex-1 flex-col">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-2">
            <h3 className="font-display text-[15px] uppercase leading-[1.05] tracking-tight text-[#2a1a12] [overflow-wrap:anywhere] sm:text-[19px]">{product.name}</h3>
            <span className="dotted-leader hidden sm:block" aria-hidden />
            <span className="whitespace-nowrap font-display text-[15px] text-[var(--accent)] sm:text-[17px]">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-2 text-[12.5px] leading-snug text-[#6d5645] sm:text-[13.5px]">{product.short}</p>
        </div>

        <motion.span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
      </motion.button>
    </motion.li>
  );
}

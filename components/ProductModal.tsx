"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/data/menu";
import { formatPrice } from "@/data/menu";

const ProductScene = dynamic(() => import("./scene/ProductScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#2a1a12]/15 border-t-[#2a1a12]/70" />
    </div>
  ),
});

type Props = {
  product: (Product & { categoryLabel: string }) | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export function ProductModal({ product, onClose, onPrev, onNext }: Props) {
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-title"
        >
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-[#1b100b]/55 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            key={product.id}
            initial={{ y: 60, opacity: 0, rotateX: 12, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 190, damping: 24 }}
            style={{ transformPerspective: 1200 }}
            className="relative grid max-h-[94dvh] w-full max-w-[1100px] grid-rows-[minmax(300px,46dvh)_1fr] overflow-hidden rounded-t-[30px] bg-[#fbf6ee] shadow-[0_40px_120px_-30px_rgba(0,0,0,.6)] md:grid-cols-[1.15fr_1fr] md:grid-rows-1 md:rounded-[34px]"
          >
            {/* ESCENA 3D */}
            <div className="relative min-h-[300px] overflow-hidden md:min-h-[600px]" style={{ background: "radial-gradient(90% 80% at 50% 70%, #f3e4cc 0%, #ead7ba 45%, #dcc3a0 100%)" }}>
              <span aria-hidden className="pointer-events-none absolute -left-6 top-4 select-none whitespace-nowrap font-display text-[120px] uppercase leading-none text-white/35 md:text-[170px]">
                {product.name.split(" ")[0]}
              </span>
              <div className="absolute inset-0">
                <ProductScene product={product} replay={replay} />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5a3522]/70">
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
                  Arrastra para girar
                </span>
                <button
                  type="button"
                  onClick={() => setReplay((r) => r + 1)}
                  className="pointer-events-auto rounded-full bg-[#2a1a12]/85 px-3.5 py-2 text-[#f5ede0] transition hover:bg-[#2a1a12]"
                >
                  ↻ Repetir
                </button>
              </div>
            </div>

            {/* INFO */}
            <div className="relative flex flex-col overflow-y-auto p-6 md:p-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{product.categoryLabel}</span>
                <div className="flex items-center gap-2">
                  {onPrev && (
                    <button type="button" onClick={onPrev} aria-label="Producto anterior" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2d2bb] text-[#5a3522] transition hover:bg-[#efe3d0]">
                      ←
                    </button>
                  )}
                  {onNext && (
                    <button type="button" onClick={onNext} aria-label="Producto siguiente" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2d2bb] text-[#5a3522] transition hover:bg-[#efe3d0]">
                      →
                    </button>
                  )}
                  <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a1a12] text-[#f5ede0] transition hover:rotate-90">
                    ✕
                  </button>
                </div>
              </div>

              <motion.h2
                id="product-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 font-display text-[42px] uppercase leading-[0.95] tracking-tight text-[#2a1a12] md:text-[56px]"
              >
                {product.name}
              </motion.h2>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-4 flex flex-wrap items-center gap-3">
                <span className="font-display text-3xl text-[var(--accent)]">{formatPrice(product.price)}</span>
                {product.season !== "all" && (
                  <span className="rounded-full bg-[#2a1a12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0]">
                    {product.season === "summer" ? "☀ Solo carta de verano" : "☾ Solo carta de invierno"}
                  </span>
                )}
                {product.tags?.map((t) => (
                  <span key={t} className="rounded-full border border-[#dcc9ae] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d5645]">
                    {t}
                  </span>
                ))}
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mt-6 font-serif text-[22px] italic leading-snug text-[#3d2519]">
                {product.description}
              </motion.p>

              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6f5c]">Ingredientes</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ing, i) => (
                      <motion.li
                        key={ing}
                        initial={{ opacity: 0, scale: 0.8, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
                        className="rounded-full bg-[#efe3d0] px-3.5 py-1.5 text-[13px] font-medium text-[#3d2519]"
                      >
                        {ing}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-10 text-[12px] leading-relaxed text-[#8a6f5c]">
                ¿Alergias o intolerancias? Pregunta en barra, te informamos de todos los alérgenos.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

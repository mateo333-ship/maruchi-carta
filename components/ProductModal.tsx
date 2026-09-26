"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { Product } from "@/data/menu";
import { formatPrice } from "@/data/menu";
import { ProductGlyph } from "./ProductGlyph";

const Spinner = () => (
  <div className="flex h-full w-full items-center justify-center">
    <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#2a1a12]/15 border-t-[#2a1a12]/70" />
  </div>
);

const ProductScene = dynamic(() => import("./scene/ProductScene"), { ssr: false, loading: Spinner });

export type ModalProduct = Product & { categoryId: string; categoryLabel: string };

type Props = {
  /** producto abierto (null = cerrado) */
  product: ModalProduct | null;
  /** lista visible de la carta, en orden: sirve para anterior / siguiente y para "Más en…" */
  list: ModalProduct[];
  onSelect: (id: string) => void;
  onClose: () => void;
};

/** Nombre gigante de fondo: se reparte en líneas y se ajusta para que nunca se corte */
function BackdropName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const words = name.toUpperCase().replace(/,/g, "").split(/\s+/).filter(Boolean);
  const maxLine = Math.max(...words.map((w) => w.length), 9);
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && last.length + 1 + w.length <= maxLine) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  const shown = lines.slice(0, 3);
  const longest = Math.max(...shown.map((l) => l.length), 6);
  const size = box.w ? Math.min(170, (box.w * 0.92) / (longest * 0.82), (box.h * 0.6) / shown.length / 0.86) : 0;
  return (
    <span
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-6 select-none px-[4%] font-display uppercase leading-[0.86] text-white/35 transition-opacity duration-300"
      style={{ fontSize: size, opacity: size ? 1 : 0 }}
    >
      {shown.map((l) => (
        <span key={l} className="block whitespace-nowrap">
          {l}
        </span>
      ))}
    </span>
  );
}

const Arrow = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
  </svg>
);

export function ProductModal({ product, list, onSelect, onClose }: Props) {
  const [replay, setReplay] = useState(0);
  const [dir, setDir] = useState(1); // 1 = siguiente, -1 = anterior (sentido de la animación)
  const dragControls = useDragControls();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const index = product ? list.findIndex((p) => p.id === product.id) : -1;
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  const siblings = product ? list.filter((p) => p.categoryId === product.categoryId) : [];

  const go = (target: ModalProduct | null, d: number) => {
    if (!target) return;
    setDir(d);
    onSelect(target.id);
  };

  // callbacks en refs: así el efecto de teclado no se re-ejecuta en cada render
  const cb = useRef({ onClose, prev, next, go });
  cb.current = { onClose, prev, next, go };
  const isOpen = product !== null;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current.onClose();
      if (e.key === "ArrowRight") cb.current.go(cb.current.next, 1);
      if (e.key === "ArrowLeft") cb.current.go(cb.current.prev, -1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // al cambiar de producto: animación desde el principio, texto arriba y miniatura activa a la vista
  useEffect(() => {
    setReplay(0);
    scrollRef.current?.scrollTo({ top: 0 });
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>("[data-active=true]");
    if (strip && active && strip.scrollWidth > strip.clientWidth + 1) strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: "smooth" });
  }, [product?.id]);

  // deslizar a izquierda / derecha sobre la ficha para pasar de producto
  const onTouchStart = (e: React.TouchEvent) => {
    // en la tira "Más en…" el dedo sirve para desplazarla, no para cambiar de producto
    if ((e.target as HTMLElement).closest("[data-noswipe]")) {
      touch.current = null;
      return;
    }
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      if (dx < 0) go(next, 1);
      else go(prev, -1);
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-title"
        >
          <motion.button type="button" aria-label="Cerrar" tabIndex={-1} className="absolute inset-0 bg-[#1b100b]/55 lg:backdrop-blur-[6px]" onClick={onClose} />

          {/* La hoja NO se vuelve a montar al cambiar de producto: solo cambia su contenido */}
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            className="relative grid h-[94dvh] w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(220px,38dvh)_minmax(0,1fr)] overflow-hidden rounded-t-[26px] bg-[#fbf6ee] shadow-[0_40px_120px_-30px_rgba(0,0,0,.6)] lg:h-auto lg:max-h-[92dvh] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-1 lg:rounded-[34px]"
          >
            {/* ── CERRAR: siempre visible, arriba a la derecha ── */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#2a1a12] text-[#f5ede0] shadow-lg transition hover:scale-105 lg:right-5 lg:top-5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>

            {/* ── ESCENA 3D ── */}
            <div
              className="relative min-h-[220px] overflow-hidden lg:min-h-[620px]"
              style={{ background: "radial-gradient(90% 80% at 50% 70%, #f3e4cc 0%, #ead7ba 45%, #dcc3a0 100%)" }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={product.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <BackdropName name={product.name} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0">
                <ProductScene product={product} replay={replay} />
              </div>
              {/* pestaña para arrastrar y cerrar (móvil) */}
              <div className="absolute inset-x-0 top-0 z-10 flex h-8 cursor-grab touch-none items-center justify-center lg:hidden" onPointerDown={(e) => dragControls.start(e)} aria-hidden>
                <span className="h-1.5 w-12 rounded-full bg-[#2a1a12]/25" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5a3522]/70 lg:p-4 lg:text-[11px]">
                <span className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
                  Arrastra para girar
                </span>
                <button type="button" onClick={() => setReplay((r) => r + 1)} className="pointer-events-auto rounded-full bg-[#2a1a12]/85 px-3.5 py-2 text-[#f5ede0] transition hover:bg-[#2a1a12]">
                  ↻ Repetir
                </button>
              </div>
            </div>

            {/* ── INFORMACIÓN ── */}
            <div className="flex min-h-0 flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={product.id}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 36 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -36 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="p-5 pr-16 sm:p-6 lg:p-10 lg:pr-20"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{product.categoryLabel}</span>
                    <h2 id="product-title" className="mt-2 font-display text-[32px] uppercase leading-[0.95] tracking-tight text-[#2a1a12] sm:text-[42px] lg:mt-4 lg:text-[54px]">
                      {product.name}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-2 lg:mt-4 lg:gap-3">
                      <span className="font-display text-[26px] text-[var(--accent)] lg:text-3xl">{formatPrice(product.price)}</span>
                      {product.season !== "all" && (
                        <span className="rounded-full bg-[#2a1a12] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0]">
                          {product.season === "summer" ? "☀ Solo carta de verano" : "❄ Solo carta de invierno"}
                        </span>
                      )}
                      {product.tags?.map((t) => (
                        <span key={t} className="rounded-full border border-[#dcc9ae] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6d5645]">
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 font-serif text-[18px] italic leading-snug text-[#3d2519] lg:mt-6 lg:text-[22px]">{product.description}</p>

                    {product.ingredients && product.ingredients.length > 0 && (
                      <div className="mt-6 lg:mt-8">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6f5c]">Ingredientes</h3>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {product.ingredients.map((ing, i) => (
                            <motion.li
                              key={ing}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 320, damping: 22 }}
                              className="rounded-full bg-[#efe3d0] px-3.5 py-1.5 text-[13px] font-medium text-[#3d2519]"
                            >
                              {ing}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="mt-6 text-[12px] leading-relaxed text-[#8a6f5c] lg:mt-8">¿Alergias o intolerancias? Pregunta en barra, te informamos de todos los alérgenos.</p>
                  </motion.div>
                </AnimatePresence>

                {/* ── MÁS EN ESTA CATEGORÍA: saltar a otro producto sin cerrar ── */}
                {siblings.length > 1 && (
                  <div className="border-t border-[#2a1a12]/8 pb-4 pt-4 lg:pb-6">
                    <p className="px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6f5c] sm:px-6 lg:px-10">Más en {product.categoryLabel}</p>
                    <div
                      ref={stripRef}
                      data-noswipe
                      className="no-scrollbar mt-3 flex snap-x snap-proximity gap-2.5 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-1 sm:px-6 lg:grid lg:snap-none lg:grid-cols-[repeat(auto-fill,minmax(88px,1fr))] lg:overflow-visible lg:px-10"
                    >
                      {siblings.map((s) => {
                        const active = s.id === product.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            data-active={active}
                            onClick={() => go(s, list.indexOf(s) >= index ? 1 : -1)}
                            aria-current={active}
                            className={`flex w-[92px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border p-2 text-center transition lg:w-auto ${
                              active ? "border-[#2a1a12] bg-[#2a1a12] text-[#f5ede0]" : "border-[#e6d6bf] bg-white/60 text-[#2a1a12] hover:border-[#2a1a12]/40"
                            }`}
                          >
                            <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${active ? "bg-[#f5ede0]/10" : "bg-[#f3e7d6]"}`}>
                              <ProductGlyph visual={s.visual} className="h-12 w-12" />
                            </span>
                            <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{s.name}</span>
                            <span className={`text-[11px] ${active ? "text-[#f5ede0]/70" : "text-[#8a6f5c]"}`}>{formatPrice(s.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── NAVEGACIÓN FIJA ABAJO: siempre a mano con el pulgar ── */}
              <div className="flex items-center gap-2 border-t border-[#2a1a12]/10 bg-[#fbf6ee] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:px-6">
                <button
                  type="button"
                  onClick={() => go(prev, -1)}
                  disabled={!prev}
                  className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[#e2d2bb] px-3 text-left text-[#2a1a12] transition enabled:hover:bg-[#efe3d0] disabled:opacity-35"
                  aria-label={prev ? `Anterior: ${prev.name}` : "No hay anterior"}
                >
                  <Arrow dir="left" />
                  <span className="min-w-0">
                    <span className="block text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#8a6f5c]">Anterior</span>
                    <span className="block truncate text-[12.5px] font-semibold">{prev?.name ?? "—"}</span>
                  </span>
                </button>
                {index >= 0 && (
                  <span className="shrink-0 px-1 text-[11px] font-semibold tabular-nums text-[#8a6f5c]">
                    {index + 1}/{list.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => go(next, 1)}
                  disabled={!next}
                  className="flex h-12 min-w-0 flex-1 items-center justify-end gap-2 rounded-2xl bg-[#2a1a12] px-3 text-right text-[#f5ede0] transition enabled:hover:brightness-125 disabled:opacity-35"
                  aria-label={next ? `Siguiente: ${next.name}` : "No hay siguiente"}
                >
                  <span className="min-w-0">
                    <span className="block text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#f5ede0]/60">Siguiente</span>
                    <span className="block truncate text-[12.5px] font-semibold">{next?.name ?? "—"}</span>
                  </span>
                  <Arrow dir="right" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { GooeyNav } from "@/components/ui/gooey-nav";
import { SearchBar } from "./SearchBar";
import { SeasonToggle } from "./SeasonToggle";
import { WeatherCard, describeWeather, useWeather } from "./WeatherCard";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { MENU, type Product } from "@/data/menu";
import { SITE } from "@/data/site";

const HeroScene = dynamic(() => import("./scene/ProductScene"), { ssr: false });

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type Flat = Product & { categoryId: string; categoryLabel: string };

const HERO_PRODUCT = MENU.find((c) => c.id === "cafes")!.products.find((p) => p.id === "latte-caramelo")!;

export default function MenuApp() {
  const [winter, setWinter] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const lockSpy = useRef(false);
  const { data: weather, error: weatherError } = useWeather();

  // temporada inicial según el mes
  useEffect(() => {
    const m = new Date().getMonth() + 1;
    setWinter(!SITE.summerMonths.includes(m));
  }, []);

  useEffect(() => {
    document.body.dataset.season = winter ? "winter" : "summer";
  }, [winter]);

  // atajo ⌘K / Ctrl+K / "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement)?.tagName === "INPUT";
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInput)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ block: "nearest" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const season = winter ? "winter" : "summer";

  const sections = useMemo(() => {
    const q = normalize(query.trim());
    return MENU.map((c) => ({
      ...c,
      products: c.products.filter((p) => {
        if (p.season !== "all" && p.season !== season) return false;
        if (!q) return true;
        const hay = normalize([p.name, p.short, p.description, ...(p.ingredients ?? []), ...(p.tags ?? []), c.label].join(" "));
        return q.split(/\s+/).every((w) => hay.includes(w));
      }),
    }));
  }, [query, season]);

  const flat: Flat[] = useMemo(
    () => sections.flatMap((c) => c.products.map((p) => ({ ...p, categoryId: c.id, categoryLabel: c.label }))),
    [sections],
  );
  const totalVisible = flat.length;
  const openIndex = flat.findIndex((p) => p.id === openId);
  const openProduct = openIndex >= 0 ? flat[openIndex] : openId ? findAny(openId) : null;

  // scroll-spy
  useEffect(() => {
    const els = MENU.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        if (lockSpy.current) return;
        const vis = entries.filter((e) => e.isIntersecting);
        if (!vis.length) return;
        const id = vis[0].target.id.replace("cat-", "");
        const idx = MENU.findIndex((c) => c.id === id);
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  // mantener visible la pestaña activa en móvil
  useEffect(() => {
    const wrap = navScrollRef.current;
    const el = wrap?.querySelectorAll("[data-slot=gooey-nav-segment]")[active] as HTMLElement | undefined;
    if (wrap && el) wrap.scrollTo({ left: el.offsetLeft - wrap.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    setQuery("");
    lockSpy.current = true;
    requestAnimationFrame(() => {
      document.getElementById(`cat-${MENU[i].id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.setTimeout(() => (lockSpy.current = false), 900);
  }, []);

  // recomendación según el tiempo
  const recommendation = useMemo(() => {
    if (!weather) return null;
    const pick = (ids: string[]) => ids.map(findAny).find((p) => p && (p.season === "all" || p.season === season)) ?? null;
    if (weather.temp >= 22) return { text: `${weather.temp}° en la calle. Pide algo frío:`, product: pick(["iced-matcha", "limonada", "naranja"]) };
    if (weather.temp <= 14) return { text: `${weather.temp}° fuera. Entra en calor con:`, product: pick(["chai-latte", "latte-avellana", "cafe-con-leche"]) };
    return { text: `${weather.temp}° y ${describeWeather(weather.code).toLowerCase()}. Hoy apetece:`, product: pick(["flat-white", "capuccino"]) };
  }, [weather, season]);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ───────── HERO ───────── */}
      <header ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 pt-6 md:px-10">
          <span className="font-display text-2xl uppercase tracking-tight">Maruchi</span>
          <div className="flex items-center gap-5 text-[13px] font-medium text-[#6d5645]">
            <a href="#carta" className="hidden transition hover:text-[#2a1a12] sm:inline">La carta</a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#2a1a12]/15 px-4 py-2 transition hover:bg-[#2a1a12] hover:text-[#f5ede0]">
              Cómo llegar
            </a>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1320px] items-center gap-6 px-5 pb-10 pt-8 md:grid-cols-[1.05fr_1fr] md:px-10 md:pb-20 md:pt-10">
          <motion.div style={{ y: heroY, opacity: heroFade }} className="relative z-10 order-2 md:order-1">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Coffee &amp; brunch · {SITE.city}
            </motion.p>
            <h1 className="mt-7 font-display uppercase leading-[0.86] tracking-[-0.02em] text-[#2a1a12]">
              {["Café,", "matcha", "& tostadas"].map((w, i) => (
                <motion.span
                  key={w}
                  className="block whitespace-nowrap text-[clamp(44px,7.2vw,108px)]"
                  initial={{ opacity: 0, y: 60, rotateX: -70 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 120, damping: 16 }}
                  style={{ transformOrigin: "50% 100%", transformPerspective: 800 }}
                >
                  {i === 1 ? <span className="text-[var(--accent)]">{w}</span> : w}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-6 max-w-[460px] font-serif text-[24px] italic leading-snug text-[#5a3522]">
              Sin horarios. Toca cualquier producto de la carta y míralo prepararse delante de ti.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#carta" className="group inline-flex items-center gap-3 rounded-full bg-[#2a1a12] py-3 pl-6 pr-3 text-[15px] font-semibold text-[#f5ede0] shadow-[0_18px_30px_-16px_rgba(42,26,18,.7)] transition hover:gap-4">
                Ver la carta
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-2)] text-[#2a1a12] transition group-hover:translate-y-0.5">↓</span>
              </a>
              <SeasonToggle winter={winter} onChange={setWinter} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-10 flex flex-wrap items-center gap-6">
              <WeatherCard data={weather} error={weatherError} onClick={() => recommendation?.product && setOpenId(recommendation.product.id)} />
              <div className="max-w-[240px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6f5c]">El tiempo ahora</p>
                {recommendation?.product ? (
                  <>
                    <p className="mt-2 font-serif text-[20px] italic leading-snug text-[#3d2519]">{recommendation.text}</p>
                    <button type="button" onClick={() => setOpenId(recommendation.product!.id)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110">
                      {recommendation.product.name} →
                    </button>
                  </>
                ) : (
                  <p className="mt-2 font-serif text-[20px] italic leading-snug text-[#3d2519]">{weatherError ? "Sea el tiempo que sea, hay un café esperándote." : `Consultando el cielo de ${SITE.city}…`}</p>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* ventana-arco con la escena 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
            className="relative order-1 mx-auto aspect-[4/5] w-full max-w-[520px] md:order-2"
          >
            <div className="absolute inset-0 rounded-t-[999px] rounded-b-[40px] bg-[var(--accent)] shadow-[inset_0_-40px_80px_rgba(0,0,0,.18)] transition-colors duration-700" />
            <div className="absolute inset-[14px] rounded-t-[999px] rounded-b-[30px] border-2 border-dashed border-white/25" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[40px]">
              <span className="absolute inset-x-0 top-[14%] select-none text-center font-display text-[clamp(64px,9vw,128px)] uppercase leading-[0.9] text-white/15">
                Maru
                <br />
                chi
              </span>
            </div>
            <div className="absolute inset-0">
              <HeroScene product={HERO_PRODUCT} distance={1.45} />
            </div>
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-2 top-[22%] rotate-[-6deg] rounded-full bg-[#fbf6ee] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] shadow-lg md:-left-8"
            >
              Latte caramelo · 3,20 €
            </motion.span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-2 bottom-[18%] rotate-[5deg] rounded-full bg-[#2a1a12] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0] shadow-lg md:-right-6"
            >
              ✺ Gíralo
            </motion.span>
          </motion.div>
        </div>

        {/* marquee */}
        <div className="relative flex overflow-hidden border-y border-[#2a1a12]/10 bg-[#2a1a12] py-4 text-[#f5ede0]">
          {[0, 1].map((k) => (
            <div key={k} className="marquee flex shrink-0 items-center gap-10 pr-10 font-display text-[22px] uppercase tracking-tight" aria-hidden={k === 1}>
              {MENU.map((c) => (
                <span key={c.id} className="flex items-center gap-10 whitespace-nowrap">
                  {c.title}
                  <span className="text-[var(--accent-2)]">✺</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </header>

      {/* ───────── BARRA FIJA ───────── */}
      <div id="carta" className="sticky top-0 z-40 border-b border-[#2a1a12]/10 bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-xl transition-colors duration-700">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-5 md:px-10">
          <div ref={navScrollRef} className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:flex-1 md:px-0">
            <GooeyNav
              items={MENU.map((c) => c.label)}
              value={active}
              onChange={goTo}
              size="sm"
              activeColor="#2a1a12"
              activeLabelColor="#f5ede0"
              className="py-1"
            />
          </div>
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <div className="min-w-0 flex-1 md:flex-none">
              <SearchBar ref={searchRef} value={query} onChange={setQuery} className="!w-full md:!w-[300px]" />
            </div>
            <SeasonToggle winter={winter} onChange={setWinter} compact />
          </div>
        </div>
      </div>

      {/* ───────── CARTA ───────── */}
      <main className="mx-auto max-w-[1320px] px-5 pb-24 pt-10 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div key={season} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-serif text-[22px] italic text-[#5a3522]">
              {winter ? "Carta de invierno" : "Carta de verano"} · {totalVisible} productos
              {query && <> para “{query}”</>}
            </p>
          </motion.div>
        </AnimatePresence>

        {totalVisible === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="font-display text-4xl uppercase">Nada por aquí</p>
            <p className="mt-3 font-serif text-xl italic text-[#6d5645]">Prueba con “café”, “matcha” o “tostada”.</p>
            <button type="button" onClick={() => setQuery("")} className="mt-6 rounded-full bg-[#2a1a12] px-5 py-2.5 text-sm font-semibold text-[#f5ede0]">
              Ver toda la carta
            </button>
          </div>
        )}

        {sections.map((c, ci) =>
          c.products.length === 0 ? (
            <div key={c.id} id={`cat-${c.id}`} className="section-anchor" />
          ) : (
            <section key={c.id} id={`cat-${c.id}`} className="section-anchor pt-14 md:pt-20" aria-labelledby={`t-${c.id}`}>
              <div className="mb-8 grid items-end gap-4 border-b border-[#2a1a12]/12 pb-6 md:grid-cols-[auto_1fr_auto]">
                <span className="font-display text-[15px] text-[var(--accent)]">{String(ci + 1).padStart(2, "0")}</span>
                <motion.h2
                  id={`t-${c.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="font-display text-[clamp(44px,7vw,92px)] uppercase leading-[0.85] tracking-[-0.02em]"
                >
                  {c.title}
                </motion.h2>
                <p className="max-w-[320px] font-serif text-[19px] italic leading-snug text-[#6d5645] md:text-right">{c.intro}</p>
              </div>
              <motion.ul layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {c.products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onOpen={() => setOpenId(p.id)} />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </section>
          ),
        )}
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer className="relative overflow-hidden bg-[#2a1a12] text-[#f5ede0]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">Dónde</p>
            <p className="mt-3 font-serif text-2xl italic">{SITE.city}, Barcelona</p>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-[#f5ede0]/40 pb-0.5 text-sm transition hover:border-[#f5ede0]">
              Abrir en Google Maps →
            </a>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">La carta</p>
            <p className="mt-3 text-sm leading-relaxed text-[#f5ede0]/75">
              Precios con IVA incluido. Leche vegetal disponible. Consulta alérgenos en barra. La carta cambia con la temporada.
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">Temporada</p>
            <div className="mt-2 md:flex md:justify-end [&_.toggle:after]:!text-[#f5ede0]/60 [&_.toggle:before]:!text-[#f5ede0]/60 [&_.input:checked+.toggle:after]:!text-[#f5ede0] [&_.input:not(:checked)+.toggle:before]:!text-[#f5ede0]">
              <SeasonToggle winter={winter} onChange={setWinter} />
            </div>
          </div>
        </div>
        <p aria-hidden className="pointer-events-none select-none px-3 text-center font-display text-[24vw] uppercase leading-[0.78] tracking-[-0.03em] text-[#f5ede0]/[0.06]">
          Maruchi
        </p>
      </footer>

      <ProductModal
        product={openProduct}
        onClose={() => setOpenId(null)}
        onPrev={openIndex > 0 ? () => setOpenId(flat[openIndex - 1].id) : undefined}
        onNext={openIndex >= 0 && openIndex < flat.length - 1 ? () => setOpenId(flat[openIndex + 1].id) : undefined}
      />
    </>
  );
}

function findAny(id: string): Flat | null {
  for (const c of MENU) {
    const p = c.products.find((x) => x.id === id);
    if (p) return { ...p, categoryId: c.id, categoryLabel: c.label };
  }
  return null;
}

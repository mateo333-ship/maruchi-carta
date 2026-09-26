"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GooeyNav } from "@/components/ui/gooey-nav";
import { SearchBar } from "./SearchBar";
import { SeasonToggle } from "./SeasonToggle";
import { Logo } from "./Logo";
import { ConnectSection, IconCamera, IconCard, IconStar } from "./ConnectLinks";
import { WeatherCard, describeWeather, useWeather } from "./WeatherCard";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { MENU, formatPrice, type Product } from "@/data/menu";
import { SITE } from "@/data/site";

const HeroScene = dynamic(() => import("./scene/ProductScene"), { ssr: false });

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type Flat = Product & { categoryId: string; categoryLabel: string };

// Producto de la portada: el latte caramelo o, si se quitara de la carta, la primera taza que haya.
const ALL = MENU.flatMap((c) => c.products);
const HERO_PRODUCT: Product | undefined =
  ALL.find((p) => p.id === "latte-caramelo") ?? ALL.find((p) => p.visual.kind === "cup") ?? ALL[0];

export default function MenuApp() {
  const [winter, setWinter] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const lockSpy = useRef(false);
  const { data: weather, error: weatherError } = useWeather();
  const heroSceneRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  // la escena 3D de portada se pausa cuando no se ve (ahorra batería y GPU)
  useEffect(() => {
    const el = heroSceneRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      const t = e.target as HTMLElement | null;
      const isInput = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (document.querySelector('[role="dialog"]')) return;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInput)) {
        e.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
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
    window.setTimeout(() => (lockSpy.current = false), 1200);
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

  return (
    <>
      {/* ───────── HERO ───────── */}
      <header ref={heroRef} className="relative overflow-hidden">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 pt-5 md:px-10 md:pt-6">
          <a href="#" aria-label="Maruchi, inicio" className="block">
            <Logo className="h-12 w-auto text-[#2a1a12] sm:h-14 md:h-16" />
          </a>
          <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#6d5645] sm:gap-5">
            <a href="#carta" className="hidden transition hover:text-[#2a1a12] sm:inline">La carta</a>
            <a href={SITE.loyaltyUrl} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 transition hover:text-[#2a1a12] md:inline-flex">
              <IconCard size={16} /> Tarjeta de fidelidad
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${SITE.instagramHandle}`}
              className="hidden h-10 w-10 items-center sm:flex justify-center rounded-full border border-[#2a1a12]/15 text-[#2a1a12] transition hover:bg-[#2a1a12] hover:text-[#f5ede0]"
            >
              <IconCamera size={18} />
            </a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#2a1a12]/15 px-4 py-2 transition hover:bg-[#2a1a12] hover:text-[#f5ede0]">
              Cómo llegar
            </a>
          </div>
        </div>

        {/* accesos directos (solo móvil): Instagram · tarjeta de fidelidad · reseñas */}
        <nav aria-label="Accesos directos" className="mx-auto mt-4 grid max-w-[1320px] grid-cols-3 gap-2 px-5 sm:hidden">
          {[
            { href: SITE.instagram, icon: <IconCamera size={16} />, label: "Instagram" },
            { href: SITE.loyaltyUrl, icon: <IconCard size={16} />, label: "Fidelidad" },
            { href: SITE.reviewUrl, icon: <IconStar size={16} />, label: "Reseña" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#2a1a12]/15 bg-[#fbf6ee] text-[12.5px] font-semibold text-[#2a1a12] transition active:scale-95 active:bg-[#efe3d0]"
            >
              {l.icon}
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mx-auto grid max-w-[1320px] items-center gap-7 px-5 pb-10 pt-4 sm:gap-6 sm:pb-10 sm:pt-8 md:grid-cols-[1.05fr_1fr] md:px-10 md:pb-20 md:pt-10">
          <div className="relative z-10 order-2 md:order-1">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--accent)] sm:text-[12px] sm:tracking-[0.28em]">
              Coffee &amp; Tea · {SITE.city}
            </motion.p>
            <h1 className="mt-3 font-display sm:mt-10 md:mt-12 uppercase leading-[0.9] tracking-[-0.02em] text-[#2a1a12]">
              {["Café,", "matcha", "& tostadas"].map((w, i) => (
                <motion.span
                  key={w}
                  className="block whitespace-nowrap text-[clamp(30px,10vw,56px)] md:text-[clamp(56px,7.2vw,108px)]"
                  initial={{ opacity: 0, y: 60, rotateX: -70 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 120, damping: 16 }}
                  style={{ transformOrigin: "50% 100%", transformPerspective: 800 }}
                >
                  {i === 1 ? <span className="text-[var(--accent)]">{w}</span> : w}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-4 max-w-[460px] font-serif text-[17px] italic sm:mt-5 sm:text-[20px] md:mt-6 md:text-[24px] leading-snug text-[#5a3522]">
              Sin horarios. Toca cualquier producto de la carta y míralo prepararse delante de ti.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-8">
              <a href="#carta" className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-[#2a1a12] py-3 pl-6 pr-3 text-[15px] sm:w-auto sm:justify-start font-semibold text-[#f5ede0] shadow-[0_18px_30px_-16px_rgba(42,26,18,.7)] transition hover:gap-4">
                Ver la carta
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-2)] text-[#2a1a12] transition group-hover:translate-y-0.5">↓</span>
              </a>
              <div className="hidden sm:block">
                <SeasonToggle winter={winter} onChange={setWinter} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-6 md:mt-10">
              {/* móvil: tarjeta compacta · tablet/escritorio: tarjeta Uiverse */}
              <div className="sm:hidden">
                <WeatherCard
                  compact
                  data={weather}
                  error={weatherError}
                  recommendation={recommendation?.product ? { text: recommendation.text, name: recommendation.product.name } : null}
                  onClick={() => recommendation?.product && setOpenId(recommendation.product.id)}
                />
              </div>
              <div className="hidden sm:block">
                <WeatherCard data={weather} error={weatherError} hint={recommendation?.product ? `Toca para ver ${recommendation.product.name}` : undefined} onClick={() => recommendation?.product && setOpenId(recommendation.product.id)} />
              </div>
              <div className="hidden min-w-0 sm:block sm:max-w-[260px] sm:flex-1">
                <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6f5c] sm:block">El tiempo ahora</p>
                {recommendation?.product ? (
                  <>
                    <p className="min-w-0 font-serif text-[16px] italic leading-snug text-[#3d2519] sm:mt-2 sm:text-[20px]">{recommendation.text}</p>
                    <button type="button" onClick={() => setOpenId(recommendation.product!.id)} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 sm:mt-3">
                      {recommendation.product.name} →
                    </button>
                  </>
                ) : (
                  <p className="font-serif text-[17px] italic leading-snug text-[#3d2519] sm:mt-2 sm:text-[20px]">{weatherError ? "Sea el tiempo que sea, hay un café esperándote." : `Consultando el cielo de ${SITE.city}…`}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* ventana-arco con la escena 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 18 }}
            className="relative order-1 mx-auto aspect-[6/5] w-full max-w-[380px] sm:aspect-[4/5] sm:max-w-[400px] md:order-2 md:max-w-[520px]"
          >
            <div className="absolute inset-0 rounded-t-[999px] rounded-b-[40px] bg-[var(--accent)] shadow-[inset_0_-40px_80px_rgba(0,0,0,.18)] transition-colors duration-700" />
            <div className="absolute inset-[14px] rounded-t-[999px] rounded-b-[30px] border-2 border-dashed border-white/25" />
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[40px]">
              <Logo title="" aria-hidden className="absolute left-1/2 top-[12%] h-[62%] w-auto -translate-x-1/2 text-white/[0.13]" />
            </div>
            <div ref={heroSceneRef} className="absolute inset-0">
              {HERO_PRODUCT && (
                <Suspense fallback={null}>
                  <HeroScene product={HERO_PRODUCT} distance={1.45} paused={!heroVisible || openId !== null} />
                </Suspense>
              )}
            </div>
            {HERO_PRODUCT && (
              <motion.button
                type="button"
                onClick={() => setOpenId(HERO_PRODUCT.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute -left-1 top-[16%] rotate-[-6deg] rounded-full bg-[#fbf6ee] px-3 py-1.5 text-[10px] sm:top-[22%] sm:px-4 sm:py-2 sm:text-[12px] font-semibold uppercase tracking-[0.14em] shadow-lg transition-colors hover:bg-white md:-left-8"
              >
                {HERO_PRODUCT.name} · {formatPrice(HERO_PRODUCT.price)}
              </motion.button>
            )}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-1 bottom-[14%] hidden sm:inline-block rotate-[5deg] rounded-full bg-[#2a1a12] px-3 py-1.5 text-[10px] sm:bottom-[18%] sm:px-4 sm:py-2 sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f5ede0] shadow-lg md:-right-6"
            >
              ✺ Gíralo
            </motion.span>
          </motion.div>
        </div>

        {/* marquee */}
        <div className="relative hidden overflow-hidden border-y border-[#2a1a12]/10 bg-[#2a1a12] py-3 text-[#f5ede0] sm:flex md:py-4">
          {[0, 1].map((k) => (
            <div key={k} className="marquee flex shrink-0 items-center gap-10 pr-10 font-display text-[18px] uppercase tracking-tight md:text-[22px]" aria-hidden={k === 1}>
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
      <div id="carta" className="sticky top-0 z-40 border-y border-t-[#2a1a12]/10 sm:border-t-0 border-b border-[#2a1a12]/10 bg-[var(--bg)] transition-colors duration-700 md:bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] md:backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center gap-2 px-3 py-2.5 md:gap-5 md:px-10 md:py-3">
          {/* categorías (en móvil y tablet se ocultan mientras buscas) */}
          <div
            ref={navScrollRef}
            className={`no-scrollbar min-w-0 flex-1 overflow-x-auto [mask-image:linear-gradient(90deg,#000_88%,transparent)] lg:[mask-image:none] ${searchOpen ? "hidden lg:block" : "block"}`}
          >
            <GooeyNav
              items={MENU.map((c) => c.label)}
              value={active}
              onChange={goTo}
              size="sm"
              activeColor="#2a1a12"
              activeLabelColor="#f5ede0"
              className="py-1 pr-6 lg:pr-0"
            />
          </div>
          {/* buscador: siempre visible en escritorio, desplegable en móvil y tablet */}
          <div className={`min-w-0 lg:flex-none ${searchOpen ? "flex-1" : "hidden lg:block"}`}>
            <SearchBar ref={searchRef} value={query} onChange={setQuery} className="!h-11 !w-full lg:!h-12 lg:!w-[300px]" />
          </div>
          <button
            type="button"
            onClick={() => {
              if (searchOpen) {
                setQuery("");
                setSearchOpen(false);
              } else {
                setSearchOpen(true);
                requestAnimationFrame(() => searchRef.current?.focus());
              }
            }}
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar en la carta"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e6d8c4] bg-[#fffdf9] text-[#5a3522] shadow-[0_10px_24px_-18px_rgba(42,26,18,.5)] lg:hidden"
          >
            {searchOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            )}
          </button>
          <SeasonToggle winter={winter} onChange={setWinter} compact />
        </div>
      </div>

      {/* ───────── CARTA ───────── */}
      <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-5 sm:px-5 sm:pb-24 sm:pt-10 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div key={season} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-serif text-[16px] italic text-[#5a3522] sm:text-[22px]">
              {winter ? "❄ Carta de invierno" : "☀ Carta de verano"} · {totalVisible} {totalVisible === 1 ? "producto" : "productos"}
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
            <section key={c.id} id={`cat-${c.id}`} className="section-anchor pt-9 sm:pt-14 md:pt-20" aria-labelledby={`t-${c.id}`}>
              <div className="mb-4 grid grid-cols-[auto_1fr] items-end gap-x-3 gap-y-1.5 border-b border-[#2a1a12]/12 pb-4 sm:mb-8 sm:gap-4 sm:pb-6 md:grid-cols-[auto_1fr_auto]">
                <span className="font-display text-[15px] text-[var(--accent)]">{String(ci + 1).padStart(2, "0")}</span>
                <motion.h2
                  id={`t-${c.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="font-display text-[clamp(30px,9vw,92px)] uppercase leading-[0.88] tracking-[-0.02em] sm:text-[clamp(44px,7vw,92px)]"
                >
                  {c.title}
                </motion.h2>
                <p className="col-span-2 max-w-[320px] font-serif text-[15.5px] italic leading-snug text-[#6d5645] sm:text-[19px] md:col-span-1 md:text-right">{c.intro}</p>
              </div>
              <motion.ul layout className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence initial={false}>
                  {c.products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onOpen={() => setOpenId(p.id)} />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </section>
          ),
        )}
      </main>

      {/* ───────── INSTAGRAM · FIDELIDAD · RESEÑAS ───────── */}
      <ConnectSection />

      {/* ───────── FOOTER ───────── */}
      <footer className="relative overflow-hidden bg-[#2a1a12] text-[#f5ede0]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pb-10 pt-14 sm:grid-cols-2 md:px-10 md:pt-20 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="h-36 w-auto text-[#f5ede0] md:h-44" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">Dónde</p>
            <p className="mt-3 font-serif text-2xl italic">{SITE.city}, Barcelona</p>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-[#f5ede0]/40 pb-0.5 text-sm transition hover:border-[#f5ede0]">
              Abrir en Google Maps →
            </a>
            <ul className="mt-6 space-y-2.5 text-sm text-[#f5ede0]/80">
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-[#f5ede0]">
                  <IconCamera size={17} /> {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <a href={SITE.loyaltyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-[#f5ede0]">
                  <IconCard size={17} /> Tarjeta de fidelidad
                </a>
              </li>
              <li>
                <a href={SITE.reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-[#f5ede0]">
                  <IconStar size={17} /> Déjanos una reseña
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">La carta</p>
            <p className="mt-3 text-sm leading-relaxed text-[#f5ede0]/75">
              Precios con IVA incluido. Consulta alérgenos en barra. La carta cambia con la temporada.
            </p>
          </div>
          <div className="lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">Temporada</p>
            <div className="mt-3 flex lg:justify-end">
              <SeasonToggle winter={winter} onChange={setWinter} onDark />
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2 border-t border-[#f5ede0]/10 px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[12px] text-[#f5ede0]/50 md:px-10">
          <span>© {new Date().getFullYear()} Maruchi Coffee &amp; Tea · {SITE.city}</span>
          <a href="#" className="transition hover:text-[#f5ede0]">Volver arriba ↑</a>
        </div>
      </footer>

      <ProductModal product={openProduct} list={flat} onSelect={setOpenId} onClose={() => setOpenId(null)} />
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

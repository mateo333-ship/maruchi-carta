import type { Topping, Visual } from "@/data/menu";

const TOPPING_COLOR: Record<Topping, string> = {
  tomato: "#c0331f",
  oil: "#d9b93a",
  butter: "#f6dc8a",
  jam: "#a8142f",
  pesto: "#4f7d2a",
  burrata: "#fbf8ef",
  cherry: "#d4291f",
  avocado: "#a9c653",
  cheese: "#f7f2e4",
  seeds: "#2a2320",
  ham: "#c9585f",
  salmon: "#ef8356",
  creamcheese: "#fbf6ea",
};

const INK = "#2a1a12";

function ToastGlyph({ toppings, x = 0, y = 0, s = 1 }: { toppings: Topping[]; x?: number; y?: number; s?: number }) {
  const base = toppings[0] ? TOPPING_COLOR[toppings[0]] : "#e5b56a";
  const extra = toppings.slice(1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M22 88 L22 46 C22 30 30 22 50 22 C70 22 78 30 78 46 L78 88 Z" fill="#9b5a25" />
      <path d="M27 84 L27 47 C27 34 34 27 50 27 C66 27 73 34 73 47 L73 84 Z" fill="#e9bf78" />
      <path d="M31 78 C30 60 36 40 50 38 C64 38 70 52 69 64 C68 76 60 80 50 80 C40 80 32 82 31 78Z" fill={base} opacity="0.95" />
      {extra.map((t, i) =>
        t === "seeds" || t === "cheese" ? (
          <g key={i} fill={TOPPING_COLOR[t]}>
            {[[40, 50], [56, 56], [46, 66], [60, 70], [38, 72], [52, 46]].map(([cx, cy], j) => (
              <circle key={j} cx={cx + i * 2} cy={cy} r={t === "cheese" ? 3.2 : 1.6} />
            ))}
          </g>
        ) : t === "cherry" ? (
          <g key={i} fill={TOPPING_COLOR[t]}>
            <circle cx="38" cy="54" r="5" /> <circle cx="62" cy="68" r="5" /> <circle cx="60" cy="48" r="4.5" />
          </g>
        ) : t === "burrata" ? (
          <circle key={i} cx="50" cy="60" r="11" fill="#fbf8ef" stroke="#e8dfcb" strokeWidth="1.5" />
        ) : t === "avocado" ? (
          <g key={i} fill="#a9c653" stroke="#3f6b25" strokeWidth="1.2">
            {[0, 1, 2, 3].map((j) => (
              <ellipse key={j} cx={40 + j * 7} cy={60} rx={3.6} ry={15} transform={`rotate(${-18 + j * 10} ${40 + j * 7} 60)`} />
            ))}
          </g>
        ) : t === "ham" || t === "salmon" ? (
          <path key={i} d="M34 52 q8 -8 16 0 t16 0 M34 64 q8 -8 16 0 t16 0" stroke={TOPPING_COLOR[t]} strokeWidth="7" fill="none" strokeLinecap="round" />
        ) : t === "jam" ? (
          <circle key={i} cx="52" cy="58" r="10" fill={TOPPING_COLOR[t]} />
        ) : t === "oil" ? (
          <g key={i} fill="#d9b93a" opacity="0.85">
            <ellipse cx="42" cy="50" rx="4" ry="2.4" /> <ellipse cx="60" cy="66" rx="5" ry="2.6" />
          </g>
        ) : t === "butter" ? (
          <rect key={i} x="42" y="50" width="16" height="11" rx="2" fill="#f6dc8a" stroke="#dcb85c" />
        ) : null,
      )}
    </g>
  );
}

function CupGlyph({ liquid, foam, art, glass, x = 0, y = 0, s = 1 }: { liquid: string; foam?: string; art?: boolean; glass?: boolean; x?: number; y?: number; s?: number }) {
  const top = foam && !art ? foam : liquid;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="50" cy="84" rx="36" ry="7" fill="#e6d8c4" />
      <path d="M70 48 c14 0 14 20 0 20" stroke={glass ? "#cfc2b0" : "#fbf6ee"} strokeWidth="6" fill="none" />
      <path d="M24 40 L30 80 C31 84 69 84 70 80 L76 40 Z" fill={glass ? liquid : "#fbf6ee"} stroke={glass ? "#e0d4c2" : "#e8dccb"} strokeWidth="2" />
      <ellipse cx="50" cy="40" rx="26" ry="7" fill={glass ? "#f5ede0" : "#efe3d0"} />
      <ellipse cx="50" cy="41" rx="23" ry="5.6" fill={top} />
      {art && foam && <path d="M50 45 c-10 -4 -8 -10 -3 -9 c2 0 3 2 3 3 c0 -1 1 -3 3 -3 c5 -1 7 5 -3 9Z" fill={foam} />}
    </g>
  );
}

function IcedGlyph({ layers, straw, garnish }: { layers: string[]; straw?: string; garnish?: string }) {
  const h = 58 / layers.length;
  return (
    <g>
      <defs>
        <clipPath id="glassclip">
          <path d="M30 20 L36 88 L64 88 L70 20 Z" />
        </clipPath>
      </defs>
      {straw && <rect x="54" y="6" width="5" height="60" rx="2.5" fill={straw} transform="rotate(12 56 36)" />}
      <g clipPath="url(#glassclip)">
        {layers.map((c, i) => (
          <rect key={i} x="20" y={88 - (i + 1) * h} width="60" height={h + 0.5} fill={c} />
        ))}
        <rect x="38" y="30" width="11" height="11" rx="2" fill="#ffffff" opacity="0.55" transform="rotate(14 43 35)" />
        <rect x="51" y="36" width="10" height="10" rx="2" fill="#ffffff" opacity="0.45" transform="rotate(-10 56 41)" />
      </g>
      <path d="M30 20 L36 88 L64 88 L70 20" fill="none" stroke="#d8cab6" strokeWidth="2.5" strokeLinejoin="round" />
      {garnish === "lemon" && <circle cx="70" cy="22" r="9" fill="#f6e98f" stroke="#e9c53a" strokeWidth="3" />}
      {garnish === "orange" && <circle cx="70" cy="22" r="9" fill="#f8b04a" stroke="#ee7d1a" strokeWidth="3" />}
      {garnish === "berry" && <path d="M66 16 l10 0 l-5 12 Z" fill="#d2283f" />}
      {garnish === "mint" && <ellipse cx="44" cy="18" rx="7" ry="3.5" fill="#3f8f3a" transform="rotate(-20 44 18)" />}
    </g>
  );
}

export function ProductGlyph({ visual, className }: { visual: Visual; className?: string }) {
  let inner: React.ReactNode = null;
  switch (visual.kind) {
    case "cup":
      inner = <CupGlyph {...visual} x={visual.small ? 12 : 0} y={visual.small ? 16 : 0} s={visual.small ? 0.78 : 1} />;
      break;
    case "iced":
      inner = <IcedGlyph layers={visual.layers} straw={visual.straw} garnish={visual.garnish} />;
      break;
    case "can":
      inner = (
        <g>
          <rect x="33" y="14" width="34" height="74" rx="6" fill={visual.color} />
          <rect x="33" y="44" width="34" height="14" fill={visual.accent} />
          <rect x="35" y="12" width="30" height="5" rx="2" fill="#c9ccd1" />
          <rect x="35" y="85" width="30" height="5" rx="2" fill="#c9ccd1" />
          <rect x="38" y="20" width="4" height="60" rx="2" fill="#ffffff" opacity="0.35" />
        </g>
      );
      break;
    case "bottle":
      inner = (
        <g>
          <path d="M44 8 h12 v14 l8 16 v48 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-48 l8 -16 Z" fill={visual.glass} opacity="0.85" />
          <rect x="36" y="52" width="28" height="20" fill={visual.label} />
          <rect x="43" y="5" width="14" height="6" rx="2" fill="#d7b56d" />
        </g>
      );
      break;
    case "beer":
      inner = (
        <g>
          <path d="M32 26 L37 88 L63 88 L68 26 Z" fill={visual.liquid} />
          <path d="M30 18 C30 10 70 10 70 18 L69 30 L31 30 Z" fill={visual.foam} />
          <path d="M31 18 L37 88 L63 88 L69 18" fill="none" stroke="#d8cab6" strokeWidth="2.5" />
        </g>
      );
      break;
    case "wine":
      inner = (
        <g>
          <path d="M32 14 C30 40 36 52 50 54 C64 52 70 40 68 14 Z" fill="none" stroke="#d8cab6" strokeWidth="2.5" />
          <path d="M33 32 C34 44 40 51 50 51 C60 51 66 44 67 32 Z" fill={visual.liquid} />
          <line x1="50" y1="54" x2="50" y2="84" stroke="#d8cab6" strokeWidth="3" />
          <ellipse cx="50" cy="86" rx="14" ry="3.5" fill="#d8cab6" />
        </g>
      );
      break;
    case "toast":
      inner = <ToastGlyph toppings={visual.toppings} />;
      break;
    case "pack":
      inner = (
        <g>
          <rect x="6" y="80" width="88" height="8" rx="3" fill="#b98150" />
          <CupGlyph liquid={visual.drink === "coffee" ? "#6b3f22" : "#8a5a35"} foam={visual.drink === "coffee" ? "#d9b88f" : "#f1e2c8"} art={visual.drink !== "coffee"} x={-2} y={22} s={0.6} />
          {visual.side === "toast" && <ToastGlyph toppings={visual.toppings ?? ["tomato"]} x={42} y={24} s={0.58} />}
          {visual.side === "croissant" && (
            <path d="M52 76 C54 58 88 58 90 76 C84 70 80 70 76 74 C74 66 68 66 64 74 C62 70 56 70 52 76Z" fill="#d48f3c" stroke="#b36e28" strokeWidth="1.5" />
          )}
          {visual.side === "bocadillo" && (
            <g>
              <rect x="48" y="62" width="44" height="10" rx="5" fill="#c98a45" />
              <rect x="50" y="59" width="40" height="4" fill="#6c9a3a" />
              <rect x="48" y="52" width="44" height="9" rx="4.5" fill="#b8732f" />
            </g>
          )}
        </g>
      );
      break;
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {inner}
    </svg>
  );
}

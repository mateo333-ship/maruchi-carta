// Chatbot "Maru" · endpoint POST /api/chat (Next.js App Router)
// La API key NUNCA va en el código: se lee de GEMINI_API_KEY (Vercel → Settings → Environment Variables).
// Opcional: GEMINI_MODEL para forzar un modelo concreto (se prueba el primero).

import { MENU, formatPrice } from "@/data/menu";
import { SITE } from "@/data/site";
import { EXTRA } from "@/data/chat-extra";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Cadena de modelos: si uno está saturado (503), sin cuota (429) o no existe (404),
 * se pasa al siguiente. Cada modelo tiene su propia cuota gratuita, así el chat
 * casi nunca se queda sin responder.
 */
const MODELOS = Array.from(
  new Set(
    [process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"].filter(
      Boolean,
    ) as string[],
  ),
);

/* ───────────────────────── CONOCIMIENTO ───────────────────────── */

const TODOS = MENU.flatMap((c) => c.products.map((p) => ({ ...p, cat: c.title })));

const CARTA = MENU.map((c) => {
  const lineas = c.products.map((p) => {
    const e = EXTRA[p.id];
    const temporada = p.season === "summer" ? "SOLO carta de verano" : p.season === "winter" ? "SOLO carta de invierno" : "todo el año";
    const partes = [
      `• ${p.name} — ${formatPrice(p.price)}`,
      `  Descripción: ${p.description}`,
      p.ingredients?.length ? `  Ingredientes: ${p.ingredients.join(", ")}` : "",
      `  ${p.hot ? "Caliente" : "Frío / temperatura ambiente"} · ${temporada}${p.tags?.includes("Favorito") ? " · ⭐ FAVORITO de la casa" : ""}${p.tags?.length ? ` · Etiquetas: ${p.tags.join(", ")}` : ""}`,
      e ? `  Sabor: ${e.sabor} · Cafeína: ${e.cafeina} · Lácteos: ${e.lacteos}` : "",
      e ? `  Alérgenos orientativos: ${e.alergenos}${e.combina ? ` · Combina con: ${e.combina}` : ""}` : "",
      e?.tambien ? `  También lo pueden llamar: ${e.tambien}` : "",
    ];
    return partes.filter(Boolean).join("\n");
  });
  return `## ${c.title.toUpperCase()} — ${c.intro}\n${lineas.join("\n")}`;
}).join("\n\n");

const porPrecio = [...TODOS].sort((a, b) => a.price - b.price);
const RESUMEN = `DATOS RÁPIDOS
- Producto más barato: ${porPrecio[0].name} (${formatPrice(porPrecio[0].price)}). Más caro: ${porPrecio[porPrecio.length - 1].name} (${formatPrice(porPrecio[porPrecio.length - 1].price)}).
- Todo ordenado de más barato a más caro: ${porPrecio.map((p) => `${p.name} ${formatPrice(p.price)}`).join("; ")}.
- Sin cafeína: ${TODOS.filter((p) => EXTRA[p.id]?.cafeina === "sin cafeína").map((p) => p.name).join(", ")}.
- Sin lácteos: ${TODOS.filter((p) => EXTRA[p.id]?.lacteos.startsWith("no")).map((p) => p.name).join(", ")}.
- Favoritos de la casa: ${TODOS.filter((p) => p.tags?.includes("Favorito")).map((p) => p.name).join(", ")}.`;

function instrucciones() {
  const hoy = new Date();
  const mes = Number(new Intl.DateTimeFormat("es-ES", { month: "numeric", timeZone: "Europe/Madrid" }).format(hoy));
  const fecha = new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Madrid" }).format(hoy);
  const temporada = SITE.summerMonths.includes(mes) ? "verano" : "invierno";

  return `Eres "Maru", el asistente de Maruchi Coffee & Tea, una cafetería de especialidad en ${SITE.city} (Barcelona). Hablas con clientes que están mirando la carta en la web, normalmente desde el móvil.

TU PERSONALIDAD
Cercano, alegre y con gracia, como un buen camarero de barra que conoce la carta al dedillo. Conversas con naturalidad: puedes charlar, bromear un poco, contestar a un "gracias", un "okey" o un "¿qué tal?", y seguir el hilo de lo que se ha hablado antes.

ENTIENDE AL CLIENTE AUNQUE ESCRIBA MAL
- Los clientes escriben rápido y con faltas: "icen macha" = Iced matcha, "capuchino" = Capuccino, "frape" = Freddo espresso, "cafe con lexe" = Café con leche, "tostada de burata" = Pesto, burrata y cherry. Interpreta SIEMPRE lo más probable y responde directamente, sin corregir al cliente ni decir que no lo entiendes.
- Si un mensaje es corto o ambiguo ("¿qué lleva?", "¿y ese?", "dulce", "okey", "¿está bueno?"), usa la conversación anterior para saber de qué producto o tema habla.
- Si de verdad hay dos opciones posibles, elige la más probable y menciona la otra en una frase.

QUÉ PUEDES HACER
- Recomendar según gustos (dulce/salado, frío/caliente, con o sin cafeína, ligero/contundente, sin lácteos, presupuesto, hora del día, el tiempo que hace…). Sugiere 1-2 opciones concretas con su precio y explica por qué.
- Opinar con entusiasmo sobre los productos ("¿está bueno?" → di por qué gusta, a quién le encaja y con qué combina).
- Comparar productos, montar un desayuno o merienda para un presupuesto (suma bien los precios), sugerir combinaciones bebida + comida.
- Explicar qué es algo (un flat white, un chai, un freddo, qué es el matcha ceremonial…) con tus conocimientos generales de cafetería.
- Si piden algo que NO hay (batido de chocolate, frappé, croissant de jamón suelto, zumo de piña…), dilo con naturalidad y ofrece lo más parecido de la carta.
- Preguntas sobre temporada: hoy estamos en carta de ${temporada}. Los productos "SOLO carta de verano/invierno" solo se sirven en esa época; si preguntan por uno fuera de temporada, avísalo y ofrece una alternativa. En la web se cambia de carta con el botón del sol / copo de nieve.

DATOS DEL LOCAL
- Maruchi Coffee & Tea, ${SITE.city} (Barcelona). Cómo llegar en Google Maps: ${SITE.mapsUrl}
- Instagram: ${SITE.instagramHandle} (horarios, novedades, eventos).
- Tarjeta de fidelidad digital para sumar sellos: ${SITE.loyaltyUrl}
- Reseñas: se pueden dejar en Google desde la sección "Quédate cerca" de la web. ¡Les ayuda mucho!
- Precios con IVA incluido. El pedido y el pago se hacen en barra (tú no puedes tomar pedidos).
- Fecha y hora actual en ${SITE.city}: ${fecha}.

LO QUE NO SABES (no lo inventes)
Horario exacto, dirección exacta de la calle, teléfono, reservas, eventos o alquiler del local, WiFi, quién es el dueño o la dueña, si hay leches vegetales o sin gluten seguro, precios de extras. Para eso: dilo con naturalidad y amabilidad, y sugiere preguntar en barra o escribir por Instagram ${SITE.instagramHandle} (para ubicación, pasa el enlace de Google Maps). No inventes productos ni precios que no estén en la carta.

ALÉRGENOS
Puedes decir ingredientes y alérgenos orientativos de la carta, pero añade siempre que los confirmen en barra.

TEMAS FUERA DE LA CAFETERÍA
Si preguntan algo que no tiene nada que ver (deberes, política, etc.), responde con simpatía en una frase y reconduce a la carta. Sé siempre respetuoso.

ESTILO
- Responde en el idioma del cliente (español, catalán, inglés…).
- Breve: 1-4 frases normalmente; algo más solo si piden comparar o un menú. Nada de párrafos largos.
- Da el precio cada vez que nombres un producto. Pon los nombres de producto en **negrita**.
- Algún emoji suelto (☕🍵🥑🧊), sin abusar. Sin tablas ni títulos; como mucho guiones para listas cortas.
- Termina a veces con una pregunta corta para seguir ayudando ("¿Lo quieres frío o caliente?"), no siempre.

${RESUMEN}

CARTA COMPLETA (con toda la información de cada producto)
${CARTA}`;
}

/* ───────────────────────── GEMINI ───────────────────────── */

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

// Textos de error del propio chat: no se reenvían a Gemini para no ensuciar la conversación
const TEXTOS_DE_ERROR = [/no he podido responder/i, /mucha gente preguntando/i, /se me ha cortado la conexión/i, /no hay conexión/i, /no puedo responder/i];

async function llamarGemini(modelo: string, contents: GeminiContent[], systemText: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
  const generationConfig: Record<string, unknown> = { temperature: 0.8, topP: 0.95, maxOutputTokens: 1024 };
  // En los modelos 2.5 flash el "pensamiento" gasta tokens y tiempo: aquí no hace falta
  if (/2\.5-flash/.test(modelo)) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY as string },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Prueba la cadena de modelos con un reintento en errores temporales. */
async function responder(contents: GeminiContent[]) {
  const systemText = instrucciones();
  let ultimoEstado = 0;
  for (const modelo of MODELOS) {
    for (let intento = 0; intento < 2; intento++) {
      let r: Response;
      try {
        r = await llamarGemini(modelo, contents, systemText);
      } catch (e) {
        console.error(`Gemini ${modelo}: error de conexión/tiempo`, e);
        ultimoEstado = 0;
        break; // siguiente modelo
      }
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const parts: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts || [];
        const texto = parts
          .filter((p) => !p.thought)
          .map((p) => p.text || "")
          .join("")
          .trim();
        if (texto) return { ok: true as const, texto };
        console.error(`Gemini ${modelo}: respuesta vacía`, JSON.stringify(data).slice(0, 500));
        break; // prueba otro modelo
      }
      ultimoEstado = r.status;
      console.error(`Gemini ${modelo}: HTTP ${r.status}`, JSON.stringify(data).slice(0, 500));
      const msg = JSON.stringify(data).toLowerCase();
      if (r.status === 400 && msg.includes("api key")) return { ok: false as const, estado: 401 };
      if (r.status === 401 || r.status === 403) return { ok: false as const, estado: r.status };
      if ([429, 500, 502, 503, 504].includes(r.status) && intento === 0) {
        await esperar(700);
        continue; // reintento en el mismo modelo
      }
      break; // 404 / 400 (modelo no válido) / segundo fallo → siguiente modelo
    }
  }
  return { ok: false as const, estado: ultimoEstado };
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta GEMINI_API_KEY en Vercel (o falta redeploy).");
    return json({ error: "Falta la variable GEMINI_API_KEY en Vercel", reply: "Ahora mismo no puedo responder 😅 Pregunta en barra y te ayudan encantados." }, 500);
  }

  let body: { messages?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const mensajes = Array.isArray(body.messages) ? (body.messages as { role?: string; text?: unknown }[]) : [];

  // Limpieza: fuera mensajes vacíos y errores anteriores del bot; se unen turnos seguidos del mismo rol
  const contents: GeminiContent[] = [];
  for (const m of mensajes.slice(-16)) {
    if (!m || typeof m.text !== "string" || !m.text.trim()) continue;
    const role = m.role === "bot" ? "model" : "user";
    const text = m.text.slice(0, 600);
    if (role === "model" && TEXTOS_DE_ERROR.some((re) => re.test(text))) continue;
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n${text}`;
    else contents.push({ role, parts: [{ text }] });
  }
  while (contents.length && contents[0].role !== "user") contents.shift();

  if (!contents.length || contents[contents.length - 1].role !== "user") {
    return json({ error: "Mensaje vacío" }, 400);
  }

  const r = await responder(contents);
  if (r.ok) return json({ reply: r.texto });

  const reply =
    r.estado === 429
      ? "Ahora mismo hay mucha gente preguntando 😅 Dame un minuto y vuelve a probar, o pregunta en barra."
      : "Uy, se me ha ido el santo al cielo ☕ ¿Me lo repites? Si sigue fallando, en barra te ayudan encantados.";
  return json({ reply });
}

/**
 * Diagnóstico: https://TU-WEB/api/chat?diagnostico=1
 * Dice si la clave está configurada y qué responde Google con cada modelo (sin mostrar la clave).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!url.searchParams.has("diagnostico")) {
    return new Response(JSON.stringify({ error: "Método no permitido. Usa ?diagnostico=1 para comprobar el chat." }), {
      status: 405,
      headers: { Allow: "POST", "Content-Type": "application/json" },
    });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return json({ clave_configurada: false, solucion: "Añade GEMINI_API_KEY en Vercel → Settings → Environment Variables (Production) y haz Redeploy." });
  }
  const prueba: GeminiContent[] = [{ role: "user", parts: [{ text: "Di solo: ok" }] }];
  const resultados: Record<string, unknown> = {};
  for (const modelo of MODELOS) {
    try {
      const r = await llamarGemini(modelo, prueba, "Responde solo 'ok'.");
      const d = await r.json().catch(() => ({}));
      resultados[modelo] = r.ok ? "OK ✅" : { estado_http: r.status, mensaje_de_google: d?.error?.message ?? d };
    } catch (e) {
      resultados[modelo] = { error_de_conexion: String(e) };
    }
  }
  return new Response(JSON.stringify({ clave_configurada: true, clave_empieza_por: key.slice(0, 4) + "…", modelos_en_orden: MODELOS, resultados }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

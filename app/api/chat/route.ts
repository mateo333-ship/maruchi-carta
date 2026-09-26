// Chatbot "Maru" · endpoint POST /api/chat (Next.js App Router)
// La API key NUNCA va en el código: se lee de GEMINI_API_KEY (Vercel → Settings → Environment Variables).
// Opcional: GEMINI_MODEL para forzar un modelo concreto (se prueba el primero).

import { MENU, formatPrice } from "@/data/menu";
import { SITE } from "@/data/site";
import { EXTRA } from "@/data/chat-extra";

export const runtime = "nodejs";
export const maxDuration = 30;

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

/* ───────────────────────── GEMINI: ROTACIÓN AUTOMÁTICA DE MODELOS ─────────────────────────
   En el plan gratuito cada modelo tiene su propio límite (p. ej. 5 preguntas/minuto y 20/día).
   Para que el chat no se quede mudo:
   1. Se pregunta a Google qué modelos de texto hay disponibles para tu clave (se guarda 1 hora).
   2. Las preguntas se reparten por turnos entre los modelos (así se suman sus límites).
   3. Si un modelo se agota (429), se "aparca" el tiempo que diga Google (1 min, o hasta mañana
      si es el límite diario) y se pasa al siguiente al instante. Y así todo el rato.
   Opcional: GEMINI_MODEL en Vercel para que un modelo concreto vaya siempre primero. */

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

// Textos de error del propio chat: no se reenvían a Gemini para no ensuciar la conversación
const TEXTOS_DE_ERROR = [/no he podido responder/i, /mucha gente preguntando/i, /se me ha cortado la conexión/i, /no hay conexión/i, /no puedo responder/i, /santo al cielo/i, /me he quedado sin voz/i];

const API = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta"; // la variable solo se usa para pruebas
const RESERVA = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];
const EXCLUIR = /image|tts|audio|live|embed|robotic|omni|veo|lyria|imagen|computer|native|aqa|learnlm|thinking|deep-research|nano|banana/i;

let catalogo: { modelos: string[]; hasta: number } | null = null;
const aparcado = new Map<string, number>(); // modelo → timestamp hasta el que no se usa
let turno = 0;

/** Prioridad: lite primero (más cuota), luego flash, luego pro, y Gemma como último recurso. */
function peso(m: string) {
  if (/^gemma/.test(m)) return 50;
  if (/flash-lite/.test(m)) return 10;
  if (/flash/.test(m)) return 20;
  if (/pro/.test(m)) return 40;
  return 30;
}

async function listaModelos(): Promise<string[]> {
  if (catalogo && catalogo.hasta > Date.now()) return catalogo.modelos;
  let modelos: string[] = [];
  try {
    const r = await fetch(`${API}/models?pageSize=200`, {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY as string },
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const d = await r.json();
      modelos = (d.models || [])
        .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m: { name: string }) => m.name.replace(/^models\//, ""))
        .filter((n: string) => (/^gemini-/.test(n) || /^gemma-\d+.*-it$/.test(n)) && !EXCLUIR.test(n))
        // Gemma: solo los grandes (los pequeños responden peor)
        .filter((n: string) => !/^gemma/.test(n) || /(12|26|27|31)b/.test(n));
    } else {
      console.error("No se pudo listar modelos:", r.status);
    }
  } catch (e) {
    console.error("No se pudo listar modelos:", e);
  }
  if (!modelos.length) modelos = RESERVA;
  modelos = Array.from(new Set(modelos)).sort((a, b) => peso(a) - peso(b) || b.localeCompare(a, undefined, { numeric: true }));
  if (process.env.GEMINI_MODEL) modelos = [process.env.GEMINI_MODEL, ...modelos.filter((m) => m !== process.env.GEMINI_MODEL)];
  catalogo = { modelos, hasta: Date.now() + 60 * 60 * 1000 };
  return modelos;
}

/** Orden de esta pregunta: se reparte por turnos dentro del grupo principal (flash / flash-lite). */
function ordenParaEstaPregunta(modelos: string[]) {
  const ahora = Date.now();
  const libres = modelos.filter((m) => (aparcado.get(m) ?? 0) <= ahora);
  const principales = libres.filter((m) => peso(m) <= 20);
  const resto = libres.filter((m) => peso(m) > 20);
  turno = (turno + 1) % Math.max(1, principales.length);
  const rotados = [...principales.slice(turno), ...principales.slice(0, turno)];
  const orden = [...rotados, ...resto];
  // si todo está aparcado, prueba igualmente el que antes se libera
  if (!orden.length) return [...modelos].sort((a, b) => (aparcado.get(a) ?? 0) - (aparcado.get(b) ?? 0)).slice(0, 2);
  return orden;
}

/** Cuánto tiempo aparcar un modelo según lo que diga Google. */
function tiempoDeAparcado(estado: number, data: unknown) {
  const txt = JSON.stringify(data ?? "");
  if (estado === 404 || (estado === 400 && /not found|not supported|no longer available|not available/i.test(txt))) return 24 * 3600e3;
  if (estado === 429) {
    if (/per ?day|perday|daily|RequestsPerDay/i.test(txt)) {
      // hasta la medianoche del Pacífico, que es cuando Google reinicia el límite diario
      const ahora = new Date();
      const pacifico = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const falta = (24 - pacifico.getHours()) * 3600e3 - pacifico.getMinutes() * 60e3;
      return Math.max(15 * 60e3, falta);
    }
    const m = txt.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
    return Math.max(10e3, (m ? Number(m[1]) : 60) * 1000);
  }
  if (estado >= 500) return 20e3;
  return 0;
}

async function llamarGemini(modelo: string, contents: GeminiContent[], systemText: string) {
  const esGemma = /^gemma/.test(modelo);
  const generationConfig: Record<string, unknown> = { temperature: 0.8, topP: 0.95, maxOutputTokens: 2048 };
  if (/2\.5-flash/.test(modelo)) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  // Gemma no admite "systemInstruction": las instrucciones van delante del primer mensaje
  const body: Record<string, unknown> = { contents, generationConfig };
  if (esGemma) {
    const copia = contents.map((c) => ({ role: c.role, parts: [{ text: c.parts[0].text }] }));
    copia[0].parts[0].text = `${systemText}\n\n---\nMensaje del cliente:\n${copia[0].parts[0].text}`;
    body.contents = copia;
  } else {
    body.systemInstruction = { parts: [{ text: systemText }] };
  }
  return fetch(`${API}/models/${modelo}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY as string },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
}

/** Recorre los modelos hasta que uno responda. */
async function responder(contents: GeminiContent[]) {
  const systemText = instrucciones();
  const orden = ordenParaEstaPregunta(await listaModelos()).slice(0, 6); // máximo 6 intentos por pregunta
  let hubo429 = false;
  for (const modelo of orden) {
    let r: Response;
    try {
      r = await llamarGemini(modelo, contents, systemText);
    } catch (e) {
      console.error(`Gemini ${modelo}: error de conexión/tiempo`, e);
      aparcado.set(modelo, Date.now() + 20e3);
      continue;
    }
    const data = await r.json().catch(() => ({}));
    if (r.ok) {
      const parts: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts || [];
      const texto = parts
        .filter((p) => !p.thought)
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (texto) return { ok: true as const, texto, modelo };
      console.error(`Gemini ${modelo}: respuesta vacía`, JSON.stringify(data).slice(0, 400));
      continue;
    }
    const txt = JSON.stringify(data).toLowerCase();
    if ((r.status === 400 && txt.includes("api key")) || r.status === 401 || r.status === 403) {
      console.error(`Gemini: clave rechazada (HTTP ${r.status})`, txt.slice(0, 300));
      return { ok: false as const, estado: r.status };
    }
    if (r.status === 429) hubo429 = true;
    const ms = tiempoDeAparcado(r.status, data);
    if (ms) aparcado.set(modelo, Date.now() + ms);
    console.error(`Gemini ${modelo}: HTTP ${r.status} → aparcado ${Math.round(ms / 1000)} s`, txt.slice(0, 300));
  }
  return { ok: false as const, estado: hubo429 ? 429 : 0 };
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
      ? "Ahora mismo estoy desbordado de preguntas 😅 Prueba en un ratito o pregunta en barra, que te ayudan encantados."
      : "Uy, se me ha ido el santo al cielo ☕ ¿Me lo repites? Si sigue fallando, en barra te ayudan encantados.";
  return json({ reply });
}

/**
 * Diagnóstico: https://TU-WEB/api/chat?diagnostico=1  → modelos disponibles y cuáles están aparcados (no gasta cuota)
 *              https://TU-WEB/api/chat?diagnostico=probar → además prueba los 4 primeros (gasta 4 preguntas)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const modo = url.searchParams.get("diagnostico");
  if (modo === null) {
    return new Response(JSON.stringify({ error: "Método no permitido. Usa ?diagnostico=1 para comprobar el chat." }), {
      status: 405,
      headers: { Allow: "POST", "Content-Type": "application/json" },
    });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return json({ clave_configurada: false, solucion: "Añade GEMINI_API_KEY en Vercel → Settings → Environment Variables (Production) y haz Redeploy." });
  }
  catalogo = null; // refresca la lista
  const modelos = await listaModelos();
  const ahora = Date.now();
  const estado = Object.fromEntries(
    modelos.map((m) => {
      const hasta = aparcado.get(m) ?? 0;
      return [m, hasta > ahora ? `aparcado ${Math.round((hasta - ahora) / 60000)} min` : "disponible"];
    }),
  );
  const pruebas: Record<string, unknown> = {};
  if (modo === "probar") {
    const prueba: GeminiContent[] = [{ role: "user", parts: [{ text: "Di solo: ok" }] }];
    for (const m of modelos.slice(0, 4)) {
      try {
        const r = await llamarGemini(m, prueba, "Responde solo 'ok'.");
        const d = await r.json().catch(() => ({}));
        pruebas[m] = r.ok ? "OK ✅" : { estado_http: r.status, mensaje_de_google: d?.error?.message ?? d };
      } catch (e) {
        pruebas[m] = { error_de_conexion: String(e) };
      }
    }
  }
  return new Response(
    JSON.stringify({ clave_configurada: true, clave_empieza_por: key.slice(0, 4) + "…", modelos_en_rotacion: modelos.length, estado, pruebas }, null, 2),
    { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
  );
}

// Chatbot "Maru" · endpoint POST /api/chat
// Adaptación a Next.js (App Router) de api/chat.js del paquete maruchi-chatbot.
// En un proyecto Next.js, Vercel sirve las funciones desde app/api/…/route.ts
// (una carpeta api/ suelta en la raíz no se ejecutaría).
//
// La API key NUNCA va en el código: se lee de la variable de entorno GEMINI_API_KEY (Vercel → Settings → Environment Variables).

import { MENU, formatPrice } from "@/data/menu";
import { SITE } from "@/data/site";

export const runtime = "nodejs";

const MODELO_PRINCIPAL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MODELO_RESERVA = "gemini-2.5-flash";

/**
 * La carta se genera a partir de data/menu.ts, la misma fuente que usa la web.
 * Así los precios del chat y de la web SIEMPRE coinciden: si cambias un precio en la web, el bot lo sabe.
 */
const CARTA = MENU.map((c) => {
  const lineas = c.products.map((p) => {
    const extras = [
      p.season === "summer" ? "solo carta de verano" : p.season === "winter" ? "solo carta de invierno" : "",
      p.tags?.includes("Favorito") ? "FAVORITO de la casa" : "",
    ].filter(Boolean);
    const ingredientes = p.ingredients?.length ? ` Ingredientes: ${p.ingredients.join(", ")}.` : "";
    return `- ${p.name} ${formatPrice(p.price)} — ${p.short}${extras.length ? ` (${extras.join(", ")})` : ""}${ingredientes}`;
  });
  return `${c.title.toUpperCase()} (${c.intro})\n${lineas.join("\n")}`;
}).join("\n\n");

const INSTRUCCIONES = `Eres "Maru", el asistente virtual de Maruchi Coffee & Tea, una cafetería en ${SITE.city} (Barcelona).
Tu trabajo: ayudar a los clientes que están mirando la carta a decidir qué pedir.

DATOS DEL LOCAL
- Nombre: Maruchi Coffee & Tea — ${SITE.city}, Barcelona.
- Instagram: ${SITE.instagramHandle} (para horarios, novedades y cualquier cosa que no sepas).
- Tarjeta de fidelidad digital para acumular sellos: ${SITE.loyaltyUrl} (también está en la web, en "Quédate cerca").
- Si les ha gustado, pueden dejar una reseña en Google desde la web (sección "Quédate cerca").
- Precios con IVA incluido. La carta cambia con la temporada: hay carta de verano y de invierno (se cambia con el botón de sol/copo de la web). Los productos marcados "solo carta de verano/invierno" solo están en esa temporada.

CARTA ACTUAL
${CARTA}

CÓMO RESPONDER
- Responde en el idioma del cliente (español, catalán, inglés, etc.).
- Sé cercano, alegre y BREVE: 1-3 frases normalmente. Nada de párrafos largos. Algún emoji suelto está bien (☕🍵🥑), sin abusar.
- Recomienda con cariño y da siempre el precio cuando nombres un producto. Si piden algo para un presupuesto, suma bien.
- Para recomendar, fíjate en lo que piden (frío/caliente, dulce/salado, sin cafeína, algo ligero...) y sugiere 1-2 opciones concretas. Los favoritos de la casa son los marcados como FAVORITO.
- Usa SOLO la información de arriba. No inventes productos, precios, ingredientes, horarios, dirección exacta, teléfono ni si hay leches vegetales o sin gluten.
- ALÉRGENOS e intolerancias: puedes decir los ingredientes que aparecen en la carta, pero añade siempre que confirmen los alérgenos en barra, porque es lo que indica el local.
- Si preguntan algo que no sabes (horario, reservas, leches vegetales, wifi, etc.), dilo con naturalidad y sugiere preguntar en barra o mirar el Instagram ${SITE.instagramHandle}.
- No puedes tomar pedidos ni cobrar: el pedido se hace en barra.
- Si te preguntan cosas que no tienen nada que ver con la cafetería, reconduce amablemente la conversación hacia la carta.
- No uses formato Markdown complejo (ni tablas ni títulos). Como mucho, guiones para listas cortas y **negrita** para nombres de productos.`;

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

async function llamarGemini(modelo: string, contents: GeminiContent[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY as string,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
    }),
  });
}

const json = (data: unknown, status = 200) => Response.json(data, { status });

/** ¿Google dice que el modelo no existe / no está disponible? (404, o 400 con "not found"/"not supported") */
async function modeloNoDisponible(r: Response) {
  if (r.status === 404) return true;
  if (r.status !== 400) return false;
  try {
    const txt = JSON.stringify(await r.clone().json()).toLowerCase();
    return txt.includes("not found") || txt.includes("not supported") || txt.includes("is not available");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta la variable de entorno GEMINI_API_KEY (Vercel → Settings → Environment Variables) o no se ha hecho redeploy.");
    return json({ error: "Falta la variable GEMINI_API_KEY en Vercel", reply: "Ahora mismo no puedo responder 😅 Pregunta en barra y te ayudan encantados." }, 500);
  }

  let body: { messages?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const mensajes = Array.isArray(body.messages) ? (body.messages as { role?: string; text?: unknown }[]) : [];

  // Limpieza y límites para evitar abusos (y gasto de cuota)
  const contents: GeminiContent[] = mensajes
    .slice(-12)
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .map((m) => ({
      role: m.role === "bot" ? "model" : "user",
      parts: [{ text: (m.text as string).slice(0, 500) }],
    }));

  if (!contents.length || contents[contents.length - 1].role !== "user") {
    return json({ error: "Mensaje vacío" }, 400);
  }

  try {
    let r = await llamarGemini(MODELO_PRINCIPAL, contents);
    if (MODELO_PRINCIPAL !== MODELO_RESERVA && (await modeloNoDisponible(r))) {
      r = await llamarGemini(MODELO_RESERVA, contents); // por si el modelo principal no existe o dejó de existir
    }
    const data = await r.json();

    if (!r.ok) {
      console.error("Error Gemini:", r.status, JSON.stringify(data));
      const msg =
        r.status === 429
          ? "Ahora mismo hay mucha gente preguntando 😅 Prueba en un minuto o pregunta en barra."
          : "Uy, no he podido responder. Pregunta en barra y te ayudan encantados.";
      return json({ reply: msg });
    }

    const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts || [];
    const reply = parts
      .map((p) => p.text || "")
      .join("")
      .trim();

    return json({ reply: reply || "Perdona, no te he entendido bien. ¿Me lo preguntas de otra forma? ☕" });
  } catch (e) {
    console.error(e);
    return json({ reply: "Uy, se me ha cortado la conexión. Inténtalo de nuevo en un momento." });
  }
}

/**
 * Diagnóstico: abre https://TU-WEB/api/chat?diagnostico=1 en el navegador.
 * Dice si la clave está configurada y qué responde Google (sin mostrar nunca la clave).
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
    return json({
      clave_configurada: false,
      solucion: "Añade GEMINI_API_KEY en Vercel → Settings → Environment Variables (Production) y haz Redeploy.",
    });
  }
  const prueba: GeminiContent[] = [{ role: "user", parts: [{ text: "Di solo: ok" }] }];
  const resultados: Record<string, unknown> = {};
  for (const modelo of Array.from(new Set([MODELO_PRINCIPAL, MODELO_RESERVA]))) {
    try {
      const r = await llamarGemini(modelo, prueba);
      const d = await r.json().catch(() => ({}));
      resultados[modelo] = r.ok ? "OK ✅" : { estado_http: r.status, mensaje_de_google: d?.error?.message ?? d };
    } catch (e) {
      resultados[modelo] = { error_de_conexion: String(e) };
    }
  }
  return json({
    clave_configurada: true,
    clave_empieza_por: key.slice(0, 4) + "…", // solo 4 caracteres, para comprobar que es la clave correcta
    modelo_principal: MODELO_PRINCIPAL,
    modelo_reserva: MODELO_RESERVA,
    resultados,
  });
}

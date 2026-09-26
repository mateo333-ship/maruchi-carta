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

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return json({ error: "Falta la variable GEMINI_API_KEY en Vercel" }, 500);
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
    if (r.status === 404 && MODELO_PRINCIPAL !== MODELO_RESERVA) {
      r = await llamarGemini(MODELO_RESERVA, contents); // por si el modelo principal deja de existir
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

// Cualquier otro método → 405, igual que la función original
export function GET() {
  return new Response(JSON.stringify({ error: "Método no permitido" }), {
    status: 405,
    headers: { Allow: "POST", "Content-Type": "application/json" },
  });
}

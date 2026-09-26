# Maruchi · Carta interactiva

Landing/carta interactiva para **Maruchi (Castelldefels)**. Next.js 16 + React Three Fiber + Motion + Tailwind 4.

## Arrancar en local
```bash
npm install
npm run dev   # http://localhost:3000
```

## Subir a Vercel
1. Sube esta carpeta a un repo de GitHub.
2. En vercel.com → *Add New Project* → importa el repo → *Deploy*. No hace falta configurar nada (ni variables de entorno).

## Dónde se edita cada cosa
| Qué | Archivo |
|---|---|
| Productos, precios, descripciones, ingredientes, temporada (verano/invierno) | `data/menu.ts` |
| Nombre, ciudad, coordenadas del tiempo, enlace a Maps, meses de verano | `data/site.ts` |
| Animaciones 3D de cada producto | `components/scene/models.tsx` |
| Colores / tipografías | `app/globals.css` |

Cada producto tiene un campo `visual` que decide su animación 3D:
`cup` (taza que se llena + vapor + latte art), `iced` (vaso por capas + hielo + pajita + guarnición),
`can` (lata que cae girando), `bottle` (botella que se destapa), `beer` (caña que se tira),
`wine` (copa), `toast` (tostada donde caen los ingredientes uno a uno) y `pack` (bebida + acompañamiento en tabla).

## Tiempo en directo
Usa **Open-Meteo** (gratuito, sin API key) con las coordenadas de `data/site.ts`. Se actualiza cada 15 min y recomienda un producto según la temperatura.

## Componentes externos integrados
- Barra de categorías: GooeyNav (rare-ui) → `components/ui/gooey-nav.tsx`
- Buscador: Uiverse (uiverse-astronaut) — atajo ⌘K / Ctrl+K / "/"
- Toggle verano/invierno: Uiverse (mobinkakei)
- Tarjeta del tiempo: Uiverse (vinodjangid07)

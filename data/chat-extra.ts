// ─────────────────────────────────────────────────────────────
//  INFO EXTRA PARA EL CHATBOT "MARU"
//  Datos que no salen en la carta pero ayudan a recomendar:
//  sabor, cafeína, si lleva lácteos, alérgenos habituales y con qué combina.
//  · Los alérgenos son ORIENTATIVOS (lo típico de esa receta). El bot siempre
//    pide confirmarlos en barra.
//  · Edita o amplía lo que quieras; la clave es el id del producto en data/menu.ts.
// ─────────────────────────────────────────────────────────────

export type ExtraInfo = {
  sabor: string;
  cafeina: string; // "alta", "media", "baja", "sin cafeína"…
  lacteos: string;
  alergenos: string;
  combina?: string;
  tambien?: string; // otros nombres o formas de pedirlo
};

export const EXTRA: Record<string, ExtraInfo> = {
  // CAFÉS
  espresso: { sabor: "intenso, cuerpo denso, notas de cacao y fruta madura, sin leche", cafeina: "alta", lacteos: "no lleva", alergenos: "ninguno habitual", combina: "cualquier tostada o un dulce", tambien: "café solo, expreso, espresso" },
  cortado: { sabor: "espresso suavizado con un poco de leche, equilibrado", cafeina: "alta", lacteos: "sí (se puede pedir leche vegetal, preguntar en barra)", alergenos: "leche", combina: "tostada con tomate", tambien: "café cortado, cortao" },
  americano: { sabor: "largo, suave, aromático; ideal para tomar sin prisa", cafeina: "alta", lacteos: "no lleva (se puede añadir leche)", alergenos: "ninguno habitual", combina: "tostada de aguacate", tambien: "café americano, café largo" },
  "cafe-con-leche": { sabor: "cremoso y suave, mitad café mitad leche", cafeina: "media", lacteos: "sí", alergenos: "leche", combina: "El Clásico (pack con tostada)", tambien: "café con leche, cafe leche, con leche" },
  capuccino: { sabor: "espuma alta y sedosa, toque de cacao; menos intenso que un cortado", cafeina: "media", lacteos: "sí", alergenos: "leche", combina: "croissant o dulce (pack El Tommy)", tambien: "cappuccino, capuchino, capu" },
  "flat-white": { sabor: "más café y menos espuma que un latte; sedoso e intenso", cafeina: "alta", lacteos: "sí", alergenos: "leche", combina: "tostada de pesto y burrata", tambien: "flat white, flatwhite" },
  "latte-caramelo": { sabor: "dulce, cremoso, caramelo salado; el más goloso de los cafés", cafeina: "media", lacteos: "sí", alergenos: "leche (el caramelo lleva mantequilla/nata)", combina: "tostada de mantequilla y mermelada si te va lo dulce", tambien: "caramel latte, latte de caramelo, café caramelo" },
  "latte-avellana": { sabor: "tostado, dulce y con canela; muy reconfortante", cafeina: "media", lacteos: "sí", alergenos: "leche; sirope sabor avellana (confirmar frutos secos en barra)", combina: "croissant", tambien: "hazelnut latte, latte avellana" },
  "iced-latte": { sabor: "frío, suave y cremoso, se ven las capas de café y leche", cafeina: "media", lacteos: "sí", alergenos: "leche", combina: "tostada de aguacate", tambien: "latte frío, café con hielo con leche, ice latte" },
  freddo: { sabor: "espresso doble batido con hielo, cremoso, intenso y muy fresco; lo más parecido a un frappé de café", cafeina: "alta", lacteos: "no lleva", alergenos: "ninguno habitual", combina: "algo dulce", tambien: "freddo, frappé, frapé, café frappé, café batido con hielo, café helado" },
  // MATCHA & CHAI
  "matcha-latte": { sabor: "vegetal, suave y ligeramente dulce, sin amargor", cafeina: "media (teína del matcha, energía más suave que el café)", lacteos: "sí (se puede pedir vegetal, preguntar)", alergenos: "leche", combina: "tostada de aguacate o de pesto y burrata", tambien: "matcha, té matcha con leche, macha latte" },
  "iced-matcha": { sabor: "fresco, cremoso y vegetal; capas de leche y matcha que remueves tú", cafeina: "media", lacteos: "sí", alergenos: "leche", combina: "tostada de pesto, burrata y cherry", tambien: "matcha frío, ice matcha, icen macha, iced macha, matcha con hielo" },
  "strawberry-matcha": { sabor: "afrutado y dulce (fresa) con el toque vegetal del matcha; muy fotogénico", cafeina: "media", lacteos: "sí", alergenos: "leche", combina: "algo salado para contrastar", tambien: "matcha fresa, strawberry, matcha con fresa" },
  "chai-latte": { sabor: "especiado (canela, cardamomo, jengibre, clavo), dulce y cálido", cafeina: "baja-media (té negro)", lacteos: "sí", alergenos: "leche", combina: "croissant o dulce", tambien: "chai, té chai, chai tea latte" },
  "dirty-chai": { sabor: "chai especiado con un shot de espresso; lo mejor de los dos mundos", cafeina: "alta", lacteos: "sí", alergenos: "leche", combina: "croissant", tambien: "dirty chai, chai con café" },
  // TÉS
  "english-breakfast": { sabor: "té negro con cuerpo, malteado; admite leche", cafeina: "media", lacteos: "no (leche opcional)", alergenos: "ninguno habitual", combina: "tostada de mantequilla y mermelada", tambien: "té negro, english" },
  "earl-grey": { sabor: "té negro con bergamota, cítrico y elegante", cafeina: "media", lacteos: "no", alergenos: "ninguno habitual", combina: "algo dulce", tambien: "earl grey, té de bergamota" },
  sencha: { sabor: "té verde japonés fresco, herbal", cafeina: "baja-media", lacteos: "no", alergenos: "ninguno habitual", combina: "tostada de salmón o aguacate", tambien: "té verde" },
  "te-helado": { sabor: "té negro frío con limón, refrescante y poco dulce", cafeina: "media", lacteos: "no", alergenos: "ninguno habitual", combina: "cualquier tostada salada", tambien: "té frío, ice tea, iced tea casero" },
  // INFUSIONES
  manzanilla: { sabor: "floral y suave, digestiva", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "camomila" },
  "menta-poleo": { sabor: "mentolado y refrescante, ideal después de comer", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "poleo menta, menta" },
  "frutos-rojos": { sabor: "ácido-dulce, afrutado, color rubí; también está buena fría", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "infusión de frutas, hibisco" },
  "jengibre-limon": { sabor: "picante del jengibre, cítrico y dulce por la miel; perfecta para el catarro", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual (lleva miel)", tambien: "jengibre, infusión de jengibre" },
  // REFRESCOS
  cola: { sabor: "clásico refresco de cola; Original o Zero (sin azúcar)", cafeina: "baja", lacteos: "no", alergenos: "ninguno habitual", tambien: "coca, cocacola, coca cola, coke, zero" },
  fanta: { sabor: "refresco de naranja o limón", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "fanta, fanta limón, fanta naranja" },
  aquarius: { sabor: "bebida isotónica suave, limón o naranja", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "acuarius, isotónica" },
  nestea: { sabor: "té al limón dulce y frío", cafeina: "baja", lacteos: "no", alergenos: "ninguno habitual", tambien: "nestea, té al limón" },
  agua: { sabor: "natural o con gas", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno", tambien: "agua, agua con gas, botella de agua" },
  // ZUMOS
  naranja: { sabor: "naranja recién exprimida, con pulpa, sin azúcar añadido", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", combina: "El Clásico o cualquier tostada", tambien: "zumo de naranja, naranjada natural" },
  "naranja-zanahoria": { sabor: "dulce y fresco con un toque de jengibre", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "zumo zanahoria" },
  verde: { sabor: "fresco y ligero, vegetal y ácido (manzana verde, lima, menta)", cafeina: "sin cafeína", lacteos: "no (vegano)", alergenos: "ninguno habitual", tambien: "zumo detox, green juice" },
  limonada: { sabor: "ácida, dulce y muy refrescante, con hierbabuena", cafeina: "sin cafeína", lacteos: "no", alergenos: "ninguno habitual", tambien: "limonada, lemonade" },
  "smoothie-rojos": { sabor: "espeso, dulce y afrutado; lo más parecido a un batido de la carta", cafeina: "sin cafeína", lacteos: "sí (yogur)", alergenos: "leche", tambien: "batido, smoothie, batido de frutas" },
  // CERVEZAS Y MÁS
  cana: { sabor: "cerveza rubia de barril, fresca", cafeina: "sin cafeína", lacteos: "no", alergenos: "gluten (cebada)", combina: "tostada de tomate y jamón", tambien: "cerveza, caña, birra" },
  "sin-alcohol": { sabor: "cerveza 0,0 en botellín", cafeina: "sin cafeína", lacteos: "no", alergenos: "gluten (cebada)", tambien: "cerveza sin, 0,0, sin alcohol" },
  clara: { sabor: "cerveza con limón, ligera", cafeina: "sin cafeína", lacteos: "no", alergenos: "gluten (cebada)", tambien: "clara con limón" },
  vino: { sabor: "tinto o blanco de la casa, del Penedès", cafeina: "sin cafeína", lacteos: "no", alergenos: "sulfitos", tambien: "copa de vino, vino tinto, vino blanco" },
  "tinto-verano": { sabor: "vino tinto con limón y mucho hielo, refrescante", cafeina: "sin cafeína", lacteos: "no", alergenos: "sulfitos", tambien: "tinto de verano" },
  // PACKS
  "pack-clasico": { sabor: "desayuno de toda la vida: café o té clásico + tostada tradicional", cafeina: "según la bebida", lacteos: "según la bebida", alergenos: "gluten (pan); leche si eliges café con leche o mantequilla", tambien: "el clásico, desayuno, pack desayuno, café y tostada" },
  "pack-salado": { sabor: "bebida clásica + bocadillo, empanada o croissant salado del día; el más contundente", cafeina: "según la bebida", lacteos: "según lo que elijas", alergenos: "gluten; resto según el salado del día (preguntar en barra)", tambien: "el salado, bocadillo, almuerzo" },
  "pack-tommy": { sabor: "especialidad (flat white, latte, matcha o chai) + croissant o dulce de la vitrina", cafeina: "según la bebida", lacteos: "sí normalmente", alergenos: "gluten, leche, huevo (bollería); confirmar en barra", tambien: "el tommy, merienda, café y dulce" },
  // TOSTADAS
  "tostada-tomate": { sabor: "pan de masa madre, tomate, aceite de oliva y sal; sencilla y perfecta", cafeina: "sin cafeína", lacteos: "no (vegana)", alergenos: "gluten", combina: "café con leche o zumo de naranja", tambien: "pan con tomate, pa amb tomàquet, tostada con tomate" },
  "tostada-mantequilla": { sabor: "dulce: mantequilla fundida y mermelada de fresa o melocotón", cafeina: "sin cafeína", lacteos: "sí (mantequilla)", alergenos: "gluten, leche", combina: "café con leche o té", tambien: "tostada dulce, tostada con mermelada" },
  "tostada-burrata": { sabor: "cremosa y fresca: pesto de albahaca, burrata entera y tomate cherry", cafeina: "sin cafeína", lacteos: "sí (burrata)", alergenos: "gluten, leche; el pesto suele llevar frutos secos (piñones) y queso — confirmar en barra", combina: "flat white o iced matcha", tambien: "burrata, tostada de burrata, pesto" },
  "tostada-aguacate": { sabor: "aguacate, queso fresco, semillas, lima y un toque de chili; fresca y saciante", cafeina: "sin cafeína", lacteos: "sí (queso fresco)", alergenos: "gluten, leche, semillas (sésamo posible)", combina: "americano o matcha latte", tambien: "avocado toast, tostada de aguacate, aguacate" },
  "tostada-jamon": { sabor: "la clásica con tomate y lonchas de jamón serrano", cafeina: "sin cafeína", lacteos: "no", alergenos: "gluten", combina: "cortado o caña", tambien: "tostada de jamón, pan con tomate y jamón" },
  "tostada-salmon": { sabor: "queso crema, salmón ahumado, eneldo y pimienta; la más gourmet", cafeina: "sin cafeína", lacteos: "sí (queso crema)", alergenos: "gluten, leche, pescado", combina: "sencha o flat white", tambien: "tostada de salmón, salmón" },
};

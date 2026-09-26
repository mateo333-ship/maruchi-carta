// ─────────────────────────────────────────────────────────────
//  CARTA MARUCHI
//  Todo el contenido de la carta vive en este archivo.
//  · season: "all" (siempre) | "summer" (solo verano) | "winter" (solo invierno)
//  · visual: define la animación 3D del producto (ver components/scene)
//  NOTA: los precios marcados como orientativos deben revisarse con la
//  carta impresa del local antes de publicar.
// ─────────────────────────────────────────────────────────────

export type Season = "all" | "summer" | "winter";

export type Topping =
  | "tomato"
  | "oil"
  | "butter"
  | "jam"
  | "pesto"
  | "burrata"
  | "cherry"
  | "avocado"
  | "cheese"
  | "seeds"
  | "ham"
  | "salmon"
  | "creamcheese";

export type Visual =
  | { kind: "cup"; liquid: string; foam?: string; art?: boolean; glass?: boolean; small?: boolean }
  | { kind: "iced"; layers: string[]; straw?: string; garnish?: "lemon" | "mint" | "berry" | "orange" }
  | { kind: "can"; color: string; accent: string }
  | { kind: "bottle"; glass: string; label: string; liquid?: string }
  | { kind: "beer"; liquid: string; foam: string }
  | { kind: "wine"; liquid: string }
  | { kind: "toast"; toppings: Topping[] }
  | { kind: "pack"; drink: "coffee" | "latte" | "juice"; side: "toast" | "croissant" | "bocadillo"; toppings?: Topping[] };

export type Product = {
  id: string;
  name: string;
  price: number;
  short: string;
  description: string;
  ingredients?: string[];
  tags?: string[];
  season: Season;
  hot?: boolean;
  visual: Visual;
};

export type Category = {
  id: string;
  label: string;
  title: string;
  intro: string;
  products: Product[];
};

const COFFEE = "#3a2012";
const MILK_COFFEE = "#8a5a35";
const FOAM = "#f1e2c8";

export const MENU: Category[] = [
  {
    id: "cafes",
    label: "Cafés",
    title: "Cafés",
    intro: "Grano de especialidad, tueste medio y leche texturizada al momento.",
    products: [
      {
        id: "espresso",
        name: "Espresso",
        price: 1.5,
        short: "Corto, intenso y con crema avellana.",
        description:
          "Extracción de 25 segundos que deja una crema densa color avellana. Notas de cacao y fruta madura; el punto de partida de todo lo demás.",
        ingredients: ["Café de especialidad"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: COFFEE, foam: "#b7773f", small: true },
      },
      {
        id: "cortado",
        name: "Cortado",
        price: 1.7,
        short: "Espresso con una nube de leche.",
        description: "Un espresso al que le añadimos justo un toque de leche caliente para redondear la acidez sin perder cuerpo.",
        ingredients: ["Espresso", "Leche"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#6b3f22", foam: "#d9b88f", small: true, glass: true },
      },
      {
        id: "americano",
        name: "Americano",
        price: 2.0,
        short: "Espresso alargado con agua caliente.",
        description: "Espresso servido sobre agua caliente. Largo, limpio y aromático, para tomar sin prisa.",
        ingredients: ["Espresso", "Agua"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#2b170c", foam: "#6e4122" },
      },
      {
        id: "cafe-con-leche",
        name: "Café con leche",
        price: 2.2,
        short: "El de toda la vida, bien hecho.",
        description: "Espresso y leche vaporizada a partes iguales. Suave, cremoso y perfecto con una tostada.",
        ingredients: ["Espresso", "Leche entera (o vegetal)"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: MILK_COFFEE, foam: FOAM },
      },
      {
        id: "capuccino",
        name: "Capuccino",
        price: 2.8,
        short: "Espuma alta y cacao espolvoreado.",
        description: "Un tercio de espresso, un tercio de leche y un tercio de espuma sedosa, con cacao por encima.",
        ingredients: ["Espresso", "Leche", "Espuma de leche", "Cacao"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: MILK_COFFEE, foam: "#efdcc0", art: true },
      },
      {
        id: "flat-white",
        name: "Flat white",
        price: 2.9,
        short: "Doble ristretto y microespuma fina.",
        description: "Doble ristretto con leche microtexturizada: más café, menos espuma y un latte art que da pena romper.",
        ingredients: ["Doble ristretto", "Leche microtexturizada"],
        tags: ["Caliente", "Especialidad"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#7a4a28", foam: "#ead6b6", art: true },
      },
      {
        id: "latte-caramelo",
        name: "Latte caramelo",
        price: 3.2,
        short: "Latte con caramelo salado de la casa.",
        description: "Nuestro latte con un hilo de caramelo salado casero que se funde en la espuma. El favorito de la barra.",
        ingredients: ["Espresso", "Leche", "Caramelo salado"],
        tags: ["Caliente", "Favorito"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#a0663a", foam: "#f3e1c2", art: true, glass: true },
      },
      {
        id: "latte-avellana",
        name: "Latte de avellana",
        price: 3.4,
        short: "Tostado, dulce y reconfortante.",
        description: "Latte con sirope de avellana tostada y un toque de canela. Nuestro abrazo para los días de frío.",
        ingredients: ["Espresso", "Leche", "Sirope de avellana", "Canela"],
        tags: ["Caliente", "Temporada"],
        season: "winter",
        hot: true,
        visual: { kind: "cup", liquid: "#8b5a33", foam: "#e9d1ad", art: true },
      },
      {
        id: "iced-latte",
        name: "Iced latte",
        price: 3.4,
        short: "Espresso sobre leche fría y hielo.",
        description: "Espresso vertido lentamente sobre leche fría y mucho hielo, para ver cómo se mezclan las capas.",
        ingredients: ["Espresso", "Leche fría", "Hielo"],
        tags: ["Frío"],
        season: "summer",
        visual: { kind: "iced", layers: ["#efe3cf", "#b98452", "#4a2815"], straw: "#2f6b66" },
      },
      {
        id: "freddo",
        name: "Freddo espresso",
        price: 3.0,
        short: "Espresso batido con hielo.",
        description: "Doble espresso batido con hielo hasta conseguir una textura cremosa y fresquísima. Receta griega.",
        ingredients: ["Doble espresso", "Hielo"],
        tags: ["Frío"],
        season: "summer",
        visual: { kind: "iced", layers: ["#4a2815", "#c89664"], straw: "#2a1a12" },
      },
    ],
  },
  {
    id: "matcha",
    label: "Matcha & Chai",
    title: "Matcha & Chai",
    intro: "Matcha ceremonial batido a mano y chai especiado hecho en casa.",
    products: [
      {
        id: "matcha-latte",
        name: "Matcha latte",
        price: 3.9,
        short: "Matcha ceremonial y leche cremosa.",
        description: "Matcha japonés de grado ceremonial batido con chasen y leche texturizada. Vegetal, dulce y sin amargor.",
        ingredients: ["Matcha ceremonial", "Leche (o vegetal)"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#7fa04a", foam: "#cfe0a6", art: true },
      },
      {
        id: "iced-matcha",
        name: "Iced matcha",
        price: 4.2,
        short: "Capas de leche y matcha sobre hielo.",
        description: "Leche fría, hielo y una capa de matcha recién batido flotando encima. Remuévelo tú.",
        ingredients: ["Matcha ceremonial", "Leche fría", "Hielo"],
        tags: ["Frío", "Favorito"],
        season: "summer",
        visual: { kind: "iced", layers: ["#f1ead8", "#b8cf7a", "#6f9a3a"], straw: "#2f6b66" },
      },
      {
        id: "strawberry-matcha",
        name: "Strawberry matcha",
        price: 4.5,
        short: "Fresa natural, leche y matcha.",
        description: "Base de fresa triturada, leche fría y matcha por encima. Tres colores, un vaso muy fotogénico.",
        ingredients: ["Fresa natural", "Leche", "Matcha", "Hielo"],
        tags: ["Frío", "Temporada"],
        season: "summer",
        visual: { kind: "iced", layers: ["#d9485b", "#f3e7dc", "#7ba444"], straw: "#d9485b", garnish: "berry" },
      },
      {
        id: "chai-latte",
        name: "Chai latte",
        price: 3.6,
        short: "Té negro, especias y leche.",
        description: "Té negro infusionado con canela, cardamomo, jengibre, clavo y pimienta, terminado con leche espumada.",
        ingredients: ["Té negro", "Canela", "Cardamomo", "Jengibre", "Clavo", "Leche"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#b07a4a", foam: "#ecd6b4", art: true },
      },
      {
        id: "dirty-chai",
        name: "Dirty chai",
        price: 4.0,
        short: "Chai latte con un shot de espresso.",
        description: "Nuestro chai latte con un shot de espresso: especias y café en la misma taza.",
        ingredients: ["Chai", "Espresso", "Leche"],
        tags: ["Caliente", "Especialidad"],
        season: "winter",
        hot: true,
        visual: { kind: "cup", liquid: "#8a5530", foam: "#e3c79f", art: true, glass: true },
      },
    ],
  },
  {
    id: "tes",
    label: "Tés",
    title: "Tés",
    intro: "Hoja entera, infusionada al tiempo justo.",
    products: [
      {
        id: "english-breakfast",
        name: "English breakfast",
        price: 2.2,
        short: "Té negro con cuerpo.",
        description: "Blend de tés negros de Assam y Ceilán. Con cuerpo y malteado; admite leche.",
        ingredients: ["Té negro Assam", "Té negro Ceilán"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#7a3514", glass: true },
      },
      {
        id: "earl-grey",
        name: "Earl grey",
        price: 2.2,
        short: "Negro con bergamota.",
        description: "Té negro aromatizado con aceite de bergamota. Cítrico, elegante y muy clásico.",
        ingredients: ["Té negro", "Bergamota"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#8c4a1c", glass: true },
      },
      {
        id: "sencha",
        name: "Sencha",
        price: 2.2,
        short: "Té verde japonés.",
        description: "Té verde japonés al vapor: fresco, herbal y ligeramente yodado.",
        ingredients: ["Té verde sencha"],
        tags: ["Caliente"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#b9b24a", glass: true },
      },
      {
        id: "te-helado",
        name: "Té helado de la casa",
        price: 3.2,
        short: "Té negro, limón y hielo.",
        description: "Té negro infusionado en frío durante la noche, con limón fresco y un punto de azúcar de caña.",
        ingredients: ["Té negro", "Limón", "Azúcar de caña", "Hielo"],
        tags: ["Frío"],
        season: "summer",
        visual: { kind: "iced", layers: ["#a8531f", "#c0692a"], straw: "#e8c547", garnish: "lemon" },
      },
    ],
  },
  {
    id: "infusiones",
    label: "Infusiones",
    title: "Infusiones",
    intro: "Sin teína, para cualquier hora.",
    products: [
      {
        id: "manzanilla",
        name: "Manzanilla",
        price: 2.0,
        short: "Flor de manzanilla entera.",
        description: "Flores enteras de manzanilla. Suave, floral y digestiva.",
        ingredients: ["Flor de manzanilla"],
        tags: ["Caliente", "Sin teína"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#d9b64a", glass: true },
      },
      {
        id: "menta-poleo",
        name: "Menta poleo",
        price: 2.0,
        short: "Fresca y reconfortante.",
        description: "Hojas de menta poleo. Refrescante en boca y perfecta después de comer.",
        ingredients: ["Menta poleo"],
        tags: ["Caliente", "Sin teína"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#a5a33f", glass: true },
      },
      {
        id: "frutos-rojos",
        name: "Frutos rojos",
        price: 2.2,
        short: "Hibisco, fresa y frambuesa.",
        description: "Infusión de hibisco, escaramujo, fresa y frambuesa deshidratadas. Color rubí y sabor ácido-dulce.",
        ingredients: ["Hibisco", "Escaramujo", "Fresa", "Frambuesa"],
        tags: ["Caliente", "Sin teína"],
        season: "all",
        hot: true,
        visual: { kind: "cup", liquid: "#8e1c2c", glass: true },
      },
      {
        id: "jengibre-limon",
        name: "Jengibre, limón y miel",
        price: 2.4,
        short: "Jengibre fresco, limón y miel.",
        description: "Jengibre fresco en rodajas, limón exprimido y una cucharada de miel. Para los días de catarro.",
        ingredients: ["Jengibre fresco", "Limón", "Miel"],
        tags: ["Caliente", "Temporada"],
        season: "winter",
        hot: true,
        visual: { kind: "cup", liquid: "#e0a93a", glass: true },
      },
    ],
  },
  {
    id: "refrescos",
    label: "Refrescos",
    title: "Refrescos",
    intro: "Bien fríos, con hielo y limón si quieres.",
    products: [
      {
        id: "cola",
        name: "Coca-Cola",
        price: 2.5,
        short: "Original o Zero.",
        description: "Lata de 33 cl servida con vaso, hielo y rodaja de limón. Original o Zero.",
        tags: ["Frío"],
        season: "all",
        visual: { kind: "can", color: "#c1121f", accent: "#f4efe6" },
      },
      {
        id: "fanta",
        name: "Fanta naranja",
        price: 2.5,
        short: "Naranja o limón.",
        description: "Lata de 33 cl. De naranja o de limón, con hielo.",
        tags: ["Frío"],
        season: "all",
        visual: { kind: "can", color: "#f07b12", accent: "#1d4fa0" },
      },
      {
        id: "aquarius",
        name: "Aquarius",
        price: 2.6,
        short: "Limón o naranja.",
        description: "Bebida isotónica en lata de 33 cl, de limón o naranja.",
        tags: ["Frío"],
        season: "all",
        visual: { kind: "can", color: "#e9ecef", accent: "#1f6fb2" },
      },
      {
        id: "nestea",
        name: "Nestea",
        price: 2.6,
        short: "Té al limón.",
        description: "Té negro al limón, en lata de 33 cl.",
        tags: ["Frío"],
        season: "all",
        visual: { kind: "can", color: "#e8b21c", accent: "#2a1a12" },
      },
      {
        id: "agua",
        name: "Agua mineral",
        price: 1.8,
        short: "Natural o con gas.",
        description: "Botella de 50 cl, natural o con gas.",
        tags: ["Frío"],
        season: "all",
        visual: { kind: "bottle", glass: "#cfe6ee", label: "#2f6b66", liquid: "#e6f3f7" },
      },
    ],
  },
  {
    id: "zumos",
    label: "Zumos",
    title: "Zumos",
    intro: "Exprimidos al momento. Nada de brick.",
    products: [
      {
        id: "naranja",
        name: "Zumo de naranja natural",
        price: 3.5,
        short: "Naranjas exprimidas al momento.",
        description: "Naranjas valencianas exprimidas en el momento. Con pulpa, sin azúcar añadido.",
        ingredients: ["Naranja natural"],
        tags: ["Frío", "Natural"],
        season: "all",
        visual: { kind: "iced", layers: ["#f39a1c", "#f7b23b"], garnish: "orange" },
      },
      {
        id: "naranja-zanahoria",
        name: "Naranja y zanahoria",
        price: 3.9,
        short: "Vitamina en vaso.",
        description: "Naranja y zanahoria recién exprimidas con un toque de jengibre.",
        ingredients: ["Naranja", "Zanahoria", "Jengibre"],
        tags: ["Frío", "Natural"],
        season: "all",
        visual: { kind: "iced", layers: ["#e8601c", "#f08a24"], garnish: "orange" },
      },
      {
        id: "verde",
        name: "Zumo verde",
        price: 4.2,
        short: "Manzana, espinaca, pepino y lima.",
        description: "Manzana verde, espinaca, pepino, lima y menta. Fresco y ligero.",
        ingredients: ["Manzana verde", "Espinaca", "Pepino", "Lima", "Menta"],
        tags: ["Frío", "Vegano"],
        season: "all",
        visual: { kind: "iced", layers: ["#6f9a2e", "#8db53c"], garnish: "mint" },
      },
      {
        id: "limonada",
        name: "Limonada casera",
        price: 3.5,
        short: "Limón, menta y hielo picado.",
        description: "Limón exprimido, hierbabuena fresca, azúcar de caña y hielo picado.",
        ingredients: ["Limón", "Hierbabuena", "Azúcar de caña", "Hielo"],
        tags: ["Frío"],
        season: "summer",
        visual: { kind: "iced", layers: ["#f3ec9a", "#f7f2c0"], straw: "#e8c547", garnish: "lemon" },
      },
      {
        id: "smoothie-rojos",
        name: "Smoothie de frutos rojos",
        price: 4.5,
        short: "Fresa, frambuesa, plátano y yogur.",
        description: "Batido espeso de fresa, frambuesa, arándano, plátano y yogur natural.",
        ingredients: ["Fresa", "Frambuesa", "Arándano", "Plátano", "Yogur"],
        tags: ["Frío"],
        season: "summer",
        visual: { kind: "iced", layers: ["#b0223f", "#c93a57"], straw: "#f3e7dc", garnish: "berry" },
      },
    ],
  },
  {
    id: "cervezas",
    label: "Cervezas y más",
    title: "Cervezas y más",
    intro: "Para el vermut o para alargar la sobremesa.",
    products: [
      {
        id: "cana",
        name: "Caña",
        price: 2.5,
        short: "Cerveza de barril bien tirada.",
        description: "Cerveza rubia de barril, tirada en dos tiempos con dos dedos de espuma.",
        ingredients: ["Cerveza lager"],
        tags: ["Frío"],
        season: "all",
        visual: { kind: "beer", liquid: "#e3a32b", foam: "#fbf4e3" },
      },
      {
        id: "sin-alcohol",
        name: "Cerveza sin alcohol",
        price: 2.8,
        short: "0,0 en botellín.",
        description: "Botellín de cerveza 0,0 servido con vaso frío.",
        tags: ["Frío", "Sin alcohol"],
        season: "all",
        visual: { kind: "bottle", glass: "#5b3a12", label: "#1f4f8c", liquid: "#e3a32b" },
      },
      {
        id: "clara",
        name: "Clara",
        price: 2.6,
        short: "Cerveza con limón.",
        description: "Caña con gaseosa de limón, ligera y refrescante.",
        ingredients: ["Cerveza", "Limón"],
        tags: ["Frío"],
        season: "all",
        visual: { kind: "beer", liquid: "#eec35a", foam: "#fbf6e8" },
      },
      {
        id: "vino",
        name: "Copa de vino",
        price: 3.2,
        short: "Tinto o blanco de la casa.",
        description: "Copa de vino tinto o blanco de bodegas del Penedès.",
        tags: [],
        season: "all",
        visual: { kind: "wine", liquid: "#6d0f22" },
      },
      {
        id: "tinto-verano",
        name: "Tinto de verano",
        price: 3.5,
        short: "Vino tinto, limón y mucho hielo.",
        description: "Vino tinto con gaseosa de limón, hielo y una rodaja de limón. Terraza obligatoria.",
        ingredients: ["Vino tinto", "Gaseosa de limón", "Hielo"],
        tags: ["Frío", "Temporada"],
        season: "summer",
        visual: { kind: "iced", layers: ["#7a1426", "#8f1d30"], garnish: "lemon" },
      },
    ],
  },
  {
    id: "packs",
    label: "Los Packs",
    title: "Los Packs",
    intro: "Sin horarios. Desayuno o merienda, cuando te apetezca.",
    products: [
      {
        id: "pack-clasico",
        name: "El Clásico",
        price: 3.9,
        short: "Café o té + tostada tradicional.",
        description:
          "Café o té clásico a elegir (espresso, cortado, americano, café con leche o té) acompañado de una tostada tradicional: con tomate o con mantequilla y mermelada.",
        ingredients: ["Café o té a elegir", "Tostada tradicional a elegir"],
        tags: ["Pack", "Favorito"],
        season: "all",
        visual: { kind: "pack", drink: "coffee", side: "toast", toppings: ["tomato", "oil"] },
      },
      {
        id: "pack-salado",
        name: "El Salado",
        price: 6.5,
        short: "Bebida + bocadillo, empanada o croissant salado.",
        description:
          "Bebida clásica a elegir con un bocadillo, una empanada o un croissant salado del día. Para cuando el hambre aprieta.",
        ingredients: ["Bebida clásica a elegir", "Bocadillo, empanada o croissant salado"],
        tags: ["Pack"],
        season: "all",
        visual: { kind: "pack", drink: "latte", side: "bocadillo" },
      },
      {
        id: "pack-tommy",
        name: "El Tommy",
        price: 5.9,
        short: "Especialidad + dulce a elegir.",
        description:
          "Una especialidad a elegir (flat white, latte, matcha o chai) con un croissant o dulce de la vitrina.",
        ingredients: ["Especialidad a elegir", "Croissant o dulce del día"],
        tags: ["Pack"],
        season: "all",
        visual: { kind: "pack", drink: "latte", side: "croissant" },
      },
    ],
  },
  {
    id: "tostadas",
    label: "Tostadas",
    title: "Las Tostadas",
    intro: "Pan de masa madre tostado a la plancha. Media o entera.",
    products: [
      {
        id: "tostada-tomate",
        name: "Clásica con tomate",
        price: 3.2,
        short: "Tomate rallado, AOVE y sal.",
        description: "Pan de masa madre, tomate rallado, aceite de oliva virgen extra y escamas de sal. Añade jamón por +1,50 €.",
        ingredients: ["Pan de masa madre", "Tomate rallado", "AOVE", "Sal en escamas"],
        tags: ["Vegano"],
        season: "all",
        visual: { kind: "toast", toppings: ["tomato", "oil"] },
      },
      {
        id: "tostada-mantequilla",
        name: "Mantequilla y mermelada",
        price: 3.2,
        short: "Mantequilla y mermelada a elegir.",
        description: "Pan tostado con mantequilla fundida y mermelada de fresa o melocotón.",
        ingredients: ["Pan de masa madre", "Mantequilla", "Mermelada a elegir"],
        tags: ["Dulce"],
        season: "all",
        visual: { kind: "toast", toppings: ["butter", "jam"] },
      },
      {
        id: "tostada-burrata",
        name: "Pesto, burrata y cherry",
        price: 5.5,
        short: "Pesto de albahaca, burrata y cherry.",
        description: "Base de pesto de albahaca, burrata cremosa entera, tomates cherry y un hilo de AOVE.",
        ingredients: ["Pan de masa madre", "Pesto de albahaca", "Burrata", "Tomate cherry", "AOVE"],
        tags: ["Vegetariana", "Favorito"],
        season: "all",
        visual: { kind: "toast", toppings: ["pesto", "burrata", "cherry"] },
      },
      {
        id: "tostada-aguacate",
        name: "Aguacate y queso",
        price: 5.9,
        short: "Aguacate, queso fresco y semillas.",
        description: "Aguacate laminado, queso fresco, semillas tostadas, lima y un toque de chili.",
        ingredients: ["Pan de masa madre", "Aguacate", "Queso fresco", "Semillas", "Lima", "Chili"],
        tags: ["Vegetariana"],
        season: "all",
        visual: { kind: "toast", toppings: ["avocado", "cheese", "seeds"] },
      },
      {
        id: "tostada-jamon",
        name: "Tomate y jamón",
        price: 4.7,
        short: "Tomate rallado y jamón serrano.",
        description: "Nuestra clásica con tomate coronada con lonchas finas de jamón serrano.",
        ingredients: ["Pan de masa madre", "Tomate", "AOVE", "Jamón serrano"],
        season: "all",
        visual: { kind: "toast", toppings: ["tomato", "ham"] },
      },
      {
        id: "tostada-salmon",
        name: "Salmón y queso crema",
        price: 6.5,
        short: "Salmón ahumado, queso crema y eneldo.",
        description: "Queso crema batido, salmón ahumado, eneldo fresco y pimienta negra.",
        ingredients: ["Pan de masa madre", "Queso crema", "Salmón ahumado", "Eneldo"],
        season: "winter",
        visual: { kind: "toast", toppings: ["creamcheese", "salmon", "seeds"] },
      },
    ],
  },
];

export const ALL_PRODUCTS = MENU.flatMap((c) => c.products.map((p) => ({ ...p, category: c.id })));

export const formatPrice = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

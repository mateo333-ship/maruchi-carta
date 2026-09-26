"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

export type WeatherData = {
  temp: number;
  max: number;
  min: number;
  code: number;
  isDay: boolean;
};

const CODES: Record<number, string> = {
  0: "Despejado",
  1: "Casi despejado",
  2: "Parcialmente nuboso",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla helada",
  51: "Llovizna débil",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia débil",
  63: "Lluvia",
  65: "Lluvia fuerte",
  71: "Nieve débil",
  73: "Nieve",
  75: "Nieve fuerte",
  80: "Chubascos",
  81: "Chubascos",
  82: "Chubascos fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta con granizo",
};

export const describeWeather = (code: number) => CODES[code] ?? "Variable";

/** Tiempo real en la ubicación del local vía Open-Meteo (gratis, sin API key). */
export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${SITE.lat}&longitude=${SITE.lon}` +
          `&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min` +
          `&timezone=Europe%2FMadrid&forecast_days=1`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("weather");
        const j = await res.json();
        if (!alive) return;
        setData({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          isDay: j.current.is_day === 1,
          max: Math.round(j.daily.temperature_2m_max[0]),
          min: Math.round(j.daily.temperature_2m_min[0]),
        });
        setError(false);
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { data, error };
}

function WeatherIcon({ code, isDay }: { code: number; isDay: boolean }) {
  const rain = code >= 51 && code <= 82;
  const cloud = code >= 2;
  const storm = code >= 95;
  return (
    <svg width="46" height="46" viewBox="0 0 64 64" fill="none" aria-hidden>
      {!cloud &&
        (isDay ? (
          <g>
            <circle cx="32" cy="32" r="12" fill="#f5c16c" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={32 + Math.cos(a) * 18}
                  y1={32 + Math.sin(a) * 18}
                  x2={32 + Math.cos(a) * 24}
                  y2={32 + Math.sin(a) * 24}
                  stroke="#f5c16c"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ) : (
          <path d="M40 14a18 18 0 1 0 10 30A20 20 0 0 1 40 14Z" fill="#f3e2c0" />
        ))}
      {cloud && (
        <g>
          {isDay && code <= 3 && <circle cx="22" cy="24" r="10" fill="#f5c16c" />}
          <path d="M20 46h26a10 10 0 0 0 0-20 14 14 0 0 0-27 3A8.5 8.5 0 0 0 20 46Z" fill="#efe3d0" />
        </g>
      )}
      {rain && (
        <g stroke="#9fd0e0" strokeWidth="3" strokeLinecap="round">
          <line x1="24" y1="52" x2="21" y2="59" />
          <line x1="34" y1="52" x2="31" y2="59" />
          <line x1="44" y1="52" x2="41" y2="59" />
        </g>
      )}
      {storm && <path d="M34 46l-6 9h6l-3 7 9-11h-6l3-5Z" fill="#f5c16c" />}
    </svg>
  );
}

export function WeatherCard({ data, error, onClick, hint }: { data: WeatherData | null; error: boolean; onClick?: () => void; hint?: string }) {
  return (
    <div className="cardContainer">
      <button type="button" className="weather-card" onClick={onClick} aria-label="Tiempo ahora en el local">
        <p className="city">{SITE.city.toUpperCase()}</p>
        {data ? (
          <>
            <WeatherIcon code={data.code} isDay={data.isDay} />
            <p className="weather">{describeWeather(data.code).toUpperCase()}</p>
            <p className="temp">{data.temp}°</p>
            <div className="minmaxContainer">
              <div className="min">
                <p className="minHeading">Mín</p>
                <p className="minTemp">{data.min}°</p>
              </div>
              <div className="max">
                <p className="maxHeading">Máx</p>
                <p className="maxTemp">{data.max}°</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[#d6c8ba]">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <span className="text-[11px] tracking-widest">{error ? "SIN CONEXIÓN" : "CARGANDO…"}</span>
          </div>
        )}
        {hint && <span className="sr-only">{hint}</span>}
      </button>
    </div>
  );
}

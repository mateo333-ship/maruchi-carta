"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOutBack = (x: number) => {
  const t = clamp01(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutBounce = (x: number) => {
  let t = clamp01(x);
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
/** progreso 0..1 de un tramo [start, start+dur] */
export const seg = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

/**
 * Llama a `fn(t)` cada frame con los segundos transcurridos desde que el
 * componente se montó. Toda la coreografía de las animaciones sale de aquí.
 */
export function useTimeline(fn: (t: number, state: { clock: THREE.Clock }) => void) {
  const start = useRef<number | null>(null);
  useFrame((state) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    fn(state.clock.elapsedTime - start.current, state);
  });
}

/** Perfil de revolución a partir de pares [radio, altura] */
export const lathe = (pts: [number, number][], segments = 64) =>
  new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );

/** Mancha irregular (salsas, tomate, mermelada...) */
export function blobShape(radius: number, seed = 1, wobble = 0.18, points = 28) {
  const shape = new THREE.Shape();
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const offsets = Array.from({ length: points }, () => 1 - wobble / 2 + rnd() * wobble);
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = radius * offsets[i % points] * (1 + 0.12 * Math.sin(a * 2));
    const x = Math.cos(a) * r * 1.05;
    const y = Math.sin(a) * r * 0.9;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

/** Textura radial suave para el vapor */
export function makeSoftTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,0.9)");
  grd.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Miga tostada con marcas de plancha */
export function makeToastTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(256, 256, 40, 256, 256, 300);
  grd.addColorStop(0, "#f0cf8e");
  grd.addColorStop(0.7, "#dca45a");
  grd.addColorStop(1, "#b8752f");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  // alveolos de la miga
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 5 + 1;
    g.fillStyle = `rgba(${120 + Math.random() * 40},${70 + Math.random() * 30},20,${0.12 + Math.random() * 0.2})`;
    g.beginPath();
    g.ellipse(x, y, r, r * (0.5 + Math.random()), Math.random() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // marcas de plancha
  g.strokeStyle = "rgba(90,45,15,0.45)";
  g.lineWidth = 16;
  g.lineCap = "round";
  for (let i = -3; i < 6; i++) {
    g.beginPath();
    g.moveTo(i * 110 - 60, 0);
    g.lineTo(i * 110 + 300, 512);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Tira ondulada (jamón, salmón) */
export function wavyRibbon(w = 0.9, h = 0.28, waves = 2.5, amp = 0.06) {
  const geo = new THREE.PlaneGeometry(w, h, 48, 6);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin((x / w) * Math.PI * 2 * waves) * amp + Math.sin(y * 8) * 0.01);
  }
  geo.computeVertexNormals();
  return geo;
}

export function makeStripeTexture(base: string, stripe: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 64);
  g.strokeStyle = stripe;
  g.lineWidth = 4;
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    g.moveTo(i * 22, 0);
    g.bezierCurveTo(i * 22 + 10, 20, i * 22 - 6, 44, i * 22 + 8, 64);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

"use client";

import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { Topping, Visual } from "@/data/menu";
import {
  blobShape,
  easeInOut,
  easeOutBack,
  easeOutBounce,
  easeOutCubic,
  lathe,
  makeSoftTexture,
  makeStripeTexture,
  makeToastTexture,
  seg,
  useTimeline,
  wavyRibbon,
} from "./helpers";

/* ───────────────────────── materiales ───────────────────────── */

const Glass = ({ tint = "#ffffff", opacity = 0.2 }: { tint?: string; opacity?: number }) => (
  <meshPhysicalMaterial
    color={tint}
    transparent
    opacity={opacity}
    roughness={0.03}
    metalness={0}
    clearcoat={1}
    clearcoatRoughness={0.04}
    envMapIntensity={2.2}
    side={THREE.DoubleSide}
    depthWrite={false}
  />
);

const Ceramic = ({ color = "#f6efe4" }: { color?: string }) => (
  <meshPhysicalMaterial color={color} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.2} envMapIntensity={1.1} />
);

const Liquid = ({ color, gloss = 0.08 }: { color: string; gloss?: number }) => (
  <meshPhysicalMaterial color={color} roughness={gloss} clearcoat={0.6} envMapIntensity={1.2} />
);

/* ───────────────────────── piezas comunes ───────────────────────── */

export function Steam({ y, delay, spread = 0.3, count = 7 }: { y: number; delay: number; spread?: number; count?: number }) {
  const tex = useMemo(() => makeSoftTexture(), []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useTimeline((t) => {
    const appear = seg(t, delay, 1.2);
    refs.current.forEach((s, i) => {
      if (!s) return;
      const p = (t * 0.28 + i / count) % 1;
      s.position.set(Math.sin(p * 5 + i * 1.7) * spread * p, y + p * 1.5, Math.cos(p * 4 + i) * spread * 0.5 * p);
      const sc = 0.25 + p * 0.75;
      s.scale.set(sc, sc, sc);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin(p * Math.PI) * 0.32 * appear;
    });
  });
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el; }}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} color="#ffffff" />
        </sprite>
      ))}
    </group>
  );
}

function Droplets({ radiusAt, yMin, yMax, delay, count = 40 }: { radiusAt: (y: number) => number; yMin: number; yMax: number; delay: number; count?: number }) {
  const ref = useRef<THREE.Group>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const y = yMin + Math.random() * (yMax - yMin);
        const a = Math.random() * Math.PI * 2;
        const r = radiusAt(y) + 0.012;
        return { pos: [Math.cos(a) * r, y, Math.sin(a) * r] as [number, number, number], s: 0.012 + Math.random() * 0.022, d: Math.random() };
      }),
    [count, radiusAt, yMin, yMax],
  );
  useTimeline((t) => {
    ref.current?.children.forEach((c, i) => {
      const k = easeOutCubic(seg(t, delay + drops[i].d * 1.5, 0.6));
      c.scale.setScalar(k);
    });
  });
  return (
    <group ref={ref}>
      {drops.map((d, i) => (
        <mesh key={i} position={d.pos} scale={0}>
          <sphereGeometry args={[d.s, 8, 8]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.5} roughness={0} clearcoat={1} envMapIntensity={3} />
        </mesh>
      ))}
    </group>
  );
}

function Saucer() {
  const geo = useMemo(
    () => lathe([[0, 0], [0.95, 0], [1.22, 0.1], [1.25, 0.14], [1.2, 0.15], [0.98, 0.07], [0.62, 0.06], [0, 0.06]]),
    [],
  );
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <Ceramic />
    </mesh>
  );
}

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.3);
  s.bezierCurveTo(-0.05, -0.2, -0.35, -0.05, -0.33, 0.13);
  s.bezierCurveTo(-0.31, 0.3, -0.08, 0.32, 0, 0.16);
  s.bezierCurveTo(0.08, 0.32, 0.31, 0.3, 0.33, 0.13);
  s.bezierCurveTo(0.35, -0.05, 0.05, -0.2, 0, -0.3);
  return s;
}

/* ───────────────────────── TAZA ───────────────────────── */

export function Cup({ v, delay = 0, saucer = true }: { v: Extract<Visual, { kind: "cup" }>; delay?: number; saucer?: boolean }) {
  const cupRef = useRef<THREE.Group>(null);
  const saucerRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);
  const artRef = useRef<THREE.Mesh>(null);

  const body = useMemo(
    () =>
      lathe([
        [0, 0], [0.5, 0], [0.6, 0.04], [0.66, 0.2], [0.72, 0.6], [0.76, 1.0], [0.775, 1.06],
        [0.745, 1.085], [0.71, 1.04], [0.67, 0.6], [0.62, 0.22], [0.54, 0.12], [0, 0.12],
      ]),
    [],
  );
  const liquidGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.695, 0.55, 0.84, 48);
    g.translate(0, 0.42, 0);
    return g;
  }, []);
  const heart = useMemo(() => new THREE.ShapeGeometry(heartShape(), 24), []);

  const topColor = useMemo(() => {
    if (!v.foam) return v.liquid;
    if (!v.art) return v.foam;
    return "#" + new THREE.Color(v.liquid).lerp(new THREE.Color("#f3e2c6"), 0.28).getHexString();
  }, [v]);

  useTimeline((t0) => {
    const t = t0 - delay;
    if (saucerRef.current) saucerRef.current.scale.setScalar(Math.max(0.0001, easeOutBack(seg(t, 0, 0.5))));
    if (cupRef.current) {
      const d = easeOutBounce(seg(t, 0.15, 0.85));
      cupRef.current.position.y = (saucer ? 0.06 : 0) + (1 - d) * 2.2;
      cupRef.current.visible = t > 0.15;
    }
    const fill = easeInOut(seg(t, 0.9, 1.3));
    if (liquidRef.current) {
      liquidRef.current.scale.y = Math.max(0.001, fill);
      liquidRef.current.visible = fill > 0.001;
    }
    if (foamRef.current) {
      const f = easeOutBack(seg(t, 2.0, 0.5));
      foamRef.current.scale.set(Math.max(0.001, f), Math.max(0.001, f), Math.max(0.001, f));
      foamRef.current.visible = f > 0.001;
    }
    if (artRef.current) {
      const a = easeOutCubic(seg(t, 2.35, 0.9));
      artRef.current.scale.setScalar(Math.max(0.001, a));
      artRef.current.rotation.z = (1 - a) * 1.2;
      artRef.current.visible = a > 0.001;
    }
  });

  const s = v.small ? 0.72 : 1;
  return (
    <group>
      {saucer && (
        <group ref={saucerRef} scale={0.0001}>
          <group scale={v.small ? 0.8 : 1}>
            <Saucer />
          </group>
        </group>
      )}
      <group ref={cupRef} visible={false}>
        <group scale={s}>
          <mesh geometry={body} castShadow receiveShadow>
            {v.glass ? <Glass opacity={0.22} /> : <Ceramic />}
          </mesh>
          {/* asa */}
          <mesh position={[0.78, 0.58, 0]} rotation={[0, 0, -Math.PI * 0.6]} castShadow>
            <torusGeometry args={[0.24, 0.055, 16, 48, Math.PI * 1.2]} />
            {v.glass ? <Glass opacity={0.3} /> : <Ceramic />}
          </mesh>
          {/* bebida */}
          <mesh ref={liquidRef} geometry={liquidGeo} position={[0, 0.12, 0]} visible={false}>
            <Liquid color={v.liquid} />
          </mesh>
          {v.foam && (
            <mesh ref={foamRef} position={[0, 0.965, 0]} visible={false}>
              <cylinderGeometry args={[0.698, 0.69, 0.04, 48]} />
              <meshPhysicalMaterial color={topColor} roughness={0.55} clearcoat={0.3} />
            </mesh>
          )}
          {v.art && v.foam && (
            <mesh ref={artRef} geometry={heart} position={[0, 0.987, 0.05]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
              <meshStandardMaterial color={v.foam} roughness={0.6} />
            </mesh>
          )}
        </group>
        {/* el vapor lo pone ProductModel si la bebida es caliente */}
      </group>
    </group>
  );
}

/* ───────────────────────── VASO CON HIELO ───────────────────────── */

const ICED_R = (y: number) => 0.51 + ((0.63 - 0.51) * (y - 0.1)) / 2.1;
const ICED_OUTER = (y: number) => 0.54 + (0.125 * (y - 0.02)) / 2.18 + 0.005;
const CAN_R = () => 0.565;

export function Iced({ v, delay = 0 }: { v: Extract<Visual, { kind: "iced" }>; delay?: number }) {
  const root = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const iceRefs = useRef<(THREE.Group | null)[]>([]);
  const strawRef = useRef<THREE.Group>(null);
  const garnishRef = useRef<THREE.Group>(null);

  const glassGeo = useMemo(
    () => lathe([[0, 0], [0.5, 0], [0.54, 0.02], [0.665, 2.2], [0.64, 2.21], [0.51, 0.1], [0, 0.1]]),
    [],
  );
  const total = 1.75;
  const layers = useMemo(() => {
    const n = v.layers.length;
    const h = total / n;
    return v.layers.map((color, i) => {
      const base = 0.1 + i * h;
      const g = new THREE.CylinderGeometry(ICED_R(base + h) - 0.012, ICED_R(base) - 0.012, h, 48);
      g.translate(0, h / 2, 0);
      return { color, base, geo: g };
    });
  }, [v.layers]);
  const pourStart = 0.9;
  const pourDur = 0.75;
  const pourEnd = pourStart + layers.length * pourDur;

  const ice = useMemo(
    () => [
      { p: [-0.2, 1.62, 0.12], r: [0.3, 0.5, 0.2] },
      { p: [0.18, 1.7, -0.1], r: [0.8, 0.2, 0.4] },
      { p: [0.05, 1.5, 0.22], r: [0.1, 1.1, 0.6] },
      { p: [-0.1, 1.82, -0.18], r: [0.5, 0.9, 0.1] },
    ],
    [],
  );

  useTimeline((t0) => {
    const t = t0 - delay;
    if (root.current) {
      const k = easeOutBack(seg(t, 0, 0.6));
      root.current.scale.set(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k));
    }
    layerRefs.current.forEach((m, i) => {
      if (!m) return;
      const f = easeInOut(seg(t, pourStart + i * pourDur, pourDur));
      m.scale.y = Math.max(0.001, f);
      m.visible = f > 0.001;
    });
    iceRefs.current.forEach((g, i) => {
      if (!g) return;
      const d = easeOutBounce(seg(t, pourEnd - 0.2 + i * 0.18, 0.8));
      g.position.y = ice[i].p[1] + (1 - d) * 3 + Math.sin(t * 1.4 + i) * 0.02 * d;
      g.visible = t > pourEnd - 0.2 + i * 0.18;
      g.rotation.y = ice[i].r[1] + t * 0.05;
    });
    if (strawRef.current) {
      const s = easeOutCubic(seg(t, pourEnd + 0.6, 0.7));
      strawRef.current.position.y = (1 - s) * 3;
      strawRef.current.visible = s > 0;
    }
    if (garnishRef.current) {
      const g = easeOutBack(seg(t, pourEnd + 0.9, 0.6));
      garnishRef.current.scale.setScalar(Math.max(0.001, g));
      garnishRef.current.visible = g > 0.001;
    }
  });

  return (
    <group ref={root} scale={0.001}>
      <mesh geometry={glassGeo} castShadow>
        <Glass />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 48]} />
        <Glass opacity={0.35} />
      </mesh>
      {layers.map((l, i) => (
        <mesh key={i} ref={(el) => { layerRefs.current[i] = el; }} geometry={l.geo} position={[0, l.base, 0]} visible={false}>
          <Liquid color={l.color} gloss={0.15} />
        </mesh>
      ))}
      {ice.map((c, i) => (
        <group key={i} ref={(el) => { iceRefs.current[i] = el; }} position={c.p as [number, number, number]} rotation={c.r as [number, number, number]} visible={false}>
          <RoundedBox args={[0.3, 0.3, 0.3]} radius={0.06} smoothness={3}>
            <meshPhysicalMaterial color="#eaf6fb" transparent opacity={0.55} roughness={0.08} clearcoat={1} envMapIntensity={2.5} />
          </RoundedBox>
        </group>
      ))}
      {v.straw && (
        <group ref={strawRef} visible={false}>
          <mesh position={[0.22, 1.85, -0.05]} rotation={[0.08, 0, -0.2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 2.5, 16]} />
            <meshPhysicalMaterial color={v.straw} roughness={0.35} clearcoat={0.5} />
          </mesh>
        </group>
      )}
      {v.garnish && (
        <group ref={garnishRef} position={[0.55, 2.14, 0.15]} visible={false}>
          <Garnish type={v.garnish} />
        </group>
      )}
      <Droplets radiusAt={ICED_OUTER} yMin={0.2} yMax={1.8} delay={pourEnd} />
    </group>
  );
}

function Garnish({ type }: { type: "lemon" | "mint" | "berry" | "orange" }) {
  if (type === "lemon" || type === "orange") {
    const rind = type === "lemon" ? "#e9c53a" : "#ee7d1a";
    const flesh = type === "lemon" ? "#f6e98f" : "#f8b04a";
    return (
      <group rotation={[Math.PI / 2, 0, 0.25]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 40]} />
          <meshPhysicalMaterial color={rind} roughness={0.4} clearcoat={0.4} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.34, 0.34, 0.065, 40]} />
          <meshPhysicalMaterial color={flesh} roughness={0.25} transmission={0} clearcoat={0.8} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.012, 0.07, 0.62]} />
            <meshStandardMaterial color="#fff6d6" />
          </mesh>
        ))}
      </group>
    );
  }
  if (type === "mint") {
    return (
      <group position={[-0.5, 0.05, -0.15]}>
        {[0, 1.2, 2.4].map((a, i) => (
          <mesh key={i} rotation={[0.6, a, 0.3]} position={[Math.cos(a) * 0.1, 0.05 * i, Math.sin(a) * 0.1]} scale={[0.1, 0.03, 0.2]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial color="#3f8f3a" roughness={0.4} clearcoat={0.5} />
          </mesh>
        ))}
      </group>
    );
  }
  // fresa
  return (
    <group rotation={[0, 0, 0.3]}>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.02, 0]} castShadow>
        <coneGeometry args={[0.2, 0.36, 24]} />
        <meshPhysicalMaterial color="#d2283f" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.17, 0]} scale={[1, 0.25, 1]}>
        <coneGeometry args={[0.2, 0.2, 6]} />
        <meshStandardMaterial color="#3f8a2f" />
      </mesh>
    </group>
  );
}

/* ───────────────────────── LATA ───────────────────────── */

export function Can({ v }: { v: Extract<Visual, { kind: "can" }> }) {
  const root = useRef<THREE.Group>(null);
  const fizz = useRef<(THREE.Mesh | null)[]>([]);
  const bubbles = useMemo(
    () => Array.from({ length: 14 }, () => ({ a: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 0.8, r: 0.02 + Math.random() * 0.03 })),
    [],
  );
  useTimeline((t) => {
    if (root.current) {
      const d = easeOutBounce(seg(t, 0, 1.1));
      root.current.position.y = (1 - d) * 3.2;
      root.current.rotation.y = (1 - easeOutCubic(seg(t, 0, 1.6))) * Math.PI * 3;
      root.current.rotation.z = Math.sin(seg(t, 1.6, 0.8) * Math.PI * 3) * 0.04 * (1 - seg(t, 1.6, 0.8));
    }
    fizz.current.forEach((m, i) => {
      if (!m) return;
      const p = seg(t, 1.7 + (i % 5) * 0.06, 0.9);
      const b = bubbles[i];
      m.position.set(0.12 + Math.cos(b.a) * p * 0.35, 1.95 + p * b.s, Math.sin(b.a) * p * 0.35);
      m.visible = p > 0 && p < 1;
      m.scale.setScalar(1 - p * 0.5);
    });
  });
  return (
    <group>
      <group ref={root}>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 1.7, 64]} />
          <meshPhysicalMaterial color={v.color} metalness={0.55} roughness={0.28} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.556, 0.556, 0.32, 64, 1, true]} />
          <meshPhysicalMaterial color={v.accent} metalness={0.3} roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.556, 0.556, 0.05, 64, 1, true]} />
          <meshPhysicalMaterial color={v.accent} metalness={0.3} roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, 1.86, 0]}>
          <cylinderGeometry args={[0.46, 0.55, 0.12, 64]} />
          <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.93, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.03, 12, 64]} />
          <meshStandardMaterial color="#d7dade" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 1.935, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.32, 0.015, 0.16]} />
          <meshStandardMaterial color="#e1e3e6" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.55, 0.46, 0.12, 64]} />
          <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.25} />
        </mesh>
        <Droplets radiusAt={CAN_R} yMin={0.2} yMax={1.75} delay={1.4} count={55} />
      </group>
      {bubbles.map((b, i) => (
        <mesh key={i} ref={(el) => { fizz.current[i] = el; }} visible={false}>
          <sphereGeometry args={[b.r, 10, 10]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.7} roughness={0} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── BOTELLA ───────────────────────── */

export function Bottle({ v }: { v: Extract<Visual, { kind: "bottle" }> }) {
  // líquidos muy claros (agua) se pintan transparentes y sin burbujas
  const isClear = !!v.liquid && new THREE.Color(v.liquid).getHSL({ h: 0, s: 0, l: 0 }).l > 0.85;
  const root = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Mesh>(null);
  const bub = useRef<(THREE.Mesh | null)[]>([]);
  const glass = useMemo(
    () => lathe([[0, 0], [0.42, 0], [0.46, 0.05], [0.46, 1.3], [0.43, 1.5], [0.21, 1.9], [0.16, 2.2], [0.175, 2.27], [0.15, 2.3], [0, 2.3]]),
    [],
  );
  const liquid = useMemo(() => lathe([[0, 0.06], [0.42, 0.06], [0.42, 1.3], [0.39, 1.48], [0.2, 1.8], [0, 1.8]]), []);
  const seeds = useMemo(() => Array.from({ length: 22 }, () => ({ x: (Math.random() - 0.5) * 0.6, z: (Math.random() - 0.5) * 0.6, o: Math.random() })), []);
  useTimeline((t) => {
    if (root.current) {
      const k = easeOutBack(seg(t, 0, 0.8));
      root.current.position.y = (1 - k) * -1.5;
      root.current.scale.setScalar(Math.max(0.001, k));
      root.current.rotation.y = (1 - easeOutCubic(seg(t, 0, 1.4))) * Math.PI * 2;
    }
    if (cap.current) {
      const p = seg(t, 1.5, 0.9);
      cap.current.position.set(p * 0.6, 2.34 + easeOutCubic(p) * 1.4 - p * p * 0.6, 0);
      cap.current.rotation.z = p * 6;
      (cap.current.material as THREE.MeshStandardMaterial).opacity = 1 - seg(t, 2.0, 0.4);
    }
    bub.current.forEach((m, i) => {
      if (!m) return;
      const p = ((t - 1.6) * 0.45 + seeds[i].o) % 1;
      m.visible = t > 1.6 && !!v.liquid && !isClear;
      m.position.set(seeds[i].x * (1 - p * 0.6), 0.12 + p * 1.6, seeds[i].z * (1 - p * 0.6));
    });
  });
  return (
    <group ref={root}>
      <mesh geometry={glass} castShadow>
        <Glass tint={v.glass} opacity={0.5} />
      </mesh>
      {v.liquid && (
        <mesh geometry={liquid}>
          {isClear ? (
            <meshPhysicalMaterial color={v.liquid} transparent opacity={0.28} roughness={0.02} clearcoat={1} envMapIntensity={2} depthWrite={false} />
          ) : (
            <meshPhysicalMaterial color={v.liquid} transparent opacity={0.9} roughness={0.15} clearcoat={0.6} />
          )}
        </mesh>
      )}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.465, 0.465, 0.62, 64, 1, true]} />
        <meshPhysicalMaterial color={v.label} roughness={0.5} clearcoat={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.468, 0.468, 0.06, 64, 1, true]} />
        <meshStandardMaterial color="#f4ede2" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={cap} position={[0, 2.34, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 24]} />
        <meshStandardMaterial color="#d7b56d" metalness={0.9} roughness={0.3} transparent />
      </mesh>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { bub.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#fff7d9" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── CAÑA ───────────────────────── */

export function Beer({ v }: { v: Extract<Visual, { kind: "beer" }> }) {
  const root = useRef<THREE.Group>(null);
  const liq = useRef<THREE.Mesh>(null);
  const foam = useRef<THREE.Group>(null);
  const bub = useRef<(THREE.Mesh | null)[]>([]);
  const glass = useMemo(
    () => lathe([[0, 0], [0.48, 0], [0.5, 0.03], [0.6, 1.85], [0.64, 2.1], [0.615, 2.11], [0.575, 1.85], [0.47, 0.12], [0, 0.12]]),
    [],
  );
  const liqGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.565, 0.465, 1.58, 48);
    g.translate(0, 0.79, 0);
    return g;
  }, []);
  const seeds = useMemo(() => Array.from({ length: 26 }, () => ({ a: Math.random() * 6.28, r: Math.random() * 0.4, o: Math.random() })), []);
  useTimeline((t) => {
    if (root.current) {
      const k = easeOutBack(seg(t, 0, 0.6));
      root.current.scale.setScalar(Math.max(0.001, k));
      root.current.rotation.z = 0.45 * (1 - easeInOut(seg(t, 0.6, 1.8)));
    }
    const f = easeInOut(seg(t, 0.6, 1.9));
    if (liq.current) {
      liq.current.scale.y = Math.max(0.001, f);
      liq.current.visible = f > 0.001;
    }
    if (foam.current) {
      const g = easeOutBack(seg(t, 2.2, 0.7));
      foam.current.scale.set(1, Math.max(0.001, g), 1);
      foam.current.visible = g > 0.001;
    }
    bub.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.4 + seeds[i].o) % 1;
      m.visible = t > 1.2;
      m.position.set(Math.cos(seeds[i].a) * seeds[i].r, 0.15 + p * 1.5 * f, Math.sin(seeds[i].a) * seeds[i].r);
    });
  });
  return (
    <group ref={root}>
      <mesh geometry={glass} castShadow>
        <Glass />
      </mesh>
      <mesh ref={liq} geometry={liqGeo} position={[0, 0.12, 0]} visible={false}>
        <meshPhysicalMaterial color={v.liquid} roughness={0.1} clearcoat={0.8} transparent opacity={0.92} />
      </mesh>
      <group ref={foam} position={[0, 1.7, 0]} visible={false}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.6, 0.565, 0.28, 48]} />
          <meshStandardMaterial color={v.foam} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]} scale={[1, 0.22, 1]}>
          <sphereGeometry args={[0.6, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={v.foam} roughness={0.9} />
        </mesh>
      </group>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { bub.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#fff6d0" transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── COPA DE VINO ───────────────────────── */

export function Wine({ v }: { v: Extract<Visual, { kind: "wine" }> }) {
  const root = useRef<THREE.Group>(null);
  const liq = useRef<THREE.Group>(null);
  // copa tipo tulipa: perfil suave generado por una función
  const bowlR = (u: number) =>
    0.1 + 0.48 * Math.sin((Math.PI / 2) * Math.min(1, u / 0.55)) - 0.1 * Math.pow(Math.max(0, (u - 0.55) / 0.45), 2);
  const BOWL_Y0 = 1.04;
  const BOWL_H = 1.11;
  const glass = useMemo(() => {
    const pts: [number, number][] = [[0, 0], [0.6, 0], [0.62, 0.025], [0.12, 0.06], [0.05, 0.12], [0.045, 0.95], [0.08, 1.0]];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28;
      pts.push([bowlR(u), BOWL_Y0 + u * BOWL_H]);
    }
    return lathe(pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const liqGeo = useMemo(() => {
    const top = 0.36;
    const pts: [number, number][] = [[0, BOWL_Y0 + 0.03]];
    for (let i = 0; i <= 16; i++) {
      const u = 0.03 + (i / 16) * (top - 0.03);
      pts.push([Math.max(0.01, bowlR(u) - 0.02), BOWL_Y0 + u * BOWL_H]);
    }
    pts.push([0, BOWL_Y0 + top * BOWL_H]);
    const g = lathe(pts);
    g.translate(0, -(BOWL_Y0 + 0.03), 0);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useTimeline((t) => {
    if (root.current) {
      const k = easeOutBack(seg(t, 0, 0.7));
      root.current.scale.setScalar(Math.max(0.001, k));
    }
    if (liq.current) {
      const f = easeInOut(seg(t, 0.8, 1.4));
      liq.current.scale.y = Math.max(0.001, f);
      liq.current.visible = f > 0.001;
      const w = seg(t, 2.2, 3);
      liq.current.rotation.x = Math.sin(t * 3) * 0.08 * (1 - w) * (t > 2.2 ? 1 : 0);
      liq.current.rotation.z = Math.cos(t * 3) * 0.08 * (1 - w) * (t > 2.2 ? 1 : 0);
    }
  });
  return (
    <group ref={root}>
      <mesh geometry={glass} castShadow>
        <Glass />
      </mesh>
      <group ref={liq} position={[0, BOWL_Y0 + 0.03, 0]} visible={false}>
        <mesh geometry={liqGeo}>
          <meshPhysicalMaterial color={v.liquid} roughness={0.05} clearcoat={1} transparent opacity={0.93} />
        </mesh>
      </group>
    </group>
  );
}

/* ───────────────────────── TOSTADA ───────────────────────── */

const TOAST_TOP = 0.47;

function breadShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.85, -1.0);
  s.lineTo(0.85, -1.0);
  s.lineTo(0.85, 0.45);
  s.bezierCurveTo(0.85, 0.75, 1.05, 1.0, 0.6, 1.1);
  s.bezierCurveTo(0.3, 1.2, -0.3, 1.2, -0.6, 1.1);
  s.bezierCurveTo(-1.05, 1.0, -0.85, 0.75, -0.85, 0.45);
  s.closePath();
  return s;
}

function Plate() {
  const geo = useMemo(
    () => lathe([[0, 0], [1.15, 0], [1.55, 0.12], [1.62, 0.17], [1.56, 0.185], [1.12, 0.065], [0, 0.065]]),
    [],
  );
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <Ceramic color="#f3ece0" />
    </mesh>
  );
}

export function Bread({ delay = 0 }: { delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => {
    const t = makeToastTexture();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.45, 0.45);
    t.offset.set(0.5, 0.5);
    return t;
  }, []);
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(breadShape(), { depth: 0.28, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 24 }),
    [],
  );
  useTimeline((t0) => {
    const t = t0 - delay;
    if (!ref.current) return;
    const d = easeOutBounce(seg(t, 0.25, 0.8));
    ref.current.position.y = 0.12 + (1 - d) * 2.5;
    ref.current.rotation.z = (1 - d) * 0.5;
    ref.current.visible = t > 0.25;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial attach="material-0" map={tex} roughness={0.85} />
        <meshStandardMaterial attach="material-1" color="#8e4f1f" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Contenedor que deja caer / extiende un topping en su momento */
function Drop({ start, children, mode = "drop", y = TOAST_TOP, from = 2 }: { start: number; children: ReactNode; mode?: "drop" | "spread" | "pop"; y?: number; from?: number }) {
  const ref = useRef<THREE.Group>(null);
  useTimeline((t) => {
    const g = ref.current;
    if (!g) return;
    g.visible = t > start;
    if (mode === "drop") {
      const d = easeOutBounce(seg(t, start, 0.7));
      g.position.y = y + (1 - d) * from;
    } else if (mode === "spread") {
      const d = easeOutCubic(seg(t, start, 0.7));
      g.position.y = y;
      g.scale.set(Math.max(0.001, 0.15 + d * 0.85), 1, Math.max(0.001, 0.15 + d * 0.85));
    } else {
      const d = easeOutBack(seg(t, start, 0.5));
      g.position.y = y;
      g.scale.setScalar(Math.max(0.001, d));
    }
  });
  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}

function Spread({ color, r = 0.72, seed = 1, rough = 0.35, opacity = 1, x = 0, z = -0.05 }: { color: string; r?: number; seed?: number; rough?: number; opacity?: number; x?: number; z?: number }) {
  const geo = useMemo(
    () => new THREE.ExtrudeGeometry(blobShape(r, seed), { depth: 0.025, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.03, bevelSegments: 3 }),
    [r, seed],
  );
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]} receiveShadow>
      <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.7} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function Ribbons({ base, stripe, count = 3 }: { base: string; stripe: string; count?: number }) {
  const geo = useMemo(() => wavyRibbon(1.25, 0.4, 2.2, 0.07), []);
  const tex = useMemo(() => makeStripeTexture(base, stripe), [base, stripe]);
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} geometry={geo} rotation={[-Math.PI / 2 + 0.05, 0, (i - 1) * 0.5 + 0.2]} position={[(i - 1) * 0.12, 0.06 + i * 0.03, (i - 1) * 0.45]} castShadow>
          <meshPhysicalMaterial map={tex} roughness={0.45} clearcoat={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function ToppingLayer({ kind, start, level }: { kind: Topping; start: number; level: number }) {
  const y = TOAST_TOP + level * 0.035;
  const rnd = useMemo(() => {
    let s = kind.length * 97 + level * 13;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }, [kind, level]);
  const scatter = useMemo(
    () => Array.from({ length: 70 }, () => [(rnd() - 0.5) * 1.35, (rnd() - 0.5) * 1.6 - 0.05, rnd()] as [number, number, number]),
    [rnd],
  );

  switch (kind) {
    case "tomato":
      return <Drop start={start} mode="spread" y={y}><Spread color="#c0331f" r={0.74} seed={2} rough={0.3} /></Drop>;
    case "jam":
      return <Drop start={start} mode="spread" y={y}><Spread color="#a8142f" r={0.6} seed={3} rough={0.1} /></Drop>;
    case "pesto":
      return (
        <Drop start={start} mode="spread" y={y}>
          <Spread color="#4f7d2a" r={0.72} seed={5} rough={0.35} />
          {scatter.slice(0, 18).map(([x, z], i) => (
            <mesh key={i} position={[x * 0.9, 0.04, z * 0.85]} scale={[1, 0.3, 1]}>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshStandardMaterial color="#2f5a19" />
            </mesh>
          ))}
        </Drop>
      );
    case "creamcheese":
      return <Drop start={start} mode="spread" y={y}><Spread color="#fbf6ea" r={0.7} seed={7} rough={0.55} /></Drop>;
    case "oil":
      return (
        <Drop start={start} mode="pop" y={y + 0.02}>
          {[[-0.3, -0.3], [0.25, 0.1], [-0.1, 0.4], [0.35, -0.45], [-0.4, 0.2]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.02, z]} scale={[1, 0.2, 0.8]}>
              <sphereGeometry args={[0.1 + (i % 2) * 0.04, 16, 10]} />
              <meshPhysicalMaterial color="#d9b93a" transparent opacity={0.75} roughness={0} clearcoat={1} />
            </mesh>
          ))}
        </Drop>
      );
    case "butter":
      return <Butter start={start} y={y} />;
    case "burrata":
      return (
        <Drop start={start} y={y} from={2.6}>
          <mesh position={[0, 0.26, 0]} scale={[1, 0.72, 1]} castShadow>
            <sphereGeometry args={[0.4, 40, 30]} />
            <meshPhysicalMaterial color="#fbf8ef" roughness={0.45} clearcoat={0.4} sheen={1} sheenColor="#ffffff" />
          </mesh>
          <mesh position={[0, 0.54, 0]} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.09, 16, 12]} />
            <meshPhysicalMaterial color="#f5efe0" roughness={0.5} />
          </mesh>
        </Drop>
      );
    case "cherry":
      return (
        <group>
          {[[0.55, 0.3], [-0.5, 0.35], [0.4, -0.55], [-0.45, -0.5], [0.05, 0.72], [0.02, -0.8]].map(([x, z], i) => (
            <Drop key={i} start={start + i * 0.12} y={y}>
              <mesh position={[x, 0.02, z]} castShadow>
                <sphereGeometry args={[0.15, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial color="#d4291f" roughness={0.15} clearcoat={1} />
              </mesh>
              <mesh position={[x, 0.021, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.15, 24]} />
                <meshStandardMaterial color="#e8604a" />
              </mesh>
            </Drop>
          ))}
        </group>
      );
    case "avocado":
      return (
        <group>
          {Array.from({ length: 6 }).map((_, i) => (
            <Drop key={i} start={start + i * 0.12} y={y} from={1.4}>
              <group position={[-0.55 + i * 0.22, 0.05, -0.05]} rotation={[0, 0.25 - i * 0.04, -0.25]}>
                <mesh scale={[0.13, 0.055, 0.62]} castShadow>
                  <sphereGeometry args={[1, 24, 16]} />
                  <meshPhysicalMaterial color="#a9c653" roughness={0.3} clearcoat={0.6} />
                </mesh>
                <mesh position={[0.1, -0.005, 0]} scale={[0.04, 0.05, 0.6]}>
                  <sphereGeometry args={[1, 12, 10]} />
                  <meshStandardMaterial color="#2f4d1c" />
                </mesh>
              </group>
            </Drop>
          ))}
        </group>
      );
    case "cheese":
      return (
        <group>
          {scatter.slice(0, 14).map(([x, z, r], i) => (
            <Drop key={i} start={start + r * 0.4} y={y + 0.08}>
              <mesh position={[x * 0.9, 0.04, z * 0.85]} rotation={[r, r * 3, r * 2]} castShadow>
                <boxGeometry args={[0.11, 0.09, 0.11]} />
                <meshStandardMaterial color="#f7f2e4" roughness={0.7} />
              </mesh>
            </Drop>
          ))}
        </group>
      );
    case "seeds":
      return (
        <group>
          {scatter.slice(0, 55).map(([x, z, r], i) => (
            <Drop key={i} start={start + r * 0.5} y={y + 0.1} from={1.5}>
              <mesh position={[x, 0, z]} rotation={[0, r * 6, 0]} scale={[1, 0.55, 1.7]}>
                <sphereGeometry args={[0.022, 8, 6]} />
                <meshStandardMaterial color={["#e8d7a8", "#2a2320", "#c9a86a"][i % 3]} />
              </mesh>
            </Drop>
          ))}
        </group>
      );
    case "ham":
      return <Drop start={start} y={y} from={1.6}><Ribbons base="#c9585f" stripe="#f3d6d0" /></Drop>;
    case "salmon":
      return <Drop start={start} y={y} from={1.6}><Ribbons base="#ef8356" stripe="#fbd0b4" /></Drop>;
  }
}

function Butter({ start, y }: { start: number; y: number }) {
  const cube = useRef<THREE.Group>(null);
  const pool = useRef<THREE.Group>(null);
  useTimeline((t) => {
    if (cube.current) {
      const d = easeOutBounce(seg(t, start, 0.7));
      const m = easeInOut(seg(t, start + 0.9, 2.5));
      cube.current.visible = t > start;
      cube.current.position.y = y + 0.06 + (1 - d) * 2 - m * 0.04;
      cube.current.scale.set(1 + m * 0.35, 1 - m * 0.6, 1 + m * 0.35);
    }
    if (pool.current) {
      const m = easeOutCubic(seg(t, start + 0.9, 2.5));
      pool.current.visible = m > 0.01;
      pool.current.scale.set(Math.max(0.001, m), 1, Math.max(0.001, m));
    }
  });
  return (
    <group>
      <group ref={pool} position={[0, y, -0.05]} visible={false}>
        <Spread color="#f2d06a" r={0.62} seed={11} rough={0.05} opacity={0.75} z={0} />
      </group>
      <group ref={cube} visible={false}>
        <RoundedBox args={[0.46, 0.13, 0.36]} radius={0.04} smoothness={3} castShadow>
          <meshPhysicalMaterial color="#f6dc8a" roughness={0.3} clearcoat={0.6} />
        </RoundedBox>
      </group>
    </group>
  );
}

export function Toast({ v, delay = 0, plate = true }: { v: { toppings: Topping[] }; delay?: number; plate?: boolean }) {
  const plateRef = useRef<THREE.Group>(null);
  useTimeline((t0) => {
    const t = t0 - delay;
    if (plateRef.current) plateRef.current.scale.setScalar(Math.max(0.001, easeOutBack(seg(t, 0, 0.5))));
  });
  return (
    <group>
      {plate && (
        <group ref={plateRef} scale={0.001}>
          <Plate />
        </group>
      )}
      <Bread delay={delay} />
      {v.toppings.map((k, i) => (
        <ToppingLayer key={k + i} kind={k} start={delay + 1.2 + i * 0.75} level={i} />
      ))}
    </group>
  );
}

/* ───────────────────────── CROISSANT & BOCADILLO ───────────────────────── */

function Croissant() {
  const parts = useMemo(() => {
    const n = 7;
    return Array.from({ length: n }, (_, i) => {
      const u = i / (n - 1) - 0.5; // -0.5..0.5
      const a = u * 2.3;
      const w = 1 - Math.abs(u) * 1.15;
      return { pos: [Math.sin(a) * 0.6, 0.2 * w + 0.06, -Math.cos(a) * 0.6 + 0.45] as [number, number, number], rot: a, w };
    });
  }, []);
  return (
    <group>
      {parts.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[0, -p.rot, 0]} scale={[0.3 * p.w + 0.07, 0.24 * p.w + 0.05, 0.2 + 0.04 * p.w]} castShadow>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial color={i % 2 ? "#c47b2e" : "#d48f3c"} roughness={0.45} clearcoat={0.8} clearcoatRoughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Bocadillo() {
  return (
    <group rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.75, 1, 1]} castShadow>
        <capsuleGeometry args={[0.28, 1.5, 12, 24]} />
        <meshPhysicalMaterial color="#c98a45" roughness={0.6} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.33, 0]} scale={[1, 0.3, 1]}>
        <boxGeometry args={[1.7, 0.18, 0.58]} />
        <meshStandardMaterial color="#c9585f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.36, 0.02]} scale={[1, 0.25, 1]}>
        <boxGeometry args={[1.66, 0.18, 0.62]} />
        <meshStandardMaterial color="#6c9a3a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.6, 1, 1]} castShadow>
        <capsuleGeometry args={[0.28, 1.5, 12, 24]} />
        <meshPhysicalMaterial color="#b8732f" roughness={0.55} clearcoat={0.4} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.63, 0]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.36]} />
          <meshStandardMaterial color="#e8c48a" />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── PACK ───────────────────────── */

export function Pack({ v }: { v: Extract<Visual, { kind: "pack" }> }) {
  const board = useRef<THREE.Group>(null);
  const side = useRef<THREE.Group>(null);
  useTimeline((t) => {
    if (board.current) board.current.scale.setScalar(Math.max(0.001, easeOutBack(seg(t, 0, 0.6))));
    if (side.current && v.side !== "toast") {
      const d = easeOutBounce(seg(t, 1.1, 0.8));
      side.current.position.y = 0.13 + (1 - d) * 2.5;
      side.current.visible = t > 1.1;
    }
  });
  const drink =
    v.drink === "coffee"
      ? { kind: "cup" as const, liquid: "#6b3f22", foam: "#d9b88f" }
      : v.drink === "latte"
        ? { kind: "cup" as const, liquid: "#8a5a35", foam: "#f1e2c8", art: true }
        : null;
  return (
    <group>
      <group ref={board} scale={0.001}>
        <RoundedBox args={[4.2, 0.12, 2.5]} radius={0.06} smoothness={3} position={[0, 0.06, 0]} receiveShadow castShadow>
          <meshPhysicalMaterial color="#b98150" roughness={0.6} clearcoat={0.2} />
        </RoundedBox>
      </group>
      <group position={[-1.1, 0.12, 0]} scale={0.85}>
        {drink ? <Cup v={drink} delay={0.3} /> : <Iced v={{ kind: "iced", layers: ["#f39a1c", "#f7b23b"], garnish: "orange" }} delay={0.3} />}
        {drink && <Steam y={1.1} delay={2.8} />}
      </group>
      <group position={[0.95, 0, 0]}>
        {v.side === "toast" ? (
          <group position={[0, 0.06, 0]} scale={0.72}>
            <Toast v={{ toppings: v.toppings ?? ["tomato"] }} delay={0.9} plate={false} />
          </group>
        ) : (
          <group ref={side} visible={false}>
            {v.side === "croissant" ? <Croissant /> : <Bocadillo />}
          </group>
        )}
      </group>
    </group>
  );
}

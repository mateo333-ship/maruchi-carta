"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, Float } from "@react-three/drei";
import type { Product } from "@/data/menu";
import { Beer, Bottle, Can, Cup, Iced, Pack, Steam as _Steam, Toast, Wine } from "./models";

type Framing = { cam: [number, number, number]; target: [number, number, number] };

function framingFor(p: Product): Framing {
  const v = p.visual;
  switch (v.kind) {
    case "cup":
      return v.small
        ? { cam: [0, 2.0, 4.0], target: [0, 0.45, 0] }
        : { cam: [0, 2.3, 4.9], target: [0, 0.6, 0] };
    case "toast":
      return { cam: [0, 4.6, 5.3], target: [0, 0.3, 0] };
    case "pack":
      return { cam: [0, 4.2, 7.4], target: [0, 0.5, 0] };
    case "wine":
      return { cam: [0, 2.3, 6.0], target: [0, 1.05, 0] };
    default:
      return { cam: [0, 2.4, 6.3], target: [0, 1.05, 0] };
  }
}

function Model({ product }: { product: Product }) {
  const v = product.visual;
  switch (v.kind) {
    case "cup":
      return (
        <group>
          <Cup v={v} />
          {product.hot && <_Steam y={v.small ? 0.75 : 1.05} delay={2.6} spread={v.small ? 0.2 : 0.3} />}
        </group>
      );
    case "iced":
      return <Iced v={v} />;
    case "can":
      return <Can v={v} />;
    case "bottle":
      return <Bottle v={v} />;
    case "beer":
      return <Beer v={v} />;
    case "wine":
      return <Wine v={v} />;
    case "toast":
      return <Toast v={v} />;
    case "pack":
      return <Pack v={v} />;
  }
}

export default function ProductScene({ product, replay = 0, autoRotate = true, distance = 1, paused = false }: { product: Product; replay?: number; autoRotate?: boolean; distance?: number; paused?: boolean }) {
  const base = framingFor(product);
  const f: Framing = {
    target: base.target,
    cam: base.cam.map((c, i) => base.target[i] + (c - base.target[i]) * distance) as [number, number, number],
  };
  return (
    <Canvas
      key={product.id}
      shadows="percentage"
      frameloop={paused ? "never" : "always"}
      dpr={[1, typeof window !== "undefined" && window.innerWidth < 768 ? 1.5 : 1.75]}
      camera={{ position: f.cam, fov: 32 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 3]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} color="#fff4e2" />
      <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#bfe0dc" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} color="#fff5e6" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#f5e3cc" />
        <Lightformer form="rect" intensity={1.2} position={[5, 2, -1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#d6ece9" />
        <Lightformer form="circle" intensity={4} position={[0, 6, -4]} scale={2} color="#ffffff" />
      </Environment>

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15} floatingRange={[0, 0.06]}>
        <group key={replay}>
          <Model product={product} />
        </group>
      </Float>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.42} scale={9} blur={2.6} far={3.5} color="#2a1a12" />
      <OrbitControls
        target={f.target}
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        makeDefault
      />
    </Canvas>
  );
}

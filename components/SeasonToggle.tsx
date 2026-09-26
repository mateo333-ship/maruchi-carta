"use client";

import { useId } from "react";

/** Toggle Verano ☀ / Invierno ☾ (Uiverse · mobinkakei, adaptado) */
export function SeasonToggle({ winter, onChange, compact = false }: { winter: boolean; onChange: (winter: boolean) => void; compact?: boolean }) {
  const id = useId();
  return (
    <div className={`toggleWrapper ${compact ? "is-compact" : ""}`} title={winter ? "Carta de invierno" : "Carta de verano"}>
      <input
        type="checkbox"
        className="input"
        id={id}
        checked={winter}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={winter ? "Cambiar a carta de verano" : "Cambiar a carta de invierno"}
      />
      <label htmlFor={id} className="toggle">
        <span className="toggle__handler">
          <span className="crater crater--1" />
          <span className="crater crater--2" />
          <span className="crater crater--3" />
        </span>
        <span className="star star--1" />
        <span className="star star--2" />
        <span className="star star--3" />
        <span className="star star--4" />
        <span className="star star--5" />
        <span className="star star--6" />
      </label>
    </div>
  );
}

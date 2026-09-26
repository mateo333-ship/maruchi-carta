"use client";

import { useId } from "react";

/** Toggle Carta de verano ☀ / Carta de invierno ❄ */
export function SeasonToggle({
  winter,
  onChange,
  compact = false,
  onDark = false,
}: {
  winter: boolean;
  onChange: (winter: boolean) => void;
  compact?: boolean;
  onDark?: boolean;
}) {
  const id = useId();
  return (
    <div className={`season-toggle ${compact ? "is-compact" : ""} ${onDark ? "on-dark" : ""}`} title={winter ? "Carta de invierno" : "Carta de verano"}>
      {!compact && (
        <span className={`season-toggle__label ${winter ? "season-toggle__label--off" : ""}`} onClick={() => onChange(false)}>
          Verano
        </span>
      )}
      <input
        type="checkbox"
        role="switch"
        className="input"
        id={id}
        checked={winter}
        onChange={(e) => onChange(e.target.checked)}
        aria-checked={winter}
        aria-label={winter ? "Carta de invierno activa. Cambiar a verano" : "Carta de verano activa. Cambiar a invierno"}
      />
      <label htmlFor={id} className="toggle">
        <span className="cloud cloud--1" />
        <span className="cloud cloud--2" />
        <span className="cloud cloud--3" />
        <span className="flake flake--1" />
        <span className="flake flake--2" />
        <span className="flake flake--3" />
        <span className="flake flake--4" />
        <span className="flake flake--5" />
        <span className="toggle__handler">
          {/* sol */}
          <svg className="toggle__icon toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
            <path d="M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6M4.8 4.8l1.8 1.8M17.4 17.4l1.8 1.8M4.8 19.2l1.8-1.8M17.4 6.6l1.8-1.8" />
          </svg>
          {/* copo de nieve */}
          <svg className="toggle__icon toggle__icon--snow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
            <path d="M9.5 3.8 12 6l2.5-2.2M9.5 20.2 12 18l2.5 2.2M4.4 10.2l3.1-.9-.7-3.2M19.6 13.8l-3.1.9.7 3.2M4.4 13.8l3.1.9-.7 3.2M19.6 10.2l-3.1-.9.7-3.2" />
          </svg>
        </span>
      </label>
      {!compact && (
        <span className={`season-toggle__label ${winter ? "" : "season-toggle__label--off"}`} onClick={() => onChange(true)}>
          Invierno
        </span>
      )}
    </div>
  );
}

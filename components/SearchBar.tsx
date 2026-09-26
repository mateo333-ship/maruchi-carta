"use client";

import { forwardRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onFocusShortcut?: () => void;
  className?: string;
};

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar({ value, onChange, className }, ref) {
  return (
    <label className={`cir-search ${className ?? ""}`}>
      <svg className="cir-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={ref}
        className="cir-search__field"
        type="search"
        placeholder="Busca matcha, burrata, zumo…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar en la carta"
      />
      {value ? (
        <button type="button" className="cir-search__kbd" onClick={() => onChange("")} aria-label="Borrar búsqueda">
          Borrar
        </button>
      ) : (
        <span className="cir-search__kbd" aria-hidden>
          ⌘ K
        </span>
      )}
    </label>
  );
});

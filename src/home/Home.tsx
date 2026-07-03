"use client";

import { useEffect } from "react";
import { PROTOTYPES, type PrototypeMeta } from "../prototypes/registry";
import homeCss from "./home.css?raw";

export function Home() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "home";
    style.textContent = homeCss;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-eyebrow">
          <span className="dot" />
          Prototypes
        </div>
        <h1>Claude Design prototypes</h1>
        <p className="home-sub">
          A small gallery of self-contained prototypes shipped from Claude Design.
          Pick one to open it — each has its own tweaks panel to switch states without
          touching code.
        </p>

        <div className="home-section-head">
          <h2>Available prototypes</h2>
          <span className="count">{PROTOTYPES.length}</span>
        </div>

        <div className="home-grid">
          {PROTOTYPES.map((p) => (
            <PrototypeCard key={p.slug} proto={p} />
          ))}
        </div>

        <div className="home-footer">
          New prototypes go in <code>src/prototypes/</code> and register themselves
          in <code>src/prototypes/registry.ts</code>.
        </div>
      </div>
    </div>
  );
}

function PrototypeCard({ proto }: { proto: PrototypeMeta }) {
  const initials = proto.title
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const accentTint = hexToRgba(proto.accent, 0.1);
  return (
    <a
      href={`#/${proto.slug}`}
      className="proto-card"
      style={
        {
          "--proto-accent": proto.accent,
          "--accent-tint": accentTint,
        } as React.CSSProperties
      }
    >
      <div className="proto-card-head">
        <div className="proto-card-mark">{initials}</div>
        <span className="proto-card-arrow" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M5 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <h3>{proto.title}</h3>
      <p className="proto-tagline">{proto.tagline}</p>
      <p className="proto-desc">{proto.description}</p>
      <div className="proto-card-tags">
        {proto.tags.map((t) => (
          <span key={t} className="proto-card-tag">
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const x =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

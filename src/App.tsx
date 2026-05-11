"use client";

import { useEffect, useState } from "react";
import { Home } from "./home/Home";
import { getPrototype } from "./prototypes/registry";

function readSlug(): string {
  if (typeof window === "undefined") return "";
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash.trim();
}

export function App() {
  const [slug, setSlug] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSlug(readSlug());
    setHydrated(true);
    const onHash = () => setSlug(readSlug());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.title = slug
      ? `${getPrototype(slug)?.title ?? "Not found"} · Prototypes`
      : "Prototypes";
  }, [slug, hydrated]);

  // SSR pass renders the Home shell so the markup the server emits is meaningful
  // even before the hash is read on the client.
  if (!hydrated || !slug) return <Home />;

  const proto = getPrototype(slug);
  if (!proto) return <NotFound slug={slug} />;

  const Comp = proto.component;
  return <Comp />;
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fafaf8",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        color: "#1a1a1a",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#908d86",
            marginBottom: 8,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 8px" }}>
          Prototype not found
        </h1>
        <p style={{ color: "#5c5a55", margin: "0 0 20px" }}>
          No prototype is registered under <code>{slug}</code>.
        </p>
        <a
          href="#/"
          style={{
            display: "inline-flex",
            padding: "8px 16px",
            background: "#1a1a1a",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ← Back to prototypes
        </a>
      </div>
    </div>
  );
}

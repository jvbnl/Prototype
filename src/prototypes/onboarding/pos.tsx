import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, eur } from "./data";
import type { CategoryKey, Product } from "./data";
import { Icon } from "./icons";

type Line = { id: string; qty: number; discounted: boolean };
const DISCOUNT = 0.1; // 10% demo korting

const CAT_VARS: Record<CategoryKey, { bg: string; ink: string }> = {
  coffee: { bg: "var(--o-cat-coffee-bg)", ink: "var(--o-cat-coffee-ink)" },
  cold: { bg: "var(--o-cat-cold-bg)", ink: "var(--o-cat-cold-ink)" },
  food: { bg: "var(--o-cat-food-bg)", ink: "var(--o-cat-food-ink)" },
  bowl: { bg: "var(--o-cat-bowl-bg)", ink: "var(--o-cat-bowl-ink)" },
  sweet: { bg: "var(--o-cat-sweet-bg)", ink: "var(--o-cat-sweet-ink)" },
};

const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

/** Touch/tablet POS used as the concrete example for the onboarding patterns. */
export function Pos({ pref, onCheckout }: { pref: "color" | "image"; onCheckout: () => void }) {
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { id: "cappuccino", qty: 2, discounted: false },
    { id: "poke", qty: 1, discounted: false },
  ]);
  const [paid, setPaid] = useState(false);

  const shown = useMemo(
    () =>
      PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && p.name.toLowerCase().includes(query.toLowerCase())),
    [cat, query],
  );

  const add = (p: Product) => {
    setPaid(false);
    setLines((ls) => {
      const hit = ls.find((l) => l.id === p.id);
      if (hit) return ls.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { id: p.id, qty: 1, discounted: false }];
    });
  };
  const step = (id: string, d: number) =>
    setLines((ls) =>
      ls.flatMap((l) => (l.id === id ? (l.qty + d <= 0 ? [] : [{ ...l, qty: l.qty + d }]) : [l])),
    );
  const toggleDisc = (id: string) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, discounted: !l.discounted } : l)));

  const lineTotal = (l: Line) => byId[l.id].price * l.qty * (l.discounted ? 1 - DISCOUNT : 1);
  const total = lines.reduce((s, l) => s + lineTotal(l), 0);
  const saved = lines.reduce((s, l) => s + (l.discounted ? byId[l.id].price * l.qty * DISCOUNT : 0), 0);

  const checkout = () => {
    if (lines.length === 0) return;
    setPaid(true);
    onCheckout();
  };

  return (
    <div className="pos">
      <div className="pos__main">
        <div className="pos__head">
          <div className="pos__loc">
            Gymly Café
            <small>Kassa 1 · Sanne</small>
          </div>
          <label className="pos__search" data-tour-id="pos-search">
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek product…"
              aria-label="Zoek product"
            />
          </label>
        </div>

        <div className="pos__cats">
          <button className="pos__chip" data-on={cat === "all" ? 1 : 0} onClick={() => setCat("all")}>
            Alles
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className="pos__chip"
              data-on={cat === c.key ? 1 : 0}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="pos__grid">
          {shown.map((p, i) => {
            const v = CAT_VARS[p.cat];
            return (
              <button
                key={p.id}
                className="pos-tile"
                data-mode={pref}
                data-tour-id={i === 0 ? "pos-product" : undefined}
                style={{ "--tile-bg": v.bg, "--tile-ink": v.ink } as React.CSSProperties}
                onClick={() => add(p)}
              >
                {pref === "image" && (
                  <span className="pos-tile__thumb" style={{ background: v.bg }}>
                    {p.emoji}
                  </span>
                )}
                <span className="pos-tile__name">{p.name}</span>
                <span className="pos-tile__price">{eur(p.price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="pos__order" aria-label="Huidige bestelling">
        <div className="pos-order__head">
          <b>Bestelling</b>
          <span className="pos-order__tag">Tafel 4</span>
        </div>

        <div className="pos-order__list">
          {lines.length === 0 && <div className="pos-empty">Tik op een product om te beginnen.</div>}
          {lines.map((l, i) => {
            const p = byId[l.id];
            return (
              <div className="pos-line" key={l.id}>
                <div className="pos-line__top">
                  <span className="pos-line__name">{p.name}</span>
                  <span className="pos-line__amt">{eur(lineTotal(l))}</span>
                </div>
                {l.discounted && <div className="pos-line__disc">Korting 10% toegepast</div>}
                <div className="pos-line__tools">
                  <span className="pos-stepper">
                    <button onClick={() => step(l.id, -1)} aria-label="Minder">
                      <Icon name="minus" size={14} />
                    </button>
                    <span>{l.qty}</span>
                    <button onClick={() => step(l.id, 1)} aria-label="Meer">
                      <Icon name="plus" size={14} />
                    </button>
                  </span>
                  <button
                    className="pos-disc"
                    data-on={l.discounted ? 1 : 0}
                    data-tour-id={i === 0 ? "pos-discount" : undefined}
                    onClick={() => toggleDisc(l.id)}
                  >
                    <Icon name="percent" size={13} />
                    Korting
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pos-order__totals">
          {saved > 0 && (
            <div className="pos-order__row">
              <span>Korting</span>
              <span>− {eur(saved)}</span>
            </div>
          )}
          <div className="pos-order__row">
            <span>Subtotaal (incl. btw)</span>
            <span>{eur(total)}</span>
          </div>
          <div className="pos-order__row pos-order__row--grand">
            <span>Totaal</span>
            <span>{eur(total)}</span>
          </div>
        </div>
        <button className="pos-pay" data-paid={paid ? 1 : 0} data-tour-id="pos-checkout" onClick={checkout}>
          <Icon name={paid ? "check" : "card"} size={19} stroke={paid ? 3 : 2} />
          {paid ? "Betaald" : `Afrekenen ${eur(total)}`}
        </button>
      </aside>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import posCss from "./styles.css?raw";

/* ───────── Gymly POS ─────────
   React/TypeScript port of the Claude Design handoff "Gymly POS.dc.html" (v2).
   A restaurant/bar point-of-sale: floor plan → order → kitchen display →
   open-orders/expediting → day report, with walk-in (counter) orders, a
   bill split into delivered / in-preparation / new, reserve, a Tebi-style
   checkout (discount → tip → split → method → receipt), and cancel flows.
   Fixed 1366×1024 in the design; here it fills the viewport and reflows to
   mobile (bottom-sheet cart, swipeable kitchen, stacked day report). */

// ── Types ──────────────────────────────────────────────
type Screen = "locked" | "start" | "floor" | "order" | "kitchen" | "orders" | "day" | "end";
type Area = "bar" | "terras";
type TableStatus = "free" | "occupied" | "reserved";
type Station = "bar" | "keuken";
type TicketStatus = "new" | "progress" | "done";
type PendingAction = "send" | "park" | null;

interface OrderLine {
  oid: string;
  name: string;
  price: number;
  qty: number;
  sent: boolean;
}
interface TableT {
  id: string;
  area?: Area;
  label: string;
  seats: number;
  status: TableStatus;
  guests: number;
  openedAt?: number | null;
  orders: OrderLine[];
  resName?: string;
  resTime?: string;
  resGuests?: number;
  walkin?: boolean;
  name?: string;
}
interface Ticket {
  id: string;
  table: string;
  items: { qty: number; name: string }[];
  status: TicketStatus;
  station: Station;
  createdAt: number;
}
interface Product {
  id: string;
  name: string;
  price: number;
  cat: string;
}

interface PosState {
  screen: Screen;
  shiftOpen: boolean;
  activeStaff: string;
  pinUser: string | null;
  pinValue: string;
  startCounts: CashCounts;
  endCounts: CashCounts;
  activeTableId: string | null;
  showReserve: boolean;
  reserveTableId: string | null;
  resName: string;
  resGuests: number;
  resTime: string;
  activeCat: string;
  showCheckout: boolean;
  toast: string | null;
  showUserMenu: boolean;
  editingOid: string | null;
  cancelOid: string | null;
  showNamePrompt: boolean;
  nameInput: string;
  pendingAction: PendingAction;
  expandOverrides: Record<string, boolean>;
  tableNotes: Record<string, string>;
  ordersTab: "open" | "closed";
  closedOrders: ClosedOrder[];
  selectedClosedId: string | null;
  ordersQuery: string;
  now: number;
  tables: TableT[];
  tickets: Ticket[];
}

interface ClosedOrder {
  id: string;
  label: string;
  paidAt: number;
  total: number;
  subtotal: number;
  tip: number;
  discount: number;
  payment: string;
  lines: { name: string; qty: number; price: number }[];
  isWalkin: boolean;
  area?: Area;
}

// ── Static data ────────────────────────────────────────
const CATS = [
  { key: "koffie", label: "Koffie", tint: "#F2ECE3" },
  { key: "frisdrank", label: "Frisdrank", tint: "#E9F0FA" },
  { key: "shakes", label: "Shakes", tint: "#FBEAF1" },
  { key: "broodjes", label: "Broodjes", tint: "#FAF1E1" },
  { key: "snacks", label: "Snacks", tint: "#EAF3EA" },
  { key: "bowls", label: "Bowls", tint: "#E2F1EF" },
];
const PRODUCTS: Product[] = [
  { id: "p1", name: "Espresso", price: 2.8, cat: "koffie" },
  { id: "p2", name: "Cappuccino", price: 3.4, cat: "koffie" },
  { id: "p3", name: "Flat white", price: 3.6, cat: "koffie" },
  { id: "p4", name: "Latte macchiato", price: 3.8, cat: "koffie" },
  { id: "p5", name: "Koffie regular", price: 3.2, cat: "koffie" },
  { id: "p6", name: "Cola", price: 3.0, cat: "frisdrank" },
  { id: "p7", name: "Spa blauw", price: 2.5, cat: "frisdrank" },
  { id: "p8", name: "Spa rood", price: 2.7, cat: "frisdrank" },
  { id: "p9", name: "Fristi", price: 2.8, cat: "frisdrank" },
  { id: "p10", name: "Ice tea", price: 3.0, cat: "frisdrank" },
  { id: "p11", name: "Protein shake", price: 6.0, cat: "shakes" },
  { id: "p12", name: "Banana shake", price: 5.5, cat: "shakes" },
  { id: "p13", name: "Berry blast", price: 6.5, cat: "shakes" },
  { id: "p14", name: "Broodje gezond", price: 5.5, cat: "broodjes" },
  { id: "p15", name: "Tosti ham-kaas", price: 4.5, cat: "broodjes" },
  { id: "p16", name: "Bagel zalm", price: 7.5, cat: "broodjes" },
  { id: "p17", name: "Bitterballen", price: 6.0, cat: "snacks" },
  { id: "p18", name: "Nachos", price: 6.5, cat: "snacks" },
  { id: "p19", name: "Loaded fries", price: 5.5, cat: "snacks" },
  { id: "p20", name: "Poke bowl", price: 11.5, cat: "bowls" },
  { id: "p21", name: "Acai bowl", price: 9.5, cat: "bowls" },
  { id: "p22", name: "Buddha bowl", price: 10.5, cat: "bowls" },
];

const AREA_ORDER: Area[] = ["bar", "terras"];
const AREA_LABELS: Record<Area, string> = { bar: "Bar", terras: "Terras" };
const PURPLE = "#7000FF";

// Staff profiles shown on the lock screen (start/switch of shift)
const EMPLOYEES: { name: string; color: string }[] = [
  { name: "Joel", color: PURPLE },
  { name: "Sophie", color: "#E0457B" },
  { name: "Lisa", color: "#2E9C8E" },
  { name: "Daan", color: "#F79009" },
];

// Euro denominations for counting the drawer at start/end of shift
// (NL hospitality drops 1/2-cent coins — cash rounds to €0,05).
type CashCounts = Record<string, number>;
const DENOMS: { key: string; label: string; value: number }[] = [
  { key: "200", label: "€200", value: 200 },
  { key: "100", label: "€100", value: 100 },
  { key: "50", label: "€50", value: 50 },
  { key: "20", label: "€20", value: 20 },
  { key: "10", label: "€10", value: 10 },
  { key: "5", label: "€5", value: 5 },
  { key: "2", label: "€2", value: 2 },
  { key: "1", label: "€1", value: 1 },
  { key: "050", label: "€0,50", value: 0.5 },
  { key: "020", label: "€0,20", value: 0.2 },
  { key: "010", label: "€0,10", value: 0.1 },
  { key: "005", label: "€0,05", value: 0.05 },
];
function cashTotal(counts: CashCounts): number {
  return round2(DENOMS.reduce((s, d) => s + (counts[d.key] || 0) * d.value, 0));
}

function fmt(n: number): string {
  return "€" + Number(n).toFixed(2).replace(".", ",");
}
function num(s: string): number {
  const v = parseFloat((s || "").replace(",", "."));
  return isFinite(v) && v > 0 ? v : 0;
}
const round2 = (n: number) => Math.round(n * 100) / 100;
function catTint(key: string): string {
  const c = CATS.find((x) => x.key === key);
  return c ? c.tint : "#F2F4F7";
}
function stationForName(name: string): Station {
  const p = PRODUCTS.find((x) => x.name === name);
  const cat = p ? p.cat : "";
  return cat === "koffie" || cat === "frisdrank" || cat === "shakes" ? "bar" : "keuken";
}
function tableTotal(t: { orders?: OrderLine[] }): number {
  return (t.orders || []).reduce((s, o) => s + o.price * o.qty, 0);
}
function tlabel(t?: TableT | null): string {
  if (!t) return "";
  return t.walkin ? (t.name && t.name.trim() ? t.name : "Nieuw order") : "Tafel " + t.label;
}

function makeInitialState(): PosState {
  const now = Date.now();
  return {
    screen: "locked",
    shiftOpen: false,
    activeStaff: "Joel",
    pinUser: null,
    pinValue: "",
    startCounts: { "50": 1, "20": 2, "10": 1 }, // tidy €100 opening float
    endCounts: {},
    activeTableId: null,
    showReserve: false,
    reserveTableId: null,
    resName: "",
    resGuests: 2,
    resTime: "19:30",
    activeCat: "alles",
    showCheckout: false,
    toast: null,
    showUserMenu: false,
    editingOid: null,
    cancelOid: null,
    showNamePrompt: false,
    nameInput: "",
    pendingAction: null,
    expandOverrides: {},
    tableNotes: { b8: "Verjaardag — taart om 21:00" },
    ordersTab: "open",
    closedOrders: [
      { id: "co1", label: "Tafel 12", paidAt: now - 600000, total: 22.0, subtotal: 22.0, tip: 0, discount: 0, payment: "pin", isWalkin: false, area: "bar", lines: [{ name: "Cappuccino", qty: 3, price: 3.4 }, { name: "Tosti ham-kaas", qty: 2, price: 4.5 }, { name: "Espresso", qty: 1, price: 2.8 }] },
      { id: "co2", label: "Sophie", paidAt: now - 1800000, total: 16.3, subtotal: 16.3, tip: 0, discount: 0, payment: "pin", isWalkin: true, lines: [{ name: "Latte macchiato", qty: 1, price: 3.8 }, { name: "Bagel zalm", qty: 1, price: 7.5 }, { name: "Spa blauw", qty: 2, price: 2.5 }] },
      { id: "co3", label: "Tafel 9", paidAt: now - 3300000, total: 42.0, subtotal: 44.5, tip: 2.5, discount: 5.0, payment: "pin", isWalkin: false, area: "bar", lines: [{ name: "Poke bowl", qty: 2, price: 11.5 }, { name: "Acai bowl", qty: 1, price: 9.5 }, { name: "Bitterballen", qty: 1, price: 6.0 }, { name: "Cola", qty: 2, price: 3.0 }] },
      { id: "co4", label: "Tafel 23", paidAt: now - 5400000, total: 10.5, subtotal: 10.5, tip: 0, discount: 0, payment: "cash", isWalkin: false, area: "terras", lines: [{ name: "Buddha bowl", qty: 1, price: 10.5 }] },
      { id: "co5", label: "Tafel 6", paidAt: now - 9000000, total: 7.2, subtotal: 7.2, tip: 0, discount: 0, payment: "account", isWalkin: false, area: "bar", lines: [{ name: "Flat white", qty: 2, price: 3.6 }] },
    ],
    selectedClosedId: null,
    ordersQuery: "",
    now,
    tables: [
      { id: "b1", area: "bar", label: "1", seats: 2, status: "free", guests: 0, orders: [] },
      { id: "b2", area: "bar", label: "2", seats: 2, status: "occupied", guests: 2, openedAt: now - 1080000, orders: [{ oid: "b2a", name: "Cappuccino", price: 3.4, qty: 2, sent: true }, { oid: "b2b", name: "Tosti ham-kaas", price: 4.5, qty: 1, sent: true }] },
      { id: "b3", area: "bar", label: "3", seats: 4, status: "free", guests: 0, orders: [] },
      { id: "b4", area: "bar", label: "4", seats: 4, status: "reserved", guests: 4, resName: "de Vries", resTime: "19:30", orders: [] },
      { id: "b5", area: "bar", label: "5", seats: 2, status: "occupied", guests: 2, openedAt: now - 2520000, orders: [{ oid: "b5a", name: "Latte macchiato", price: 3.8, qty: 1, sent: true }, { oid: "b5b", name: "Koffie regular", price: 3.2, qty: 1, sent: true }] },
      { id: "b6", area: "bar", label: "6", seats: 4, status: "free", guests: 0, orders: [] },
      { id: "b7", area: "bar", label: "7", seats: 2, status: "occupied", guests: 3, openedAt: now - 540000, orders: [{ oid: "b7a", name: "Poke bowl", price: 11.5, qty: 1, sent: true }, { oid: "b7b", name: "Cola", price: 3.0, qty: 2, sent: true }] },
      { id: "b8", area: "bar", label: "8", seats: 6, status: "occupied", guests: 5, openedAt: now - 1560000, orders: [{ oid: "b8a", name: "Bitterballen", price: 6.0, qty: 2, sent: true }, { oid: "b8b", name: "Nachos", price: 6.5, qty: 1, sent: true }, { oid: "b8c", name: "Cola", price: 3.0, qty: 4, sent: true }] },
      { id: "b9", area: "bar", label: "9", seats: 4, status: "free", guests: 0, orders: [] },
      { id: "b10", area: "bar", label: "10", seats: 2, status: "reserved", guests: 2, resName: "Janssen", resTime: "20:00", orders: [] },
      { id: "b11", area: "bar", label: "11", seats: 4, status: "free", guests: 0, orders: [] },
      { id: "b12", area: "bar", label: "12", seats: 6, status: "free", guests: 0, orders: [] },
      { id: "b13", area: "bar", label: "13", seats: 2, status: "free", guests: 0, orders: [] },
      { id: "b14", area: "bar", label: "14", seats: 4, status: "occupied", guests: 2, openedAt: now - 300000, orders: [{ oid: "b14a", name: "Espresso", price: 2.8, qty: 2, sent: true }] },
      { id: "t1", area: "terras", label: "21", seats: 2, status: "free", guests: 0, orders: [] },
      { id: "t2", area: "terras", label: "22", seats: 2, status: "free", guests: 0, orders: [] },
      { id: "t3", area: "terras", label: "23", seats: 4, status: "occupied", guests: 2, openedAt: now - 1980000, orders: [{ oid: "t3a", name: "Acai bowl", price: 9.5, qty: 2, sent: true }] },
      { id: "t4", area: "terras", label: "24", seats: 4, status: "free", guests: 0, orders: [] },
      { id: "t5", area: "terras", label: "25", seats: 6, status: "free", guests: 0, orders: [] },
      { id: "t6", area: "terras", label: "26", seats: 4, status: "reserved", guests: 4, resName: "Bakker", resTime: "18:30", orders: [] },
    ],
    tickets: [
      { id: "k1", table: "Tafel 8", items: [{ qty: 2, name: "Bitterballen" }, { qty: 1, name: "Nachos" }], status: "new", station: "keuken", createdAt: now - 60000 },
      { id: "k2", table: "Tafel 2", items: [{ qty: 1, name: "Tosti ham-kaas" }], status: "progress", station: "keuken", createdAt: now - 240000 },
      { id: "k3", table: "Tafel 7", items: [{ qty: 1, name: "Poke bowl" }], status: "progress", station: "keuken", createdAt: now - 1080000 },
      { id: "k4", table: "Tafel 5", items: [{ qty: 1, name: "Latte macchiato" }], status: "done", station: "bar", createdAt: now - 540000 },
    ],
  };
}

// Static demo data for the day report
const DAY_KPIS = [
  { label: "Omzet", value: "€1.284,50", accent: true },
  { label: "Transacties", value: "96", accent: false },
  { label: "Gem. besteding", value: "€13,38", accent: false },
  { label: "Fooien", value: "€42,00", accent: false },
];
const DAY_PAY = [
  { label: "Pinnen", amount: 842.3, color: PURPLE },
  { label: "Contant", amount: 318.2, color: "#12B76A" },
  { label: "Op rekening", amount: 124.0, color: "#F79009" },
];
const DAY_PAY_TOTAL = 1284.5;
const DAY_CATS = [
  { l: "Koffie", a: 386.4 },
  { l: "Broodjes", a: 298.0 },
  { l: "Bowls", a: 264.5 },
  { l: "Frisdrank", a: 176.6 },
  { l: "Shakes", a: 98.0 },
  { l: "Snacks", a: 61.0 },
];
const DAY_TOP = [
  { n: "Cappuccino", q: 64, a: 217.6 },
  { n: "Poke bowl", q: 18, a: 207.0 },
  { n: "Broodje gezond", q: 22, a: 121.0 },
  { n: "Latte macchiato", q: 28, a: 106.4 },
  { n: "Bitterballen", q: 14, a: 84.0 },
];
const DAY_HOURS: [number, number][] = [
  [8, 42], [9, 78], [10, 96], [11, 110], [12, 168], [13, 182], [14, 96],
  [15, 74], [16, 88], [17, 124], [18, 156], [19, 210], [20, 140], [21, 90],
];
const DAY_CASH = [
  { label: "Startgeld (wisselgeld)", v: 100, strong: false },
  { label: "Contante omzet", v: 318.2, strong: false },
  { label: "Verwacht in lade", v: 418.2, strong: true },
  { label: "Geteld", v: 420, strong: false },
];

// ── Icons ──────────────────────────────────────────────
function OrdersIcon({ stroke = "currentColor" }: { stroke?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.1" fill={stroke} stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill={stroke} stroke="none" />
      <circle cx="4.5" cy="18" r="1.1" fill={stroke} stroke="none" />
    </svg>
  );
}
function KitchenIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
function ClockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function PrintIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="9" rx="2" />
      <path d="M7 15h10v6H7z" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 5.5l4 4M4 20l1.2-4.2 9.3-9.3 4 4-9.3 9.3L4 20Z" />
    </svg>
  );
}
function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 6" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Drawer-count grid: one tile per euro denomination, tap to type the quantity.
// Used for both the opening float (start) and the closing count (end of shift).
function CashCountGrid({ counts, onSet }: { counts: CashCounts; onSet: (key: string, n: number) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
      {DENOMS.map((d) => {
        const n = counts[d.key] || 0;
        return (
          <label key={d.key} className="pos-denom">
            <span className="pos-denom-label">{d.label}</span>
            <input
              value={String(n)}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                onSet(d.key, isNaN(v) ? 0 : Math.min(v, 9999));
              }}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              className="pos-denom-input"
              style={{ color: n > 0 ? PURPLE : "#101828" }}
            />
          </label>
        );
      })}
    </div>
  );
}

// ── Component ──────────────────────────────────────────
export function PosPrototype() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "pos";
    style.textContent = posCss;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [locationName, setLocationName] = useState("Tree 11 Bar");
  const [staffName, setStaffName] = useState("Joel");
  const [s, setS] = useState<PosState>(makeInitialState);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const billRef = useRef<HTMLDivElement | null>(null);
  const prevLen = useRef(0);

  const patch = (p: Partial<PosState> | ((st: PosState) => Partial<PosState>)) =>
    setS((st) => ({ ...st, ...(typeof p === "function" ? p(st) : p) }));

  useEffect(() => {
    const iv = setInterval(() => setS((st) => ({ ...st, now: Date.now() })), 15000);
    return () => {
      clearInterval(iv);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // PIN complete (4 digits) → continue to "Dienst starten", or straight to the
  // floor when switching user while a shift is already open.
  useEffect(() => {
    if (s.screen !== "locked" || !s.pinUser || s.pinValue.length !== 4) return;
    const t = setTimeout(() => {
      setS((cur) =>
        cur.shiftOpen
          ? { ...cur, activeStaff: cur.pinUser || cur.activeStaff, screen: "floor", pinUser: null, pinValue: "" }
          : { ...cur, screen: "start" }
      );
    }, 200);
    return () => clearTimeout(t);
  }, [s.screen, s.pinUser, s.pinValue, s.shiftOpen]);

  const setToast = (msg: string) => {
    patch({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch({ toast: null }), 2600);
  };
  const findTable = (id: string | null) => s.tables.find((t) => t.id === id);
  const updateTable = (id: string, fn: (t: TableT) => TableT) =>
    patch((st) => ({ tables: st.tables.map((t) => (t.id === id ? fn({ ...t }) : t)) }));

  // ── Navigation ──
  const goKitchen = () => patch({ screen: "kitchen", showUserMenu: false });
  const goOrders = () => patch({ screen: "orders", showUserMenu: false });
  const goDay = () => patch({ screen: "day", showUserMenu: false });
  const backToFloor = () => {
    setCartSheetOpen(false);
    patch({ screen: "floor", activeTableId: null, editingOid: null });
  };
  const jumpTo = (key: string) => {
    const cont = document.getElementById("posFloorScroll");
    const el = document.getElementById("pos-sec-" + key);
    if (cont && el) cont.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: "smooth" });
  };

  // ── Shift / lock (start & end of day) ──
  const selectPinUser = (name: string) => patch({ pinUser: name, pinValue: "" });
  const pinCancel = () => patch({ pinUser: null, pinValue: "" });
  const pinBack = () => patch((st) => ({ pinValue: st.pinValue.slice(0, -1) }));
  const pinPress = (d: string) => patch((st) => (st.pinValue.length >= 4 ? {} : { pinValue: st.pinValue + d }));
  const setStartCount = (key: string, n: number) => patch((st) => ({ startCounts: { ...st.startCounts, [key]: n } }));
  const confirmStart = () => {
    const nm = s.pinUser || s.activeStaff;
    setCartSheetOpen(false);
    patch({ shiftOpen: true, activeStaff: nm, screen: "floor", pinUser: null, pinValue: "" });
    setToast("Dienst gestart · " + nm);
  };
  const setEndCount = (key: string, n: number) => patch((st) => ({ endCounts: { ...st.endCounts, [key]: n } }));
  const beginEndShift = () => patch({ showUserMenu: false, screen: "end", endCounts: {} });
  const confirmEnd = () => {
    const nm = s.activeStaff;
    setCartSheetOpen(false);
    patch({ shiftOpen: false, screen: "locked", pinUser: null, pinValue: "", endCounts: {} });
    setToast("Dienst afgesloten · " + nm);
  };

  // ── Walk-in (counter) orders ──
  const newOrder = () => {
    const id = "w" + Date.now();
    const wt: TableT = { id, walkin: true, name: "", label: "", seats: 0, guests: 0, status: "free", orders: [], openedAt: null };
    setCartSheetOpen(false);
    patch((st) => ({ tables: st.tables.concat([wt]), activeTableId: id, screen: "order", editingOid: null }));
  };
  const promptName = (action: PendingAction) => {
    const t = findTable(s.activeTableId);
    patch({ showNamePrompt: true, pendingAction: action, nameInput: (t && t.name) || "" });
  };
  const nameCancel = () => patch({ showNamePrompt: false, pendingAction: null });
  const nameConfirm = () => {
    const nm = s.nameInput.trim();
    if (!nm) return;
    const id = s.activeTableId!;
    const action = s.pendingAction;
    updateTable(id, (t) => ({ ...t, name: nm }));
    patch({ showNamePrompt: false, pendingAction: null });
    if (action === "send") setTimeout(() => sendKitchen(nm), 0);
    else if (action === "park") setTimeout(() => parkOrder(nm), 0);
  };
  const parkOrder = (forcedName?: string) => {
    const id = s.activeTableId!;
    const t = findTable(id);
    if (!t) return;
    const nm = forcedName || t.name;
    if (!(nm && nm.trim())) {
      promptName("park");
      return;
    }
    updateTable(id, (tt) => {
      if (tt.status !== "occupied") tt.status = "occupied";
      if (!tt.openedAt) tt.openedAt = Date.now();
      return tt;
    });
    setCartSheetOpen(false);
    patch({ activeTableId: null, screen: "floor" });
    setToast("Order geparkeerd op naam " + nm);
  };
  const discardWalkin = () => {
    const id = s.activeTableId;
    setCartSheetOpen(false);
    patch((st) => ({ tables: st.tables.filter((x) => x.id !== id), activeTableId: null, screen: "floor" }));
  };

  // ── Table tap / reserve ──
  // Tap on any table goes straight to the order screen — no popover. For a
  // free/reserved table we claim default guests (= seats) on the way in.
  const tapTable = (t: TableT) => {
    patch((st) => ({
      tables: st.tables.map((x) => {
        if (x.id !== t.id) return x;
        const nx = { ...x };
        if (!nx.guests) nx.guests = nx.seats;
        return nx;
      }),
      activeTableId: t.id,
      screen: "order",
    }));
  };
  const resConfirm = () => {
    if (!s.resName.trim()) return;
    const id = s.reserveTableId!;
    const nm = s.resName.trim();
    const g = s.resGuests;
    const tm = s.resTime;
    const lbl = findTable(id)!.label;
    updateTable(id, (t) => ({ ...t, status: "reserved", resName: nm, resGuests: g, guests: g, resTime: tm }));
    patch({ showReserve: false });
    setToast("Tafel " + lbl + " gereserveerd · " + nm);
  };

  // ── Order edits ──
  const addProduct = (p: Product) => {
    const id = s.activeTableId!;
    updateTable(id, (t) => {
      const orders = (t.orders || []).slice();
      const idx = orders.findIndex((o) => o.name === p.name && !o.sent);
      if (idx >= 0) orders[idx] = { ...orders[idx], qty: orders[idx].qty + 1 };
      else orders.push({ oid: "n" + Date.now() + Math.random().toString(36).slice(2, 6), name: p.name, price: p.price, qty: 1, sent: false });
      return { ...t, orders };
    });
  };
  const incItem = (oid: string) =>
    updateTable(s.activeTableId!, (t) => ({ ...t, orders: (t.orders || []).map((o) => (o.oid === oid ? { ...o, qty: o.qty + 1 } : o)) }));
  const decItem = (oid: string) =>
    updateTable(s.activeTableId!, (t) => {
      const out: OrderLine[] = [];
      (t.orders || []).forEach((o) => {
        if (o.oid !== oid) return out.push(o);
        if (o.qty > 1) out.push({ ...o, qty: o.qty - 1 });
      });
      return { ...t, orders: out };
    });
  // In-preparation line edit — keeps the kitchen ticket in sync
  const removeSentLine = (oid: string) => {
    const t = findTable(s.activeTableId);
    if (!t) return;
    const item = (t.orders || []).find((o) => o.oid === oid);
    if (!item) return;
    const nm = item.name;
    const qty = item.qty;
    const lbl = tlabel(t);
    updateTable(t.id, (tt) => ({ ...tt, orders: (tt.orders || []).filter((o) => o.oid !== oid) }));
    patch((st) => ({
      tickets: st.tickets
        .map((k) => {
          if (k.table !== lbl) return k;
          const items: { qty: number; name: string }[] = [];
          let toRemove = qty;
          k.items.forEach((it) => {
            if (it.name === nm && toRemove > 0) {
              const keep = it.qty - toRemove;
              toRemove -= it.qty;
              if (keep > 0) items.push({ ...it, qty: keep });
            } else items.push(it);
          });
          return { ...k, items };
        })
        .filter((k) => k.items.length > 0),
    }));
  };
  const adjustSentQty = (oid: string, delta: number) => {
    const t = findTable(s.activeTableId);
    if (!t) return;
    const item = (t.orders || []).find((o) => o.oid === oid);
    if (!item) return;
    const nm = item.name;
    const lbl = tlabel(t);
    const newQty = item.qty + delta;
    updateTable(t.id, (tt) => {
      if (newQty <= 0) return { ...tt, orders: (tt.orders || []).filter((o) => o.oid !== oid) };
      return { ...tt, orders: (tt.orders || []).map((o) => (o.oid === oid ? { ...o, qty: newQty } : o)) };
    });
    patch((st) => {
      let tickets = st.tickets.slice();
      if (delta > 0) {
        let added = false;
        tickets = tickets.map((k) => {
          if (added || k.table !== lbl || !k.items.some((it) => it.name === nm)) return k;
          added = true;
          return { ...k, items: k.items.map((it) => (it.name === nm ? { ...it, qty: it.qty + 1 } : it)) };
        });
        if (!added) tickets = tickets.concat([{ id: "k" + Date.now(), table: lbl, items: [{ qty: 1, name: nm }], status: "new", station: stationForName(nm), createdAt: Date.now() }]);
      } else {
        tickets = tickets
          .map((k) => {
            if (k.table !== lbl) return k;
            const items: { qty: number; name: string }[] = [];
            let toRemove = 1;
            k.items.forEach((it) => {
              if (it.name === nm && toRemove > 0) {
                const keep = it.qty - toRemove;
                toRemove -= it.qty;
                if (keep > 0) items.push({ ...it, qty: keep });
              } else items.push(it);
            });
            return { ...k, items };
          })
          .filter((k) => k.items.length > 0);
      }
      return { tickets };
    });
    if (newQty <= 0) patch({ editingOid: null });
  };
  const toggleEdit = (oid: string) => patch((st) => ({ editingOid: st.editingOid === oid ? null : oid }));
  const confirmCancel = (reason: string) => {
    const oid = s.cancelOid!;
    const t = findTable(s.activeTableId);
    const item = t && (t.orders || []).find((o) => o.oid === oid);
    const nm = item ? item.name : "";
    removeSentLine(oid);
    patch({ cancelOid: null, editingOid: null });
    setToast("Geannuleerd: " + nm + " · " + reason + " · voorraad gecorrigeerd");
  };

  // ── Kitchen / expediting ──
  const sendKitchen = (forcedName?: string) => {
    const t = findTable(s.activeTableId);
    if (!t) return;
    if (t.walkin && !((forcedName || t.name) && (forcedName || t.name || "").trim())) {
      promptName("send");
      return;
    }
    const unsent = (t.orders || []).filter((o) => !o.sent);
    if (!unsent.length) return;
    const lbl = forcedName && t.walkin ? forcedName : tlabel(t);
    const groups: Record<string, { qty: number; name: string }[]> = {};
    unsent.forEach((o) => {
      const st = stationForName(o.name);
      (groups[st] = groups[st] || []).push({ qty: o.qty, name: o.name });
    });
    updateTable(t.id, (tt) => {
      tt.orders = (tt.orders || []).map((o) => ({ ...o, sent: true }));
      if (tt.status !== "occupied") {
        tt.status = "occupied";
        if (!tt.guests) tt.guests = tt.seats;
      }
      if (!tt.openedAt) tt.openedAt = Date.now();
      return tt;
    });
    const stationKeys = Object.keys(groups);
    const newTickets: Ticket[] = stationKeys.map((st, i) => ({ id: "k" + Date.now() + i, table: lbl, items: groups[st], status: "new", station: st as Station, createdAt: Date.now() }));
    patch((st) => ({ tickets: st.tickets.concat(newTickets) }));
    setCartSheetOpen(false);
    const dest = stationKeys.length > 1 ? "keuken & bar" : stationKeys[0] === "bar" ? "de bar" : "de keuken";
    setToast("Doorgestuurd naar " + dest);
  };
  const advanceTicket = (id: string) =>
    patch((st) => ({
      tickets: st.tickets.flatMap((k) => {
        if (k.id !== id) return [k];
        if (k.status === "new") return [{ ...k, status: "progress" as TicketStatus }];
        if (k.status === "progress") return [{ ...k, status: "done" as TicketStatus }];
        return []; // done → bumped/delivered, remove from board
      }),
    }));
  const setExpand = (id: string, val: boolean) =>
    patch((st) => ({ expandOverrides: { ...st.expandOverrides, [id]: val } }));
  const setTableNote = (id: string, val: string) =>
    patch((st) => ({ tableNotes: { ...st.tableNotes, [id]: val } }));
  const printInterimReceipt = (t: TableT) => {
    const total = tableTotal(t);
    setToast("Tussenbon geprint · " + tlabel(t) + " · " + fmt(total));
  };

  // ── Checkout ──
  const onCheckout = () => {
    const t = findTable(s.activeTableId);
    if (!t || !tableTotal(t)) return;
    setCartSheetOpen(false);
    patch({ showCheckout: true });
  };
  const finalizePaid = (grand: number, breakdown: { subtotal: number; tip: number; discount: number; payment: string }) => {
    const id = s.activeTableId;
    const t = findTable(id);
    if (!t) return;
    const lbl = tlabel(t);
    const isWalk = !!t.walkin;
    const closed: ClosedOrder = {
      id: "co" + Date.now() + Math.random().toString(36).slice(2, 6),
      label: lbl,
      paidAt: Date.now(),
      total: grand,
      subtotal: breakdown.subtotal,
      tip: breakdown.tip,
      discount: breakdown.discount,
      payment: breakdown.payment,
      isWalkin: isWalk,
      area: t.area,
      lines: (t.orders || []).map((o) => ({ name: o.name, qty: o.qty, price: o.price })),
    };
    patch((st) => ({ closedOrders: [closed, ...st.closedOrders] }));
    if (isWalk) patch((st) => ({ tables: st.tables.filter((x) => x.id !== id) }));
    else updateTable(t.id, (tt) => ({ ...tt, status: "free", orders: [], guests: 0, resName: "", resTime: "", openedAt: null }));
    patch((st) => ({ tickets: st.tickets.filter((k) => k.table !== lbl), showCheckout: false, activeTableId: null, screen: "floor" }));
    setToast(lbl + " afgerekend · " + fmt(grand));
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const timeText = (createdAt: number) => {
    const m = Math.floor((s.now - createdAt) / 60000);
    return m < 1 ? "zojuist" : m + " min";
  };

  // ── Derived ──
  const displayStaff = s.activeStaff || staffName;
  const staffInitial = (displayStaff[0] || "J").toUpperCase();
  const startTotal = cashTotal(s.startCounts);
  const countFree = s.tables.filter((t) => t.status === "free" && !t.walkin).length;
  const countOcc = s.tables.filter((t) => t.status === "occupied").length;
  const countRes = s.tables.filter((t) => t.status === "reserved").length;
  const kitchenBadge = s.tickets.filter((k) => k.status === "new" || k.status === "progress").length;

  const at = findTable(s.activeTableId) || ({ id: "", label: "", orders: [], seats: 0, guests: 0, status: "free" } as TableT);
  const orders = at.orders || [];
  const subtotal = tableTotal(at);
  const hasItems = orders.length > 0;
  const hasUnsent = orders.some((o) => !o.sent);
  const itemCount = orders.reduce((a, o) => a + o.qty, 0);
  const sentSrc = orders.filter((o) => o.sent);
  const newSrc = orders.filter((o) => !o.sent);

  // Auto-scroll the bill to the bottom when a line is added / on entering order
  useEffect(() => {
    if (s.screen !== "order") {
      prevLen.current = orders.length;
      return;
    }
    const el = billRef.current;
    if (el && orders.length >= prevLen.current) el.scrollTop = el.scrollHeight;
    prevLen.current = orders.length;
  }, [orders.length, s.screen, s.activeTableId]);

  // primary / secondary order actions
  let primaryLabel = "";
  let primaryAction: () => void = () => {};
  let primaryIcon = false;
  let showPrimary = true;
  let secondaryLabel = "";
  let secondaryAction: () => void = () => {};
  if (at.walkin) {
    if (hasUnsent) { primaryLabel = "Submit"; primaryIcon = true; primaryAction = () => sendKitchen(); secondaryLabel = "Afrekenen"; secondaryAction = onCheckout; }
    else if (hasItems) { primaryLabel = "Afrekenen"; primaryAction = onCheckout; secondaryLabel = "Order parkeren"; secondaryAction = () => parkOrder(); }
    else { showPrimary = false; secondaryLabel = "Annuleren"; secondaryAction = discardWalkin; }
  } else if (hasUnsent) {
    primaryLabel = "Submit"; primaryIcon = true; primaryAction = () => sendKitchen(); secondaryLabel = "Afrekenen"; secondaryAction = onCheckout;
  } else if (hasItems) {
    primaryLabel = "Afrekenen"; primaryAction = onCheckout; secondaryLabel = "Tafel sluiten"; secondaryAction = () => finalizeSimpleClose();
  } else {
    showPrimary = false; secondaryLabel = "Tafel sluiten"; secondaryAction = backToFloor;
  }
  const barLabel = showPrimary ? primaryLabel : secondaryLabel;
  const barAction = showPrimary ? primaryAction : secondaryAction;

  function finalizeSimpleClose() {
    const t = findTable(s.activeTableId);
    const lbl = t ? tlabel(t) : "";
    if (t) updateTable(t.id, (tt) => ({ ...tt, status: "free", orders: [], guests: 0, resName: "", resTime: "", openedAt: null }));
    setCartSheetOpen(false);
    patch((st) => ({ tickets: st.tickets.filter((k) => k.table !== lbl), activeTableId: null, screen: "floor" }));
    setToast((t && t.label ? "Tafel " + t.label : lbl) + " gesloten");
  }

  // floor walk-in cards + open-order count
  const walkinList = s.tables.filter((t) => t.walkin && t.orders && t.orders.length);
  const openThings = s.tables.filter((t) => t.orders && t.orders.length > 0);

  // open orders / expediting
  const occ = s.tables.filter((t) => t.status === "occupied");
  const openOrders = occ
    .map((t) => {
      const m = Math.floor((s.now - (t.openedAt || s.now)) / 60000);
      const wc = m >= 30 ? { color: "#B42318", background: "#FEE4E2" } : m >= 15 ? { color: "#B54708", background: "#FEF0C7" } : { color: "#475467", background: "#F2F4F7" };
      const ic = (t.orders || []).reduce((a, o) => a + o.qty, 0);
      const lbl = tlabel(t);
      const lines: { name: string; qty: number; price: number }[] = (t.orders || []).map((o) => ({
        name: o.name,
        qty: o.qty,
        price: o.price,
      }));
      const exp = !!s.expandOverrides[t.id];
      return { t, m, wc, ic, lbl, lines, exp };
    })
    .sort((a, b) => b.m - a.m);

  const Avatar = () => <div className="pos-avatar">{staffInitial}</div>;
  const BackBtn = () => (
    <div className="pos-icon-btn" onClick={backToFloor} style={{ fontSize: 20 }}>{"←"}</div>
  );
  const OrdersButton = () => (
    <div className="pos-btn" onClick={goOrders}>
      <ReceiptIcon />
      <span className="pos-btn-label">Orders</span>
      {countOcc > 0 && <span className="pos-badge" style={{ background: PURPLE }}>{countOcc}</span>}
    </div>
  );
  const KitchenButton = () => (
    <div className="pos-btn" onClick={goKitchen}>
      <KitchenIcon />
      <span className="pos-btn-label">Keuken</span>
      {kitchenBadge > 0 && <span className="pos-badge" style={{ background: "#F79009" }}>{kitchenBadge}</span>}
    </div>
  );

  function BillLine({ o }: { o: OrderLine }) {
    const editing = s.editingOid === o.oid;
    const onDec = () => adjustSentQty(o.oid, -1);
    const onInc = () => adjustSentQty(o.oid, 1);
    if (!editing)
      // Tap-the-whole-row to edit — standard touch POS pattern (Square /
      // Lightspeed / Toast all use this; no separate small pencil button).
      return (
        <div
          onClick={() => toggleEdit(o.oid)}
          className="pos-bill-line"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", margin: "0 -8px", borderRadius: 10, borderBottom: "1px solid #F7F8FA", cursor: "pointer", minHeight: 56 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F2F4F7", color: "#98A2B3", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{o.qty}</div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500, color: "#98A2B3" }}>{o.name}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#98A2B3" }}>{fmt(o.price * o.qty)}</div>
        </div>
      );
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F7F8FA", minHeight: 60 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: "#101828" }}>{o.name}</div>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
          <div onClick={onDec} className="pos-step" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#475467", cursor: "pointer", userSelect: "none" }}>{"−"}</div>
          <div style={{ minWidth: 32, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{o.qty}</div>
          <div onClick={onInc} className="pos-step" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: PURPLE, cursor: "pointer", userSelect: "none" }}>+</div>
        </div>
        <div className="pos-del-btn pos-tap" onClick={() => patch({ cancelOid: o.oid })} title="Annuleren" style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D92D20", flexShrink: 0 }}>
          <XIcon />
        </div>
        <div className="pos-ok-btn pos-tap" onClick={() => toggleEdit(o.oid)} title="Klaar" style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#12B76A", flexShrink: 0 }}>
          <CheckIcon size={18} />
        </div>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="pos-root">
      {/* ───── Locked / sign-in (start of shift) ───── */}
      {s.screen === "locked" && (
        <div className="pos-screen" style={{ alignItems: "center", justifyContent: "center", background: "#F9FAFB", padding: 40 }}>
          <img src="/prototypes/pos/location-logo.svg" alt={locationName} style={{ height: 34, display: "block", marginBottom: 8 }} />
          <div style={{ fontSize: 14, color: "#98A2B3", fontWeight: 500, marginBottom: 38 }}>Point of Sale</div>
          {s.pinUser ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Hoi {s.pinUser}</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 24 }}>Voer je pincode in</div>
              <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < s.pinValue.length ? PURPLE : "transparent", border: "2px solid " + (i < s.pinValue.length ? PURPLE : "#D0D5DD") }} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 84px)", gap: 12 }}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((d, i) => (
                  <div
                    key={i}
                    onClick={() => { if (d === "back") pinBack(); else if (d !== "") pinPress(d); }}
                    className={d === "" ? undefined : "pos-key"}
                    style={{ height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, cursor: d === "" ? "default" : "pointer", background: d === "" ? "transparent" : "#fff", border: d === "" ? "none" : "1px solid #EAECF0", color: "#101828", userSelect: "none" }}
                  >
                    {d === "back" ? "⌫" : d}
                  </div>
                ))}
              </div>
              <div onClick={pinCancel} style={{ marginTop: 24, fontSize: 14, fontWeight: 600, color: "#667085", cursor: "pointer" }}>Annuleren</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#475467", marginBottom: 22 }}>Kies je profiel om in te loggen</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                {EMPLOYEES.map((e, idx) => {
                  const name = idx === 0 ? staffName || e.name : e.name;
                  return (
                    <div key={e.name} onClick={() => selectPinUser(name)} className="pos-profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, cursor: "pointer", padding: "16px 22px", borderRadius: 18 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: e.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>{(name[0] || "?").toUpperCase()}</div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#101828" }}>{name}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ───── Start shift (count opening float) ───── */}
      {s.screen === "start" && (
        <div className="pos-screen" style={{ background: "#F9FAFB", overflow: "auto", padding: 24 }}>
          <div style={{ width: "min(560px, 100%)", margin: "auto", background: "#fff", border: "1px solid #EAECF0", borderRadius: 24, padding: 30, boxShadow: "0 1px 3px rgba(16,24,40,0.05)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dienst starten</div>
            <div style={{ fontSize: 14, color: "#667085", marginBottom: 22 }}>Welkom {s.pinUser || displayStaff} · tel het startgeld in de lade.</div>
            <CashCountGrid counts={s.startCounts} onSet={setStartCount} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F2F4F7", marginTop: 18, paddingTop: 16, marginBottom: 20 }}>
              <span style={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Startgeld (wisselgeld)</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{fmt(startTotal)}</span>
            </div>
            <div onClick={confirmStart} style={{ height: 54, borderRadius: 14, background: PURPLE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Dienst starten</div>
          </div>
        </div>
      )}

      {/* ───── Floor ───── */}
      {s.screen === "floor" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side" style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em" }}>
              {locationName === "Tree 11 Bar" ? (
                <img src="/prototypes/pos/location-logo.svg" alt="Tree 11 Bar" style={{ height: 30, width: "auto", display: "block" }} />
              ) : (
                locationName
              )}
            </div>
            <div className="pos-header-side">
              <OrdersButton />
              <KitchenButton />
              <div className="pos-btn" onClick={newOrder} style={{ background: PURPLE, color: "#fff", border: "none", fontWeight: 700, padding: "10px 16px" }}>
                <PlusIcon />
                <span className="pos-btn-label">Nieuw order</span>
              </div>
              <div className="pos-icon-btn" onClick={() => patch((st) => ({ showUserMenu: !st.showUserMenu }))} style={{ fontSize: 22, lineHeight: 0 }}>{"⋮"}</div>
            </div>
          </div>

          <div className="pos-floor-subhead">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#98A2B3" }}>Spring naar</span>
              <div style={{ display: "flex", gap: 8 }}>
                {AREA_ORDER.map((key) => (
                  <div key={key} onClick={() => jumpTo(key)} style={{ background: "#F2F4F7", border: "1px solid #EAECF0", borderRadius: 999, padding: "7px 15px", fontSize: 14, fontWeight: 600, color: "#344054", cursor: "pointer" }}>
                    {AREA_LABELS[key]}
                  </div>
                ))}
              </div>
            </div>
            <div className="pos-floor-legend">
              <Legend dot={<span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1.5px solid #E4E7EC" }} />} text={`${countFree} vrij`} />
              <Legend dot={<span style={{ width: 11, height: 11, borderRadius: "50%", background: "#F4EBFF", border: "1.5px solid " + PURPLE }} />} text={`${countOcc} bezet`} />
              <Legend dot={<span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFFBF4", border: "1.5px dashed #F79009" }} />} text={`${countRes} gereserveerd`} />
            </div>
          </div>

          <div id="posFloorScroll" className="pos-floor-scroll">
            {openThings.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div
                  onClick={goOrders}
                  style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 2px 14px", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>Open orders</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#98A2B3" }}>{openThings.length} open · bekijk alle ›</div>
                </div>
                {walkinList.length > 0 && (
                  <div className="pos-floor-grid">
                    {walkinList.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => patch({ activeTableId: t.id, screen: "order" })}
                        style={{ borderRadius: 16, padding: "14px 16px", height: 116, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", background: "#EFF8F7", border: "1.5px solid #2E9C8E", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#16544C", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name && t.name.trim() ? t.name : "Naamloos"}</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E9C8E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="8" r="3.2" />
                            <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: "#16544C" }}>{fmt(tableTotal(t))}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#4E8C84" }}>{t.orders.reduce((a, o) => a + o.qty, 0)} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {AREA_ORDER.map((key) => {
              const ts = s.tables.filter((t) => t.area === key);
              return (
                <div key={key} id={"pos-sec-" + key} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "6px 2px 14px" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>{AREA_LABELS[key]}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#98A2B3" }}>{ts.length} tafels</div>
                  </div>
                  <div className="pos-floor-grid">
                    {ts.map((t) => (
                      <TableCard key={t.id} t={t} tickets={s.tickets} now={s.now} onTap={() => tapTable(t)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── Order ───── */}
      {s.screen === "order" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side">
              <BackBtn />
              <div className="pos-header-title">{s.activeTableId ? tlabel(at) : ""}</div>
              <div className="pos-header-sub">{at.walkin ? "Losse order" : (at.guests || at.seats) + " gasten"}</div>
            </div>
            <div className="pos-header-side">
              <OrdersButton />
              <KitchenButton />
              <Avatar />
            </div>
          </div>

          <div className="pos-order-body">
            <div className="pos-product-area">
              <div className="pos-cat-pills">
                {[{ key: "alles", label: "Alles" }, ...CATS.map((c) => ({ key: c.key, label: c.label }))].map((c) => {
                  const on = s.activeCat === c.key;
                  return (
                    <div key={c.key} onClick={() => patch({ activeCat: c.key })} style={{ padding: "9px 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", ...(on ? { background: PURPLE, color: "#fff" } : { background: "#F9F5FF", color: "#6941C6" }) }}>
                      {c.label}
                    </div>
                  );
                })}
              </div>
              <div className="pos-product-scroll">
                <div className="pos-product-grid">
                  {(s.activeCat === "alles" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === s.activeCat)).map((p) => (
                    <div key={p.id} className="pos-tile" onClick={() => addProduct(p)} style={{ background: catTint(p.cat), border: "1px solid rgba(16,24,40,0.04)", borderRadius: 16, padding: 14, height: 118, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", userSelect: "none", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, color: "#101828" }}>{p.name}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#475467" }}>{fmt(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {cartSheetOpen && <div className="pos-cart-backdrop" onClick={() => setCartSheetOpen(false)} />}

            <aside className={"pos-cart" + (cartSheetOpen ? " open" : "")}>
              <div className="pos-cart-grip" onClick={() => setCartSheetOpen(false)} />
              <div style={{ flexShrink: 0, padding: "20px 22px 14px", borderBottom: "1px solid #F2F4F7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Bestelling</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6941C6", background: "#F4EBFF", padding: "5px 11px", borderRadius: 999 }}>{at.status === "occupied" ? "Lopende rekening" : "Nieuwe bestelling"}</div>
              </div>
              <div ref={billRef} style={{ flex: 1, overflow: "auto", padding: "6px 22px" }}>
                {sentSrc.length > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px 0 10px", color: "#98A2B3", fontSize: 12, fontWeight: 600 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                      Eerdere orders
                    </div>
                    {sentSrc.map((o) => <BillLine key={o.oid} o={o} />)}
                  </>
                )}
                {newSrc.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6941C6", textTransform: "uppercase", letterSpacing: "0.04em", padding: "14px 0 4px" }}>Nieuw · nog niet verstuurd</div>
                    {newSrc.map((o) => (
                      <div key={o.oid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", minHeight: 56 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#101828" }}>{o.name}</div>
                          <div style={{ fontSize: 12, color: "#98A2B3" }}>{fmt(o.price)}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
                          <div onClick={() => decItem(o.oid)} className="pos-step" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#475467", cursor: "pointer", userSelect: "none" }}>{"−"}</div>
                          <div style={{ minWidth: 32, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{o.qty}</div>
                          <div onClick={() => incItem(o.oid)} className="pos-step" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: PURPLE, cursor: "pointer", userSelect: "none" }}>+</div>
                        </div>
                        <div style={{ width: 64, textAlign: "right", fontSize: 15, fontWeight: 700, color: "#101828" }}>{fmt(o.price * o.qty)}</div>
                      </div>
                    ))}
                  </>
                )}
                {!hasItems && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, textAlign: "center", color: "#98A2B3" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F4EBFF", color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 26, fontWeight: 600 }}>+</div>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>Nog geen items.<br />Tik op een product om toe te voegen.</div>
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, padding: "16px 22px 20px", borderTop: "1px solid #EAECF0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 15, color: "#475467", fontWeight: 500 }}>Totaal</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{fmt(subtotal)}</span>
                </div>
                {showPrimary && (
                  <div onClick={primaryAction} style={{ height: 54, borderRadius: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer", background: PURPLE, color: "#fff" }}>{primaryIcon && <ArrowRightIcon />}{primaryLabel}</div>
                )}
                <div onClick={secondaryAction} style={{ height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, cursor: "pointer", background: "#fff", border: "1px solid #E4E7EC", color: "#475467" }}>{secondaryLabel}</div>
              </div>
            </aside>

            <div className="pos-cart-bar">
              <div onClick={() => setCartSheetOpen((v) => !v)} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#F4EBFF", color: "#6941C6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>{itemCount}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#98A2B3", fontWeight: 600 }}>{itemCount === 1 ? "1 item" : itemCount + " items"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(subtotal)}</div>
                </div>
              </div>
              <div onClick={barAction} style={{ height: 48, padding: "0 18px", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", ...(showPrimary ? { background: PURPLE, color: "#fff" } : { background: "#F2F4F7", color: "#475467" }) }}>{showPrimary && primaryIcon && <ArrowRightIcon />}{barLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* ───── Kitchen ───── */}
      {s.screen === "kitchen" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side">
              <BackBtn />
              <div className="pos-header-title">Keuken</div>
              <div className="pos-header-sub">{kitchenBadge + " actieve tickets"}</div>
            </div>
            <div className="pos-header-side">
              <Avatar />
            </div>
          </div>
          <div className="pos-kitchen-cols">
            {([{ key: "new", label: "Nieuw", accent: "#F79009" }, { key: "progress", label: "In behandeling", accent: PURPLE }, { key: "done", label: "Klaar", accent: "#12B76A" }] as const).map((cd) => {
              const ts = s.tickets.filter((k) => k.status === cd.key);
              return (
                <div key={cd.key} className="pos-kitchen-col">
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 6px 14px" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: cd.accent, display: "inline-block" }} />
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{cd.label}</span>
                    <span style={{ marginLeft: "auto", background: "#fff", color: "#475467", fontSize: 13, fontWeight: 700, minWidth: 24, height: 24, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{ts.length}</span>
                  </div>
                  <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    {ts.map((k) => (
                      <div key={k.id} style={{ background: "#fff", borderRadius: 14, padding: 14, borderLeft: "4px solid " + cd.accent, boxShadow: "0 1px 3px rgba(16,24,40,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>{k.table}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em", ...(k.station === "bar" ? { background: "#FEF0C7", color: "#B54708" } : { background: "#F4EBFF", color: "#6941C6" }) }}>{k.station === "bar" ? "Bar" : "Keuken"}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#98A2B3" }}>{timeText(k.createdAt)}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 13 }}>
                          {k.items.map((it, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "#344054" }}>
                              <span style={{ fontWeight: 700, color: "#101828", minWidth: 24 }}>{it.qty + "×"}</span>
                              <span>{it.name}</span>
                            </div>
                          ))}
                        </div>
                        <div onClick={() => advanceTicket(k.id)} style={{ height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", background: cd.accent, color: "#fff" }}>
                          {cd.key === "new" ? "Start bereiding" : cd.key === "progress" ? "Markeer klaar" : "Geleverd · afronden"}
                        </div>
                      </div>
                    ))}
                    {ts.length === 0 && <div style={{ textAlign: "center", color: "#98A2B3", fontSize: 13, padding: "28px 0" }}>Geen tickets</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── Open orders / expediting ───── */}
      {s.screen === "orders" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side">
              <BackBtn />
              <div className="pos-header-title">Orders</div>
              <div className="pos-header-sub">{s.ordersTab === "open" ? occ.length + " openstaand" : s.closedOrders.length + " afgerekend vandaag"}</div>
            </div>
            <div className="pos-header-side">
              <KitchenButton />
              <Avatar />
            </div>
          </div>

          <div style={{ flexShrink: 0, padding: "14px 28px 0", display: "flex", flexDirection: "column", gap: 12, maxWidth: 940, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #EAECF0" }}>
              {([
                { k: "open", label: "Open", count: occ.length },
                { k: "closed", label: "Afgerekend", count: s.closedOrders.length },
              ] as const).map((tab) => {
                const on = s.ordersTab === tab.k;
                return (
                  <button
                    key={tab.k}
                    onClick={() => patch({ ordersTab: tab.k })}
                    style={{ background: "transparent", border: 0, padding: "10px 16px", marginBottom: -1, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: on ? PURPLE : "#667085", borderBottom: "2px solid " + (on ? PURPLE : "transparent"), cursor: "pointer" }}
                  >
                    {tab.label}
                    <span style={{ background: on ? "#F4EBFF" : "#F2F4F7", color: on ? "#6941C6" : "#667085", fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 999 }}>{tab.count}</span>
                  </button>
                );
              })}
              {s.ordersTab === "closed" && (
                <div style={{ marginLeft: "auto", padding: "4px 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    value={s.ordersQuery}
                    onChange={(e) => patch({ ordersQuery: e.target.value })}
                    placeholder="Zoek tafel of naam…"
                    style={{ height: 34, border: "1px solid #E4E7EC", borderRadius: 8, padding: "0 12px", fontSize: 13.5, color: "#101828", outline: "none", width: 220, background: "#fff" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "16px 28px 28px", minHeight: 0 }}>
            {s.ordersTab === "open" ? (
              occ.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 940, margin: "0 auto" }}>
                  {openOrders.map(({ t, m, wc, ic, lbl, lines, exp }) => {
                    const note = s.tableNotes[t.id] || "";
                    return (
                    <div key={t.id} className="pos-oo-row" style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, boxShadow: "0 1px 2px rgba(16,24,40,0.04)", overflow: "hidden" }}>
                      <div onClick={() => setExpand(t.id, !exp)} style={{ display: "flex", alignItems: "center", gap: 18, padding: "15px 18px", cursor: "pointer" }}>
                        <div style={{ width: 50, height: 50, borderRadius: 12, background: "#F4EBFF", color: "#6941C6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{t.walkin ? (t.name || "?").slice(0, 2) : t.label}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>{lbl}</div>
                          <div style={{ fontSize: 13, color: "#667085" }}>{(t.walkin ? "Losse order" : (t.area === "bar" ? "Bar" : "Terras") + " · " + (t.guests || t.seats) + " gasten") + " · " + ic + " items"}</div>
                        </div>
                        <div className="pos-oo-wait" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, fontSize: 13, fontWeight: 700, ...wc }}>
                          <ClockIcon />
                          <span>{m < 1 ? "< 1 min" : m + " min"}</span>
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#101828", width: 86, textAlign: "right" }}>{fmt(tableTotal(t))}</div>
                        <span style={{ display: "inline-block", transition: "transform .15s", transform: exp ? "rotate(90deg)" : "rotate(0deg)", fontSize: 22, color: "#D0D5DD", fontWeight: 600 }}>{"›"}</span>
                      </div>
                      {exp && (
                        <div style={{ borderTop: "1px solid #F2F4F7", background: "#FCFCFD", padding: "10px 18px 14px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#98A2B3", textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 0 6px" }}>Bestelling</div>
                          {lines.map((ln, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 2px", borderBottom: "1px solid #F2F4F7" }}>
                              <span style={{ fontSize: 15, fontWeight: 700, color: "#101828", minWidth: 30 }}>{ln.qty}×</span>
                              <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: "#101828" }}>{ln.name}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#475467", width: 72, textAlign: "right" }}>{fmt(ln.price * ln.qty)}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, padding: "10px 12px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 3, flexShrink: 0 }}>
                              <path d="M4 5h16M4 10h16M4 15h10" />
                            </svg>
                            <input
                              value={note}
                              onChange={(e) => setTableNote(t.id, e.target.value)}
                              placeholder="Notitie voor deze tafel — bv. allergie, verjaardag, betaalt apart…"
                              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 14, fontWeight: 500, color: "#101828", padding: "3px 0" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                            <div onClick={() => printInterimReceipt(t)} className="pos-hover-row" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 42, borderRadius: 11, background: "#fff", border: "1px solid #E4E7EC", color: "#344054", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                              <PrintIcon size={15} />
                              Tussenbon printen
                            </div>
                            <div onClick={() => patch({ activeTableId: t.id, screen: "order" })} className="pos-hover-row" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 42, borderRadius: 11, background: "#fff", border: "1px solid #E4E7EC", color: "#475467", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Open volledige bestelling ›</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );})}
                </div>
              ) : (
                <EmptyOrders title="Geen openstaande orders" sub="Alle tafels zijn vrij of afgerekend." />
              )
            ) : (() => {
              const q = s.ordersQuery.trim().toLowerCase();
              const filtered = s.closedOrders.filter((c) => !q || c.label.toLowerCase().includes(q));
              if (!filtered.length) return <EmptyOrders title={q ? "Geen resultaten" : "Nog niets afgerekend"} sub={q ? "Pas je zoekopdracht aan." : "Afgerekende orders verschijnen hier."} />;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 940, margin: "0 auto" }}>
                  {filtered.map((c) => {
                    const m = Math.floor((s.now - c.paidAt) / 60000);
                    const timeText = m < 1 ? "zojuist" : m < 60 ? m + " min geleden" : Math.floor(m / 60) + "u" + (m % 60 ? " " + (m % 60) + "m" : "") + " geleden";
                    return (
                      <div key={c.id} onClick={() => patch({ selectedClosedId: c.id })} className="pos-oo-row" style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid #EAECF0", borderRadius: 14, padding: "13px 16px", cursor: "pointer", boxShadow: "0 1px 2px rgba(16,24,40,0.03)" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: "#ECFDF3", color: "#067647", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckIcon size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>{c.label}</div>
                          <div style={{ fontSize: 12.5, color: "#667085" }}>{timeText} · {c.lines.reduce((a, l) => a + l.qty, 0)} items · {paymentLabel(c.payment)}</div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#101828", width: 86, textAlign: "right" }}>{fmt(c.total)}</div>
                        <div onClick={(e) => { e.stopPropagation(); setToast("Bon herprint · " + c.label); }} className="pos-icon-btn pos-hover-row" title="Bon herprinten" style={{ border: "1px solid #E4E7EC" }}>
                          <PrintIcon />
                        </div>
                        <span style={{ fontSize: 22, color: "#D0D5DD", fontWeight: 600 }}>{"›"}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ───── Day report ───── */}
      {s.screen === "day" && <DayReport staffName={displayStaff} staffInitial={staffInitial} onBack={backToFloor} />}

      {/* ───── End shift (count drawer + cash difference) ───── */}
      {s.screen === "end" && (() => {
        const expected = round2(startTotal + 318.2);
        const endTotal = cashTotal(s.endCounts);
        const anyCounted = DENOMS.some((d) => (s.endCounts[d.key] || 0) > 0);
        const diff = anyCounted ? round2(endTotal - expected) : null;
        const diffText = diff == null ? "—" : (diff >= 0 ? "+ " : "− ") + fmt(Math.abs(diff));
        const diffColor = diff == null ? "#98A2B3" : diff < -0.005 ? "#B42318" : "#067647";
        return (
          <div className="pos-screen">
            <div className="pos-header">
              <div className="pos-header-side">
                <div className="pos-icon-btn" onClick={backToFloor} style={{ fontSize: 20 }}>{"←"}</div>
                <div className="pos-header-title">Dienst afsluiten</div>
                <div className="pos-header-sub">{displayStaff} · sinds 08:00</div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 24, display: "flex", justifyContent: "center", minHeight: 0 }}>
              <div style={{ width: "min(560px, 100%)", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ flex: 1, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: "16px 18px" }}>
                    <div style={{ fontSize: 13, color: "#667085", fontWeight: 600, marginBottom: 6 }}>Omzet</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>€1.284,50</div>
                  </div>
                  <div style={{ flex: 1, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: "16px 18px" }}>
                    <div style={{ fontSize: 13, color: "#667085", fontWeight: 600, marginBottom: 6 }}>Transacties</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>96</div>
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Kassa tellen</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0 14px" }}>
                    <span style={{ fontSize: 14, color: "#667085", fontWeight: 500 }}>Verwacht in lade</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(expected)}</span>
                  </div>
                  <CashCountGrid counts={s.endCounts} onSet={setEndCount} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                    <span style={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Geteld</span>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{fmt(endTotal)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F2F4F7", paddingTop: 13, marginTop: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Kasverschil</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: diffColor }}>{diffText}</span>
                  </div>
                </div>
                <div onClick={confirmEnd} style={{ height: 54, borderRadius: 14, background: "#1D1B52", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Dienst afsluiten</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───── Reserve ───── */}
      {s.showReserve && (() => {
        const rt = findTable(s.reserveTableId) || ({ label: "", seats: 0 } as TableT);
        const can = s.resName.trim().length > 0;
        const over = rt.seats > 0 && s.resGuests > rt.seats;
        return (
          <div style={overlay(0.45, 55)} onClick={() => patch({ showReserve: false })}>
            <div onClick={stop} style={{ width: "100%", maxWidth: 472, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Reserveren op naam</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 22 }}>Tafel {rt.label}</div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>Naam van de gast</label>
              <input value={s.resName} onChange={(e) => patch({ resName: e.target.value })} placeholder="Bijv. Janssen" style={{ width: "100%", height: 50, border: "1.5px solid #E4E7EC", borderRadius: 12, padding: "0 14px", fontSize: 16, color: "#101828", outline: "none", marginBottom: 18 }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>
                Aantal gasten {over && <span style={{ color: "#B54708", fontWeight: 600 }}>· meer dan capaciteit (max {rt.seats})</span>}
              </label>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid " + (over ? "#FEC84B" : "#E4E7EC"), borderRadius: 12, height: 50, overflow: "hidden", width: 180, marginBottom: 18 }}>
                <div onClick={() => patch((st) => ({ resGuests: Math.max(1, st.resGuests - 1) }))} style={{ width: 54, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#475467", cursor: "pointer" }}>{"−"}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: over ? "#B54708" : "#101828" }}>{s.resGuests}</div>
                <div onClick={() => patch((st) => ({ resGuests: Math.min(20, st.resGuests + 1) }))} style={{ width: 54, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: PURPLE, cursor: "pointer" }}>+</div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>Tijd</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((tm) => {
                  const on = s.resTime === tm;
                  return (
                    <div key={tm} onClick={() => patch({ resTime: tm })} style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...(on ? { background: PURPLE, color: "#fff", border: "1.5px solid " + PURPLE } : { background: "#fff", color: "#475467", border: "1.5px solid #E4E7EC" }) }}>{tm}</div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div onClick={() => patch({ showReserve: false })} style={{ flex: 1, height: 52, borderRadius: 13, border: "1.5px solid #E4E7EC", background: "#fff", color: "#344054", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Annuleren</div>
                <div onClick={resConfirm} style={{ flex: 2, height: 52, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, ...(can ? { background: PURPLE, color: "#fff", cursor: "pointer" } : { background: "#F2F4F7", color: "#98A2B3", cursor: "default" }) }}>Bevestig reservering</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───── Checkout (Tebi-style: discount → tip → split → method → receipt) ───── */}
      {s.showCheckout && (
        <Checkout
          base={subtotal}
          label={tlabel(at)}
          onClose={() => patch({ showCheckout: false })}
          onComplete={(grand, breakdown) => finalizePaid(grand, breakdown)}
        />
      )}

      {/* ───── Name prompt (walk-in) ───── */}
      {s.showNamePrompt && (
        <div style={overlay(0.45, 58)} onClick={nameCancel}>
          <div onClick={stop} style={{ width: "100%", maxWidth: 430, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 26, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 2 }}>Order op naam</div>
            <div style={{ fontSize: 14, color: "#667085", marginBottom: 18 }}>Geef de order een naam zodat je 'm terugvindt bij Open orders.</div>
            <input autoFocus value={s.nameInput} onChange={(e) => patch({ nameInput: e.target.value })} placeholder="Bijv. Sophie / klant blauw shirt" style={{ width: "100%", height: 50, border: "1.5px solid #E4E7EC", borderRadius: 12, padding: "0 14px", fontSize: 16, color: "#101828", outline: "none", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <div onClick={nameCancel} style={{ flex: 1, height: 52, borderRadius: 13, border: "1.5px solid #E4E7EC", background: "#fff", color: "#344054", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Annuleren</div>
              <div onClick={nameConfirm} style={{ flex: 2, height: 52, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, ...(s.nameInput.trim() ? { background: PURPLE, color: "#fff", cursor: "pointer" } : { background: "#F2F4F7", color: "#98A2B3", cursor: "default" }) }}>Bevestigen</div>
            </div>
          </div>
        </div>
      )}

      {/* ───── User menu ───── */}
      {s.showUserMenu && (
        <div style={{ position: "absolute", inset: 0, zIndex: 60 }} onClick={() => patch({ showUserMenu: false })}>
          <div onClick={stop} style={{ position: "absolute", top: 60, right: 24, width: "min(252px, calc(100vw - 32px))", background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, boxShadow: "0 16px 40px rgba(16,24,40,0.16)", padding: 8, animation: "posPop .15s ease" }}>
            <a href="#/" className="pos-hover-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#6941C6", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 19l-7-7 7-7M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Alle prototypes
            </a>
            <div style={{ height: 1, background: "#F2F4F7", margin: "6px 2px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px 12px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F4EBFF", color: "#6941C6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{staffInitial}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{displayStaff}</div>
                <div style={{ fontSize: 12, color: "#98A2B3" }}>Ingelogd</div>
              </div>
            </div>
            <div style={{ height: 1, background: "#F2F4F7", margin: "0 2px 6px" }} />
            <MenuRow icon={<OrdersIcon />} label="Open orders" onClick={goOrders} />
            <MenuRow icon={<path d="M5 20v-6M10 20V5M15 20v-9M20 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />} label="Dagoverzicht" onClick={goDay} raw />
            <MenuRow icon={<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />} label="Gebruiker wisselen" onClick={() => { patch({ showUserMenu: false }); setToast("Gebruiker gewisseld"); }} raw />
            <MenuRow icon={<><rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 12.5h17M10 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>} label="Kassalade openen" onClick={() => { patch({ showUserMenu: false }); setToast("Kassalade geopend"); }} raw />
            <MenuRow icon={<><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="14" cy="8" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.7" /><circle cx="9" cy="16" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.7" /></>} label="Instellingen" onClick={() => { patch({ showUserMenu: false }); setToast("Instellingen geopend"); }} raw />
            <div style={{ height: 1, background: "#F2F4F7", margin: "6px 2px" }} />
            <div className="pos-hover-danger" onClick={beginEndShift} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#D92D20" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7.5 7.5a6.5 6.5 0 1 0 9 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Dienst beëindigen</span>
            </div>
          </div>
        </div>
      )}

      {/* ───── Cancel reason ───── */}
      {s.cancelOid != null && s.screen === "order" && (() => {
        const item = (at.orders || []).find((o) => o.oid === s.cancelOid);
        const name = item ? item.qty + "× " + item.name : "";
        return (
          <div style={overlay(0.45, 58)} onClick={() => patch({ cancelOid: null })}>
            <div onClick={stop} style={{ width: "100%", maxWidth: 420, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 26, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 2 }}>Reden van annuleren</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 18 }}>{name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Damaged", "Eigen gebruik", "Verkeerd aangeslagen", "Representatie"].map((r) => (
                  <div key={r} className="pos-hover-row" onClick={() => confirmCancel(r)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1px solid #E4E7EC", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#344054" }}>
                    <span>{r}</span>
                    <span style={{ color: "#D0D5DD", fontSize: 18 }}>{"›"}</span>
                  </div>
                ))}
              </div>
              <div onClick={() => patch({ cancelOid: null })} style={{ marginTop: 14, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#667085" }}>Sluiten</div>
            </div>
          </div>
        );
      })()}

      {/* ───── Closed-order detail (reprint, mutation) ───── */}
      {s.selectedClosedId && (() => {
        const co = s.closedOrders.find((c) => c.id === s.selectedClosedId);
        if (!co) return null;
        const close = () => patch({ selectedClosedId: null });
        const reprint = () => { close(); setToast("Bon herprint · " + co.label); };
        const addCorrection = () => {
          // Tebi pattern: a closed order can't be reopened, but you can add a
          // correction order on top. Spin up a walk-in pre-named with the source,
          // so the user lands in the order screen with a fresh ticket.
          const id = "w" + Date.now();
          const wt: TableT = { id, walkin: true, name: "Correctie · " + co.label, label: "", seats: 0, guests: 0, status: "free", orders: [], openedAt: null };
          setCartSheetOpen(false);
          patch((st) => ({ tables: st.tables.concat([wt]), activeTableId: id, screen: "order", editingOid: null, selectedClosedId: null }));
          setToast("Correctie-order geopend voor " + co.label);
        };
        const paidDate = new Date(co.paidAt);
        const paidTime = String(paidDate.getHours()).padStart(2, "0") + ":" + String(paidDate.getMinutes()).padStart(2, "0");
        const itemCount = co.lines.reduce((a, l) => a + l.qty, 0);
        return (
          <div style={overlay(0.45, 58)} onClick={close}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 26, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{co.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#067647", background: "#ECFDF3", padding: "3px 10px", borderRadius: 999 }}>Afgerekend</div>
              </div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 18 }}>{paidTime} · {paymentLabel(co.payment)} · {itemCount} items</div>

              <div style={{ background: "#FAFAFB", border: "1px solid #EAECF0", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
                {co.lines.filter((l) => l.qty > 0).map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 14 }}>
                    <span style={{ width: 26, fontWeight: 700, color: "#101828" }}>{l.qty}×</span>
                    <span style={{ flex: 1, color: "#344054" }}>{l.name}</span>
                    <span style={{ fontWeight: 600, color: "#475467" }}>{fmt(l.qty * l.price)}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "#EAECF0", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#667085" }}>
                  <span>Subtotaal</span>
                  <span style={{ fontWeight: 600, color: "#475467" }}>{fmt(co.subtotal)}</span>
                </div>
                {co.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#667085", marginTop: 2 }}>
                    <span>Korting</span>
                    <span style={{ fontWeight: 600, color: "#067647" }}>− {fmt(co.discount)}</span>
                  </div>
                )}
                {co.tip > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#667085", marginTop: 2 }}>
                    <span>Fooi</span>
                    <span style={{ fontWeight: 600, color: "#475467" }}>{fmt(co.tip)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>Totaal</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#101828" }}>{fmt(co.total)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div onClick={reprint} className="pos-hover-row" style={{ flex: 1, height: 52, borderRadius: 13, border: "1.5px solid #E4E7EC", background: "#fff", color: "#344054", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  <PrintIcon />
                  Bon herprinten
                </div>
                <div onClick={addCorrection} style={{ flex: 1, height: 52, borderRadius: 13, background: PURPLE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  <PencilIcon />
                  Wijziging
                </div>
              </div>
              <div onClick={close} style={{ marginTop: 10, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#667085" }}>Sluiten</div>
            </div>
          </div>
        );
      })()}

      {/* ───── Toast ───── */}
      {s.toast && (
        <div style={{ position: "absolute", left: "50%", bottom: 30, background: "#1D1B52", color: "#fff", padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600, boxShadow: "0 12px 30px rgba(16,24,40,0.28)", zIndex: 70, animation: "posToastUp .28s ease", transform: "translateX(-50%)" }}>{s.toast}</div>
      )}

      <PosTweaks
        screen={s.screen}
        setScreen={(sc) => { setCartSheetOpen(false); patch({ screen: sc, activeTableId: sc === "order" ? s.activeTableId : null, showUserMenu: false }); }}
        locationName={locationName}
        setLocationName={setLocationName}
        staffName={staffName}
        setStaffName={setStaffName}
        onReset={() => { setS(makeInitialState()); setCartSheetOpen(false); setToast("Demo gereset"); }}
      />
    </div>
  );
}

// ── Day report ──
function DayReport({ staffName, staffInitial, onBack }: { staffName: string; staffInitial: string; onBack: () => void }) {
  const dayHmax = 210;
  return (
    <div className="pos-screen" style={{ background: "#F9FAFB" }}>
      <div className="pos-header">
        <div className="pos-header-side">
          <div className="pos-icon-btn" onClick={onBack} style={{ fontSize: 20 }}>{"←"}</div>
          <div className="pos-header-title">Dagoverzicht</div>
          <div className="pos-header-sub">Dinsdag 24 juni</div>
        </div>
        <div className="pos-avatar">{staffInitial}</div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "22px 28px 32px", minHeight: 0 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#98A2B3" }}>Dienst geopend 08:00 · {staffName}</div>

          <div className="pos-day-kpis">
            {DAY_KPIS.map((k) => (
              <div key={k.label} style={{ borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 7, ...(k.accent ? { background: PURPLE } : { background: "#fff", border: "1px solid #EAECF0" }) }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: k.accent ? "rgba(255,255,255,0.82)" : "#667085" }}>{k.label}</span>
                <span style={{ fontSize: 26, fontWeight: 800, color: k.accent ? "#fff" : "#101828" }}>{k.value}</span>
              </div>
            ))}
          </div>

          <div className="pos-day-row">
            <div style={{ flex: 1, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Betaalmethoden</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {DAY_PAY.map((p) => {
                  const pct = Math.round((p.amount / DAY_PAY_TOTAL) * 100);
                  return (
                    <div key={p.label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#344054" }}>{p.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#98A2B3" }}>{pct}%</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#101828", width: 88, textAlign: "right" }}>{fmt(p.amount)}</span>
                      </div>
                      <div style={{ height: 6, background: "#F2F4F7", borderRadius: 999, overflow: "hidden", marginTop: 7 }}>
                        <div style={{ width: pct + "%", height: "100%", background: p.color, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 1.5, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Omzet per uur</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 150 }}>
                {DAY_HOURS.map(([h, v]) => (
                  <div key={h} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ height: Math.round((v / dayHmax) * 100) + "%", minHeight: 4, background: "#C8A2FF", borderRadius: "4px 4px 0 0", width: "100%" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
                {DAY_HOURS.map(([h]) => (
                  <div key={h} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#98A2B3" }}>{h}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="pos-day-row">
            <div style={{ flex: 1, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Omzet per categorie</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {DAY_CATS.map((c) => (
                  <div key={c.l}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#344054" }}>{c.l}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{fmt(c.a)}</span>
                    </div>
                    <div style={{ height: 8, background: "#F2F4F7", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: Math.round((c.a / DAY_CATS[0].a) * 100) + "%", height: "100%", borderRadius: 999, background: PURPLE }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Best verkocht</div>
              {DAY_TOP.map((p, i) => (
                <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: "1px solid #F7F8FA" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: "#F4EBFF", color: "#6941C6", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: "#101828" }}>{p.n}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#98A2B3", width: 44, textAlign: "right" }}>{p.q}×</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#101828", width: 78, textAlign: "right" }}>{fmt(p.a)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Kassa-overzicht</div>
            {DAY_CASH.map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F7F8FA" }}>
                <span style={{ fontSize: 14, fontWeight: r.strong ? 700 : 500, color: r.strong ? "#101828" : "#667085" }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: r.strong ? 800 : 600, color: r.strong ? "#101828" : "#475467" }}>{fmt(r.v)}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0 2px" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#067647" }}>Kasverschil</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#067647" }}>+ €1,80</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Checkout flow ──
function Checkout({ base, label, onClose, onComplete }: { base: number; label: string; onClose: () => void; onComplete: (grand: number, breakdown: { subtotal: number; tip: number; discount: number; payment: string }) => void }) {
  const [disc, setDisc] = useState<"none" | "p10" | "custom">("none");
  const [discCustom, setDiscCustom] = useState("");
  const [tip, setTip] = useState<"none" | "p5" | "p10" | "custom">("none");
  const [tipCustom, setTipCustom] = useState("");
  const [split, setSplit] = useState<"full" | "equal" | "custom">("full");
  const [parts, setParts] = useState(2);
  const [partInput, setPartInput] = useState("");
  const [paid, setPaid] = useState(0);
  const [method, setMethod] = useState<string | null>(null);
  const [phase, setPhase] = useState<"config" | "receipt" | "done">("config");

  const discount = disc === "p10" ? round2(base * 0.1) : disc === "custom" ? Math.min(num(discCustom), base) : 0;
  const billTotal = Math.max(0, round2(base - discount));
  const tipAmt = tip === "p5" ? round2(billTotal * 0.05) : tip === "p10" ? round2(billTotal * 0.1) : tip === "custom" ? num(tipCustom) : 0;
  const grand = round2(billTotal + tipAmt);
  const remaining = Math.max(0, round2(grand - paid));
  let thisPay = remaining;
  if (split === "equal") thisPay = Math.min(remaining, round2(grand / parts));
  else if (split === "custom") thisPay = Math.min(remaining, num(partInput));
  const canPay = !!method && thisPay > 0.004;

  const confirm = () => {
    if (!canPay) return;
    const np = round2(paid + thisPay);
    if (np >= grand - 0.005) {
      setPaid(grand);
      setPhase("receipt");
    } else {
      setPaid(np);
      setMethod(null);
      setPartInput("");
    }
  };
  const chooseReceipt = () => {
    setPhase("done");
    setTimeout(() => onComplete(grand, { subtotal: base, tip: tipAmt, discount, payment: method || "pin" }), 1200);
  };

  const Seg = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <div onClick={onClick} style={{ flex: 1, minWidth: 56, textAlign: "center", padding: "9px 8px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", ...(active ? { background: PURPLE, color: "#fff" } : { background: "#F4EBFF", color: "#6941C6" }) }}>{children}</div>
  );

  return (
    <div style={overlay(0.5, 55)} onClick={() => phase === "config" && onClose()}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
        {phase === "done" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 0" }}>
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#12B76A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckIcon size={24} /></div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Betaald</div>
            <div style={{ fontSize: 15, color: "#667085" }}>{label} · {fmt(grand)}</div>
          </div>
        ) : phase === "receipt" ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Bon</div>
            <div style={{ fontSize: 14, color: "#667085", marginBottom: 20 }}>Hoe wil de gast de bon ontvangen?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { k: "print", label: "Printen", desc: "Kassabon afdrukken" },
                { k: "email", label: "E-mailen", desc: "Digitale bon versturen" },
                { k: "none", label: "Geen bon", desc: "Gast hoeft geen bon" },
              ].map((r) => (
                <div key={r.k} onClick={chooseReceipt} className="pos-hover-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 16px", borderRadius: 14, border: "1.5px solid #E4E7EC", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: "#667085" }}>{r.desc}</div>
                  </div>
                  <span style={{ color: "#D0D5DD", fontSize: 20 }}>{"›"}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Afrekenen</div>
              <div style={{ fontSize: 14, color: "#667085" }}>{label}</div>
            </div>

            <div style={{ background: "#F9F5FF", border: "1px solid #E9D7FE", borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: "#6941C6", fontWeight: 600, marginBottom: 4 }}>{paid > 0 ? "Resterend" : "Te betalen"}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#42307D" }}>{fmt(remaining)}</div>
              {(discount > 0 || tipAmt > 0 || paid > 0) && (
                <div style={{ fontSize: 12, color: "#6941C6", marginTop: 6 }}>
                  {fmt(base)}{discount > 0 ? " − " + fmt(discount) + " korting" : ""}{tipAmt > 0 ? " + " + fmt(tipAmt) + " fooi" : ""}{paid > 0 ? " · " + fmt(paid) + " voldaan" : ""}
                </div>
              )}
            </div>

            <Section label="Korting">
              <div style={{ display: "flex", gap: 6 }}>
                <Seg active={disc === "none"} onClick={() => setDisc("none")}>Geen</Seg>
                <Seg active={disc === "p10"} onClick={() => setDisc("p10")}>10%</Seg>
                <Seg active={disc === "custom"} onClick={() => setDisc("custom")}>Bedrag</Seg>
              </div>
              {disc === "custom" && <AmountInput value={discCustom} onChange={setDiscCustom} placeholder="Kortingsbedrag in €" />}
            </Section>

            <Section label="Fooi">
              <div style={{ display: "flex", gap: 6 }}>
                <Seg active={tip === "none"} onClick={() => setTip("none")}>Geen</Seg>
                <Seg active={tip === "p5"} onClick={() => setTip("p5")}>5%</Seg>
                <Seg active={tip === "p10"} onClick={() => setTip("p10")}>10%</Seg>
                <Seg active={tip === "custom"} onClick={() => setTip("custom")}>Bedrag</Seg>
              </div>
              {tip === "custom" && <AmountInput value={tipCustom} onChange={setTipCustom} placeholder="Fooi in €" />}
            </Section>

            <Section label="Splitsen">
              <div style={{ display: "flex", gap: 6 }}>
                <Seg active={split === "full"} onClick={() => setSplit("full")}>Volledig</Seg>
                <Seg active={split === "equal"} onClick={() => setSplit("equal")}>Gelijk</Seg>
                <Seg active={split === "custom"} onClick={() => setSplit("custom")}>Bedrag</Seg>
              </div>
              {split === "equal" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: "#667085" }}>Aantal personen</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #E4E7EC", borderRadius: 10, overflow: "hidden" }}>
                      <div onClick={() => setParts((p) => Math.max(2, p - 1))} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: "#475467", cursor: "pointer" }}>{"−"}</div>
                      <div style={{ minWidth: 28, textAlign: "center", fontSize: 15, fontWeight: 700 }}>{parts}</div>
                      <div onClick={() => setParts((p) => Math.min(8, p + 1))} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: PURPLE, cursor: "pointer" }}>+</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>{fmt(round2(grand / parts))} p.p.</span>
                  </div>
                </div>
              )}
              {split === "custom" && <AmountInput value={partInput} onChange={setPartInput} placeholder="Te betalen deel in €" />}
            </Section>

            <Section label="Betaalmethode">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { k: "pin", label: "Pinnen", desc: "Kaart of contactloos" },
                  { k: "cash", label: "Contant", desc: "Betaling met cash" },
                  { k: "account", label: "Op rekening", desc: "Koppel aan lidaccount" },
                ].map((m) => {
                  const on = method === m.k;
                  return (
                    <div key={m.k} onClick={() => setMethod(m.k)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 14, cursor: "pointer", ...(on ? { border: "1.5px solid " + PURPLE, background: "#F9F5FF" } : { border: "1.5px solid #E4E7EC", background: "#fff" }) }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>{m.label}</div>
                        <div style={{ fontSize: 13, color: "#667085" }}>{m.desc}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, ...(on ? { border: "6px solid " + PURPLE } : { border: "2px solid #D0D5DD" }) }} />
                    </div>
                  );
                })}
              </div>
            </Section>

            <div onClick={confirm} style={{ height: 54, borderRadius: 14, marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, ...(canPay ? { background: PURPLE, color: "#fff", cursor: "pointer" } : { background: "#F2F4F7", color: "#98A2B3", cursor: "default" }) }}>
              {split === "full" || paid + thisPay >= grand - 0.005 ? "Bevestig betaling · " + fmt(thisPay) : "Betaal deel · " + fmt(thisPay)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#98A2B3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function AmountInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="decimal"
      placeholder={placeholder}
      style={{ width: "100%", height: 46, border: "1.5px solid #E4E7EC", borderRadius: 12, padding: "0 14px", fontSize: 15, color: "#101828", outline: "none", marginTop: 10 }}
    />
  );
}

// ── Small presentational helpers ──
function EmptyOrders({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 360, textAlign: "center", color: "#98A2B3" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F2F4F7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <OrdersIcon stroke="#98A2B3" />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#475467" }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function paymentLabel(k: string): string {
  return k === "pin" ? "Pinnen" : k === "cash" ? "Contant" : k === "account" ? "Op rekening" : k;
}

function Legend({ dot, text }: { dot: ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#475467" }}>
      {dot}
      {text}
    </div>
  );
}
function MenuRow({ icon, label, onClick, raw }: { icon: ReactNode; label: string; onClick: () => void; raw?: boolean }) {
  return (
    <div className="pos-hover-row" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#344054" }}>
      {raw ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icon}</svg> : icon}
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function TableCard({ t, tickets, now, onTap }: { t: TableT; tickets: Ticket[]; now: number; onTap: () => void }) {
  const isOcc = t.status === "occupied";
  const isRes = t.status === "reserved";
  const lbl = tlabel(t);
  const active = tickets.filter((k) => k.table === lbl);
  const openCount = active.reduce((a, k) => a + k.items.reduce((b, i) => b + i.qty, 0), 0);
  const base: CSSProperties = { borderRadius: 16, padding: "14px 16px", height: 116, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", userSelect: "none", boxSizing: "border-box", transition: "transform .12s ease, box-shadow .12s ease" };
  let sty: CSSProperties;
  let numColor: string;
  let chipBg: string;
  let chipFg: string;
  let chipText: string;
  let showChip: boolean;
  let totalColor = "#42307D";
  let guestsColor = "#8B79BE";
  if (isOcc) {
    const oldest = active.reduce((m, k) => Math.min(m, k.createdAt), Infinity);
    const waitMin = isFinite(oldest) ? Math.floor((now - oldest) / 60000) : 0;
    const late = openCount > 0 && waitMin >= 12;
    if (late) {
      sty = { background: "#FEF3F2", border: "1.5px solid #F04438", boxShadow: "0 2px 8px rgba(240,68,56,0.14)" };
      numColor = "#B42318";
      chipBg = "#FEE4E2";
      chipFg = "#B42318";
      chipText = openCount + " open · " + waitMin + "m";
      totalColor = "#B42318";
      guestsColor = "#B42318";
    } else {
      sty = { background: "#F4EBFF", border: "1.5px solid " + PURPLE, boxShadow: "0 2px 8px rgba(112,0,255,0.12)" };
      numColor = "#6941C6";
      chipBg = "#E9D7FE";
      chipFg = "#6941C6";
      chipText = openCount + " open";
    }
    showChip = openCount > 0;
  } else if (isRes) {
    sty = { background: "#FFFBF4", border: "1.5px dashed #F79009", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" };
    numColor = "#B54708";
    chipText = t.seats + "p";
    chipBg = "rgba(16,24,40,0.05)";
    chipFg = "#667085";
    showChip = true;
  } else {
    sty = { background: "#FFFFFF", border: "1.5px solid #E4E7EC", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" };
    numColor = "#344054";
    chipText = t.seats + "p";
    chipBg = "rgba(16,24,40,0.05)";
    chipFg = "#667085";
    showChip = true;
  }
  return (
    <div className="pos-table-card" style={{ ...base, ...sty }} onClick={onTap}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: numColor }}>{t.label}</span>
        {showChip && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: chipBg, color: chipFg }}>{chipText}</span>}
      </div>
      {t.status === "free" && <div style={{ fontSize: 13, fontWeight: 600, color: "#98A2B3" }}>Vrij</div>}
      {isOcc && (
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: totalColor }}>{fmt(tableTotal(t))}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: guestsColor }}>{(t.guests || t.seats) + " gasten"}</div>
        </div>
      )}
      {isRes && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#B54708", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.resName || ""}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#D9912B" }}>{t.resTime || ""}</div>
        </div>
      )}
    </div>
  );
}

function overlay(alpha: number, z: number): CSSProperties {
  return { position: "absolute", inset: 0, background: `rgba(16,24,40,${alpha})`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: z, padding: 16, boxSizing: "border-box", animation: "posFade .18s ease" };
}

// ── Tweaks panel ──
function PosTweaks({
  screen,
  setScreen,
  locationName,
  setLocationName,
  staffName,
  setStaffName,
  onReset,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  locationName: string;
  setLocationName: (v: string) => void;
  staffName: string;
  setStaffName: (v: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button className="pos-twk-pill" onClick={() => setOpen(true)}>⚙ Tweaks</button>
    );
  return (
    <div className="pos-twk-panel">
      <div className="pos-twk-hd">
        <b>Tweaks</b>
        <button className="pos-twk-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <div className="pos-twk-body">
        <a className="pos-twk-link" href="#/">← All prototypes</a>

        <div className="pos-twk-sect">Scherm</div>
        <div className="pos-twk-seg">
          {([["locked", "Lock"], ["start", "Start"], ["floor", "Vloer"], ["kitchen", "Keuken"], ["orders", "Orders"], ["day", "Dag"], ["end", "Eind"]] as const).map(([k, label]) => (
            <button key={k} className={screen === k ? "on" : ""} onClick={() => setScreen(k)}>{label}</button>
          ))}
        </div>

        <div className="pos-twk-sect">Locatie</div>
        <input className="pos-twk-field" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Locatienaam" />

        <div className="pos-twk-sect">Medewerker</div>
        <input className="pos-twk-field" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Naam" />

        <div className="pos-twk-sect">Demo</div>
        <button className="pos-twk-btn" onClick={onReset}>Reset demo-data</button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import posCss from "./styles.css?raw";

/* ───────── Gymly POS ─────────
   React/TypeScript port of the Claude Design handoff "Gymly POS.dc.html".
   A restaurant/bar point-of-sale: floor plan → order → kitchen display →
   open orders, with reserve / checkout / cancel / user-menu modals.
   The original is a fixed 1366×1024 tablet layout; this version fills the
   viewport and reflows to mobile (stacked order screen with a bottom-sheet
   cart, swipeable kitchen columns, condensed header). */

// ── Types ──────────────────────────────────────────────
type Screen = "floor" | "order" | "kitchen" | "orders";
type Area = "bar" | "terras";
type TableStatus = "free" | "occupied" | "reserved";
type Station = "bar" | "keuken";
type TicketStatus = "new" | "progress" | "done";

interface OrderLine {
  oid: string;
  name: string;
  price: number;
  qty: number;
  sent: boolean;
}
interface TableT {
  id: string;
  area: Area;
  label: string;
  seats: number;
  status: TableStatus;
  guests: number;
  openedAt?: number;
  orders: OrderLine[];
  resName?: string;
  resTime?: string;
  resGuests?: number;
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
  activeTableId: string | null;
  popoverId: string | null;
  showReserve: boolean;
  reserveTableId: string | null;
  resName: string;
  resGuests: number;
  resTime: string;
  activeCat: string;
  showCheckout: boolean;
  checkoutMethod: string | null;
  paid: boolean;
  toast: string | null;
  showUserMenu: boolean;
  editingOid: string | null;
  cancelOid: string | null;
  cartSheetOpen: boolean;
  now: number;
  tables: TableT[];
  tickets: Ticket[];
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

function fmt(n: number): string {
  return "€" + Number(n).toFixed(2).replace(".", ",");
}
function catTint(key: string): string {
  const c = CATS.find((x) => x.key === key);
  return c ? c.tint : "#F2F4F7";
}
function stationForName(name: string): Station {
  const p = PRODUCTS.find((x) => x.name === name);
  const cat = p ? p.cat : "";
  return cat === "koffie" || cat === "frisdrank" || cat === "shakes" ? "bar" : "keuken";
}
function tableTotal(t: TableT): number {
  return (t.orders || []).reduce((s, o) => s + o.price * o.qty, 0);
}

function makeInitialState(): PosState {
  const now = Date.now();
  return {
    screen: "floor",
    activeTableId: null,
    popoverId: null,
    showReserve: false,
    reserveTableId: null,
    resName: "",
    resGuests: 2,
    resTime: "19:30",
    activeCat: "alles",
    showCheckout: false,
    checkoutMethod: null,
    paid: false,
    toast: null,
    showUserMenu: false,
    editingOid: null,
    cancelOid: null,
    cartSheetOpen: false,
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
      { id: "k3", table: "Tafel 7", items: [{ qty: 1, name: "Poke bowl" }], status: "progress", station: "keuken", createdAt: now - 420000 },
      { id: "k4", table: "Tafel 5", items: [{ qty: 1, name: "Latte macchiato" }], status: "done", station: "bar", createdAt: now - 540000 },
    ],
  };
}

// ── Icons ──────────────────────────────────────────────
function OrdersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
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
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
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
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = (p: Partial<PosState> | ((st: PosState) => Partial<PosState>)) =>
    setS((st) => ({ ...st, ...(typeof p === "function" ? p(st) : p) }));

  useEffect(() => {
    const iv = setInterval(() => setS((st) => ({ ...st, now: Date.now() })), 15000);
    return () => {
      clearInterval(iv);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const setToast = (msg: string) => {
    patch({ toast: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch({ toast: null }), 2600);
  };
  const findTable = (id: string | null) => s.tables.find((t) => t.id === id);
  const updateTable = (id: string, fn: (t: TableT) => TableT) =>
    patch((st) => ({ tables: st.tables.map((t) => (t.id === id ? fn({ ...t }) : t)) }));

  // ── Handlers ──
  const tapTable = (t: TableT) => {
    if (t.status === "occupied") patch({ activeTableId: t.id, screen: "order" });
    else patch({ popoverId: t.id });
  };
  const popClose = () => patch({ popoverId: null });
  const popOpenOrder = () => {
    const id = s.popoverId!;
    patch((st) => ({
      tables: st.tables.map((x) => {
        if (x.id !== id) return x;
        const nx = { ...x };
        if (!nx.guests) nx.guests = nx.seats;
        return nx;
      }),
      activeTableId: id,
      screen: "order",
      popoverId: null,
    }));
  };
  const popReserve = () => {
    const id = s.popoverId!;
    const t = findTable(id);
    patch({
      showReserve: true,
      reserveTableId: id,
      resName: t && t.status === "reserved" ? t.resName || "" : "",
      resGuests: t ? t.seats : 2,
      resTime: "19:30",
      popoverId: null,
    });
  };
  const resConfirm = () => {
    if (!s.resName.trim()) return;
    const id = s.reserveTableId!;
    const nm = s.resName.trim();
    const g = s.resGuests;
    const tm = s.resTime;
    const lbl = findTable(id)!.label;
    updateTable(id, (t) => {
      t.status = "reserved";
      t.resName = nm;
      t.resGuests = g;
      t.guests = g;
      t.resTime = tm;
      return t;
    });
    patch({ showReserve: false });
    setToast("Tafel " + lbl + " gereserveerd · " + nm);
  };

  const goKitchen = () => patch({ screen: "kitchen", showUserMenu: false });
  const goOrders = () => patch({ screen: "orders", showUserMenu: false });
  const backToFloor = () => patch({ screen: "floor", activeTableId: null, editingOid: null, cartSheetOpen: false });
  const jumpTo = (key: string) => {
    const cont = document.getElementById("posFloorScroll");
    const el = document.getElementById("pos-sec-" + key);
    if (cont && el) cont.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: "smooth" });
  };

  const addProduct = (p: Product) => {
    const id = s.activeTableId!;
    updateTable(id, (t) => {
      const orders = (t.orders || []).slice();
      const idx = orders.findIndex((o) => o.name === p.name && !o.sent);
      if (idx >= 0) orders[idx] = { ...orders[idx], qty: orders[idx].qty + 1 };
      else orders.push({ oid: "n" + Date.now() + Math.random().toString(36).slice(2, 6), name: p.name, price: p.price, qty: 1, sent: false });
      t.orders = orders;
      return t;
    });
  };
  const incItem = (oid: string) =>
    updateTable(s.activeTableId!, (t) => {
      t.orders = (t.orders || []).map((o) => (o.oid === oid ? { ...o, qty: o.qty + 1 } : o));
      return t;
    });
  const decItem = (oid: string) =>
    updateTable(s.activeTableId!, (t) => {
      const out: OrderLine[] = [];
      (t.orders || []).forEach((o) => {
        if (o.oid !== oid) return out.push(o);
        if (o.qty > 1) out.push({ ...o, qty: o.qty - 1 });
      });
      t.orders = out;
      return t;
    });

  const removeSentLine = (oid: string) => {
    const t = findTable(s.activeTableId);
    if (!t) return;
    const item = (t.orders || []).find((o) => o.oid === oid);
    if (!item) return;
    const nm = item.name;
    let qty = item.qty;
    const lbl = "Tafel " + t.label;
    updateTable(t.id, (tt) => {
      tt.orders = (tt.orders || []).filter((o) => o.oid !== oid);
      return tt;
    });
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
    const lbl = "Tafel " + t.label;
    const newQty = item.qty + delta;
    updateTable(t.id, (tt) => {
      if (newQty <= 0) tt.orders = (tt.orders || []).filter((o) => o.oid !== oid);
      else tt.orders = (tt.orders || []).map((o) => (o.oid === oid ? { ...o, qty: newQty } : o));
      return tt;
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
        if (!added)
          tickets = tickets.concat([{ id: "k" + Date.now(), table: lbl, items: [{ qty: 1, name: nm }], status: "new", station: stationForName(nm), createdAt: Date.now() }]);
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
  const confirmCancel = (reason: string) => {
    const oid = s.cancelOid!;
    const t = findTable(s.activeTableId);
    const item = t && (t.orders || []).find((o) => o.oid === oid);
    const nm = item ? item.name : "";
    removeSentLine(oid);
    patch({ cancelOid: null, editingOid: null });
    setToast("Geannuleerd: " + nm + " · " + reason);
  };

  const sendKitchen = () => {
    const t = findTable(s.activeTableId);
    if (!t) return;
    const unsent = (t.orders || []).filter((o) => !o.sent);
    if (!unsent.length) return;
    const lbl = t.label;
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
    const newTickets: Ticket[] = stationKeys.map((st, i) => ({
      id: "k" + Date.now() + i,
      table: "Tafel " + lbl,
      items: groups[st],
      status: "new",
      station: st as Station,
      createdAt: Date.now(),
    }));
    patch((st) => ({ tickets: st.tickets.concat(newTickets), cartSheetOpen: false }));
    const dest = stationKeys.length > 1 ? "keuken & bar" : stationKeys[0] === "bar" ? "de bar" : "de keuken";
    setToast("Doorgestuurd naar " + dest);
  };
  const closeTable = () => {
    const t = findTable(s.activeTableId);
    const lbl = t ? t.label : "";
    if (t)
      updateTable(t.id, (tt) => {
        tt.status = "free";
        tt.orders = [];
        tt.guests = 0;
        tt.resName = "";
        tt.resTime = "";
        return tt;
      });
    patch((st) => ({ tickets: st.tickets.filter((k) => k.table !== "Tafel " + lbl), activeTableId: null, screen: "floor", cartSheetOpen: false }));
    setToast("Tafel " + lbl + " gesloten");
  };
  const onCheckout = () => {
    const t = findTable(s.activeTableId);
    if (!t || !tableTotal(t)) return;
    patch({ showCheckout: true, checkoutMethod: null, paid: false, cartSheetOpen: false });
  };
  const payConfirm = () => {
    if (!s.checkoutMethod) return;
    const t = findTable(s.activeTableId);
    if (!t) return;
    const lbl = t.label;
    const total = tableTotal(t);
    patch({ paid: true });
    setTimeout(() => {
      updateTable(t.id, (tt) => {
        tt.status = "free";
        tt.orders = [];
        tt.guests = 0;
        tt.resName = "";
        tt.resTime = "";
        return tt;
      });
      patch((st) => ({ tickets: st.tickets.filter((k) => k.table !== "Tafel " + lbl), showCheckout: false, paid: false, checkoutMethod: null, activeTableId: null, screen: "floor" }));
      setToast("Tafel " + lbl + " afgerekend · " + fmt(total));
    }, 1300);
  };
  const advanceTicket = (id: string) =>
    patch((st) => ({
      tickets: st.tickets.flatMap((k) => {
        if (k.id !== id) return [k];
        if (k.status === "new") return [{ ...k, status: "progress" as TicketStatus }];
        if (k.status === "progress") return [{ ...k, status: "done" as TicketStatus }];
        return [k];
      }),
    }));
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const timeText = (createdAt: number) => {
    const m = Math.floor((s.now - createdAt) / 60000);
    return m < 1 ? "zojuist" : m + " min";
  };

  // ── Derived ──
  const staffInitial = (staffName[0] || "J").toUpperCase();
  const countFree = s.tables.filter((t) => t.status === "free").length;
  const countOcc = s.tables.filter((t) => t.status === "occupied").length;
  const countRes = s.tables.filter((t) => t.status === "reserved").length;
  const kitchenBadge = s.tickets.filter((k) => k.status === "new" || k.status === "progress").length;
  const openCount = countOcc;

  const at = findTable(s.activeTableId) || { label: "", orders: [], seats: 0, guests: 0, status: "free" as TableStatus };
  const orders = at.orders || [];
  const subtotal = orders.reduce((a, o) => a + o.price * o.qty, 0);
  const hasItems = orders.length > 0;
  const hasUnsent = orders.some((o) => !o.sent);
  const sentItems = orders.filter((o) => o.sent);
  const newItems = orders.filter((o) => !o.sent);
  const itemCount = orders.reduce((a, o) => a + o.qty, 0);

  const unsentStations: Record<string, boolean> = {};
  newItems.forEach((o) => (unsentStations[stationForName(o.name)] = true));
  const stKeys = Object.keys(unsentStations);
  const sendLabel = stKeys.length > 1 ? "Doorsturen naar keuken & bar" : stKeys[0] === "bar" ? "Doorsturen naar de bar" : "Doorsturen naar de keuken";

  let primaryLabel = "";
  let primaryAction: () => void = () => {};
  let showPrimary = true;
  let secondaryLabel = "";
  let secondaryAction: () => void = () => {};
  if (hasUnsent) {
    primaryLabel = sendLabel;
    primaryAction = sendKitchen;
    secondaryLabel = "Afrekenen";
    secondaryAction = onCheckout;
  } else if (hasItems) {
    primaryLabel = "Afrekenen";
    primaryAction = onCheckout;
    secondaryLabel = "Tafel sluiten";
    secondaryAction = closeTable;
  } else {
    showPrimary = false;
    secondaryLabel = "Tafel sluiten";
    secondaryAction = backToFloor;
  }
  const barLabel = showPrimary ? primaryLabel : secondaryLabel;
  const barAction = showPrimary ? primaryAction : secondaryAction;

  const checkoutTotal = tableTotal(at as TableT);

  // ── Shared header buttons ──
  const OrdersButton = () => (
    <div className="pos-btn" onClick={goOrders}>
      <OrdersIcon />
      <span className="pos-btn-label">Open orders</span>
      {openCount > 0 && <span className="pos-badge" style={{ background: "#7000FF" }}>{openCount}</span>}
    </div>
  );
  const KitchenButton = () => (
    <div className="pos-btn" onClick={goKitchen}>
      <KitchenIcon />
      <span className="pos-btn-label">Keuken</span>
      {kitchenBadge > 0 && <span className="pos-badge" style={{ background: "#F79009" }}>{kitchenBadge}</span>}
    </div>
  );
  const Avatar = () => <div className="pos-avatar">{staffInitial}</div>;
  const BackBtn = () => (
    <div className="pos-icon-btn" onClick={backToFloor} style={{ fontSize: 20 }}>{"←"}</div>
  );

  // ── Render ──
  return (
    <div className="pos-root">
      {/* ───── Floor ───── */}
      {s.screen === "floor" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side" style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em" }}>{locationName}</div>
            <div className="pos-header-side">
              <OrdersButton />
              <KitchenButton />
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
              <Legend dot={<span style={{ width: 11, height: 11, borderRadius: "50%", background: "#F4EBFF", border: "1.5px solid #7000FF" }} />} text={`${countOcc} bezet`} />
              <Legend dot={<span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFFBF4", border: "1.5px dashed #F79009" }} />} text={`${countRes} gereserveerd`} />
            </div>
          </div>

          <div id="posFloorScroll" className="pos-floor-scroll">
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
                      <TableCard key={t.id} t={t} onTap={() => tapTable(t)} />
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
              <div className="pos-header-title">{at.label ? "Tafel " + at.label : ""}</div>
              <div className="pos-header-sub">{(at.guests || at.seats) + " gasten"}</div>
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
                    <div key={c.key} onClick={() => patch({ activeCat: c.key })} style={{ padding: "9px 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", ...(on ? { background: "#7000FF", color: "#fff" } : { background: "#F9F5FF", color: "#6941C6" }) }}>
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

            {s.cartSheetOpen && <div className="pos-cart-backdrop" onClick={() => patch({ cartSheetOpen: false })} />}

            <aside className={"pos-cart" + (s.cartSheetOpen ? " open" : "")}>
              <div className="pos-cart-grip" onClick={() => patch({ cartSheetOpen: false })} />
              <div style={{ flexShrink: 0, padding: "20px 22px 14px", borderBottom: "1px solid #F2F4F7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Bestelling</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6941C6", background: "#F4EBFF", padding: "5px 11px", borderRadius: 999 }}>{at.status === "occupied" ? "Lopende rekening" : "Nieuwe bestelling"}</div>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "6px 22px" }}>
                {sentItems.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#12B76A", textTransform: "uppercase", letterSpacing: "0.04em", padding: "12px 0 4px" }}>In de keuken</div>
                    {sentItems.map((o) => {
                      const editing = s.editingOid === o.oid;
                      return (
                        <div key={o.oid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F7F8FA" }}>
                          {!editing ? (
                            <>
                              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#ECFDF3", color: "#12B76A", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{o.qty}</div>
                              <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, color: "#475467" }}>{o.name}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#475467" }}>{fmt(o.price * o.qty)}</div>
                              <div className="pos-edit-btn" onClick={() => patch((st) => ({ editingOid: st.editingOid === o.oid ? null : o.oid }))} title="Aantal wijzigen" style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#98A2B3", flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5l4 4M4 20l1.2-4.2 9.3-9.3 4 4-9.3 9.3L4 20Z" /></svg>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: "#101828" }}>{o.name}</div>
                              <div style={{ display: "flex", alignItems: "center", border: "1px solid #E4E7EC", borderRadius: 10, overflow: "hidden" }}>
                                <div onClick={() => adjustSentQty(o.oid, -1)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: "#475467", cursor: "pointer" }}>{"−"}</div>
                                <div style={{ minWidth: 22, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{o.qty}</div>
                                <div onClick={() => adjustSentQty(o.oid, 1)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: "#7000FF", cursor: "pointer" }}>+</div>
                              </div>
                              <div className="pos-del-btn" onClick={() => patch({ cancelOid: o.oid })} title="Annuleren" style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D92D20", flexShrink: 0 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                              </div>
                              <div className="pos-ok-btn" onClick={() => patch((st) => ({ editingOid: st.editingOid === o.oid ? null : o.oid }))} title="Klaar" style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#12B76A", flexShrink: 0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                {newItems.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6941C6", textTransform: "uppercase", letterSpacing: "0.04em", padding: "14px 0 4px" }}>Nieuw &middot; nog niet verstuurd</div>
                    {newItems.map((o) => (
                      <div key={o.oid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>{o.name}</div>
                          <div style={{ fontSize: 12, color: "#98A2B3" }}>{fmt(o.price)}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #E4E7EC", borderRadius: 10, overflow: "hidden" }}>
                          <div onClick={() => decItem(o.oid)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#475467", cursor: "pointer" }}>{"−"}</div>
                          <div style={{ minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{o.qty}</div>
                          <div onClick={() => incItem(o.oid)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#7000FF", cursor: "pointer" }}>+</div>
                        </div>
                        <div style={{ width: 56, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#101828" }}>{fmt(o.price * o.qty)}</div>
                      </div>
                    ))}
                  </>
                )}
                {!hasItems && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, textAlign: "center", color: "#98A2B3" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F4EBFF", color: "#7000FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 26, fontWeight: 600 }}>+</div>
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
                  <div onClick={primaryAction} style={{ height: 54, borderRadius: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer", background: "#7000FF", color: "#fff" }}>{primaryLabel}</div>
                )}
                <div onClick={secondaryAction} style={{ height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, cursor: "pointer", background: "#fff", border: "1px solid #E4E7EC", color: "#475467" }}>{secondaryLabel}</div>
              </div>
            </aside>

            {/* Mobile-only sticky order bar */}
            <div className="pos-cart-bar">
              <div onClick={() => patch((st) => ({ cartSheetOpen: !st.cartSheetOpen }))} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "#F4EBFF", color: "#6941C6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>{itemCount}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#98A2B3", fontWeight: 600 }}>{itemCount === 1 ? "1 item" : itemCount + " items"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(subtotal)}</div>
                </div>
              </div>
              <div onClick={barAction} style={{ height: 48, padding: "0 18px", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", ...(showPrimary ? { background: "#7000FF", color: "#fff" } : { background: "#F2F4F7", color: "#475467" }) }}>{barLabel}</div>
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
              <OrdersButton />
              <Avatar />
            </div>
          </div>
          <div className="pos-kitchen-cols">
            {([{ key: "new", label: "Nieuw", accent: "#F79009" }, { key: "progress", label: "In behandeling", accent: "#7000FF" }, { key: "done", label: "Klaar", accent: "#12B76A" }] as const).map((cd) => {
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
                          {cd.key === "new" ? "Start bereiding" : cd.key === "progress" ? "Markeer klaar" : "Afronden"}
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

      {/* ───── Open orders ───── */}
      {s.screen === "orders" && (
        <div className="pos-screen">
          <div className="pos-header">
            <div className="pos-header-side">
              <BackBtn />
              <div className="pos-header-title">Open orders</div>
              <div className="pos-header-sub">{openCount + " openstaande tafels"}</div>
            </div>
            <div className="pos-header-side">
              <KitchenButton />
              <Avatar />
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "18px 28px 28px", minHeight: 0 }}>
            {openCount > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 940, margin: "0 auto" }}>
                {s.tables
                  .filter((t) => t.status === "occupied")
                  .map((t) => {
                    const m = Math.floor((s.now - (t.openedAt || s.now)) / 60000);
                    const wc = m >= 30 ? { color: "#B42318", background: "#FEE4E2" } : m >= 15 ? { color: "#B54708", background: "#FEF0C7" } : { color: "#475467", background: "#F2F4F7" };
                    const ic = (t.orders || []).reduce((a, o) => a + o.qty, 0);
                    return { t, m, wc, ic };
                  })
                  .sort((a, b) => b.m - a.m)
                  .map(({ t, m, wc, ic }) => (
                    <div key={t.id} className="pos-oo-row" onClick={() => patch({ activeTableId: t.id, screen: "order" })} style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", border: "1px solid #EAECF0", borderRadius: 16, padding: "15px 18px", cursor: "pointer", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
                      <div style={{ width: 50, height: 50, borderRadius: 12, background: "#F4EBFF", color: "#6941C6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{t.label}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>Tafel {t.label}</div>
                        <div style={{ fontSize: 13, color: "#667085" }}>{(t.area === "bar" ? "Bar" : "Terras") + " · " + (t.guests || t.seats) + " gasten · " + ic + " items"}</div>
                      </div>
                      <div className="pos-oo-wait" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, fontSize: 13, fontWeight: 700, ...wc }}>
                        <ClockIcon />
                        <span>{m < 1 ? "< 1 min" : m + " min"}</span>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#101828", width: 86, textAlign: "right" }}>{fmt(tableTotal(t))}</div>
                      <div style={{ fontSize: 22, color: "#D0D5DD", fontWeight: 600 }}>{"›"}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 360, textAlign: "center", color: "#98A2B3" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F2F4F7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1.1" /><circle cx="4.5" cy="12" r="1.1" /><circle cx="4.5" cy="18" r="1.1" /></svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#475467" }}>Geen openstaande orders</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Alle tafels zijn vrij of afgerekend.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───── Table popover ───── */}
      {s.popoverId != null && s.screen === "floor" && (() => {
        const pt = findTable(s.popoverId) || { label: "", seats: 0, status: "free" as TableStatus, resName: "", resTime: "" };
        const reserved = pt.status === "reserved";
        return (
          <div style={overlay(0.4, 50)} onClick={popClose}>
            <div onClick={stop} className="pos-modal" style={{ width: "100%", maxWidth: 400, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 22, padding: 26, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Tafel {pt.label}</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 20 }}>{pt.seats} personen</div>
              {reserved && (
                <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#FFFBF4", border: "1px solid #FEDF89", borderRadius: 14, padding: "12px 14px", marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#FEF0C7", color: "#B54708", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{(pt.resName || "?")[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#B54708" }}>{pt.resName}</div>
                    <div style={{ fontSize: 12, color: "#B54708" }}>Gereserveerd &middot; {pt.resTime}</div>
                  </div>
                </div>
              )}
              <div onClick={popOpenOrder} style={{ height: 54, borderRadius: 14, background: "#7000FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>{reserved ? "Tafel openen" : "Bestelling openen"}</div>
              {!reserved && (
                <div onClick={popReserve} style={{ height: 54, borderRadius: 14, background: "#fff", border: "1.5px solid #E4E7EC", color: "#344054", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Reserveren op naam</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ───── Reserve ───── */}
      {s.showReserve && (() => {
        const rt = findTable(s.reserveTableId) || { label: "" };
        const can = s.resName.trim().length > 0;
        return (
          <div style={overlay(0.45, 55)} onClick={() => patch({ showReserve: false })}>
            <div onClick={stop} className="pos-modal" style={{ width: "100%", maxWidth: 472, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Reserveren op naam</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 22 }}>Tafel {rt.label}</div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>Naam van de gast</label>
              <input value={s.resName} onChange={(e) => patch({ resName: e.target.value })} placeholder="Bijv. Janssen" style={{ width: "100%", height: 50, border: "1.5px solid #E4E7EC", borderRadius: 12, padding: "0 14px", fontSize: 16, color: "#101828", outline: "none", marginBottom: 18 }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>Aantal gasten</label>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E4E7EC", borderRadius: 12, height: 50, overflow: "hidden", width: 180, marginBottom: 18 }}>
                <div onClick={() => patch((st) => ({ resGuests: Math.max(1, st.resGuests - 1) }))} style={{ width: 54, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#475467", cursor: "pointer" }}>{"−"}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{s.resGuests}</div>
                <div onClick={() => patch((st) => ({ resGuests: Math.min(20, st.resGuests + 1) }))} style={{ width: 54, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#7000FF", cursor: "pointer" }}>+</div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 7 }}>Tijd</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"].map((tm) => {
                  const on = s.resTime === tm;
                  return (
                    <div key={tm} onClick={() => patch({ resTime: tm })} style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", ...(on ? { background: "#7000FF", color: "#fff", border: "1.5px solid #7000FF" } : { background: "#fff", color: "#475467", border: "1.5px solid #E4E7EC" }) }}>{tm}</div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div onClick={() => patch({ showReserve: false })} style={{ flex: 1, height: 52, borderRadius: 13, border: "1.5px solid #E4E7EC", background: "#fff", color: "#344054", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Annuleren</div>
                <div onClick={resConfirm} style={{ flex: 2, height: 52, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, ...(can ? { background: "#7000FF", color: "#fff", cursor: "pointer" } : { background: "#F2F4F7", color: "#98A2B3", cursor: "default" }) }}>Bevestig reservering</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ───── Checkout ───── */}
      {s.showCheckout && (
        <div style={overlay(0.5, 55)} onClick={() => !s.paid && patch({ showCheckout: false, checkoutMethod: null })}>
          <div onClick={stop} className="pos-modal" style={{ width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
            {s.paid ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "18px 0" }}>
                <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#12B76A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{"✓"}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Betaald</div>
                <div style={{ fontSize: 15, color: "#667085" }}>{(at.label ? "Tafel " + at.label : "") + " · " + fmt(checkoutTotal)}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Afrekenen</div>
                <div style={{ fontSize: 14, color: "#667085", marginBottom: 18 }}>{at.label ? "Tafel " + at.label : ""}</div>
                <div style={{ background: "#F9F5FF", border: "1px solid #E9D7FE", borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: "#6941C6", fontWeight: 600, marginBottom: 4 }}>Te betalen</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: "#42307D" }}>{fmt(checkoutTotal)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                  {[{ key: "pin", label: "Pinnen", desc: "Kaart of contactloos" }, { key: "cash", label: "Contant", desc: "Betaling met cash" }, { key: "account", label: "Op rekening", desc: "Koppel aan lidaccount" }].map((m) => {
                    const on = s.checkoutMethod === m.key;
                    return (
                      <div key={m.key} onClick={() => patch({ checkoutMethod: m.key })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, cursor: "pointer", ...(on ? { border: "1.5px solid #7000FF", background: "#F9F5FF" } : { border: "1.5px solid #E4E7EC", background: "#fff" }) }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#101828" }}>{m.label}</div>
                          <div style={{ fontSize: 13, color: "#667085" }}>{m.desc}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, ...(on ? { border: "6px solid #7000FF" } : { border: "2px solid #D0D5DD" }) }} />
                      </div>
                    );
                  })}
                </div>
                <div onClick={payConfirm} style={{ height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, ...(s.checkoutMethod ? { background: "#7000FF", color: "#fff", cursor: "pointer" } : { background: "#F2F4F7", color: "#98A2B3", cursor: "default" }) }}>{"Bevestig betaling · " + fmt(checkoutTotal)}</div>
              </>
            )}
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
                <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{staffName}</div>
                <div style={{ fontSize: 12, color: "#98A2B3" }}>Ingelogd</div>
              </div>
            </div>
            <div style={{ height: 1, background: "#F2F4F7", margin: "0 2px 6px" }} />
            {[
              { label: "Gebruiker wisselen", msg: "Gebruiker gewisseld", icon: <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> },
              { label: "Kassalade openen", msg: "Kassalade geopend", icon: <><rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 12.5h17M10 15.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></> },
              { label: "Dagoverzicht", msg: "Dagoverzicht geopend", icon: <path d="M5 20v-6M10 20V5M15 20v-9M20 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> },
              { label: "Instellingen", msg: "Instellingen geopend", icon: <><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="14" cy="8" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.7" /><circle cx="9" cy="16" r="2.5" fill="#fff" stroke="currentColor" strokeWidth="1.7" /></> },
            ].map((m) => (
              <div key={m.label} className="pos-hover-row" onClick={() => { patch({ showUserMenu: false }); setToast(m.msg); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#344054" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{m.icon}</svg>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "#F2F4F7", margin: "6px 2px" }} />
            <div className="pos-hover-danger" onClick={() => { patch({ showUserMenu: false }); setToast("Dienst beëindigd"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 10, cursor: "pointer", color: "#D92D20" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7.5 7.5a6.5 6.5 0 1 0 9 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Dienst be&euml;indigen</span>
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
            <div onClick={stop} className="pos-modal" style={{ width: "100%", maxWidth: 420, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#fff", borderRadius: 24, padding: 26, boxShadow: "0 24px 60px rgba(16,24,40,0.3)", animation: "posPop .18s ease" }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 2 }}>Waarom annuleren?</div>
              <div style={{ fontSize: 14, color: "#667085", marginBottom: 18 }}>{name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Verkeerd aangeslagen", "Klant bedacht zich", "Niet op voorraad", "Verkeerd bereid", "Dubbel aangeslagen"].map((r) => (
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

      {/* ───── Toast ───── */}
      {s.toast && (
        <div style={{ position: "absolute", left: "50%", bottom: 30, background: "#1D1B52", color: "#fff", padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600, boxShadow: "0 12px 30px rgba(16,24,40,0.28)", zIndex: 70, animation: "posToastUp .28s ease", transform: "translateX(-50%)" }}>{s.toast}</div>
      )}

      <PosTweaks
        screen={s.screen}
        setScreen={(sc) => patch({ screen: sc, activeTableId: sc === "order" ? s.activeTableId : null, showUserMenu: false })}
        locationName={locationName}
        setLocationName={setLocationName}
        staffName={staffName}
        setStaffName={setStaffName}
        onReset={() => { setS(makeInitialState()); setToast("Demo gereset"); }}
      />
    </div>
  );
}

// ── Small presentational helpers ──
function Legend({ dot, text }: { dot: ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#475467" }}>
      {dot}
      {text}
    </div>
  );
}

function TableCard({ t, onTap }: { t: TableT; onTap: () => void }) {
  const base: CSSProperties = { borderRadius: 16, padding: "14px 16px", height: 116, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", userSelect: "none", boxSizing: "border-box", transition: "transform .12s ease, box-shadow .12s ease" };
  let sty: CSSProperties;
  let numColor: string;
  if (t.status === "occupied") { sty = { background: "#F4EBFF", border: "1.5px solid #7000FF", boxShadow: "0 2px 8px rgba(112,0,255,0.12)" }; numColor = "#6941C6"; }
  else if (t.status === "reserved") { sty = { background: "#FFFBF4", border: "1.5px dashed #F79009", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }; numColor = "#B54708"; }
  else { sty = { background: "#FFFFFF", border: "1.5px solid #E4E7EC", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" }; numColor = "#344054"; }
  return (
    <div className="pos-table-card" style={{ ...base, ...sty }} onClick={onTap}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: numColor }}>{t.label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#98A2B3", background: "rgba(16,24,40,0.04)", padding: "3px 9px", borderRadius: 999 }}>{t.seats}p</span>
      </div>
      {t.status === "free" && <div style={{ fontSize: 13, fontWeight: 600, color: "#98A2B3" }}>Vrij</div>}
      {t.status === "occupied" && (
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#42307D" }}>{fmt(tableTotal(t))}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#8B79BE" }}>{(t.guests || t.seats) + " gasten"}</div>
        </div>
      )}
      {t.status === "reserved" && (
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

// ── Tweaks panel (collapsed pill by default) ──
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
          {([["floor", "Vloer"], ["kitchen", "Keuken"], ["orders", "Orders"]] as const).map(([k, label]) => (
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

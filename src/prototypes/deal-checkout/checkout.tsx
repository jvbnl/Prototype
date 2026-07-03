import { useEffect, useMemo, useState, type ReactNode } from "react";

export type DealType = "percent" | "fixed" | "free_month";
export type DealSource = "gymly" | "rep";
export type AppliesTo = "both" | "monthly" | "yearly";

export type Deal = {
  enabled: boolean;
  type: DealType;
  percent: number;
  amount: number;
  title: string;
  descShort: string;
  descLong: string;
  appliesTo: AppliesTo;
};

export type Pricing = {
  final: number;
  discount: number;
  savings: number;
};

export function GymlyMark({ size = 24, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth="1.6" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke={color}
        strokeWidth="1.6"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke={color}
        strokeWidth="1.6"
        transform="rotate(120 12 12)"
      />
      <circle cx="12" cy="12" r="1.6" fill={color} />
    </svg>
  );
}

export function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 7v4M8 5h.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M10 3l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10m-4-4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l1.4 4.1L13.5 7l-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4L8 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function NlFlag({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 12) / 18}
      viewBox="0 0 18 12"
      style={{ borderRadius: 2 }}
    >
      <rect width="18" height="4" fill="#AE1C28" />
      <rect y="4" width="18" height="4" fill="#fff" />
      <rect y="8" width="18" height="4" fill="#21468B" />
    </svg>
  );
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

export function computePricing({
  basePrice,
  deal,
}: {
  basePrice: number;
  deal: Deal;
}): Pricing {
  if (!deal.enabled) return { final: basePrice, discount: 0, savings: 0 };
  if (deal.type === "percent") {
    const savings = basePrice * (deal.percent / 100);
    return { final: basePrice - savings, discount: deal.percent, savings };
  }
  if (deal.type === "fixed") {
    const savings = Math.min(deal.amount, basePrice);
    return { final: basePrice - savings, discount: 0, savings };
  }
  // free_month: full first-period discount
  return { final: 0, discount: 100, savings: basePrice };
}

export function BillingForm() {
  return (
    <div className="checkout-left">
      <SignInSection />

      <div className="card">
        <h2>Factuurgegevens</h2>
        <div className="field-help" style={{ marginTop: -12, marginBottom: 18 }}>
          We maken hiermee automatisch een Gymly-account aan voor je studio.
        </div>

        <div className="field">
          <label>Bedrijfsnaam</label>
          <input type="text" defaultValue="Studio Test" />
        </div>

        <div className="field">
          <label>E-mailadres voor bonnen</label>
          <input type="email" defaultValue="joel@gymly.io" />
          <div className="field-help">
            Hier sturen we de bon en herinneringen voor verlenging naartoe.
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>KvK-nummer</label>
            <input type="text" defaultValue="12345678" />
          </div>
          <div className="field">
            <label>BTW-nummer</label>
            <input type="text" defaultValue="1234567890" />
            <div className="field-help">Vereist voor btw-verlegging buiten Nederland.</div>
          </div>
        </div>

        <div className="field">
          <label>Telefoonnummer</label>
          <div className="input-prefix">
            <span className="pfx">
              <NlFlag />
            </span>
            <input type="tel" defaultValue="+31612345678" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Adres</label>
            <input type="text" defaultValue="Prins Bernhardstraat 1" />
          </div>
          <div className="field">
            <label>Land</label>
            <select defaultValue="NL">
              <option value="NL">Nederland</option>
              <option value="BE">België</option>
              <option value="DE">Duitsland</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Postcode</label>
            <input type="text" defaultValue="1211AB" />
          </div>
          <div className="field">
            <label>Plaats</label>
            <input type="text" defaultValue="Hilversum" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stripe/Shopify-style auth surface at the top of checkout: returning users
// can sign in for a faster path, new users continue with the form below which
// implicitly creates their Gymly account on submit. No separate "register"
// step — fewer dead-ends in the flow.
function SignInSection() {
  return (
    <div className="card signin-card">
      <div className="signin-head">
        <div>
          <h2 style={{ margin: 0 }}>Heb je al een Gymly-account?</h2>
          <div className="field-help" style={{ marginTop: 4 }}>
            Log in om je gegevens automatisch in te vullen.
          </div>
        </div>
        <a href="#" className="signin-forgot">
          Wachtwoord vergeten?
        </a>
      </div>

      <div className="field-row" style={{ marginTop: 16 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>E-mailadres</label>
          <input type="email" placeholder="jij@studio.nl" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Wachtwoord</label>
          <input type="password" placeholder="••••••••" />
        </div>
      </div>

      <button type="button" className="signin-btn">
        Inloggen
        <ArrowRight />
      </button>

      <div className="signin-divider">
        <span>of</span>
      </div>

      <div className="signin-noaccount">
        <div className="signin-noaccount-head">Nog geen Gymly-account?</div>
        <p className="signin-noaccount-body">
          Begin gratis. Geen creditcard nodig. Upgrade wanneer je er klaar voor bent.
        </p>
        <a href="https://admin.gymly.io/onboarding" className="signin-free-btn">
          Maak gratis account
          <ArrowRight />
        </a>
      </div>
    </div>
  );
}

function PlanOption({
  name,
  sub,
  price,
  unit,
  selected,
  onSelect,
  badge,
  beforePrice,
}: {
  name: string;
  sub?: string;
  price: number;
  unit: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  beforePrice?: number | null;
}) {
  return (
    <div
      className={"plan-option" + (selected ? " selected" : "")}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
    >
      <div className="radio" />
      <div className="plan-body">
        <div className="plan-row">
          <span className="plan-name">
            {name}
            {badge && <span className="plan-badge">{badge}</span>}
          </span>
          <span className="plan-price tnum">
            {beforePrice != null && (
              <span className="was-price">{fmtMoney(beforePrice)}</span>
            )}
            {fmtMoney(price)} <span className="unit">/ {unit}</span>
          </span>
        </div>
        {sub && <div className="plan-meta">{sub}</div>}
      </div>
    </div>
  );
}

export type Cycle = "monthly" | "yearly";

export function OrderSummary({
  cycle,
  setCycle,
  pricing,
  deal,
  children,
  showPlanPicker = true,
  baseMonthly = 99,
  baseYearly = 990,
}: {
  cycle: Cycle;
  setCycle: (c: Cycle) => void;
  pricing: Pricing;
  deal: Deal;
  children?: ReactNode;
  showPlanPicker?: boolean;
  baseMonthly?: number;
  baseYearly?: number;
}) {
  const isMonthly = cycle === "monthly";
  const basePrice = isMonthly ? baseMonthly : baseYearly;
  const final = pricing.final;
  const proRataFactor = isMonthly ? 0.267 : 1;
  const dealDelta = deal.enabled ? (basePrice - final) * proRataFactor : 0;
  const proRataLine = final * proRataFactor + dealDelta;
  const btw = final * proRataFactor * 0.21;
  const totalToday = final * proRataFactor + btw;

  const applyMonthly = deal.enabled && deal.appliesTo !== "yearly";
  const applyYearly = deal.enabled && deal.appliesTo !== "monthly";
  const discountedMonthly =
    deal.type === "percent"
      ? baseMonthly * (1 - deal.percent / 100)
      : deal.type === "fixed"
        ? Math.max(0, baseMonthly - deal.amount)
        : 0;
  const discountedYearly =
    deal.type === "percent"
      ? baseYearly * (1 - deal.percent / 100)
      : deal.type === "fixed"
        ? Math.max(0, baseYearly - deal.amount)
        : 0;
  const monthlyShown = applyMonthly ? discountedMonthly : baseMonthly;
  const yearlyShown = applyYearly ? discountedYearly : baseYearly;

  return (
    <aside className="summary card">
      {children}

      <h2>Besteloverzicht</h2>

      {showPlanPicker && (
        <>
          <PlanOption
            name="Maandelijks"
            sub={`Betaal ${fmtMoney(monthlyShown)} per maand`}
            price={monthlyShown}
            beforePrice={applyMonthly ? baseMonthly : null}
            unit="mnd"
            selected={isMonthly}
            onSelect={() => setCycle("monthly")}
          />
          <PlanOption
            name="Jaarlijks"
            sub={`${fmtMoney(yearlyShown / 12)} / mnd · gefactureerd ${fmtMoney(yearlyShown)}`}
            price={yearlyShown}
            beforePrice={applyYearly ? baseYearly : null}
            unit="jr"
            badge="BESPAAR 17%"
            selected={!isMonthly}
            onSelect={() => setCycle("yearly")}
          />
        </>
      )}

      <div className="summary-divider" />

      <div className="line">
        <span className="lbl">
          Pro-rata upgrade naar Gymly Studio
          <small>Rest van mei</small>
        </span>
        <span className="val tnum">{fmtMoney(proRataLine)}</span>
      </div>

      {deal.enabled && (
        <div className="line deal">
          <span className="lbl">
            <SparkleIcon size={12} />
            {deal.type === "percent"
              ? `Deal ${deal.percent}% korting`
              : deal.type === "fixed"
                ? `Deal ${fmtMoney(deal.amount)} korting`
                : "Eerste maand gratis"}
          </span>
          <span className="val tnum">−{fmtMoney(dealDelta)}</span>
        </div>
      )}

      <div className="line">
        <span className="lbl">BTW 21%</span>
        <span className="val tnum">{fmtMoney(btw)}</span>
      </div>

      <div className="line total">
        <span className="lbl">Totaal vandaag</span>
        <span className="val tnum">{fmtMoney(totalToday)}</span>
      </div>

      <div className="info-box">
        <InfoIcon />
        <span>
          Na vandaag brengen we {fmtMoney(final)} in rekening op{" "}
          {isMonthly ? "de 1e van elke maand" : "1 mei volgend jaar"}. We berekenen het
          bedrag van vandaag naar rato, zodat verlengingen op de 1e van de maand vallen.
        </span>
      </div>

      <button className="cta-btn">
        Aankoop afronden · {fmtMoney(totalToday)}
        <ArrowRight />
      </button>

      <div className="trust-row">
        <LockIcon />
        <span>
          Veilige betalingen via{" "}
          <strong style={{ color: "var(--text)" }}>Adyen</strong>. Op elk moment
          opzegbaar.
        </span>
      </div>

      <div className="legal">
        Door verder te gaan ga je akkoord met de{" "}
        <a href="#">Algemene voorwaarden</a> en het{" "}
        <a href="#">Privacybeleid</a> van Gymly.
      </div>
    </aside>
  );
}

export type Countdown = { d: number; h: number; m: number; s: number; ms: number };

export function useCountdown(hours: number): Countdown {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (hours <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hours]);
  const target = useMemo(() => Date.now() + hours * 3600 * 1000, [hours]);
  const ms = Math.max(0, target - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, ms };
}

export function formatCountdown(c: Countdown): string {
  if (c.d > 0) return `${c.d}d ${c.h}u ${String(c.m).padStart(2, "0")}m`;
  if (c.h > 0)
    return `${c.h}u ${String(c.m).padStart(2, "0")}m ${String(c.s).padStart(2, "0")}s`;
  return `${c.m}m ${String(c.s).padStart(2, "0")}s`;
}

export function senderName(source: DealSource): string {
  return source === "gymly" ? "Gymly" : "Joël Mulder";
}

export function senderRole(source: DealSource): string {
  return source === "gymly" ? "Team Gymly" : "Sales rep · Gymly";
}

export function dealHeadline(deal: Deal): string {
  if (deal.type === "percent") return `${deal.percent}% korting`;
  if (deal.type === "fixed") return `${fmtMoney(deal.amount)} korting`;
  return "Eerste maand gratis";
}

export function DealAvatar({
  source,
  size = 32,
  className = "avatar",
}: {
  source: DealSource;
  size?: number;
  className?: string;
}) {
  if (source === "gymly") {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: "#7C3AED" }}
      >
        <GymlyMark size={size * 0.55} color="#fff" />
      </div>
    );
  }
  return (
    <div className={className} style={{ width: size, height: size }}>
      JM
    </div>
  );
}

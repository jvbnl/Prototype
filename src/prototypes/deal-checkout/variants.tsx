import { useState } from "react";
import {
  BillingForm,
  ChevronLeft,
  ClockIcon,
  DealAvatar,
  GymlyMark,
  OrderSummary,
  SparkleIcon,
  computePricing,
  dealHeadline,
  fmtMoney,
  formatCountdown,
  senderName,
  senderRole,
  useCountdown,
  type Cycle,
  type Deal,
  type DealSource,
  type Pricing,
} from "./checkout";

type VariantProps = {
  deal: Deal;
  source: DealSource;
  urgency: boolean;
  short: boolean;
  cycle: Cycle;
  setCycle: (c: Cycle) => void;
  pricing: Pricing;
};

function descText(deal: Deal, short: boolean): string {
  return short ? deal.descShort : deal.descLong;
}

function ProductHeader() {
  return (
    <div className="product-header">
      <div className="product-icon">
        <GymlyMark size={22} />
      </div>
      <div className="product-title">
        <h1>Upgraden naar Studio</h1>
        <p>Voor groeiende single-location studio's</p>
      </div>
    </div>
  );
}

// VARIANT 1: Spotlight banner
export function VariantOne({
  deal,
  source,
  urgency,
  cycle,
  setCycle,
  pricing,
}: VariantProps) {
  const c = useCountdown(urgency ? 3 * 24 + 6 : 0);
  return (
    <div className="page">
      {deal.enabled && (
        <div className="v1-banner">
          <div className="v1-banner-inner">
            <div className="v1-banner-left">
              <DealAvatar source={source} size={36} />
              <div>
                <div className="v1-from" style={{ marginBottom: 2 }}>
                  Speciale deal van {senderName(source)}
                </div>
                <div className="v1-title">
                  {deal.title} — {dealHeadline(deal)} op Gymly Studio
                </div>
              </div>
            </div>
            <div className="v1-banner-right">
              {urgency && (
                <div className="v1-timer">
                  <ClockIcon /> Verloopt over {formatCountdown(c)}
                </div>
              )}
              <div className="v1-discount tnum">
                {deal.type === "percent"
                  ? `−${deal.percent}%`
                  : deal.type === "fixed"
                    ? `−${fmtMoney(deal.amount)}`
                    : "1 mnd gratis"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-inner">
        <ProductHeader />
        <div className="page-grid">
          <BillingForm />
          <OrderSummary cycle={cycle} setCycle={setCycle} pricing={pricing} deal={deal} />
        </div>
        <a href="#" className="back-link">
          <ChevronLeft /> Terug naar facturatie
        </a>
      </div>
    </div>
  );
}

// VARIANT 2: Replaced hero
export function VariantTwo({
  deal,
  source,
  urgency,
  short,
  cycle,
  setCycle,
  pricing,
}: VariantProps) {
  const c = useCountdown(urgency ? 3 * 24 + 6 : 0);
  const [expanded, setExpanded] = useState(false);
  const longDesc = !short;
  const showReadMore = longDesc && !expanded;
  const text =
    longDesc && !expanded ? deal.descLong.split("\n")[0] : descText(deal, short);
  const baseMonthly = 99;
  const { final } = computePricing({ basePrice: baseMonthly, deal });

  return (
    <div className="page">
      <div className="page-inner">
        {deal.enabled ? (
          <div className="v2-hero">
            <div className="v2-top">
              <div>
                <div className="v2-from">
                  <DealAvatar source={source} size={40} />
                  <div className="v2-from-text">
                    <strong>{senderName(source)}</strong>
                    <span className="role">{senderRole(source)} · deelt een deal met je</span>
                  </div>
                  <span style={{ marginLeft: "auto" }}>
                    <span className="deal-pill">
                      <span className="dot" />
                      Deal
                    </span>
                  </span>
                </div>
                <h1 className="v2-title">{deal.title}</h1>
                <p className="v2-desc">{text}</p>
                {showReadMore && (
                  <button className="v2-read-more" onClick={() => setExpanded(true)}>
                    Lees meer
                  </button>
                )}
              </div>
              <div className="v2-pricepanel">
                <div className="was tnum">{fmtMoney(baseMonthly)}</div>
                <div className="now tnum">
                  {fmtMoney(final)} <small>/ mnd</small>
                </div>
                <span className="saving">
                  {deal.type === "percent"
                    ? `Bespaar ${deal.percent}%`
                    : deal.type === "fixed"
                      ? `Bespaar ${fmtMoney(deal.amount)}/mnd`
                      : "Eerste maand gratis"}
                </span>
              </div>
            </div>
            {urgency && (
              <div className="v2-bottom">
                <div className="lhs">
                  <SparkleIcon /> Deze deal is exclusief voor jou.
                </div>
                <div className="timer">
                  <ClockIcon /> Verloopt over {formatCountdown(c)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ProductHeader />
        )}

        <div className="page-grid">
          <BillingForm />
          <OrderSummary cycle={cycle} setCycle={setCycle} pricing={pricing} deal={deal} />
        </div>

        <a href="#" className="back-link">
          <ChevronLeft /> Terug naar facturatie
        </a>
      </div>
    </div>
  );
}

// VARIANT 3: Integrated into order summary
export function VariantThree({
  deal,
  source,
  urgency,
  short,
  cycle,
  setCycle,
  pricing,
}: VariantProps) {
  const c = useCountdown(urgency ? 3 * 24 + 6 : 0);
  const [expanded, setExpanded] = useState(false);
  const longDesc = !short;
  const text =
    longDesc && !expanded ? deal.descLong.split("\n")[0] : descText(deal, short);

  const dealBlock = deal.enabled ? (
    <div className="v3-deal-block">
      <div className="v3-deal-head">
        <div className="v3-deal-from">
          <DealAvatar source={source} size={22} />
          Van {senderName(source)}
        </div>
        <span className="deal-pill">
          <span className="dot" />
          {dealHeadline(deal)}
        </span>
      </div>
      <div className="v3-title">{deal.title}</div>
      <p className="v3-desc">{text}</p>
      {longDesc && !expanded && (
        <button className="v2-read-more" onClick={() => setExpanded(true)}>
          Lees meer
        </button>
      )}
      {urgency && (
        <div className="v3-timer">
          <ClockIcon /> Verloopt over {formatCountdown(c)}
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="page">
      <div className="page-inner">
        <ProductHeader />
        <div className="page-grid">
          <BillingForm />
          <OrderSummary cycle={cycle} setCycle={setCycle} pricing={pricing} deal={deal}>
            {dealBlock}
          </OrderSummary>
        </div>
        <a href="#" className="back-link">
          <ChevronLeft /> Terug naar facturatie
        </a>
      </div>
    </div>
  );
}

// VARIANT 4: Dedicated deal card
export function VariantFour({
  deal,
  source,
  urgency,
  short,
  cycle,
  setCycle,
  pricing,
}: VariantProps) {
  const c = useCountdown(urgency ? 3 * 24 + 6 : 0);
  const [expanded, setExpanded] = useState(false);
  const longDesc = !short;
  const text =
    longDesc && !expanded ? deal.descLong.split("\n")[0] : descText(deal, short);
  const baseMonthly = 99;
  const { final } = computePricing({ basePrice: baseMonthly, deal });

  return (
    <div className="page">
      <div className="page-inner">
        <ProductHeader />

        {deal.enabled && (
          <div
            className="v4-side-card"
            style={{ position: "static", marginBottom: 24, padding: "28px 28px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 32,
                alignItems: "center",
                position: "relative",
              }}
            >
              <div>
                <div className="v4-tag">
                  <span className="dot" />
                  Deal · {dealHeadline(deal)}
                </div>
                <div className="v4-from">
                  <DealAvatar source={source} size={28} />
                  <span>
                    {senderName(source)} — {senderRole(source)}
                  </span>
                </div>
                <h2 className="v4-title">{deal.title}</h2>
                <p className="v4-desc" style={{ marginBottom: 0 }}>
                  {text}
                </p>
                {longDesc && !expanded && (
                  <button
                    className="v2-read-more"
                    onClick={() => setExpanded(true)}
                    style={{ marginTop: 6 }}
                  >
                    Lees meer
                  </button>
                )}
                {urgency && (
                  <div className="v4-timer">
                    <ClockIcon /> Verloopt over {formatCountdown(c)}
                  </div>
                )}
              </div>
              <div
                style={{
                  textAlign: "right",
                  position: "relative",
                  paddingLeft: 24,
                  borderLeft: "1px solid var(--border)",
                }}
              >
                <div
                  className="was-price tnum"
                  style={{ display: "block", marginRight: 0, fontSize: 15 }}
                >
                  {fmtMoney(baseMonthly)}
                </div>
                <div
                  className="v4-pricerow"
                  style={{ borderTop: 0, padding: 0, justifyContent: "flex-end" }}
                >
                  <span className="now tnum">
                    {fmtMoney(final)} <small>/ mnd</small>
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "inline-flex",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--brand)",
                    background: "var(--brand-tint-2)",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  {deal.type === "percent"
                    ? `Bespaar ${deal.percent}%`
                    : deal.type === "fixed"
                      ? `Bespaar ${fmtMoney(deal.amount)}/mnd`
                      : "Eerste maand gratis"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="page-grid">
          <BillingForm />
          <OrderSummary cycle={cycle} setCycle={setCycle} pricing={pricing} deal={deal} />
        </div>

        <a href="#" className="back-link">
          <ChevronLeft /> Terug naar facturatie
        </a>
      </div>
    </div>
  );
}

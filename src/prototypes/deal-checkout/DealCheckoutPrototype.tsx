import { useEffect, useState } from "react";
import { VariantOne, VariantTwo, VariantThree, VariantFour } from "./variants";
import { computePricing, type Cycle, type Deal, type DealSource } from "./checkout";
import dealCheckoutCss from "./styles.css?inline";

type VariantKey = "v1" | "v2" | "v3" | "v4";
type DealType = "percent" | "fixed" | "free_month";
type AppliesTo = "both" | "monthly" | "yearly";

const DEAL_CONTENT = {
  title: "Welkom-bij-Gymly korting",
  descShort: "Speciale prijs voor jouw studio — geldt op je eerste abonnementsperiode.",
  descLong:
    "Speciale prijs voor jouw studio. We hebben deze deal samengesteld na ons gesprek vorige week.\n\n" +
    "De korting geldt op je eerste abonnementsperiode en wordt automatisch verwerkt in je eerste factuur. Na de eerste periode betaal je het reguliere tarief — je kunt op elk moment opzeggen of van plan wisselen.\n\n" +
    "Heb je nog vragen? Reageer gewoon op de e-mail waarin je deze link kreeg.",
};

const VARIANT_NAMES: Record<VariantKey, string> = {
  v1: "Spotlight banner",
  v2: "Hero replacement",
  v3: "Summary integrated",
  v4: "Dedicated deal card",
};

const VARIANTS = {
  v1: VariantOne,
  v2: VariantTwo,
  v3: VariantThree,
  v4: VariantFour,
};

export function DealCheckoutPrototype() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "deal-checkout";
    style.textContent = dealCheckoutCss;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const [variant, setVariant] = useState<VariantKey>("v1");
  const [dealEnabled, setDealEnabled] = useState(true);
  const [dealType, setDealType] = useState<DealType>("percent");
  const [percent, setPercent] = useState(30);
  const [amount, setAmount] = useState(25);
  const [source, setSource] = useState<DealSource>("rep");
  const [urgency, setUrgency] = useState(true);
  const [shortDesc, setShortDesc] = useState(false);
  const [appliesTo, setAppliesTo] = useState<AppliesTo>("both");
  const [cycle, setCycle] = useState<Cycle>("monthly");

  const deal: Deal = {
    enabled: dealEnabled,
    type: dealType,
    percent,
    amount,
    title: DEAL_CONTENT.title,
    descShort: DEAL_CONTENT.descShort,
    descLong: DEAL_CONTENT.descLong,
    appliesTo,
  };

  const basePrice = cycle === "monthly" ? 99 : 990;
  const pricing = computePricing({ basePrice, deal });

  const Variant = VARIANTS[variant];

  return (
    <>
      <div className="dc-topbar">
        <a href="#/" className="dc-back">
          ← All prototypes
        </a>
        <div className="dc-variant-label">
          <span className="pill">V{variant.replace("v", "")}</span>
          {VARIANT_NAMES[variant]}
        </div>
      </div>

      <Variant
        deal={deal}
        source={source}
        urgency={urgency}
        short={shortDesc}
        cycle={cycle}
        setCycle={setCycle}
        pricing={pricing}
      />

      <DealCheckoutTweaks
        variant={variant}
        setVariant={setVariant}
        dealEnabled={dealEnabled}
        setDealEnabled={setDealEnabled}
        dealType={dealType}
        setDealType={setDealType}
        percent={percent}
        setPercent={setPercent}
        amount={amount}
        setAmount={setAmount}
        appliesTo={appliesTo}
        setAppliesTo={setAppliesTo}
        source={source}
        setSource={setSource}
        shortDesc={shortDesc}
        setShortDesc={setShortDesc}
        urgency={urgency}
        setUrgency={setUrgency}
      />
    </>
  );
}

function DealCheckoutTweaks(props: {
  variant: VariantKey;
  setVariant: (v: VariantKey) => void;
  dealEnabled: boolean;
  setDealEnabled: (v: boolean) => void;
  dealType: DealType;
  setDealType: (v: DealType) => void;
  percent: number;
  setPercent: (v: number) => void;
  amount: number;
  setAmount: (v: number) => void;
  appliesTo: AppliesTo;
  setAppliesTo: (v: AppliesTo) => void;
  source: DealSource;
  setSource: (v: DealSource) => void;
  shortDesc: boolean;
  setShortDesc: (v: boolean) => void;
  urgency: boolean;
  setUrgency: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button className="dc-twk-pill" onClick={() => setOpen(true)}>
        ⚙ Tweaks
      </button>
    );
  }

  return (
    <div className="dc-twk-panel">
      <div className="dc-twk-hd">
        <b>Tweaks</b>
        <button className="dc-twk-x" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="dc-twk-body">
        <div className="dc-twk-sect">Layout</div>
        <div className="dc-twk-row">
          <div className="dc-twk-lbl">
            <span>Variant</span>
          </div>
          <select
            className="dc-twk-field"
            value={props.variant}
            onChange={(e) => props.setVariant(e.target.value as VariantKey)}
          >
            <option value="v1">V1 · Spotlight banner</option>
            <option value="v2">V2 · Hero replacement</option>
            <option value="v3">V3 · Summary integrated</option>
            <option value="v4">V4 · Dedicated deal card</option>
          </select>
        </div>

        <div className="dc-twk-sect">Deal</div>
        <div className="dc-twk-row dc-twk-row-h">
          <span>Deal active</span>
          <button
            type="button"
            className="dc-twk-toggle"
            data-on={props.dealEnabled ? "1" : "0"}
            onClick={() => props.setDealEnabled(!props.dealEnabled)}
            aria-label="Toggle deal"
          >
            <i />
          </button>
        </div>
        <div className="dc-twk-row">
          <div className="dc-twk-lbl">
            <span>Type</span>
          </div>
          <select
            className="dc-twk-field"
            value={props.dealType}
            onChange={(e) => props.setDealType(e.target.value as DealType)}
          >
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="free_month">Free first period</option>
          </select>
        </div>
        {props.dealType === "percent" && (
          <div className="dc-twk-row">
            <div className="dc-twk-lbl">
              <span>Percent</span>
              <span className="dc-twk-val">{props.percent}%</span>
            </div>
            <input
              type="range"
              className="dc-twk-slider"
              min={5}
              max={75}
              step={5}
              value={props.percent}
              onChange={(e) => props.setPercent(Number(e.target.value))}
            />
          </div>
        )}
        {props.dealType === "fixed" && (
          <div className="dc-twk-row">
            <div className="dc-twk-lbl">
              <span>Amount</span>
              <span className="dc-twk-val">€{props.amount}</span>
            </div>
            <input
              type="range"
              className="dc-twk-slider"
              min={5}
              max={80}
              step={5}
              value={props.amount}
              onChange={(e) => props.setAmount(Number(e.target.value))}
            />
          </div>
        )}
        <div className="dc-twk-row">
          <div className="dc-twk-lbl">
            <span>Applies to</span>
          </div>
          <select
            className="dc-twk-field"
            value={props.appliesTo}
            onChange={(e) => props.setAppliesTo(e.target.value as AppliesTo)}
          >
            <option value="both">Both billing cycles</option>
            <option value="monthly">Monthly only</option>
            <option value="yearly">Yearly only</option>
          </select>
        </div>

        <div className="dc-twk-sect">Presentation</div>
        <div className="dc-twk-row">
          <div className="dc-twk-lbl">
            <span>Source</span>
          </div>
          <div className="dc-twk-seg">
            <button
              className={props.source === "gymly" ? "on" : ""}
              onClick={() => props.setSource("gymly")}
            >
              Gymly
            </button>
            <button
              className={props.source === "rep" ? "on" : ""}
              onClick={() => props.setSource("rep")}
            >
              Sales rep
            </button>
          </div>
        </div>
        <div className="dc-twk-row dc-twk-row-h">
          <span>Short description</span>
          <button
            type="button"
            className="dc-twk-toggle"
            data-on={props.shortDesc ? "1" : "0"}
            onClick={() => props.setShortDesc(!props.shortDesc)}
            aria-label="Toggle short description"
          >
            <i />
          </button>
        </div>
        <div className="dc-twk-row dc-twk-row-h">
          <span>Show urgency timer</span>
          <button
            type="button"
            className="dc-twk-toggle"
            data-on={props.urgency ? "1" : "0"}
            onClick={() => props.setUrgency(!props.urgency)}
            aria-label="Toggle urgency"
          >
            <i />
          </button>
        </div>
      </div>
    </div>
  );
}

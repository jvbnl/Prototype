import { useCallback, useEffect, useState } from "react";
import { POS_CHECKLIST } from "./data";
import type { ChecklistItem } from "./data";

export type Phase = "intro" | "tour" | "app";
export type Pref = "color" | "image";

/** Per-feature persistence. One flag triggers the intro exactly once; the
 *  preference is remembered. Everything stays restartable via the launcher. */
const KEY = "gymly-onb-pos";
type Persisted = { seen: boolean; pref: Pref };

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { seen: false, pref: "color", ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — fall through to defaults */
  }
  return { seen: false, pref: "color" };
}
function save(p: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export type Onboarding = ReturnType<typeof useOnboarding>;

export function useOnboarding() {
  const initial = load();
  const [phase, setPhase] = useState<Phase>(initial.seen ? "app" : "intro");
  const [introStep, setIntroStep] = useState(0);
  const [pref, setPrefState] = useState<Pref>(initial.pref);
  const [tourStep, setTourStep] = useState(0);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [discover, setDiscover] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(POS_CHECKLIST);

  // success-toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const markSeen = useCallback(() => save({ seen: true, pref }), [pref]);

  const setPref = useCallback(
    (p: Pref) => {
      setPrefState(p);
      save({ seen: phase !== "intro", pref: p });
    },
    [phase],
  );

  const tickChecklist = useCallback((id: string) => {
    setChecklist((cl) => cl.map((c) => (c.id === id ? { ...c, done: true } : c)));
  }, []);

  const introNext = () => setIntroStep((s) => Math.min(2, s + 1));
  const introPrev = () => setIntroStep((s) => Math.max(0, s - 1));

  const closeIntro = () => {
    markSeen();
    setPhase("app");
  };

  const choose = (opt: "tour" | "discover" | "later") => {
    markSeen();
    if (opt === "tour") {
      setTourStep(0);
      setPhase("tour");
    } else {
      setDiscover(opt === "discover");
      setPhase("app");
    }
  };

  const tourNext = (lastIndex: number) =>
    setTourStep((s) => {
      if (s >= lastIndex) {
        setPhase("app");
        setToast(true);
        tickChecklist("tour");
        return s;
      }
      return s + 1;
    });
  const tourPrev = () => setTourStep((s) => Math.max(0, s - 1));
  const tourClose = () => setPhase("app");

  const restartTour = () => {
    setTourStep(0);
    setLauncherOpen(false);
    setDiscover(false);
    setPhase("tour");
  };

  /** Demo affordance: wipe the "seen" flag and replay from the welcome step. */
  const replayDemo = () => {
    save({ seen: false, pref });
    setIntroStep(0);
    setTourStep(0);
    setToast(false);
    setLauncherOpen(false);
    setDiscover(false);
    setChecklist(POS_CHECKLIST);
    setPhase("intro");
  };

  return {
    phase,
    introStep,
    pref,
    tourStep,
    launcherOpen,
    toast,
    discover,
    checklist,
    setPref,
    introNext,
    introPrev,
    closeIntro,
    choose,
    tourNext,
    tourPrev,
    tourClose,
    restartTour,
    replayDemo,
    tickChecklist,
    toggleLauncher: () => setLauncherOpen((o) => !o),
    closeLauncher: () => setLauncherOpen(false),
    hideToast: () => setToast(false),
  };
}

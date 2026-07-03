import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Traps focus inside `ref` while `active`, wires Esc → onEscape, and restores
 * focus to the previously-focused element on close. Used by the intro-modal.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onEscape: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const prevFocus = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // move focus in — prefer an explicit [data-autofocus] (the primary action)
    const preferred = node.querySelector<HTMLElement>("[data-autofocus]");
    (preferred ?? focusables()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [active, onEscape]);

  return ref;
}

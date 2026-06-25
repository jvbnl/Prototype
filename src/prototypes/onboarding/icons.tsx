/** Small stroked icon set (24×24, inherits color via currentColor). */
export type IconName =
  | "restart"
  | "search"
  | "plus"
  | "minus"
  | "check"
  | "arrow-right"
  | "chevron-right"
  | "help"
  | "x"
  | "percent"
  | "card"
  | "grid"
  | "image"
  | "swatch"
  | "list-check"
  | "article"
  | "trash"
  | "receipt";

const PATHS: Record<IconName, React.ReactNode> = {
  restart: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  "chevron-right": <path d="M9 18l6-6-6-6" />,
  help: (
    <>
      <path d="M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1-1.3 2v.3" />
      <path d="M12 17h.01" />
    </>
  ),
  x: <path d="M18 6L6 18M6 6l12 12" />,
  percent: (
    <>
      <path d="M19 5L5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.8" />
      <path d="M21 16l-5-5L5 21" />
    </>
  ),
  swatch: (
    <>
      <path d="M4 4h7v16a4 4 0 0 1-4-4H4z" />
      <path d="M11 12l5-5 3 3-9 9" />
      <path d="M11 20h9" />
    </>
  ),
  "list-check": (
    <>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7H4V5h11" />
    </>
  ),
  article: <path d="M4 4h16v13H8l-4 4z" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3v18l2-1.4L9 21l2-1.4L13 21l2-1.4L17 21l2-1.4V3l-2 1.4L15 3l-2 1.4L11 3 9 4.4 7 3z" />
      <path d="M8 8h8M8 12h8" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  stroke = 2,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

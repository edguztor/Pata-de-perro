import { cn } from "@/lib/utils";

/** The paw print mark used as the brand icon (4 toes + pad). */
export function PawMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" className={cn("text-current", className)} aria-hidden="true">
      {/* Toes */}
      <ellipse cx="20" cy="20" rx="6.5" ry="9" transform="rotate(-18 20 20)" />
      <ellipse cx="34" cy="14" rx="6.5" ry="9.5" />
      <ellipse cx="48" cy="20" rx="6.5" ry="9" transform="rotate(18 48 20)" />
      {/* Pad */}
      <path d="M34 28c9 0 17 7 17 16 0 7-6 11-12 11-2 0-3-1-5-1s-3 1-5 1c-6 0-12-4-12-11 0-9 8-16 17-16Z" />
    </svg>
  );
}

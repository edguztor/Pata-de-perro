import { cn } from "@/lib/utils";
import { PawMark } from "./paw-mark";

interface LogoProps {
  className?: string;
  /** Hide the text wordmark, show only the paw badge */
  iconOnly?: boolean;
}

/** Brand lockup: paw badge + "Pata de Perro" wordmark. */
export function Logo({ className, iconOnly }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e94560] to-[#f59e0b] shadow-lg shadow-[#e94560]/25">
        <PawMark className="h-5 w-5 text-white" />
      </span>
      {!iconOnly && (
        <div className="leading-none">
          <p
            className="text-[17px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            Pata de Perro
          </p>
          <p className="mt-1 text-[11px] font-medium text-amber-400/90">Hostel · Querétaro</p>
        </div>
      )}
    </div>
  );
}

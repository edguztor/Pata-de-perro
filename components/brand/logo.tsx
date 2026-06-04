"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PawMark } from "./paw-mark";

interface LogoProps {
  className?: string;
  /** Hide the text wordmark on the fallback, show only the paw badge */
  iconOnly?: boolean;
}

/**
 * Brand logo. Uses the uploaded artwork at /logo.png when present, and
 * gracefully falls back to a coded paw + wordmark lockup if the file
 * hasn't been added yet.
 */
export function Logo({ className, iconOnly }: LogoProps) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="Pata de Perro"
        className={cn("h-10 w-auto object-contain", className)}
        onError={() => setImgOk(false)}
      />
    );
  }

  // Fallback lockup (until /logo.png is uploaded)
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e94560] to-[#f59e0b] shadow-lg shadow-[#e94560]/25">
        <PawMark className="h-5 w-5 text-white" />
      </span>
      {!iconOnly && (
        <div className="leading-none">
          <p
            className="text-[17px] font-extrabold tracking-tight text-stone-900"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            Pata de Perro
          </p>
          <p className="mt-1 text-[11px] font-semibold text-amber-600">Hostel · Querétaro</p>
        </div>
      )}
    </div>
  );
}

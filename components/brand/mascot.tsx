"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DogMascot } from "./dog-mascot";

/**
 * Brand mascot. Uses the uploaded artwork at /perro.png when present,
 * falling back to the coded SVG dachshund if the file isn't there yet.
 * `tintClass` only applies to the SVG fallback (a PNG can't be tinted).
 */
export function Mascot({ className, tintClass = "text-stone-700" }: { className?: string; tintClass?: string }) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/perro.png"
        alt="Mascota Pata de Perro"
        className={cn("object-contain", className)}
        onError={() => setImgOk(false)}
      />
    );
  }

  return <DogMascot className={cn(tintClass, className)} />;
}

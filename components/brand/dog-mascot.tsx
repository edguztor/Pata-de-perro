import { cn } from "@/lib/utils";

/**
 * Pata de Perro mascot — a little dachshund travelling with a bindle stick.
 * Hand-drawn marker style line art, recreated as SVG so it scales crisply
 * and can be tinted (currentColor) for dark backgrounds.
 */
export function DogMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      aria-hidden="true"
    >
      {/* Bindle stick — from mouth up to the sack */}
      <path d="M196 92 L96 52" />

      {/* Bindle sack (knapsack) hanging from the stick */}
      <path d="M70 50 C 56 58, 54 84, 70 92 C 86 98, 100 84, 96 66 C 94 56, 84 48, 70 50 Z" />
      {/* Knot + two little leaf ears at the top of the sack */}
      <path d="M78 52 C 70 40, 82 32, 90 40 C 96 32, 108 38, 100 50" />

      {/* Floppy ear */}
      <path d="M150 66 C 138 80, 138 104, 150 116" />

      {/* Head + snout (pointing right, holding the stick) */}
      <path d="M150 70 C 168 60, 196 64, 202 86 C 206 102, 196 112, 182 112 C 168 112, 156 104, 152 92" />

      {/* Eye */}
      <circle cx="178" cy="84" r="3.2" fill="currentColor" stroke="none" />

      {/* Body — long sausage body */}
      <path d="M70 96 C 60 96, 56 112, 64 122 C 72 132, 140 132, 152 120 C 160 112, 158 100, 150 96" />

      {/* Back / top line connecting head to rump */}
      <path d="M70 96 C 80 86, 140 86, 150 96" />

      {/* Legs */}
      <path d="M78 130 L76 150" />
      <path d="M104 132 L102 152" />
      <path d="M126 132 L128 152" />
      <path d="M148 128 L150 148" />

      {/* Fluffy bone-like paws */}
      <path d="M70 150 c -4 0 -6 6 0 7 c -2 4 4 6 6 2 c 2 4 8 2 6 -2 c 6 -1 4 -7 0 -7 c 0 -4 -6 -4 -6 0 c -3 -3 -8 -1 -6 0 Z" />
      <path d="M96 152 c -4 0 -6 6 0 7 c -2 4 4 6 6 2 c 2 4 8 2 6 -2 c 6 -1 4 -7 0 -7 c 0 -4 -6 -4 -6 0 c -3 -3 -8 -1 -6 0 Z" />
      <path d="M122 152 c -4 0 -6 6 0 7 c -2 4 4 6 6 2 c 2 4 8 2 6 -2 c 6 -1 4 -7 0 -7 c 0 -4 -6 -4 -6 0 c -3 -3 -8 -1 -6 0 Z" />
      <path d="M144 148 c -4 0 -6 6 0 7 c -2 4 4 6 6 2 c 2 4 8 2 6 -2 c 6 -1 4 -7 0 -7 c 0 -4 -6 -4 -6 0 c -3 -3 -8 -1 -6 0 Z" />
    </svg>
  );
}

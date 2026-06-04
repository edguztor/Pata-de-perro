import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#e94560] text-white",
        secondary: "border-transparent bg-stone-200 text-stone-800",
        outline: "border-stone-300 text-stone-600",
        available: "border-emerald-300 bg-emerald-100 text-emerald-700",
        occupied: "border-rose-300 bg-rose-100 text-rose-700",
        reserved: "border-amber-300 bg-amber-100 text-amber-700",
        maintenance: "border-stone-300 bg-stone-200 text-stone-600",
        checkin: "border-emerald-300 bg-emerald-100 text-emerald-700",
        checkout: "border-stone-300 bg-stone-200 text-stone-600",
        cancelled: "border-rose-300 bg-rose-100 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

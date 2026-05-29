import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#e94560] text-white",
        secondary: "border-transparent bg-slate-700 text-slate-100",
        outline: "border-slate-600 text-slate-300",
        available: "border-transparent bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
        occupied: "border-transparent bg-rose-600/20 text-rose-400 border-rose-600/30",
        reserved: "border-transparent bg-amber-600/20 text-amber-400 border-amber-600/30",
        maintenance: "border-transparent bg-slate-600/20 text-slate-400 border-slate-600/30",
        checkin: "border-transparent bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
        checkout: "border-transparent bg-slate-600/20 text-slate-300 border-slate-600/30",
        cancelled: "border-transparent bg-rose-900/30 text-rose-400 border-rose-600/20",
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

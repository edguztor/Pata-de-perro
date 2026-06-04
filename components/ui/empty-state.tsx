import { Mascot } from "@/components/brand/mascot";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-[#e94560]/8 blur-2xl" />
        <Mascot className="relative h-20 w-20 animate-bob" tintClass="text-stone-400" />
      </div>
      <h3 className="text-base font-bold text-stone-800" style={{ fontFamily: "Nunito, sans-serif" }}>
        {title}
      </h3>
      {description && <p className="mt-1 text-sm text-stone-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

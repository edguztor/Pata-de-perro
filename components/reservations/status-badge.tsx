import { Badge } from "@/components/ui/badge";

const variantMap: Record<string, "available" | "occupied" | "reserved" | "checkout" | "cancelled" | "checkin"> = {
  RESERVED: "reserved",
  CHECKED_IN: "checkin",
  CHECKED_OUT: "checkout",
  CANCELLED: "cancelled",
};

const labelMap: Record<string, string> = {
  RESERVED: "Reservada",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  CANCELLED: "Cancelada",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantMap[status] ?? "checkout"}>
      {labelMap[status] ?? status}
    </Badge>
  );
}

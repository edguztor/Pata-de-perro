import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ActivityItem {
  id: number;
  status: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  guest: { name: string };
  bed: { name: string; roomName: string };
}

const statusMap: Record<string, { label: string; variant: "available" | "occupied" | "reserved" | "checkout" | "cancelled" }> = {
  CHECKED_IN: { label: "Check-in", variant: "available" },
  CHECKED_OUT: { label: "Check-out", variant: "checkout" },
  RESERVED: { label: "Reservada", variant: "reserved" },
  CANCELLED: { label: "Cancelada", variant: "cancelled" },
};

export function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activity.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-xl">🐾</span>
            </div>
            <p className="text-stone-400 text-sm font-medium">Sin actividad reciente</p>
          </div>
        )}
        {activity.map((item) => {
          const s = statusMap[item.status] ?? { label: item.status, variant: "checkout" as const };
          return (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-stone-200 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{item.guest.name}</p>
                <p className="text-xs text-stone-500">{item.bed.name} · {item.bed.roomName}</p>
                <p className="text-xs text-stone-400">{formatDate(item.checkIn)} → {formatDate(item.checkOut)}</p>
              </div>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

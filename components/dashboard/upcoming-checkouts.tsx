import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface Checkout {
  id: number;
  checkOut: string;
  guest: { name: string };
  bed: { name: string; roomName: string };
}

export function UpcomingCheckouts({ checkouts }: { checkouts: Checkout[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LogOut className="h-4 w-4 text-amber-600" />
          Próximos Check-outs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checkouts.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No hay check-outs próximos</p>
        )}
        {checkouts.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-stone-200 last:border-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
              <LogOut className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{item.guest.name}</p>
              <p className="text-xs text-stone-500">{item.bed.name} · {item.bed.roomName}</p>
            </div>
            <p className="text-xs text-amber-600 font-medium">{formatDate(item.checkOut)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

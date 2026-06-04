"use client";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale/es";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

export interface BlockedRange {
  start: Date;
  end: Date;
  label?: string;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  blockedRanges?: BlockedRange[];
  disabled?: boolean;
}

function isInBlockedRange(day: Date, ranges: BlockedRange[]): boolean {
  return ranges.some(
    (r) => !isBefore(startOfDay(day), startOfDay(r.start)) && !isAfter(startOfDay(day), startOfDay(r.end))
  );
}

export function DatePicker({ value, onChange, placeholder = "Selecciona fecha", minDate, blockedRanges = [], disabled }: DatePickerProps) {
  const selected = value ? new Date(value + "T12:00:00") : null;
  const [viewDate, setViewDate] = useState<Date>(selected ?? new Date());
  const [open, setOpen] = useState(false);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 }),
  });

  const handleSelect = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-stone-300 bg-[#f4efe4] px-3 text-sm text-left transition-colors",
            "hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-[#e94560]/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Calendar className="h-4 w-4 text-stone-500 flex-shrink-0" />
          <span className={selected ? "text-stone-900" : "text-stone-400"}>
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-xl border border-stone-300 bg-[#ece4d5] p-4 shadow-2xl"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewDate((d) => subMonths(d, 1))}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-stone-900 capitalize">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </p>
            <button type="button" onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-stone-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const inMonth = isSameMonth(day, viewDate);
              const isPast = minDate ? isBefore(startOfDay(day), startOfDay(minDate)) : false;
              const isBlocked = !isPast && isInBlockedRange(day, blockedRanges);
              const isDisabled = isPast || isBlocked;
              const todayMark = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  title={isBlocked ? "Fecha ocupada" : undefined}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center",
                    !inMonth && "text-stone-300",
                    inMonth && !isSelected && !todayMark && !isDisabled && "text-stone-600 hover:bg-stone-200 hover:text-stone-900",
                    todayMark && !isSelected && !isBlocked && "bg-stone-200 text-stone-900",
                    isSelected && "bg-[#e94560] text-white font-bold",
                    isPast && "text-stone-300 cursor-not-allowed",
                    isBlocked && inMonth && "bg-rose-100 text-rose-600 cursor-not-allowed line-through"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {blockedRanges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-200 space-y-1">
              {blockedRanges.map((r, i) => (
                <p key={i} className="text-[10px] text-rose-600 leading-tight">
                  🔴 {r.label ?? "Ocupado"}: {format(r.start, "dd/MM")} – {format(r.end, "dd/MM/yyyy")}
                </p>
              ))}
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

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
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale/es";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

interface DatePickerProps {
  value: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Selecciona fecha", minDate, disabled }: DatePickerProps) {
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
            "flex h-9 w-full items-center gap-2 rounded-lg border border-slate-600 bg-[#0a0f1e] px-3 text-sm text-left transition-colors",
            "hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className={selected ? "text-white" : "text-slate-500"}>
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-xl border border-slate-700 bg-[#0d1627] p-4 shadow-2xl"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate((d) => subMonths(d, 1))}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-white capitalize">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </p>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const inMonth = isSameMonth(day, viewDate);
              const isDisabled = minDate ? isBefore(startOfDay(day), startOfDay(minDate)) : false;
              const todayMark = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center",
                    !inMonth && "text-slate-700",
                    inMonth && !isSelected && !todayMark && !isDisabled && "text-slate-300 hover:bg-slate-700 hover:text-white",
                    todayMark && !isSelected && "bg-slate-700/70 text-white",
                    isSelected && "bg-[#e94560] text-white font-bold",
                    isDisabled && "text-slate-700 cursor-not-allowed"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

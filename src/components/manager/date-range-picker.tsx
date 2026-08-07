"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_ID   = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
const DAYS        = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const ACCENT      = "#D0BCFF";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

interface Props {
  iconSrc: string;
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
}

export function DateRangePicker({ iconSrc, onChange }: Props) {
  const today = new Date();

  const [open, setOpen]           = useState(false);
  const [viewDate, setViewDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate]     = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [applied, setApplied]     = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function displayLabel() {
    if (!applied.start) return "30 hari terakhir";
    const start = formatDate(applied.start);
    const end   = applied.end ? formatDate(applied.end) : "Hari Ini";
    return `${start} – ${end}`;
  }

  const year        = viewDate.getFullYear();
  const month       = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function rangeEnd() { return endDate ?? (startDate && !endDate ? hoverDate : null); }

  function inRange(d: Date) {
    const s = startDate;
    const e = rangeEnd();
    if (!s || !e) return false;
    const [from, to] = s <= e ? [s, e] : [e, s];
    return d > from && d < to;
  }

  function handleDayClick(d: Date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
    } else {
      if (d < startDate) { setEndDate(startDate); setStartDate(d); }
      else setEndDate(d);
    }
  }

  function apply() {
    const next = { start: startDate, end: endDate };
    setApplied(next);
    onChange?.(next);
    setOpen(false);
  }

  function reset() {
    setStartDate(null);
    setEndDate(null);
    setApplied({ start: null, end: null });
    onChange?.({ start: null, end: null });
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors"
        style={{ borderColor: open ? ACCENT : "rgba(255,255,255,0.1)", color: open ? ACCENT : "#94a3b8", backgroundColor: "#151C25" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" width={13} height={13}
          style={{ filter: open ? `brightness(0) saturate(100%) invert(80%) sepia(20%) saturate(500%) hue-rotate(220deg)` : undefined }} />
        <span>{displayLabel()}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 z-50 rounded-2xl border p-5 w-[280px] max-w-[85vw] shadow-2xl"
          style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.1)" }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: "#64748b" }}
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-white font-semibold text-sm">
              {MONTHS_ID[month]} {year}
            </span>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: "#64748b" }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold py-1" style={{ color: "#475569" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;

              const isStart   = startDate ? isSameDay(d, startDate) : false;
              const re        = rangeEnd();
              const isEnd     = re ? isSameDay(d, re) : false;
              const isInRange = inRange(d);
              const isToday   = isSameDay(d, today);

              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(d)}
                  onMouseEnter={() => setHoverDate(d)}
                  onMouseLeave={() => setHoverDate(null)}
                  className="relative h-8 flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    color:           isStart || isEnd ? "#000" : isInRange ? ACCENT : isToday ? ACCENT : "#94a3b8",
                    backgroundColor: isStart || isEnd ? ACCENT : isInRange ? `${ACCENT}20` : "transparent",
                    borderRadius:    isStart || isEnd ? "50%" : "0",
                  }}
                >
                  {d.getDate()}
                  {isToday && !isStart && !isEnd && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Range label */}
          {(startDate || endDate) && (
            <p className="text-center text-[11px] mt-3" style={{ color: "#64748b" }}>
              {startDate ? formatDate(startDate) : "—"}
              {" – "}
              {endDate ? formatDate(endDate) : "Hari Ini"}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <button onClick={reset} className="text-xs font-semibold transition-colors hover:text-white" style={{ color: "#64748b" }}>
              Reset
            </button>
            <button
              onClick={apply}
              disabled={!startDate}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-opacity disabled:opacity-40"
              style={{ backgroundColor: ACCENT, color: "#000" }}
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

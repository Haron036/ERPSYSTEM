import { useState } from "react";
import { ChevronLeft, ChevronRight, LogIn, LogOut, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  useAttendanceGrid,
  useTodayAttendance,
  useClockIn,
  useClockOut,
} from "@/hooks/useApi";
import { toast } from "sonner";

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  PRESENT:  { bg: "bg-emerald-500",  label: "Present"  },
  ABSENT:   { bg: "bg-red-400",      label: "Absent"   },
  ON_LEAVE: { bg: "bg-amber-400",    label: "On Leave" },
  WEEKEND:  { bg: "bg-muted/40",     label: "Weekend"  },
  NO_DATA:  { bg: "bg-border/60",    label: "—"        },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── helpers ───────────────────────────────────────────────────────────────────

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

// ── ClockPanel ────────────────────────────────────────────────────────────────

function ClockPanel({ employeeId }) {
  const { data: today, isLoading } = useTodayAttendance(employeeId);
  const clockIn  = useClockIn();
  const clockOut = useClockOut();

  async function handleClockIn() {
    try {
      await clockIn.mutateAsync(employeeId);
      toast.success("Clocked in", { description: "Your attendance has been recorded." });
    } catch (err) {
      toast.error("Clock-in failed", { description: err?.message });
    }
  }

  async function handleClockOut() {
    try {
      await clockOut.mutateAsync(employeeId);
      toast.success("Clocked out", { description: "Have a great rest of your day!" });
    } catch (err) {
      toast.error("Clock-out failed", { description: err?.message });
    }
  }

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-KE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">My Attendance</CardTitle>
            <CardDescription className="text-xs mt-0.5">{dateLabel}</CardDescription>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
            today?.clockedIn && !today?.clockedOut
              ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
              : "bg-muted-foreground/30"
          }`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Check-in
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {today?.checkInTime ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Check-out
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {today?.checkOutTime ?? "—"}
                </p>
              </div>
            </div>

            {today?.status && (
              <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${
                today.status === "PRESENT"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                  : today.status === "ON_LEAVE"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                    : "bg-muted text-muted-foreground"
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {today.status === "PRESENT"
                  ? today.clockedOut ? "You've completed your day" : "You're clocked in"
                  : today.status === "ON_LEAVE"
                    ? "You are on approved leave today"
                    : today.status}
              </div>
            )}

            {!today?.clockedIn ? (
              <Button className="w-full gap-2" onClick={handleClockIn} disabled={clockIn.isPending}>
                <LogIn className="h-4 w-4" />
                {clockIn.isPending ? "Recording…" : "Clock In"}
              </Button>
            ) : !today?.clockedOut ? (
              <Button
                variant="outline"
                className="w-full gap-2 border-destructive/40 text-destructive
                           hover:bg-destructive/5 hover:text-destructive"
                onClick={handleClockOut}
                disabled={clockOut.isPending}
              >
                <LogOut className="h-4 w-4" />
                {clockOut.isPending ? "Recording…" : "Clock Out"}
              </Button>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-1">
                Attendance recorded for today.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Cell tooltip ──────────────────────────────────────────────────────────────

function CellTooltip({ day, status, checkIn, checkOut, month, year }) {
  if (status === "WEEKEND" || status === "NO_DATA") return null;
  const date = new Date(year, month - 1, day).toLocaleDateString("en-KE", {
    day: "numeric", month: "short",
  });
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20
                    w-max rounded-md border bg-popover px-2.5 py-1.5 shadow-md
                    text-[11px] leading-tight pointer-events-none">
      <p className="font-medium">{date}</p>
      <p className="text-muted-foreground">{STATUS_META[status]?.label ?? status}</p>
      {checkIn  && <p className="text-muted-foreground">In:  {checkIn}</p>}
      {checkOut && <p className="text-muted-foreground">Out: {checkOut}</p>}
    </div>
  );
}

// ── Single heatmap cell ───────────────────────────────────────────────────────

function HeatmapCell({ day, status, checkIn, checkOut, month, year }) {
  const [hovered, setHovered] = useState(false);
  const meta = STATUS_META[status] ?? STATUS_META.NO_DATA;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`h-5 w-5 rounded-sm ${meta.bg} transition-transform
                       ${hovered && status !== "WEEKEND" && status !== "NO_DATA"
                         ? "scale-125 z-10 relative" : ""}`}
      />
      {hovered && (
        <CellTooltip
          day={day} status={status}
          checkIn={checkIn} checkOut={checkOut}
          month={month} year={year}
        />
      )}
    </div>
  );
}

// ── Heatmap grid ──────────────────────────────────────────────────────────────

function AttendanceHeatmap({ grid, year, month }) {
  if (!grid) return null;
  const { rows, daysInMonth } = grid;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex items-center gap-1 mb-2 pl-[180px]">
          {days.map((d) => {
            const dow = new Date(year, month - 1, d).getDay();
            const isWeekend = dow === 0 || dow === 6;
            return (
              <div
                key={d}
                className={`w-5 text-center text-[9px] font-medium leading-none
                            ${isWeekend ? "text-muted-foreground/40" : "text-muted-foreground"}`}
              >
                {d}
              </div>
            );
          })}
        </div>

        <div className="space-y-1">
          {rows.map((row) => (
            <div key={row.employeeId} className="flex items-center gap-1">
              <div className="w-[180px] shrink-0 flex items-center gap-2 pr-3">
                <Avatar className="h-5 w-5 shrink-0">
                  <AvatarFallback className="text-[8px] bg-muted">
                    {initials(row.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate leading-tight">{row.employeeName}</p>
                  <p className="text-[9px] text-muted-foreground truncate leading-tight">
                    {row.department}
                  </p>
                </div>
              </div>

              {row.days.map((cell) => (
                <HeatmapCell
                  key={cell.day}
                  day={cell.day}
                  status={cell.status}
                  checkIn={cell.checkInTime}
                  checkOut={cell.checkOutTime}
                  month={month}
                  year={year}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Summary KPI cards ─────────────────────────────────────────────────────────

function AttendanceSummary({ grid }) {
  if (!grid?.rows) return null;

  const today = new Date().getDate();
  const isCurrentMonth =
    grid.year === new Date().getFullYear() &&
    grid.month === new Date().getMonth() + 1;

  let presentToday = 0, absentToday = 0, onLeaveToday = 0;
  let totalWorkdays = 0, totalPresent = 0;

  grid.rows.forEach((row) => {
    row.days.forEach((cell) => {
      if (cell.status !== "WEEKEND" && cell.status !== "NO_DATA") totalWorkdays++;
      if (cell.status === "PRESENT") totalPresent++;
      if (cell.day === today) {
        if (cell.status === "PRESENT")  presentToday++;
        if (cell.status === "ABSENT")   absentToday++;
        if (cell.status === "ON_LEAVE") onLeaveToday++;
      }
    });
  });

  const rate = totalWorkdays > 0
    ? Math.round((totalPresent / totalWorkdays) * 100) : 0;

  const kpis = isCurrentMonth
    ? [
        { label: "Present Today",  value: presentToday,  cls: "text-emerald-600" },
        { label: "Absent Today",   value: absentToday,   cls: "text-red-500"     },
        { label: "On Leave Today", value: onLeaveToday,  cls: "text-amber-600"   },
        { label: "Month Rate",     value: `${rate}%`,    cls: ""                 },
      ]
    : [
        { label: "Total Present", value: totalPresent, cls: "text-emerald-600" },
        { label: "Month Rate",    value: `${rate}%`,   cls: ""                 },
      ];

  return (
    <div className={`grid gap-3 ${isCurrentMonth ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
      {kpis.map(({ label, value, cls }) => (
        <Card key={label}>
          <CardContent className="p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`text-2xl font-semibold tabular-nums mt-0.5 ${cls}`}>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AttendanceTab({ viewerMode = false }) {
  const { user } = useAuth();
  const now = new Date();

  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: rawGrid, isLoading, isError } = useAttendanceGrid(year, month);

  // viewerMode: filter heatmap to just the logged-in employee's row
  const grid = viewerMode && rawGrid?.rows
    ? { ...rawGrid, rows: rawGrid.rows.filter((r) => r.employeeId === user?.employeeId) }
    : rawGrid;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const n = new Date();
    if (year === n.getFullYear() && month === n.getMonth() + 1) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${user?.employeeId ? "lg:grid-cols-[280px_1fr]" : ""}`}>
        {user?.employeeId && <ClockPanel employeeId={user.employeeId} />}
        <div className="flex flex-col justify-center">
          <AttendanceSummary grid={grid} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {viewerMode ? "My Attendance History" : "Attendance Heatmap"}
              </CardTitle>
              <CardDescription>
                {viewerMode
                  ? `Your daily attendance — ${MONTH_NAMES[month - 1]} ${year}`
                  : `Per-employee daily attendance — ${MONTH_NAMES[month - 1]} ${year}`}
              </CardDescription>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-sm font-medium w-28 text-center tabular-nums">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                onClick={nextMonth}
                disabled={isCurrentMonth}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
            {Object.entries(STATUS_META).map(([key, { bg, label }]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm ${bg}`} />
                {label}
              </div>
            ))}
          </div>

          {isError ? (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30
                            bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load attendance data. Please refresh.
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
              Loading attendance records…
            </div>
          ) : !grid?.rows?.length ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No records found.</p>
            </div>
          ) : (
            <AttendanceHeatmap grid={grid} year={year} month={month} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale/id';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Car,
  CalendarDays,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  Ban,
  ArrowLeft,
  X,
  Filter,
  CalendarClock,
  Users,
  Inbox,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { useIdentity } from '@/hooks/useIdentity';

// ─── Types ───────────────────────────────────────────────────────────────────

type BorrowingType = 'aula' | 'kendaraan';
type BorrowingStatus = 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled' | 'cancel_requested';

interface CalendarEvent {
  id: string | number;
  title: string;
  start: string;
  end: string;
  type: BorrowingType;
  status: BorrowingStatus;
  user: string;
  kendaraan?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
}

interface CalendarResponse {
  events: CalendarEvent[];
  month: number;
  year: number;
  total: number;
}

interface KalenderViewProps {
  initialType?: BorrowingType;
}

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BorrowingStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    barClass: string;
    icon: React.ElementType;
    indicator: string;
    gradientFrom: string;
    gradientTo: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  pending: {
    label: 'Menunggu',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    dotClass: 'bg-amber-400',
    barClass: 'bg-gradient-to-r from-amber-400 to-amber-500',
    icon: Clock,
    indicator: '⏳',
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  approved: {
    label: 'Disetujui',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    dotClass: 'bg-emerald-400',
    barClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    icon: CheckCircle2,
    indicator: '✓',
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  completed: {
    label: 'Selesai',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    dotClass: 'bg-teal-400',
    barClass: 'bg-gradient-to-r from-teal-400 to-cyan-400',
    icon: CheckCheck,
    indicator: '★',
    gradientFrom: 'from-teal-400',
    gradientTo: 'to-cyan-400',
    badgeBg: 'bg-teal-100 dark:bg-teal-900/60',
    badgeText: 'text-teal-700 dark:text-teal-300',
  },
  rejected: {
    label: 'Ditolak',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-200 dark:border-red-800',
    dotClass: 'bg-red-400',
    barClass: 'bg-gradient-to-r from-red-400 to-red-500',
    icon: XCircle,
    indicator: '✗',
    gradientFrom: 'from-red-400',
    gradientTo: 'to-red-500',
    badgeBg: 'bg-red-100 dark:bg-red-900/60',
    badgeText: 'text-red-700 dark:text-red-300',
  },
  cancelled: {
    label: 'Dibatalkan',
    bgClass: 'bg-gray-50 dark:bg-gray-900/40',
    textClass: 'text-gray-500 dark:text-gray-400',
    borderClass: 'border-gray-200 dark:border-gray-700',
    dotClass: 'bg-gray-400',
    barClass: 'bg-gradient-to-r from-gray-400 to-gray-500',
    icon: Ban,
    indicator: '⊘',
    gradientFrom: 'from-gray-400',
    gradientTo: 'to-gray-500',
    badgeBg: 'bg-gray-100 dark:bg-gray-800/60',
    badgeText: 'text-gray-600 dark:text-gray-400',
  },
  cancel_requested: {
    label: 'Pembatalan Diajukan',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
    dotClass: 'bg-orange-400',
    barClass: 'bg-gradient-to-r from-orange-400 to-orange-500',
    icon: Clock,
    indicator: '⏳',
    gradientFrom: 'from-orange-400',
    gradientTo: 'to-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
  },
};

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const ALL_STATUSES: BorrowingStatus[] = ['pending', 'approved', 'completed', 'rejected', 'cancelled', 'cancel_requested'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function KalenderView({ initialType = 'aula' }: KalenderViewProps) {
  const [activeType, setActiveType] = useState<BorrowingType>(initialType);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<BorrowingStatus>>(
    new Set(ALL_STATUSES)
  );
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const { user } = useAppStore();
  const { identity } = useIdentity();
  const siteName = identity.site_name || 'E-Pakar';

  // ─── Fetch calendar data ────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await fetch(
        `/api/borrowing/calendar?type=${activeType}&month=${month}&year=${year}`
      );
      if (res.ok) {
        const data: CalendarResponse = await res.json();
        setEvents(data.events || []);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, activeType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ─── Calendar grid computation ──────────────────────────────────────────

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // ─── Events for a specific date ─────────────────────────────────────────

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      return events.filter((evt) => {
        if (!activeFilters.has(evt.status)) return false;
        try {
          const evtStart = parseISO(evt.start);
          const evtEnd = parseISO(evt.end);
          return isWithinInterval(date, { start: evtStart, end: evtEnd }) || isSameDay(date, evtStart) || isSameDay(date, evtEnd);
        } catch {
          return false;
        }
      });
    },
    [events, activeFilters]
  );

  // ─── Filtered events for selected date ──────────────────────────────────

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, getEventsForDate]);

  // ─── Summary stats ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const filtered = events.filter((e) => activeFilters.has(e.status));
    return {
      total: filtered.length,
      pending: filtered.filter((e) => e.status === 'pending').length,
      approved: filtered.filter((e) => e.status === 'approved').length,
      completed: filtered.filter((e) => e.status === 'completed').length,
    };
  }, [events, activeFilters]);

  // ─── Month navigation ───────────────────────────────────────────────────

  const goToPrevMonth = () => {
    setDirection('left');
    setCurrentDate((d) => subMonths(d, 1));
  };

  const goToNextMonth = () => {
    setDirection('right');
    setCurrentDate((d) => addMonths(d, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setDirection(isSameMonth(today, currentDate) ? 'right' : today > currentDate ? 'right' : 'left');
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // ─── Toggle filter ──────────────────────────────────────────────────────

  const toggleFilter = (status: BorrowingStatus) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        if (next.size > 1) next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  // ─── Format date for display ────────────────────────────────────────────

  const formatSelectedDate = (date: Date): string => {
    return format(date, 'EEEE, d MMMM yyyy', { locale: localeId });
  };

  const formatDateRange = (start: string, end: string): string => {
    try {
      const s = parseISO(start);
      const e = parseISO(end);
      if (isSameDay(s, e)) {
        return format(s, 'd MMMM yyyy', { locale: localeId });
      }
      return `${format(s, 'd MMM', { locale: localeId })} – ${format(e, 'd MMM yyyy', { locale: localeId })}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => useAppStore.getState().setCurrentView('home')}
          className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <div className="w-full space-y-5 pb-8">
      {/* ── Header with gradient ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1px]">
        <div className="rounded-2xl bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Kalender Peminjaman
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {siteName} · Aula & Kendaraan
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hari Ini</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-gray-400" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800">
                  <TrendingUp className="w-4 h-4 text-slate-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-400" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">Menunggu</p>
                  <p className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-300">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-400" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">Disetujui</p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50">
                  <CheckCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 font-medium">Selesai</p>
                  <p className="text-lg sm:text-xl font-bold text-teal-700 dark:text-teal-300">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Type Tabs ────────────────────────────────────────────────────── */}
      <Tabs
        value={activeType}
        onValueChange={(v) => setActiveType(v as BorrowingType)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger
            value="aula"
            className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 transition-all duration-300"
          >
            <Building2 className="w-4 h-4" />
            <span className="font-semibold">Aula</span>
          </TabsTrigger>
          <TabsTrigger
            value="kendaraan"
            className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 transition-all duration-300"
          >
            <Car className="w-4 h-4" />
            <span className="font-semibold">Kendaraan</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Status Filter ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filter:</span>
        </div>
        {ALL_STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const isActive = activeFilters.has(status);
          return (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={`
                shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
                transition-all duration-200 border
                ${
                  isActive
                    ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.borderClass} shadow-sm`
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-50'
                }
              `}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
              {!isActive && <X className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* ── Calendar Card ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Month Navigation Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentDate.toISOString().slice(0, 7)}
                initial={{ opacity: 0, x: direction === 'right' ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 'right' ? -30 : 30 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {format(currentDate, 'MMMM yyyy', { locale: localeId })}
                </h2>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-2 sm:p-4">
          {/* Day Names */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`
                  text-center text-[11px] sm:text-xs font-bold py-2
                  ${i >= 5 ? 'text-red-400 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}
                `}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentDate.toISOString().slice(0, 7)}
              initial={{ opacity: 0, x: direction === 'right' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === 'right' ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-[3px] sm:gap-1"
            >
              {calendarDays.map((day, idx) => {
                const inCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const dayEvents = getEventsForDate(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative flex flex-col items-center justify-start
                      min-h-[52px] sm:min-h-[64px] rounded-xl
                      transition-all duration-200 cursor-pointer
                      border-[1.5px] group
                      ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                          : isTodayDate
                          ? 'bg-white dark:bg-gray-900 border-emerald-300 dark:border-emerald-700 shadow-sm'
                          : isWeekend && inCurrentMonth
                          ? 'bg-red-50/40 dark:bg-red-950/10 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          : inCurrentMonth
                          ? 'bg-white dark:bg-gray-900 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          : 'bg-gray-50/50 dark:bg-gray-900/30 border-transparent'
                      }
                      ${!inCurrentMonth ? 'opacity-30' : ''}
                    `}
                  >
                    {/* Today ring */}
                    {isTodayDate && !isSelected && (
                      <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/60 dark:ring-emerald-500/50 pointer-events-none" />
                    )}

                    {/* Date Number */}
                    <span
                      className={`
                        text-xs sm:text-sm font-bold mt-1.5 leading-none
                        ${
                          isSelected
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : isTodayDate
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : !inCurrentMonth
                            ? 'text-gray-300 dark:text-gray-600'
                            : isWeekend
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Event indicators */}
                    {dayEvents.length > 0 && inCurrentMonth && (
                      <div className="flex flex-col items-center gap-[2px] mt-1 px-1 w-full max-w-full">
                        {/* Single event: show truncated text */}
                        {dayEvents.length === 1 ? (
                          <div className="flex items-center gap-0.5 w-full">
                            <div
                              className={`w-1 h-1 rounded-full shrink-0 ${STATUS_CONFIG[dayEvents[0].status].dotClass}`}
                            />
                            <span className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                              {dayEvents[0].title}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-[2px] flex-wrap justify-center">
                            {dayEvents.slice(0, 4).map((evt, i) => (
                              <div
                                key={`${evt.id}-${i}`}
                                className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[evt.status].dotClass}`}
                                title={`${evt.title} (${STATUS_CONFIG[evt.status].label})`}
                              />
                            ))}
                            {dayEvents.length > 4 && (
                              <span className="text-[7px] text-gray-400 font-bold">
                                +{dayEvents.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status bar */}
                        <div className="flex gap-[1px] w-full max-w-[80%]">
                          {dayEvents.slice(0, 5).map((evt, i) => (
                            <div
                              key={`bar-${evt.id}-${i}`}
                              className={`h-[3px] rounded-full flex-1 ${STATUS_CONFIG[evt.status].barClass}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Keterangan Status
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ALL_STATUSES.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <div
                  key={status}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg ${cfg.bgClass} border ${cfg.borderClass}`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] sm:text-xs font-bold ${cfg.textClass} leading-tight`}>
                      {cfg.indicator} {cfg.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Selected Date Panel ───────────────────────────────────────────── */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 px-4 sm:px-6 py-3 border-b border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                {selectedDate ? formatSelectedDate(selectedDate) : 'Pilih Tanggal'}
              </h3>
            </div>
            {selectedDateEvents.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px]"
              >
                {selectedDateEvents.length} peminjaman
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {selectedDateEvents.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                  Tidak ada peminjaman
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  Tidak ada jadwal pada tanggal ini
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar"
              >
                {selectedDateEvents.map((evt, idx) => {
                  const cfg = STATUS_CONFIG[evt.status];
                  const StatusIcon = cfg.icon;
                  const TypeIcon = evt.type === 'aula' ? Building2 : Car;

                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        relative overflow-hidden rounded-xl border ${cfg.borderClass} ${cfg.bgClass}
                        p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md
                      `}
                    >
                      {/* Gradient accent line */}
                      <div
                        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${cfg.gradientFrom} ${cfg.gradientTo}`}
                      />

                      <div className="flex items-start gap-3 pl-2">
                        {/* Type icon */}
                        <div
                          className={`
                            shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                            bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} shadow-sm
                          `}
                        >
                          <TypeIcon className="w-4.5 h-4.5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                              {evt.title}
                            </h4>
                            <Badge
                              className={`shrink-0 gap-1 text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.borderClass} px-2 py-0.5`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {cfg.indicator} {cfg.label}
                            </Badge>
                          </div>

                          <div className="mt-2 space-y-1">
                            {/* Borrower */}
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {typeof evt.user === 'string' ? evt.user : (evt.user as Record<string, string>)?.name || 'Unknown'}
                              </span>
                            </div>

                            {/* Date range */}
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDateRange(evt.start, evt.end)}
                              </span>
                            </div>

                            {/* Time range */}
                            {(evt.waktuMulai || evt.waktuSelesai) && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {evt.waktuMulai || '–'}
                                  {evt.waktuMulai && evt.waktuSelesai ? ' – ' : ''}
                                  {evt.waktuSelesai || ''}
                                </span>
                              </div>
                            )}

                            {/* Vehicle name */}
                            {evt.kendaraan && (
                              <div className="flex items-center gap-1.5">
                                <Car className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {evt.kendaraan}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

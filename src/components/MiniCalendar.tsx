'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  type: 'aula' | 'kendaraan'
  selectedDate?: string // YYYY-MM-DD
  onDateSelect?: (date: string) => void
  className?: string
}

type BookingStatus = 'pending' | 'approved' | 'completed' | 'rejected'

interface CalendarBooking {
  id: string
  activityName: string
  status: BookingStatus
  startTime?: string
  endTime?: string
}

interface CalendarDayData {
  date: string // YYYY-MM-DD
  bookings: CalendarBooking[]
  primaryStatus?: BookingStatus
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BookingStatus,
  { dot: string; bg: string; badgeVariant: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badgeVariant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    icon: <Clock className="size-3" />,
    label: 'Pending',
  },
  approved: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    badgeVariant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: <CheckCircle2 className="size-3" />,
    label: 'Approved',
  },
  completed: {
    dot: 'bg-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    badgeVariant: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    icon: <CheckCircle2 className="size-3" />,
    label: 'Completed',
  },
  rejected: {
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    badgeVariant: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: <XCircle className="size-3" />,
    label: 'Rejected',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_PRIORITY: BookingStatus[] = ['rejected', 'pending', 'approved', 'completed']

function getPrimaryStatus(bookings: CalendarBooking[]): BookingStatus | undefined {
  if (bookings.length === 0) return undefined
  for (const prio of STATUS_PRIORITY) {
    if (bookings.some((b) => b.status === prio)) return prio
  }
  return bookings[0]?.status
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

// ─── Component ───────────────────────────────────────────────────────────────

export default function MiniCalendar({
  type,
  selectedDate,
  onDateSelect,
  className,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDayData>>({})
  const [loading, setLoading] = useState(false)

  const month = currentMonth.getMonth() + 1
  const year = currentMonth.getFullYear()

  // ── Fetch calendar data ──────────────────────────────────────────────────

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/borrowing/calendar?type=${type}&month=${month}&year=${year}`
      )
      if (res.ok) {
        const json = await res.json()
        const events = json.events || []
        const map: Record<string, CalendarDayData> = {}

        // Process events into per-date map
        for (const event of events) {
          try {
            const start = parseISO(event.start || event.tanggalPinjam)
            const end = parseISO(event.end || event.tanggalKembali)
            // Expand date range into individual dates
            let current = new Date(start)
            while (current <= end) {
              const dateStr = format(current, 'yyyy-MM-dd')
              if (!map[dateStr]) {
                map[dateStr] = { date: dateStr, bookings: [], primaryStatus: undefined }
              }
              map[dateStr].bookings.push({
                id: event.id,
                activityName: event.title || event.kegiatan || '',
                status: event.status || 'pending',
                startTime: event.waktuMulam || event.startTime,
                endTime: event.waktuSelesai || event.endTime,
              })
              current = addDays(current, 1)
            }
          } catch {
            // Skip invalid events
          }
        }

        // Calculate primary status for each date
        for (const dateStr of Object.keys(map)) {
          map[dateStr].primaryStatus = getPrimaryStatus(map[dateStr].bookings)
        }

        setCalendarData(map)
      }
    } catch {
      // silently ignore – calendar will render empty
    } finally {
      setLoading(false)
    }
  }, [type, month, year])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  // ── Navigation ───────────────────────────────────────────────────────────

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1))
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1))

  // ── Build grid ───────────────────────────────────────────────────────────

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // ── Selected date bookings ───────────────────────────────────────────────

  const selectedBookings = selectedDate ? calendarData[selectedDate]?.bookings ?? [] : []

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'w-full max-w-[400px] rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden',
        className
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-800 dark:via-teal-800 dark:to-emerald-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-white/80 hover:text-white hover:bg-white/10"
            onClick={prevMonth}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.h3
              key={`${month}-${year}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-white tracking-wide"
            >
              {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
            </motion.h3>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-white/80 hover:text-white hover:bg-white/10"
            onClick={nextMonth}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-1 right-4">
            <Loader2 className="size-3 text-white/60 animate-spin" />
          </div>
        )}
      </div>

      {/* ── Day labels ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center h-8 text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ───────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${month}-${year}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="px-2 pb-2"
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((d, di) => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const inMonth = isSameMonth(d, currentMonth)
                const dayData = calendarData[dateStr]
                const primaryStatus = dayData?.primaryStatus
                const bookings = dayData?.bookings ?? []
                const isSelected = selectedDate === dateStr
                const today = isToday(d)

                // Unique statuses for dots
                const uniqueStatuses = Array.from(
                  new Set(bookings.map((b) => b.status))
                ) as BookingStatus[]

                return (
                  <motion.button
                    key={di}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      if (inMonth) onDateSelect?.(dateStr)
                    }}
                    className={cn(
                      'relative flex flex-col items-center justify-center h-9 w-full rounded-lg text-xs transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                      !inMonth && 'text-muted-foreground/30 cursor-default',
                      inMonth && !isSelected && !today && 'hover:bg-accent/50',
                      isSelected && 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25',
                      !isSelected && today && 'ring-2 ring-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400',
                      !isSelected && inMonth && !today && primaryStatus && STATUS_CONFIG[primaryStatus]?.bg
                    )}
                    disabled={!inMonth}
                  >
                    <span
                      className={cn(
                        'leading-none',
                        !inMonth && 'opacity-30',
                        isSelected && 'text-white',
                        !isSelected && inMonth && today && 'text-emerald-700 dark:text-emerald-400'
                      )}
                    >
                      {format(d, 'd')}
                    </span>

                    {/* Status dots */}
                    {inMonth && uniqueStatuses.length > 0 && !isSelected && (
                      <div className="flex items-center gap-[2px] mt-[2px]">
                        {uniqueStatuses.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className={cn('size-1.5 rounded-full', STATUS_CONFIG[s].dot)}
                          />
                        ))}
                        {uniqueStatuses.length > 3 && (
                          <span className="size-1 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>
                    )}

                    {/* Dots shown on selected date (white variants) */}
                    {isSelected && uniqueStatuses.length > 0 && (
                      <div className="flex items-center gap-[2px] mt-[2px]">
                        {uniqueStatuses.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="size-1.5 rounded-full bg-white/80"
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {(Object.entries(STATUS_CONFIG) as [BookingStatus, typeof STATUS_CONFIG[BookingStatus]][]).map(
            ([status, cfg]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={cn('size-2 rounded-full', cfg.dot)} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Selected date bookings ──────────────────────────────────────── */}
      {selectedDate && (
        <div className="border-t border-border/50 px-4 py-3">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">
            {format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: localeId })}
          </p>

          {selectedBookings.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 italic">
              Tidak ada peminjaman pada tanggal ini
            </p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
              {selectedBookings.map((booking) => {
                const cfg = STATUS_CONFIG[booking.status]
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-accent/40 px-2.5 py-1.5"
                  >
                    <span className="flex-1 text-xs font-medium truncate">
                      {booking.activityName}
                    </span>

                    <Badge
                      className={cn(
                        'h-5 gap-1 px-1.5 text-[10px] font-medium border-0 rounded-md',
                        cfg.badgeVariant
                      )}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>

                    {booking.startTime && booking.endTime && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {booking.startTime}–{booking.endTime}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

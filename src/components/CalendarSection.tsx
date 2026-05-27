'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  isToday,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  isWithinInterval,
} from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2, XCircle, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

interface CalendarEvent {
  id: string
  start: string
  end: string
  status: string
  title: string
}

const STATUS_INDICATORS: Record<string, { dot: string; bg: string; label: string }> = {
  pending: { dot: 'bg-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Menunggu' },
  approved: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Disetujui' },
  completed: { dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', label: 'Selesai' },
  rejected: { dot: 'bg-red-400', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Ditolak' },
}

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function CalendarSection() {
  const { setCurrentView } = useAppStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    try {
      const month = format(currentMonth, 'M')
      const year = format(currentMonth, 'yyyy')
      const res = await fetch(`/api/borrowing/calendar?type=aula&month=${month}&year=${year}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      try {
        const start = parseISO(event.start)
        const end = parseISO(event.end)
        return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end)
      } catch {
        return false
      }
    })
  }

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

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50/20 to-white dark:from-gray-900/20 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            Ketersediaan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
            Jadwal Peminjaman Aula
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Cek ketersediaan jadwal aula sebelum mengajukan peminjaman
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-emerald-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-800 dark:via-teal-800 dark:to-emerald-900">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <CardTitle className="text-lg font-semibold text-white">
                  {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-white/80 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const inMonth = isSameMonth(d, currentMonth)
                  const dayEvents = inMonth ? getEventsForDate(d) : []
                  const hasBookings = dayEvents.length > 0
                  const today = isToday(d)
                  const isSelected = selectedDate && isSameDay(d, selectedDate)

                  // Get unique statuses
                  const uniqueStatuses = Array.from(new Set(dayEvents.map((e) => e.status)))
                  const primaryStatus = uniqueStatuses[0] || null

                  return (
                    <button
                      key={i}
                      onClick={() => inMonth && setSelectedDate(d)}
                      className={`
                        relative flex flex-col items-center justify-center h-10 sm:h-11 rounded-lg text-sm transition-all duration-200 gap-0.5
                        ${!inMonth ? 'text-gray-300 dark:text-gray-600' : 'cursor-pointer'}
                        ${inMonth && !hasBookings && !isSelected ? 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:scale-105' : ''}
                        ${today && !isSelected ? 'font-bold ring-2 ring-emerald-500 ring-offset-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30' : ''}
                        ${isSelected ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 scale-105' : ''}
                        ${hasBookings && !isSelected ? primaryStatus && STATUS_INDICATORS[primaryStatus]?.bg : ''}
                      `}
                    >
                      <span className={`text-xs leading-none ${today && !isSelected ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}`}>
                        {format(d, 'd')}
                      </span>
                      {hasBookings && !isSelected && (
                        <div className="flex gap-0.5">
                          {uniqueStatuses.slice(0, 3).map((status, si) => (
                            <span
                              key={si}
                              className={`size-1.5 rounded-full ${STATUS_INDICATORS[status]?.dot || 'bg-gray-400'}`}
                            />
                          ))}
                        </div>
                      )}
                      {hasBookings && isSelected && (
                        <div className="flex gap-0.5">
                          {uniqueStatuses.slice(0, 3).map((_, si) => (
                            <span key={si} className="size-1.5 rounded-full bg-white/70" />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: localeId })}
                    </p>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Tutup
                    </button>
                  </div>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Tidak ada peminjaman pada tanggal ini</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-2">
                          <span className={`size-2 rounded-full shrink-0 ${STATUS_INDICATORS[event.status]?.dot || 'bg-gray-400'}`} />
                          <span className="text-xs font-medium truncate flex-1">{event.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_INDICATORS[event.status]?.bg || ''} ${STATUS_INDICATORS[event.status]?.dot ? 'text-gray-700 dark:text-gray-300' : ''}`}>
                            {STATUS_INDICATORS[event.status]?.label || event.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                {Object.entries(STATUS_INDICATORS).map(([status, cfg]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`size-2.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30" />
                  Hari Ini
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                  Tersedia
                </div>
              </div>

              {/* Full Calendar Button */}
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setCurrentView('kalender-aula')}
                  variant="outline"
                  className="border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 hover:scale-105 transition-all duration-300"
                >
                  <CalendarDays className="mr-2 size-4" />
                  Lihat Kalender Lengkap
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import * as React from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type CalendarProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  weekStartsOn = 1,
}: CalendarProps) {
  const initialMonth = selected ?? new Date()
  const [currentMonth, setCurrentMonth] = React.useState(
    startOfMonth(initialMonth)
  )

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn })
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn })
  const days = eachDayOfInterval({ start, end })

  const rows: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7))
  }

  const handleSelect = (day: Date) => {
    if (disabled?.(day)) return
    onSelect?.(day)
  }

  return (
    <div
      className={cn(
        'w-auto min-w-[17rem] rounded-xl border border-emerald-100 bg-white/95 p-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-emerald-900">
          {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
        </p>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-emerald-700">
        {Array.from({ length: 7 }).map((_, index) => {
          const dayIndex = (index + weekStartsOn) % 7
          return (
            <span key={`weekday-${dayIndex}`} className="py-1">
              {WEEKDAY_LABELS[dayIndex]}
            </span>
          )
        })}
      </div>

      <div className="mt-1 space-y-1">
        {rows.map((week, rowIndex) => (
          <div key={`week-${rowIndex}`} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const isSelected = selected && isSameDay(day, selected)
              const isOutside = !isSameMonth(day, currentMonth)
              const isDisabled = disabled?.(day) ?? false

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1',
                    isSelected
                      ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                      : 'text-emerald-900 hover:bg-emerald-50',
                    isOutside && 'text-muted-foreground/70',
                    isDisabled && 'cursor-not-allowed text-muted-foreground/50'
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

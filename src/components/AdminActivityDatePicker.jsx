import { useEffect, useMemo, useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function isBeforeDay(a, b) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  const dayTime = startOfDay(day).getTime();
  const rangeStart = startOfDay(start).getTime();
  const rangeEnd = startOfDay(end).getTime();
  const min = Math.min(rangeStart, rangeEnd);
  const max = Math.max(rangeStart, rangeEnd);
  return dayTime > min && dayTime < max;
}

function normalizeRange(start, end) {
  if (!start || !end) {
    return { start, end };
  }

  if (isBeforeDay(end, start)) {
    return { start: end, end: start };
  }

  return { start, end };
}

function AdminActivityDatePickerChevron({ direction }) {
  return (
    <svg
      className={`admin-activity-date-picker__chevron admin-activity-date-picker__chevron--${direction}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={direction === 'prev' ? 'M10 4L6 8L10 12' : 'M6 4L10 8L6 12'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminActivityDatePicker({ value, onChange }) {
  const [rangeStart, setRangeStart] = useState(value?.start ?? null);
  const [rangeEnd, setRangeEnd] = useState(value?.end ?? null);
  const [viewMonth, setViewMonth] = useState(() => value?.start ?? value?.end ?? new Date());

  useEffect(() => {
    setRangeStart(value?.start ?? null);
    setRangeEnd(value?.end ?? null);
    if (value?.start) {
      setViewMonth(value.start);
    } else if (value?.end) {
      setViewMonth(value.end);
    }
  }, [value?.start, value?.end]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const cells = [];
    for (let index = 0; index < startWeekday; index += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    return cells;
  }, [startWeekday, daysInMonth]);

  const selectDay = (day) => {
    const dayDate = new Date(year, month, day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      const nextRange = { start: dayDate, end: null };
      setRangeStart(dayDate);
      setRangeEnd(null);
      onChange?.(nextRange);
      return;
    }

    if (isBeforeDay(dayDate, rangeStart)) {
      const nextRange = { start: dayDate, end: null };
      setRangeStart(dayDate);
      setRangeEnd(null);
      onChange?.(nextRange);
      return;
    }

    const nextRange = normalizeRange(rangeStart, dayDate);
    setRangeStart(nextRange.start);
    setRangeEnd(nextRange.end);
    onChange?.(nextRange);
  };

  return (
    <div className="admin-activity-date-picker" data-admin-activity-date-picker>
      <div className="admin-activity-date-picker__header">
        <p className="admin-activity-date-picker__title">{monthLabel}</p>
        <div className="admin-activity-date-picker__nav">
          <button
            type="button"
            className="admin-activity-date-picker__nav-btn"
            aria-label="Previous month"
            onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          >
            <AdminActivityDatePickerChevron direction="prev" />
          </button>
          <button
            type="button"
            className="admin-activity-date-picker__nav-btn"
            aria-label="Next month"
            onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          >
            <AdminActivityDatePickerChevron direction="next" />
          </button>
        </div>
      </div>
      <div className="admin-activity-date-picker__weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="admin-activity-date-picker__weekday">
            {weekday}
          </span>
        ))}
      </div>
      <div className="admin-activity-date-picker__grid" role="grid" aria-label={monthLabel}>
        {days.map((day, index) => {
          if (day === null) {
            return (
              <span
                key={`empty-${index}`}
                className="admin-activity-date-picker__day admin-activity-date-picker__day--empty"
              />
            );
          }

          const dayDate = new Date(year, month, day);
          const normalizedRange = normalizeRange(rangeStart, rangeEnd);
          const isStart = isSameDay(dayDate, normalizedRange.start);
          const isEnd = isSameDay(dayDate, normalizedRange.end);
          const inRange = isInRange(dayDate, normalizedRange.start, normalizedRange.end);
          const selected = isStart || isEnd;

          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              className={[
                'admin-activity-date-picker__day',
                selected ? 'admin-activity-date-picker__day--selected' : '',
                inRange ? 'admin-activity-date-picker__day--in-range' : '',
                isStart ? 'admin-activity-date-picker__day--range-start' : '',
                isEnd ? 'admin-activity-date-picker__day--range-end' : '',
              ].filter(Boolean).join(' ')}
              aria-label={dayDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              aria-selected={selected}
              onClick={() => selectDay(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

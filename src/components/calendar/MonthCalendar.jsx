import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

const STATUS_STYLES = {
  pending: 'bg-yellow-400/80 text-black',
  paid: 'bg-green-400/80 text-black',
  cancelled: 'bg-red-400/80 text-white',
  refunded: 'bg-gray-400/80 text-white',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function DayCell({ day, bookings, currentMonth, isToday }) {
  const [expanded, setExpanded] = useState(false);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const visible = expanded ? bookings : bookings.slice(0, 3);
  const hidden = bookings.length - 3;

  return (
    <div
      className={`min-h-[90px] p-1.5 rounded-lg border transition-colors
        ${isToday ? 'border-[#F5C300]/60 bg-[#F5C300]/5' : 'border-white/[0.06] bg-white/[0.02]'}
        ${!isCurrentMonth ? 'opacity-30' : ''}
      `}
    >
      <p className={`text-xs font-bold mb-1 ${isToday ? 'text-[#F5C300]' : 'text-white/60'}`}>
        {format(day, 'd')}
      </p>
      <div className="space-y-0.5">
        {visible.map(b => (
          <a
            key={b.id}
            href={createPageUrl('Reservas')}
            title={`${b.departure_time || ''} ${b.client_name} · ${b.departure_point?.split(',')[0]} → ${b.arrival_point?.split(',')[0]}`}
            className={`block truncate text-[10px] px-1.5 py-0.5 rounded font-medium cursor-pointer hover:opacity-80 transition-opacity ${STATUS_STYLES[b.payment_status] || STATUS_STYLES.pending}`}
          >
            {b.departure_time ? `${b.departure_time} ` : ''}{b.client_name}
          </a>
        ))}
        {!expanded && hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors w-full text-left px-1"
          >
            +{hidden} de plus
          </button>
        )}
      </div>
    </div>
  );
}

export default function MonthCalendar({ currentMonth, bookings }) {
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getBookingsForDay = (day) =>
    bookings
      .filter(b => b.departure_date && isSameDay(new Date(b.departure_date + 'T00:00:00'), day))
      .sort((a, b) => (a.departure_time || '').localeCompare(b.departure_time || ''));

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(name => (
          <div key={name} className="text-center text-xs text-white/30 uppercase tracking-wider py-1 font-semibold">
            {name}
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            bookings={getBookingsForDay(day)}
            currentMonth={currentMonth}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  );
}
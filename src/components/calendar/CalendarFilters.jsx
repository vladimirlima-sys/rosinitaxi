import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, addDays, startOfWeek, addMonths, subMonths, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function CalendarFilters({
  viewMode,
  weekStart, setWeekStart,
  currentMonth, setCurrentMonth,
  filterStatus, setFilterStatus,
  filterDriver, setFilterDriver,
  drivers
}) {
  // Week navigation
  const goWeekBack = () => setWeekStart(subWeeks(weekStart, 1));
  const goWeekNext = () => setWeekStart(addWeeks(weekStart, 1));
  const goToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setCurrentMonth(startOfMonth(new Date()));
  };
  const weekEnd = addDays(weekStart, 6);

  // Month navigation
  const goMonthBack = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goMonthNext = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={viewMode === 'week' ? goWeekBack : goMonthBack}
          className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-white/90 text-sm font-medium min-w-[180px] text-center">
          {viewMode === 'week'
            ? `${format(weekStart, 'd MMM', { locale: fr })} – ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`
            : format(currentMonth, 'MMMM yyyy', { locale: fr })
          }
        </span>

        <button
          onClick={viewMode === 'week' ? goWeekNext : goMonthNext}
          className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={goToday}
          className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-xs font-medium"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-3 py-2 outline-none"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
          ))}
        </select>

        <select
          value={filterDriver}
          onChange={e => setFilterDriver(e.target.value)}
          className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-3 py-2 outline-none"
        >
          <option value="all" className="bg-[#111]">Tous les chauffeurs</option>
          <option value="unassigned" className="bg-[#111]">Non attribué</option>
          {drivers.filter(d => d.status === 'active').map(d => (
            <option key={d.id} value={d.id} className="bg-[#111]">{d.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
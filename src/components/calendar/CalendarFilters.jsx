import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function CalendarFilters({ weekStart, setWeekStart, filterStatus, setFilterStatus, filterDriver, setFilterDriver, drivers }) {
  const goBack = () => setWeekStart(subWeeks(weekStart, 1));
  const goNext = () => setWeekStart(addWeeks(weekStart, 1));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white/90 text-sm font-medium min-w-[180px] text-center">
          {format(weekStart, 'd MMM', { locale: fr })} – {format(weekEnd, 'd MMM yyyy', { locale: fr })}
        </span>
        <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={goToday} className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-xs font-medium">
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
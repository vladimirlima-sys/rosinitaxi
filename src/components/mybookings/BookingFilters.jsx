import { FilterX } from 'lucide-react';

export default function BookingFilters({ filters, setFilters, t }) {
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'paid', label: t.statusLabels.paid },
    { value: 'pending', label: t.statusLabels.pending },
    { value: 'cancelled', label: t.statusLabels.cancelled },
    { value: 'refunded', label: t.statusLabels.refunded },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Mais recentes' },
    { value: 'date-asc', label: 'Mais antigas' },
    { value: 'price-desc', label: 'Maior preço' },
    { value: 'price-asc', label: 'Menor preço' },
  ];

  return (
    <div className="bg-black rounded-2xl p-4 mb-6 space-y-3">
      <div className="flex gap-3 flex-wrap">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#F5C300]/50"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#F5C300]/50"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
          ))}
        </select>

        {(filters.status !== 'all' || filters.sort !== 'date-desc') && (
          <button
            onClick={() => setFilters({ status: 'all', sort: 'date-desc' })}
            className="px-3 py-2 text-[#F5C300] text-sm flex items-center gap-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <FilterX className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>
    </div>
  );
}
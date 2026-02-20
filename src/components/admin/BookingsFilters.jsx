import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';

export default function BookingsFilters({ filters, onFilterChange, onReset }) {
  const handleDateChange = (e) => {
    onFilterChange({ ...filters, date: e.target.value });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleVehicleChange = (vehicle) => {
    onFilterChange({ ...filters, vehicle });
  };

  const hasActiveFilters = filters.date || filters.status !== 'all' || filters.vehicle !== 'all';

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-[#C9A96E]" />
        <h3 className="text-white font-medium">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Filter */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">Data de partida</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]" />
            <Input
              type="date"
              value={filters.date}
              onChange={handleDateChange}
              className="bg-white/5 border-white/10 text-white pl-10 h-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">Status do pagamento</label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Vehicle Filter */}
        <div>
          <label className="text-white/60 text-sm mb-2 block">Tipo de veículo</label>
          <select
            value={filters.vehicle}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="economic">Econômico</option>
            <option value="comfort">Conforto</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
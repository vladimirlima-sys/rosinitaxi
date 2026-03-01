import React from 'react';

export default function FinanceFilters({
  selectedMonth,
  setSelectedMonth,
  filterDriver,
  setFilterDriver,
  availableMonths,
  monthLabel,
  availableDrivers
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-black/60 text-sm mb-2 block">Sélectionner le mois</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-black border border-black/40 text-white px-4 py-2 rounded-lg outline-none w-full"
        >
          {availableMonths.map(month => (
            <option key={month} value={month} className="bg-black text-white">
              {new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </option>
          ))}
          {!availableMonths.includes(selectedMonth) && (
            <option value={selectedMonth} className="bg-[#222] text-white">{monthLabel}</option>
          )}
        </select>
      </div>

      <div>
        <label className="text-black/60 text-sm mb-2 block">Filtrer par motorista</label>
        <select
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
          className="bg-black border border-black/40 text-white px-4 py-2 rounded-lg outline-none w-full"
        >
          <option value="all" className="bg-black text-white">Todos os motoristas</option>
          {availableDrivers.map(driver => (
            <option key={driver.id} value={driver.id} className="bg-black text-white">
              {driver.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
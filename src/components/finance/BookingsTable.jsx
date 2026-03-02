import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function BookingsTable({ monthBookings }) {
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterMethod, setFilterMethod] = useState('all');

  const sortedBookings = [...monthBookings].sort((a, b) => {
    const dateA = new Date(a.departure_date || a.created_date);
    const dateB = new Date(b.departure_date || b.created_date);
    
    switch (sortBy) {
      case 'date-asc':
        return dateA - dateB;
      case 'date-desc':
        return dateB - dateA;
      case 'amount-asc':
        return (a.total_price || 0) - (b.total_price || 0);
      case 'amount-desc':
        return (b.total_price || 0) - (a.total_price || 0);
      case 'client-asc':
        return a.client_name.localeCompare(b.client_name);
      case 'client-desc':
        return b.client_name.localeCompare(a.client_name);
      default:
        return 0;
    }
  });

  const filteredBookings = filterMethod === 'all' 
    ? sortedBookings 
    : sortedBookings.filter(b => b.payment_method === filterMethod);

  return (
    <div className="bg-black border border-black/40 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-white font-semibold">Détail des courses</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-2 pr-8 cursor-pointer hover:border-white/20 transition"
            >
              <option value="date-desc">Date (récent)</option>
              <option value="date-asc">Date (ancien)</option>
              <option value="amount-desc">Montant (élevé)</option>
              <option value="amount-asc">Montant (bas)</option>
              <option value="client-asc">Client (A-Z)</option>
              <option value="client-desc">Client (Z-A)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-2 pr-8 cursor-pointer hover:border-white/20 transition"
            >
              <option value="all">Toutes méthodes</option>
              <option value="stripe">Stripe</option>
              <option value="twint">TWINT</option>
              <option value="cash">Espèces</option>
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
      {filteredBookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-white/60 text-left py-2 px-3">Date</th>
                <th className="text-white/60 text-left py-2 px-3">Client</th>
                <th className="text-white/60 text-left py-2 px-3">Trajet</th>
                <th className="text-white/60 text-left py-2 px-3">Méthode</th>
                <th className="text-white/60 text-right py-2 px-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="text-white py-3 px-3">
                    {new Date(booking.departure_date || booking.created_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="text-white py-3 px-3">{booking.client_name}</td>
                  <td className="text-white/70 py-3 px-3 text-xs">
                    {booking.departure_point.split(',')[0]} → {booking.arrival_point.split(',')[0]}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      booking.payment_method === 'stripe' ? 'bg-blue-500/30 text-blue-300' :
                      booking.payment_method === 'twint' ? 'bg-red-500/30 text-red-300' :
                      'bg-green-500/30 text-green-300'
                    }`}>
                      {booking.payment_method === 'stripe' ? 'Stripe' :
                       booking.payment_method === 'twint' ? 'TWINT' : 'Espèces'}
                    </span>
                  </td>
                  <td className="text-white font-semibold text-right py-3 px-3">
                    CHF {booking.total_price?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/50 text-center py-8">Aucune course payée sur cette période</p>
      )}
    </div>
  );
}
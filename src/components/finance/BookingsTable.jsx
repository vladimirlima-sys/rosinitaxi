import React from 'react';

export default function BookingsTable({ monthBookings }) {
  return (
    <div className="bg-black border border-black/40 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">Détail des courses</h3>
      {monthBookings.length > 0 ? (
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
              {monthBookings.map(booking => (
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
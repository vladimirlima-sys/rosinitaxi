import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Banknote } from 'lucide-react';

export default function Finance() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const allBookings = await base44.entities.Booking.list();
      setBookings(allBookings);
      setLoading(false);
    };

    if (isAdmin) fetchBookings();
  }, [isAdmin]);

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-2">Acesso Restrito</h1>
          <p className="text-white/50">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Filter bookings for selected month and paid status
  const monthBookings = bookings.filter(b => {
    if (b.payment_status !== 'paid') return false;
    if (!b.created_date) return false;
    const bookingMonth = b.created_date.substring(0, 7);
    return bookingMonth === selectedMonth;
  });

  // Calculate totals by payment method
  const paymentMethods = {
    stripe: { total: 0, count: 0, label: 'Stripe (Cartão)', color: '#635BFF' },
    twint: { total: 0, count: 0, label: 'TWINT', color: '#FF6B6B' },
    cash: { total: 0, count: 0, label: 'Dinheiro', color: '#51CF66' }
  };

  let grandTotal = 0;

  monthBookings.forEach(booking => {
    if (!paymentMethods[booking.payment_method]) return;
    paymentMethods[booking.payment_method].total += booking.total_price || 0;
    paymentMethods[booking.payment_method].count += 1;
    grandTotal += booking.total_price || 0;
  });

  // Prepare chart data
  const chartData = [
    { method: 'Stripe', value: paymentMethods.stripe.total, fill: '#635BFF' },
    { method: 'TWINT', value: paymentMethods.twint.total, fill: '#FF6B6B' },
    { method: 'Dinheiro', value: paymentMethods.cash.total, fill: '#51CF66' }
  ].filter(d => d.value > 0);

  // Get available months
  const availableMonths = Array.from(new Set(
    bookings
      .filter(b => b.created_date)
      .map(b => b.created_date.substring(0, 7))
  )).sort().reverse();

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light text-white mb-2">Relatório Financeiro</h1>
        <p className="text-white/50 mb-8">Acompanhe as entradas de corridas por método de pagamento</p>

        {/* Month Selector */}
        <div className="mb-8">
          <label className="text-white/60 text-sm mb-2 block">Selecionar Mês</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg outline-none"
          >
            {availableMonths.map(month => (
              <option key={month} value={month} className="bg-black text-white">
                {new Date(`${month}-01`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-white/50">Carregando dados...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Total do Mês</p>
                    <p className="text-white text-3xl font-bold">CHF {grandTotal.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-2">{monthBookings.length} corridas</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#F5C300]" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Stripe</p>
                    <p className="text-white text-3xl font-bold">CHF {paymentMethods.stripe.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-2">{paymentMethods.stripe.count} transações</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">TWINT</p>
                    <p className="text-white text-3xl font-bold">CHF {paymentMethods.twint.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-2">{paymentMethods.twint.count} transações</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Dinheiro</p>
                    <p className="text-white text-3xl font-bold">CHF {paymentMethods.cash.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-2">{paymentMethods.cash.count} transações</p>
                  </div>
                  <Banknote className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Distribuição por Método</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="method" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                        formatter={(value) => `CHF ${value.toFixed(2)}`}
                      />
                      <Bar dataKey="value" fill="#F5C300" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/50 text-center py-12">Sem dados para este período</p>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Percentual por Método</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, value, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                        formatter={(value) => `CHF ${value.toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/50 text-center py-12">Sem dados para este período</p>
                )}
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Detalhes das Corridas</h3>
              {monthBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-white/60 text-left py-2 px-3">Data</th>
                        <th className="text-white/60 text-left py-2 px-3">Cliente</th>
                        <th className="text-white/60 text-left py-2 px-3">Percurso</th>
                        <th className="text-white/60 text-left py-2 px-3">Método</th>
                        <th className="text-white/60 text-right py-2 px-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthBookings.map(booking => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="text-white py-3 px-3">
                            {new Date(booking.created_date).toLocaleDateString('pt-BR')}
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
                               booking.payment_method === 'twint' ? 'TWINT' : 'Dinheiro'}
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
                <p className="text-white/50 text-center py-8">Nenhuma corrida paga neste período</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
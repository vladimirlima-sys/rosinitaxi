import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, TrendingUp, Users, BookOpen } from 'lucide-react';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader.js';
import DailyChart from '@/components/analytics/DailyChart.js';
import WeeklyChart from '@/components/analytics/WeeklyChart.js';
import MonthlyChart from '@/components/analytics/MonthlyChart.js';
import BookingsEvolution from '@/components/analytics/BookingsEvolution.js';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics.js';

export default function Analytics() {
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
  const [pageViews, setPageViews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch page views
        const views = await base44.entities.PageView.filter({}, '-timestamp', 500);
        setPageViews(views || []);

        // Fetch bookings
        const allBookings = await base44.entities.Booking.filter({}, '-created_date', 500);
        setBookings(allBookings || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const unsubscribeViews = base44.entities.PageView.subscribe((event) => {
      if (event.type === 'create') {
        setPageViews(prev => [event.data, ...prev]);
      }
    });

    const unsubscribeBookings = base44.entities.Booking.subscribe((event) => {
      if (event.type === 'create') {
        setBookings(prev => [event.data, ...prev]);
      }
    });

    return () => {
      unsubscribeViews();
      unsubscribeBookings();
    };
  }, []);

  const filteredViews = pageViews.filter(view => {
    const viewDate = new Date(view.date);
    return viewDate >= dateRange.start && viewDate <= dateRange.end;
  });

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.created_date);
    return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <AnalyticsHeader />

        {/* Date Range and Period Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                <Calendar className="inline w-4 h-4 mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                <Calendar className="inline w-4 h-4 mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                Período
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <AnalyticsMetrics views={filteredViews} bookings={filteredBookings} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {period === 'daily' && (
            <>
              <DailyChart pageViews={filteredViews} />
              <DailyChart pageViews={filteredViews} isBookings={true} bookings={filteredBookings} />
            </>
          )}
          {period === 'weekly' && (
            <>
              <WeeklyChart pageViews={filteredViews} />
              <WeeklyChart pageViews={filteredViews} isBookings={true} bookings={filteredBookings} />
            </>
          )}
          {period === 'monthly' && (
            <>
              <MonthlyChart pageViews={filteredViews} />
              <MonthlyChart pageViews={filteredViews} isBookings={true} bookings={filteredBookings} />
            </>
          )}
        </div>

        {/* Bookings Evolution */}
        <BookingsEvolution bookings={filteredBookings} />
      </div>
    </div>
  );
}
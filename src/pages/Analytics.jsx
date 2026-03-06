import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Eye, Smartphone, Monitor, Tablet, TrendingUp, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  const [visits, setVisits] = useState([]);
  const [activeNow, setActiveNow] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    if (!selectedMonth) setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) loadData();
  }, [selectedMonth]);

  // Auto-refresh every 30s for live count
  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveNow();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await base44.entities.PageVisit.filter({ month: selectedMonth }, '-created_date', 500);
    setVisits(data);
    setLoading(false);
    loadActiveNow();
  };

  const loadActiveNow = async () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const all = await base44.entities.PageVisit.filter({ is_active: true }, '-last_seen', 100);
    const live = all.filter(v => v.last_seen && v.last_seen > fiveMinAgo);
    setActiveNow(live.length);
  };

  // Stats
  const totalVisits = visits.length;
  const uniqueSessions = new Set(visits.map(v => v.session_id)).size;
  const deviceCounts = visits.reduce((acc, v) => {
    acc[v.device_type || 'desktop'] = (acc[v.device_type || 'desktop'] || 0) + 1;
    return acc;
  }, {});

  // Daily chart
  const dailyMap = {};
  visits.forEach(v => {
    if (v.day) dailyMap[v.day] = (dailyMap[v.day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day: day.slice(8), count }));

  // Hourly chart
  const hourlyMap = {};
  for (let i = 0; i < 24; i++) hourlyMap[i] = 0;
  visits.forEach(v => { if (v.hour !== undefined) hourlyMap[v.hour]++; });
  const hourlyData = Object.entries(hourlyMap).map(([h, count]) => ({ h: `${h}h`, count }));

  // Language breakdown
  const langMap = {};
  visits.forEach(v => { const l = (v.language || 'fr').slice(0, 2); langMap[l] = (langMap[l] || 0) + 1; });
  const langData = Object.entries(langMap).sort(([, a], [, b]) => b - a).slice(0, 6);

  // Available months (last 6)
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="min-h-screen bg-[#F5C300] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href={createPageUrl('AdminPanel')} className="flex items-center gap-2 text-black/60 hover:text-black text-sm mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Panneau admin
            </a>
            <h1 className="text-black text-3xl font-extralight tracking-[0.2em] uppercase">ANALYTICS</h1>
            <p className="text-black/50 text-xs tracking-wider uppercase mt-1">Statistiques de visites</p>
          </div>
          <button
            onClick={() => { loadData(); setLastRefresh(new Date()); }}
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-black text-sm rounded-xl px-4 py-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* LIVE counter */}
        <div className="bg-black rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">En ligne maintenant</p>
            <p className="text-[#F5C300] text-5xl font-bold">{activeNow}</p>
            <p className="text-white/40 text-xs mt-2">
              visiteur{activeNow !== 1 ? 's' : ''} actif{activeNow !== 1 ? 's' : ''} · actualisé à {lastRefresh.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#F5C300]/10 border border-[#F5C300]/30 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#F5C300] animate-pulse" />
          </div>
        </div>

        {/* Month selector */}
        <div className="flex gap-2 flex-wrap mb-6">
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedMonth === m ? 'bg-black text-white' : 'bg-black/10 text-black hover:bg-black/20'
              }`}
            >
              {new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-black/50">Chargement...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Visites totales', value: totalVisits, icon: Eye },
                { label: 'Sessions uniques', value: uniqueSessions, icon: Users },
                { label: 'Mobile', value: deviceCounts.mobile || 0, icon: Smartphone },
                { label: 'Desktop', value: deviceCounts.desktop || 0, icon: Monitor },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-black rounded-xl p-4">
                  <Icon className="w-4 h-4 text-white/40 mb-2" />
                  <p className="text-[#F5C300] text-2xl font-bold">{value}</p>
                  <p className="text-white/50 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Daily chart */}
            {dailyData.length > 0 && (
              <div className="bg-black rounded-xl p-5 mb-4">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Visites par jour
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyData}>
                    <XAxis dataKey="day" tick={{ fill: '#ffffff40', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="count" fill="#F5C300" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Hourly chart */}
            {dailyData.length > 0 && (
              <div className="bg-black rounded-xl p-5 mb-4">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Visites par heure
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={hourlyData}>
                    <XAxis dataKey="h" tick={{ fill: '#ffffff40', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#ffffff40', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: 8, color: '#fff' }} />
                    <Line type="monotone" dataKey="count" stroke="#F5C300" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Language breakdown */}
            {langData.length > 0 && (
              <div className="bg-black rounded-xl p-5 mb-4">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-4">Langues des visiteurs</p>
                <div className="space-y-2">
                  {langData.map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-3">
                      <span className="text-white/60 text-xs w-8 uppercase">{lang}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-[#F5C300] h-2 rounded-full"
                          style={{ width: `${Math.round((count / totalVisits) * 100)}%` }}
                        />
                      </div>
                      <span className="text-white/50 text-xs w-12 text-right">{count} ({Math.round((count / totalVisits) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalVisits === 0 && (
              <div className="text-center py-12 text-black/50">
                Aucune visite enregistrée pour ce mois.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
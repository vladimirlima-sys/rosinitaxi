import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar, ChevronDown, ChevronUp, Star, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("fr-CH");
}

function formatCHF(n) {
  return `CHF ${(n || 0).toFixed(2)}`;
}

function buildClientMap(bookings) {
  const map = {};
  for (const b of bookings) {
    const key = b.client_email || b.client_name;
    if (!map[key]) {
      map[key] = {
        name: b.client_name,
        email: b.client_email,
        phone: b.client_phone,
        language: b.language,
        bookings: [],
      };
    }
    map[key].bookings.push(b);
  }
  return Object.values(map).map((c) => {
    const paid = c.bookings.filter((b) => b.payment_status === "paid");
    const total_spent = paid.reduce((s, b) => s + (b.total_price || 0), 0);
    const last_booking = c.bookings.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date))[0];
    return { ...c, total_spent, num_bookings: c.bookings.length, num_paid: paid.length, last_booking_date: last_booking?.departure_date };
  }).sort((a, b) => b.total_spent - a.total_spent);
}

function ClientRow({ client }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {(client.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{client.name}</p>
            <p className="text-zinc-400 text-sm truncate">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-500">Trajets</p>
            <p className="font-bold text-white">{client.num_bookings}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-500">Total dépensé</p>
            <p className="font-bold text-yellow-400">{formatCHF(client.total_spent)}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-zinc-500">Dernier trajet</p>
            <p className="text-sm text-white">{formatDate(client.last_booking_date)}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-950">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Phone className="w-4 h-4 text-yellow-400" />
              {client.phone || "—"}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Mail className="w-4 h-4 text-yellow-400" />
              {client.email || "—"}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Star className="w-4 h-4 text-yellow-400" />
              {client.num_paid} trajet(s) payé(s) / {client.num_bookings} total
            </div>
          </div>

          <p className="text-xs text-zinc-500 uppercase mb-2 font-semibold">Historique des trajets</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {client.bookings
              .sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date))
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-zinc-900 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    <span className="text-zinc-400 flex-shrink-0">{formatDate(b.departure_date)}</span>
                    <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    <span className="text-zinc-300 truncate">{b.departure_point} → {b.arrival_point}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-yellow-400 font-medium">{formatCHF(b.total_price)}</span>
                    <Badge className={
                      b.payment_status === "paid" ? "bg-green-900 text-green-300" :
                      b.payment_status === "cancelled" ? "bg-red-900 text-red-300" :
                      "bg-zinc-700 text-zinc-300"
                    }>
                      {b.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Booking.list("-departure_date", 500).then((bookings) => {
      setClients(buildClientMap(bookings));
      setLoading(false);
    });
  }, []);

  const filtered = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalRevenue = clients.reduce((s, c) => s + c.total_spent, 0);
  const totalBookings = clients.reduce((s, c) => s + c.num_bookings, 0);
  const topClient = clients[0];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-widest text-white mb-1">CLIENTS</h1>
          <p className="text-zinc-500 text-sm tracking-wider">ROSINI TRANSFERT — BASE DE DONNÉES</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Clients uniques</p>
                  <p className="text-2xl font-bold text-white">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Total trajets</p>
                  <p className="text-2xl font-bold text-white">{totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Revenu total</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCHF(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top client highlight */}
        {topClient && (
          <Card className="bg-zinc-900 border-yellow-400/30 mb-6">
            <CardContent className="p-4 flex items-center gap-4">
              <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-400 uppercase">Meilleur client</p>
                <p className="text-white font-semibold">{topClient.name} — <span className="text-yellow-400">{formatCHF(topClient.total_spent)}</span> en {topClient.num_bookings} trajet(s)</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Client list */}
        {loading ? (
          <div className="text-center text-zinc-500 py-20">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">Aucun client trouvé</div>
        ) : (
          <div>
            <p className="text-zinc-500 text-xs mb-3">{filtered.length} client(s)</p>
            {filtered.map((c, i) => (
              <ClientRow key={c.email || i} client={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
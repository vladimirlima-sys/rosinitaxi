import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar,
  ChevronDown, ChevronUp, Star, UserPlus, Download, ArrowUpDown, ArrowLeft
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createPageUrl } from "@/utils";

const LANG_LABELS = { fr: "🇫🇷 FR", pt: "🇧🇷 PT", en: "🇬🇧 EN", de: "🇩🇪 DE", it: "🇮🇹 IT", es: "🇪🇸 ES", nl: "🇳🇱 NL" };

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
      map[key] = { name: b.client_name, email: b.client_email, phone: b.client_phone, language: b.language, bookings: [], first_booking_date: b.departure_date };
    } else {
      if (b.departure_date < map[key].first_booking_date) map[key].first_booking_date = b.departure_date;
    }
    map[key].bookings.push(b);
  }
  return Object.values(map).map((c) => {
    const paid = c.bookings.filter((b) => b.payment_status === "paid");
    const total_spent = paid.reduce((s, b) => s + (b.total_price || 0), 0);
    const sorted = [...c.bookings].sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
    return { ...c, total_spent, num_bookings: c.bookings.length, num_paid: paid.length, last_booking_date: sorted[0]?.departure_date };
  });
}

function buildMonthlyNewClients(clients) {
  const map = {};
  for (const c of clients) {
    if (!c.first_booking_date) continue;
    const d = new Date(c.first_booking_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + 1;
  }
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-CH", { month: "short", year: "2-digit" });
    result.push({ month: label, nouveaux: map[key] || 0 });
  }
  return result;
}

function exportCSV(clients) {
  const header = "Nom,Email,Téléphone,Langue,Trajets,Trajets payés,Total dépensé (CHF),Premier trajet,Dernier trajet,Fidélisé";
  const rows = clients.map((c) =>
    [
      `"${c.name || ""}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      c.language || "",
      c.num_bookings,
      c.num_paid,
      (c.total_spent || 0).toFixed(2),
      formatDate(c.first_booking_date),
      formatDate(c.last_booking_date),
      c.num_bookings >= 3 ? "Oui" : "Non",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clients_rosini_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ClientRow({ client }) {
  const [expanded, setExpanded] = useState(false);
  const isLoyal = client.num_bookings >= 3;

  return (
    <div className="border border-zinc-800 rounded-xl mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
            {(client.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-white truncate">{client.name}</p>
              {isLoyal && <Badge className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-xs px-1.5 py-0">⭐ Fidélisé</Badge>}
              {client.language && <span className="text-xs text-zinc-500">{LANG_LABELS[client.language] || client.language}</span>}
            </div>
            <p className="text-zinc-400 text-sm truncate">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Phone className="w-4 h-4 text-yellow-400" />
              {client.phone || "—"}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Mail className="w-4 h-4 text-yellow-400" />
              <span className="truncate">{client.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Star className="w-4 h-4 text-yellow-400" />
              {client.num_paid} payé(s) / {client.num_bookings} total
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Calendar className="w-4 h-4 text-yellow-400" />
              1er trajet: {formatDate(client.first_booking_date)}
            </div>
          </div>

          <p className="text-xs text-zinc-500 uppercase mb-2 font-semibold">Historique des trajets</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...client.bookings]
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
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("total_spent");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterLoyal, setFilterLoyal] = useState("all");

  useEffect(() => {
    base44.entities.Booking.list("-departure_date", 500).then((bookings) => {
      setAllClients(buildClientMap(bookings));
      setLoading(false);
    });
  }, []);

  // Build period options from data
  const periodOptions = useMemo(() => {
    const months = new Set();
    allClients.forEach((c) => {
      c.bookings.forEach((b) => {
        if (b.departure_date) {
          const d = new Date(b.departure_date);
          months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        }
      });
    });
    return [...months].sort().reverse();
  }, [allClients]);

  const clients = useMemo(() => {
    let list = [...allClients];

    // Filter by period: keep clients who had a booking in that month
    if (filterPeriod !== "all") {
      list = list.filter((c) =>
        c.bookings.some((b) => b.departure_date?.startsWith(filterPeriod))
      );
    }

    // Filter loyal
    if (filterLoyal === "loyal") list = list.filter((c) => c.num_bookings >= 3);
    if (filterLoyal === "new") list = list.filter((c) => c.num_bookings < 3);

    // Search
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) =>
        c.name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone?.includes(search)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "total_spent") return b.total_spent - a.total_spent;
      if (sortBy === "num_bookings") return b.num_bookings - a.num_bookings;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "last_booking") return new Date(b.last_booking_date || 0) - new Date(a.last_booking_date || 0);
      return 0;
    });

    return list;
  }, [allClients, search, sortBy, filterPeriod, filterLoyal]);

  const totalRevenue = allClients.reduce((s, c) => s + c.total_spent, 0);
  const totalBookings = allClients.reduce((s, c) => s + c.num_bookings, 0);
  const loyalCount = allClients.filter((c) => c.num_bookings >= 3).length;
  const monthlyData = buildMonthlyNewClients(allClients);
  const thisMonth = monthlyData[monthlyData.length - 1]?.nouveaux || 0;
  const topClient = [...allClients].sort((a, b) => b.total_spent - a.total_spent)[0];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-widest text-white mb-1">CLIENTS</h1>
            <p className="text-zinc-500 text-sm tracking-wider">ROSINI TRANSFERT — BASE DE DONNÉES</p>
          </div>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 gap-2"
            onClick={() => exportCSV(clients)}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Clients uniques</p>
                  <p className="text-2xl font-bold text-white">{allClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-7 h-7 text-yellow-400" />
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
                <TrendingUp className="w-7 h-7 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Revenu total</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCHF(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserPlus className="w-7 h-7 text-yellow-400" />
                <div>
                  <p className="text-zinc-400 text-xs uppercase">Nouveaux ce mois</p>
                  <p className="text-2xl font-bold text-white">{thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loyal + top client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-400 uppercase">Clients fidélisés (3+ trajets)</p>
                <p className="text-xl font-bold text-white">{loyalCount} <span className="text-zinc-500 text-sm font-normal">/ {allClients.length}</span></p>
              </div>
            </CardContent>
          </Card>
          {topClient && (
            <Card className="bg-zinc-900 border-yellow-400/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400 uppercase">Meilleur client</p>
                  <p className="text-white font-semibold">{topClient.name} — <span className="text-yellow-400">{formatCHF(topClient.total_spent)}</span> · {topClient.num_bookings} trajet(s)</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Monthly chart */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-400 uppercase font-semibold mb-4">Nouveaux clients par mois (12 derniers mois)</p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v) => [v, "Nouveaux clients"]}
                />
                <Bar dataKey="nouveaux" fill="#F5C300" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Filters & Sort */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Nom, email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-white">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              <SelectItem value="all">Toutes périodes</SelectItem>
              {periodOptions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLoyal} onValueChange={setFilterLoyal}>
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 text-white">
              <SelectValue placeholder="Fidélité" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="loyal">⭐ Fidélisés</SelectItem>
              <SelectItem value="new">Nouveaux</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-700 text-white">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
              <SelectItem value="total_spent">Total dépensé</SelectItem>
              <SelectItem value="num_bookings">Nb de trajets</SelectItem>
              <SelectItem value="name">Nom (A→Z)</SelectItem>
              <SelectItem value="last_booking">Dernier trajet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client list */}
        {loading ? (
          <div className="text-center text-zinc-500 py-20">Chargement...</div>
        ) : clients.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">Aucun client trouvé</div>
        ) : (
          <div>
            <p className="text-zinc-500 text-xs mb-3">{clients.length} client(s)</p>
            {clients.map((c, i) => (
              <ClientRow key={c.email || i} client={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
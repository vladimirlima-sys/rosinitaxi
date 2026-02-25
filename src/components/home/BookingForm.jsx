import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Plane, User, Mail, Phone, MessageSquare, Loader2, Navigation2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PlacesAutocomplete from './PlacesAutocomplete';
import RouteCalculator from './RouteCalculator';
import DatePicker from './DatePicker';
import PriceExamplesCards from './PriceExamplesCards';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function BookingForm({ bookingRef }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [step, setStep] = useState(1); // 1=booking form, 2=vehicle, 3=personal info, 4=payment, 5=confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isLocating, setIsLocating] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [priceSettings, setPriceSettings] = useState(null);
  const [form, setForm] = useState({
    departure_point: '',
    arrival_point: '',
    departure_date: '',
    departure_time: '',
    flight_number: '',
    vehicle_type: '',
    passengers: 1,
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
    distance_km: 0
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    locateUser();
    const fetchSettings = async () => {
      const settings = await base44.entities.PriceSettings.list();
      if (settings?.length > 0) setPriceSettings(settings[0]);
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('booking') === 'success') {
      setStep(5);
      window.history.replaceState({}, '', window.location.pathname);
      // Restore form data for confirmation screen display
      const savedBooking = JSON.parse(sessionStorage.getItem('pendingBooking') || '{}');
      if (savedBooking.client_name) {
        setForm(prev => ({
          ...prev,
          client_name: savedBooking.client_name || '',
          client_email: savedBooking.client_email || '',
          departure_point: savedBooking.departure_point || '',
          arrival_point: savedBooking.arrival_point || '',
        }));
      }
      sessionStorage.removeItem('pendingBooking');
      // Note: emails are sent by the Stripe webhook, not here
    }
  }, []);

  const locateUser = async () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await base44.functions.invoke('hereReverseGeocoding', { lat: latitude, lng: longitude });
        if (response.data?.address) update('departure_point', response.data.address);
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const handleRouteCalculated = (routeData) => {
    if (routeData.distance_km > 0) {
      setEstimatedDistance(routeData.distance_km);
      setEstimatedTime(routeData.estimated_time_minutes);
      update('distance_km', routeData.distance_km);
    }
  };

  const getPricePerKm = () => {
    if (!priceSettings) return 0;
    if (form.vehicle_type === 'comfort') return priceSettings.comfort_price_per_km || priceSettings.standard_price_per_km * 1.3;
    return priceSettings.standard_price_per_km;
  };

  const calculateTotalPrice = () => {
    if (!priceSettings || estimatedDistance === 0 || !form.vehicle_type) return null;
    let total = estimatedDistance * getPricePerKm();
    if (estimatedDistance <= 30) total += priceSettings.base_fare || 0;

    if (form.departure_date && form.departure_time && priceSettings.night_surcharge_percentage > 0) {
      const dt = new Date(`${form.departure_date}T${form.departure_time}:00`);
      const day = dt.getDay(), hour = dt.getHours();
      if (day === priceSettings.night_surcharge_day && hour >= priceSettings.night_surcharge_start_hour && hour < priceSettings.night_surcharge_end_hour) {
        total *= 1 + priceSettings.night_surcharge_percentage / 100;
      }
    }

    const isAirport = ['aeroporto', 'aéroport', 'airport'].some(k =>
      form.departure_point.toLowerCase().includes(k) || form.arrival_point.toLowerCase().includes(k)
    );
    if (isAirport && priceSettings.airport_fee) total += priceSettings.airport_fee;
    return total.toFixed(2);
  };

  const totalPrice = calculateTotalPrice();

  const checkShortNotice = () => {
    if (!form.departure_date || !form.departure_time) return false;
    const [y, m, d] = form.departure_date.split('-').map(Number);
    const [h, min] = form.departure_time.split(':').map(Number);
    const departure = new Date(y, m - 1, d, h, min, 0);
    const diffMinutes = (departure.getTime() - Date.now()) / 60000;
    console.log('[ShortNotice] date:', form.departure_date, 'time:', form.departure_time, 'departure:', departure, 'diffMin:', diffMinutes);
    return diffMinutes >= 0 && diffMinutes < 90;
  };
  const isShortNotice = checkShortNotice();
  console.log('[ShortNotice] isShortNotice:', isShortNotice, 'date:', form.departure_date, 'time:', form.departure_time);

  const canProceedStep1 = form.departure_point && form.arrival_point && form.departure_date && form.departure_time && estimatedDistance > 0;
  const canProceedStep2 = !!form.vehicle_type;
  const canProceedStep3 = form.client_name && form.client_email && form.client_phone;

  const handlePayment = async () => {
    if (!totalPrice) return;
    setIsSubmitting(true);
    try {
      if (paymentMethod === 'stripe') {
        if (window.self !== window.top) {
          toast.error(t.checkoutFromPublishedApp);
          setIsSubmitting(false);
          return;
        }
        await base44.entities.Booking.create({ ...form, total_price: parseFloat(totalPrice), payment_status: 'pending', payment_method: 'stripe' });
        sessionStorage.setItem('pendingBooking', JSON.stringify({ ...form, total_price: parseFloat(totalPrice), distance_km: estimatedDistance, language: lang }));
        const response = await base44.functions.invoke('createCheckout', {
          amount: parseFloat(totalPrice), currency: 'chf',
          client_name: form.client_name, client_email: form.client_email,
          departure: form.departure_point, arrival: form.arrival_point,
          vehicle_type: form.vehicle_type, distance_km: estimatedDistance,
          departure_date: form.departure_date, departure_time: form.departure_time,
          origin: window.location.origin
        });
        if (response.data?.url) window.location.href = response.data.url;
        else throw new Error(response.data?.error || 'Erreur de paiement');
      } else {
        // TWINT or Cash payment
        const bookingData = { ...form, total_price: parseFloat(totalPrice), payment_status: 'pending', payment_method: paymentMethod, special_notes: form.notes };
        const createdBooking = await base44.entities.Booking.create(bookingData);
        
        await base44.functions.invoke('sendBookingConfirmation', {
          client_name: form.client_name, client_email: form.client_email, client_phone: form.client_phone,
          departure_point: form.departure_point, arrival_point: form.arrival_point,
          departure_date: form.departure_date, departure_time: form.departure_time,
          flight_number: form.flight_number, vehicle_type: form.vehicle_type,
          distance_km: estimatedDistance, total_price: parseFloat(totalPrice),
          passengers: form.passengers, notes: form.notes, payment_method: paymentMethod, language: lang,
          skip_client_email: isShortNotice,
          booking_id: createdBooking.id
        });
        
        setStep(5);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(t.paymentError);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPaymentMethod('stripe');
    setForm({ departure_point: '', arrival_point: '', departure_date: '', departure_time: '', flight_number: '', vehicle_type: '', passengers: 1, client_name: '', client_email: '', client_phone: '', notes: '', distance_km: 0 });
    setEstimatedDistance(0);
    setEstimatedTime(0);
  };

  const inputClass = "bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-0 h-12 rounded-lg text-sm";
  const labelClass = "text-white/70 text-xs uppercase tracking-wider mb-1 block";

  const cardClass = "bg-black border border-black/40 rounded-xl p-4";
  const darkInputClass = "w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60";
  const darkLabelClass = "text-white/60 text-xs uppercase tracking-wider mb-1 block";

  return (
    <div ref={bookingRef} className="min-h-screen bg-[#F5C300] flex flex-col items-center justify-start py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
        <p className="text-black/60 text-sm tracking-[0.5em] uppercase mt-2">TÁXI</p>
        <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3" />

      </div>

      <div className="w-full max-w-md">

      {/* STEP 1 — Booking form */}
        {step === 1 && (
          <div className="space-y-3">
            {/* Departure */}
            <div className="bg-black border border-black/40 rounded-xl p-4">
              <PlacesAutocomplete
                value={form.departure_point}
                onChange={(val) => update('departure_point', val)}
                placeholder={t.departurePlaceholder}
                label={t.departure}
                showLocateButton={true}
                isLocating={isLocating}
                onLocate={locateUser}
                t={t}
                darkMode={false}
              />
            </div>

            {/* Arrow connector */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1px] h-3 bg-black/30" />
                <div className="w-3 h-3 rounded-full border-2 border-black bg-[#F5C300]" />
                <div className="w-[1px] h-3 bg-black/30" />
              </div>
            </div>

            {/* Arrival */}
            <div className="bg-black border border-black/40 rounded-xl p-4">
              <PlacesAutocomplete
                value={form.arrival_point}
                onChange={(val) => update('arrival_point', val)}
                placeholder={t.arrivalPlaceholder}
                label={t.arrival}
                showLocateButton={false}
                t={t}
                darkMode={false}
              />
            </div>

            {/* Hidden route calculator */}
            {form.departure_point && form.arrival_point && (
              <RouteCalculator
                departure={form.departure_point}
                arrival={form.arrival_point}
                onRouteCalculated={handleRouteCalculated}
              />
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black border border-black/40 rounded-xl p-4">
                <label className={labelClass}>{t.dateLabel}</label>
                <DatePicker
                  value={form.departure_date}
                  onChange={(date) => update('departure_date', date)}
                />
              </div>
              <div className="bg-black border border-black/40 rounded-xl p-4">
                <label className={labelClass}>{t.timeLabel}</label>
                <input
                  type="time"
                  value={form.departure_time}
                  onChange={(e) => update('departure_time', e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none border-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Short notice warning - below date/time */}
            {isShortNotice && (
              <div className="bg-black border-2 border-red-500 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-red-400 text-lg mt-0.5">⚠️</span>
                <p className="text-white text-sm leading-relaxed font-medium">{t.shortNoticeWarning}</p>
              </div>
            )}

            {/* Flight (optional) */}
            <div className="bg-black border border-black/40 rounded-xl p-4">
              <label className={labelClass}><Plane className="inline w-3 h-3 mr-1" />{t.flightLabel}</label>
              <input
                type="text"
                placeholder={t.flightPlaceholder}
                value={form.flight_number}
                onChange={(e) => update('flight_number', e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none border-none placeholder:text-white/40"
              />
            </div>

            {/* Passengers */}
            <div className="bg-black border border-black/40 rounded-xl p-4">
              <label className={labelClass}>{t.passengersLabel}</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => update('passengers', num)}
                    className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${
                      form.passengers === num
                        ? 'bg-[#F5C300] text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Price preview */}
            {estimatedDistance > 0 && (
              <div className="bg-black border border-black/40 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">{t.estimatedPrice}</p>
                  <p className="text-white text-sm mt-0.5">{estimatedDistance} km · {Math.floor(estimatedTime / 60)}h{estimatedTime % 60}min</p>
                </div>
                <div className="text-right">
                  {totalPrice ? (
                    <p className="text-[#F5C300] text-2xl font-bold">CHF {totalPrice}</p>
                  ) : (
                    <p className="text-white/40 text-sm">—</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className={`w-full h-14 rounded-xl font-bold text-base tracking-wider uppercase transition-all ${
                canProceedStep1
                  ? 'bg-black text-white hover:bg-black/80'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {t.continueBtn}
            </button>

            <PriceExamplesCards priceSettings={priceSettings} />
          </div>
        )}

        {/* STEP 2 — Vehicle Selection */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-black font-semibold text-sm uppercase tracking-wider mb-2">{t.step2Title}</h3>

            {/* Standard */}
            <div
              onClick={() => update('vehicle_type', 'economic')}
              className={`rounded-xl p-4 cursor-pointer transition-all border ${
                form.vehicle_type === 'economic' ? 'bg-black text-white border-transparent' : 'bg-[#E8B800]/70 border-white/30 hover:bg-[#E8B800]/90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`font-bold text-base ${form.vehicle_type === 'economic' ? 'text-white' : 'text-black'}`}>STANDARD</p>
                  <p className={`text-xs ${form.vehicle_type === 'economic' ? 'text-white/60' : 'text-black/60'}`}>1–3 {t.persons} · 2 {t.luggageLabel}</p>
                </div>
                <div className="text-right">
                  {priceSettings && estimatedDistance > 0 && (
                    <p className={`font-bold ${form.vehicle_type === 'economic' ? 'text-[#F5C300]' : 'text-black'}`}>
                      CHF {(estimatedDistance * priceSettings.standard_price_per_km + (estimatedDistance <= 30 ? (priceSettings.base_fare || 0) : 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {t.vehicleFeatures.economic.map((f, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${form.vehicle_type === 'economic' ? 'bg-white/10 text-white/70' : 'bg-black/20 text-black/60'}`}>{f}</span>
                ))}
              </div>
            </div>

            {/* Comfort */}
            <div
              onClick={() => update('vehicle_type', 'comfort')}
              className={`rounded-xl p-4 cursor-pointer transition-all border ${
                form.vehicle_type === 'comfort' ? 'bg-black text-white border-transparent' : 'bg-[#E8B800]/70 border-white/30 hover:bg-[#E8B800]/90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`font-bold text-base ${form.vehicle_type === 'comfort' ? 'text-white' : 'text-black'}`}>COMFORT</p>
                  <p className={`text-xs ${form.vehicle_type === 'comfort' ? 'text-white/60' : 'text-black/60'}`}>1–4 {t.persons} · 3 {t.luggageLabel}</p>
                </div>
                <div className="text-right">
                  {priceSettings && estimatedDistance > 0 && (
                    <p className={`font-bold ${form.vehicle_type === 'comfort' ? 'text-[#F5C300]' : 'text-black'}`}>
                      CHF {(estimatedDistance * (priceSettings.comfort_price_per_km || priceSettings.standard_price_per_km * 1.3) + (estimatedDistance <= 30 ? (priceSettings.base_fare || 0) : 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {t.vehicleFeatures.comfort.map((f, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${form.vehicle_type === 'comfort' ? 'bg-white/10 text-white/70' : 'bg-black/20 text-black/60'}`}>{f}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all">{t.backBtn}</button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`flex-[2] h-12 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${canProceedStep2 ? 'bg-black text-white hover:bg-black/80' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Personal Info */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-black border border-black/40 rounded-xl p-4 space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">{t.step3Title}</h3>

              <div>
                <label className={labelClass}><User className="inline w-3 h-3 mr-1" />{t.nameLabel}</label>
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={form.client_name}
                  onChange={(e) => update('client_name', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60"
                />
              </div>
              <div>
                <label className={labelClass}><Mail className="inline w-3 h-3 mr-1" />{t.emailLabel}</label>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={form.client_email}
                  onChange={(e) => update('client_email', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60"
                />
              </div>
              <div>
                <label className={labelClass}><Phone className="inline w-3 h-3 mr-1" />{t.phoneLabel}</label>
                <input
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={form.client_phone}
                  onChange={(e) => update('client_phone', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60"
                />
              </div>
              <div>
                <label className={labelClass}><MessageSquare className="inline w-3 h-3 mr-1" />{t.notesLabel}</label>
                <textarea
                  placeholder={t.notesPlaceholder}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all"
              >
                {t.backBtn}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                style={canProceedStep3 ? { backgroundColor: '#000000', color: '#ffffff' } : {}}
                className={`flex-[2] h-12 rounded-xl border font-bold text-sm uppercase tracking-wider transition-all ${
                  canProceedStep3
                    ? 'border-black hover:opacity-80'
                    : 'bg-white/10 text-white/40 border-white/50 cursor-not-allowed'
                }`}
              >
                {t.paymentBtn}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Payment */}
        {step === 4 && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-black border border-black/40 rounded-xl p-4 space-y-2">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">{t.summaryLabel}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/50">{t.departure}</span><span className="text-white text-right max-w-[60%] truncate">{form.departure_point}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">{t.arrival}</span><span className="text-white text-right max-w-[60%] truncate">{form.arrival_point}</span></div>
              </div>
              <div className="flex justify-between text-sm"><span className="text-white/50">{t.summaryDateHeure}</span><span className="text-white">{form.departure_date} {form.departure_time}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">{t.summaryVehicle}</span><span className="text-white">{form.vehicle_type === 'comfort' ? 'COMFORT' : 'STANDARD'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">{t.summaryDistance}</span><span className="text-white">{estimatedDistance} km</span></div>
              <div className="w-full h-[1px] bg-white/20 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-sm">{t.summaryTotal}</span>
                <span className="text-[#F5C300] text-2xl font-bold">CHF {totalPrice}</span>
              </div>
              <p className="text-white/40 text-xs italic">{t.noTollsIncluded}</p>
            </div>



            {/* Payment method */}
            <div className="bg-black border border-black/40 rounded-xl p-4 space-y-2">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">{t.paymentMethod}</h3>
              {[
                { value: 'stripe', label: t.stripeLabel, desc: t.stripeDesc },
                { value: 'twint', label: t.twintLabel, desc: t.twintDesc },
                { value: 'cash', label: t.cashLabel, desc: t.cashDesc },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                    paymentMethod === opt.value
                      ? 'border-[#F5C300] bg-white/10'
                      : 'border-white/20 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-[#F5C300]"
                  />
                  <span className="text-white text-sm font-medium flex-1">{opt.label}</span>
                  <span className="text-white/50 text-xs">{opt.desc}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all"
              >
                {t.backBtn}
              </button>
              <button
                onClick={handlePayment}
                disabled={isSubmitting || !totalPrice}
                className="flex-[2] h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t.redirecting}</> : (paymentMethod === 'stripe' ? t.payBtn(totalPrice) : t.confirmBooking)}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — Confirmation */}
        {step === 5 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 rounded-full bg-transparent border border-transparent flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-[#F5C300]" />
            </div>
            <h3 className="text-black text-xl font-bold">{isShortNotice ? t.shortNoticeConfirmTitle : t.confirmTitle}</h3>
            <p className="text-black/60 text-sm max-w-xs mx-auto">{isShortNotice ? t.shortNoticeConfirmMsg(form.client_name) : t.confirmMsg(form.client_name, form.departure_point, form.arrival_point)}</p>
            {!isShortNotice && <p className="text-black/40 text-xs">{t.confirmEmail(form.client_email)}</p>}
            <button
              onClick={resetForm}
              className="mt-4 px-8 h-12 rounded-xl bg-[#F5C300] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#e6b800] transition-all"
            >
              {t.newBooking}
            </button>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-8 text-center">
          <p className="text-black text-xs mb-1">La Tour-de-Peilz</p>
          <a href="tel:+41796505347" className="text-black text-xs hover:text-black/70 transition-colors">
            +41 79 650 53 47
          </a>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Plane, User, Mail, Phone, MessageSquare, Loader2, Navigation2, CheckCircle, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PlacesAutocomplete from './PlacesAutocomplete';
import RouteCalculator from './RouteCalculator';
import DatePicker from './DatePicker';
import PriceExamplesCards from './PriceExamplesCards';
import AddToHomeScreen from './AddToHomeScreen';
import PreferredDriverSelector from './PreferredDriverSelector';
import RideCounter from './RideCounter';
import MyBookingCard from './MyBookingCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { createPageUrl } from '@/utils';

export default function BookingForm({ bookingRef }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [step, setStep] = useState(1); // 1=booking form, 2=vehicle, 3=personal info, 4=payment, 5=confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isLocating, setIsLocating] = useState(false);
  const [isLocatingArrival, setIsLocatingArrival] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [priceSettings, setPriceSettings] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [additionalStops, setAdditionalStops] = useState([]);
  const [locatingStopIndex, setLocatingStopIndex] = useState(null);
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
    client_phone: '+41',
    notes: '',
    distance_km: 0
  });
  const [phoneError, setPhoneError] = useState('');

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'client_phone') {
      setPhoneError('');
    }
  };

  const isValidPhone = (phone) => /^\+\d{1,3}\d{6,}$/.test(phone.replace(/[\s-]/g, ''));

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await base44.entities.PriceSettings.list();
      if (settings?.length > 0) setPriceSettings(settings[0]);
    };
    fetchSettings();
  }, []);

  // Save departure/arrival coordinates for next session
  useEffect(() => {
    window.addEventListener('placeSelected', (e) => {
      const { address, lat, lng } = e.detail;
      if (lat && lng) {
        localStorage.setItem('last_departure_coords', JSON.stringify({ lat, lng, address }));
      }
    });
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
    if (!navigator.geolocation) {
      toast.error(t.locationUnavailable);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await base44.functions.invoke('hereReverseGeocoding', { lat: latitude, lng: longitude });
          if (response.data?.address) {
            const address = response.data.address;
            update('departure_point', address);
            // Dispatch placeSelected so RouteCalculator gets the coords directly
            window.dispatchEvent(new CustomEvent('placeSelected', {
              detail: { address, lat: latitude, lng: longitude }
            }));
          } else {
            toast.error(t.locationError);
          }
        } catch (e) {
          console.error('Reverse geocoding failed:', e);
          toast.error(t.locationError);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error(t.locationDenied);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const locateUserArrival = async () => {
    if (!navigator.geolocation) {
      toast.error(t.locationUnavailable);
      return;
    }
    setIsLocatingArrival(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await base44.functions.invoke('hereReverseGeocoding', { lat: latitude, lng: longitude });
          if (response.data?.address) {
            const address = response.data.address;
            update('arrival_point', address);
            window.dispatchEvent(new CustomEvent('placeSelected', {
              detail: { address, lat: latitude, lng: longitude }
            }));
          } else {
            toast.error(t.locationError);
          }
        } catch (e) {
          toast.error(t.locationError);
        } finally {
          setIsLocatingArrival(false);
        }
      },
      () => {
        toast.error(t.locationDenied);
        setIsLocatingArrival(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Auto-locate on mount (disabled to prevent blocking on mobile)
  useEffect(() => {
    // Locating is now optional - user can click the locate button if needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const checkValaisFribourg = () => {
    if (!priceSettings || !priceSettings.valais_fribourg_surcharge_percentage) return false;
    // Only cities clearly in Valais or Fribourg cantons (NOT Vaud)
    const valaisKeywords = [
      'valais', 'wallis',
      'sion', 'sierre', 'martigny', 'monthey', 'visp', 'brig', 'zermatt',
      'verbier', 'crans-montana', 'crans montana', 'saas-fee', 'saas fee',
      'leukerbad', 'nendaz', 'champery', 'champéry', 'saillon', 'fully',
      'bagnes', 'evolène', 'evolene', 'hérémence', 'heremence', 'anniviers',
      'grimentz', 'zinal', 'vercorin', 'lens', 'icogne', 'ayent',
      'conthey', 'ardon', 'chamoson', 'saint-pierre-de-clages', 'riddes',
      'isérables', 'iserables', 'saxon', 'bovernier', 'sembrancher',
      'orsières', 'orsieres', 'liddes', 'bourg-saint-pierre', 'val de bagnes',
      'fiesch', 'bellwald', 'ernen', 'lax', 'mörel', 'riederalp', 'bettmeralp',
      'aletsch', 'goms', 'ulrichen', 'münster', 'reckingen', 'blitzingen',
      'stalden', 'saas-grund', 'saas-almagell', 'täsch', 'randa',
      'herbriggen', 'st. niklaus', 'grächen', 'embd', 'törbel', 'zeneggen',
      'lalden', 'naters', 'mund', 'birgisch', 'ried-brig', 'termen',
      'simplon', 'gondo', 'baltschieder', 'eggerberg', 'steg', 'hohtenn',
      'niedergesteln', 'raron', 'turtig', 'gampel', 'bratsch', 'ferden',
      'kippel', 'wiler', 'blatten', 'belalp', 'susten', 'inden', 'albinen',
      'guttet', 'feschel', 'erschmatt', 'varen', 'salgesch', 'miège',
      'venthône', 'veyras', 'montana', 'randogne', 'mollens', 'chermignon',
      'lens', 'saint-léonard', 'grimisuat', 'arbaz', 'savièse', 'conthey',
    ];
    const fribourgKeywords = [
      'fribourg', 'freiburg',
      'bulle', 'romont', 'murten', 'morat', 'estavayer', 'chatel-saint-denis',
      'gruyères', 'gruyeres', 'gruyere', 'charmey', 'schwarzsee', 'tafers',
      'châtel-saint-denis', 'attalens', 'cheyres', 'vully', 'bas-vully',
      'haut-vully', 'domdidier', 'avenches', 'cudrefin', 'courtepin',
      'cressier', 'grolley', 'givisiez', 'villars-sur-glâne', 'marly',
      'granges-paccot', 'corminboeuf', 'matran', 'autigny', 'ependes',
      'ponthaux', 'grangettes', 'belfaux', 'rosé', 'ecuvillens', 'posieux',
      'hauterive', 'villaz-saint-pierre', 'vuisternens', 'ursy', 'rue',
      'billens', 'hennens', 'palézieux', 'vauderens', 'siviriez', 'mézières',
      'promasens', 'bossonnens', 'remaufens', 'semsales', 'saint-martin',
      'corbières', 'jaun', 'charmey', 'bellegarde', 'riaz', 'marsens',
      'broc', 'gruyères', 'epagny', 'echarlens', 'vuippens', 'morlon',
      'enney', 'botterens', 'villargiroud', 'avry-sur-matran',
    ];
    const dep = form.departure_point.toLowerCase();
    const allKeywords = [...valaisKeywords, ...fribourgKeywords];
    return allKeywords.some(k => dep.includes(k));
  };

  const calculateTotalPrice = () => {
    if (!priceSettings || estimatedDistance === 0 || !form.vehicle_type) return null;
    
    // Base distance price
    let total = estimatedDistance * getPricePerKm();
    
    // Add base fare for short trips (≤ 50 km)
    if (estimatedDistance <= 50) total += priceSettings.base_fare || 0;

    // Apply night surcharge if conditions match (applied AFTER base + distance)
    if (form.departure_date && form.departure_time && priceSettings.night_surcharge_percentage > 0) {
      const dt = new Date(`${form.departure_date}T${form.departure_time}:00`);
      const day = dt.getDay(), hour = dt.getHours();
      const nightSurchargeDays = priceSettings.night_surcharge_days || [];
      
      let isNightTime = false;
      if (nightSurchargeDays.includes(day)) {
        if (priceSettings.night_surcharge_start_hour > priceSettings.night_surcharge_end_hour) {
          isNightTime = hour >= priceSettings.night_surcharge_start_hour || hour < priceSettings.night_surcharge_end_hour;
        } else {
          isNightTime = hour >= priceSettings.night_surcharge_start_hour && hour < priceSettings.night_surcharge_end_hour;
        }
      }
      
      if (isNightTime) {
        total *= 1 + priceSettings.night_surcharge_percentage / 100;
      }
    }

    // Apply Valais/Fribourg surcharge
    if (checkValaisFribourg()) {
      total *= 1 + priceSettings.valais_fribourg_surcharge_percentage / 100;
    }

    // Add airport fee if applicable (fixed amount, NOT percentage)
    const isAirport = ['aeroporto', 'aéroport', 'airport'].some(k =>
      form.departure_point.toLowerCase().includes(k) || form.arrival_point.toLowerCase().includes(k)
    );
    if (isAirport && priceSettings.airport_fee) total += priceSettings.airport_fee;
    
    return total.toFixed(2);
  };

  const totalPrice = calculateTotalPrice();
  const hasValaisFribourgSurcharge = checkValaisFribourg();

  const checkShortNotice = () => {
    if (!form.departure_date || !form.departure_time) return false;
    const [y, m, d] = form.departure_date.split('-').map(Number);
    const [h, min] = form.departure_time.split(':').map(Number);
    const departure = new Date(y, m - 1, d, h, min, 0);
    const diffMinutes = (departure.getTime() - Date.now()) / 60000;
    return diffMinutes >= 0 && diffMinutes < 90;
  };
  const isShortNotice = checkShortNotice();

  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Listen for route calculation status
  useEffect(() => {
    const handleCalculating = () => {
      setEstimatedDistance(0);
      setIsCalculatingRoute(true);
      setRouteError(null);
    };

    window.addEventListener('routeCalculating', handleCalculating);
    return () => window.removeEventListener('routeCalculating', handleCalculating);
  }, []);

  const canProceedStep1 = form.departure_point && form.arrival_point && form.departure_date && form.departure_time && estimatedDistance > 0;
  const canProceedStep2 = !!form.vehicle_type;
  const canProceedStep3 = form.client_name && form.client_email && isValidPhone(form.client_phone);

  const handlePayment = async () => {
    if (!totalPrice || isSubmitting) return;
    
    console.log('🚀 handlePayment started, paymentMethod:', paymentMethod);
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 Creating booking...');
      const driverFields = selectedDriver
        ? { driver_id: selectedDriver.id, driver_name: selectedDriver.name }
        : {};

      const bookingData = { 
        ...form, 
        ...driverFields, 
        total_price: parseFloat(totalPrice), 
        payment_status: paymentMethod === 'stripe' ? 'pending' : 'pending', 
        payment_method: paymentMethod, 
        language: lang 
      };

      if (paymentMethod === 'stripe') {
        console.log('💳 Stripe payment - going directly to checkout (booking created after payment)...');

        sessionStorage.setItem('pendingBooking', JSON.stringify({ 
          ...form, 
          total_price: parseFloat(totalPrice), 
          distance_km: estimatedDistance, 
          language: lang 
        }));
        
        console.log('🔗 Calling createCheckout function...');
        const response = await base44.functions.invoke('createCheckout', {
          amount: parseFloat(totalPrice), 
          currency: 'chf',
          client_name: form.client_name, 
          client_email: form.client_email, 
          client_phone: form.client_phone,
          departure: form.departure_point, 
          arrival: form.arrival_point,
          vehicle_type: form.vehicle_type, 
          distance_km: estimatedDistance,
          departure_date: form.departure_date, 
          departure_time: form.departure_time,
          flight_number: form.flight_number || '',
          passengers: form.passengers || 1,
          notes: form.notes || '',
          language: lang,
          driver_id: selectedDriver?.id || '',
          driver_name: selectedDriver?.name || '',
          additional_stops: additionalStops.filter(s => s.address?.trim()).map(s => s.address),
          origin: window.location.origin,
          is_short_notice: isShortNotice,
        });
        
        console.log('📦 Checkout response received:', response);
        if (response?.data?.url) {
          console.log('✅ Redirecting to Stripe:', response.data.url);
          window.top.location.href = response.data.url;
        } else {
          console.error('❌ No URL in response:', response);
          sessionStorage.removeItem('pendingBooking');
          throw new Error(response?.data?.error || 'Erro na sessão de pagamento');
        }
      } else {
        // TWINT / Cash payment
        console.log('💵 Non-stripe payment - creating booking...');
        const response = await base44.functions.invoke('createBooking', bookingData);
        const createdBooking = response.data;
        console.log('✅ Booking created:', createdBooking.id);
        
        // Avança para confirmação
        setStep(5);
        setIsSubmitting(false);
        
        // Enviar email em background (não-bloqueante)
        base44.functions.invoke('sendBookingConfirmation', {
          client_name: form.client_name, 
          client_email: form.client_email, 
          client_phone: form.client_phone,
          departure_point: form.departure_point, 
          arrival_point: form.arrival_point,
          departure_date: form.departure_date, 
          departure_time: form.departure_time,
          flight_number: form.flight_number, 
          vehicle_type: form.vehicle_type,
          distance_km: estimatedDistance, 
          total_price: parseFloat(totalPrice),
          passengers: form.passengers, 
          notes: form.notes, 
          payment_method: paymentMethod, 
          language: lang,
          skip_client_email: isShortNotice,
          booking_id: createdBooking.id
        }).catch(err => console.error('Email error:', err));
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      toast.error(err.message || t.paymentError);
      setIsSubmitting(false);
    }
  };

  const addStop = () => setAdditionalStops(prev => [...prev, { address: '', lat: null, lng: null }]);
  const removeStop = (i) => setAdditionalStops(prev => prev.filter((_, idx) => idx !== i));
  const updateStop = (i, field, val) => setAdditionalStops(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const locateStop = async (i) => {
    if (!navigator.geolocation) { toast.error(t.locationUnavailable); return; }
    setLocatingStopIndex(i);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await base44.functions.invoke('hereReverseGeocoding', { lat: latitude, lng: longitude });
          if (response.data?.address) {
            setAdditionalStops(prev => prev.map((s, idx) => idx === i ? { address: response.data.address, lat: latitude, lng: longitude } : s));
          } else { toast.error(t.locationError); }
        } catch { toast.error(t.locationError); }
        finally { setLocatingStopIndex(null); }
      },
      () => { toast.error(t.locationDenied); setLocatingStopIndex(null); },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const resetForm = () => {
    setStep(1);
    setPaymentMethod('stripe');
    setAdditionalStops([]);
    setLocatingStopIndex(null);
    setForm({ departure_point: '', arrival_point: '', departure_date: '', departure_time: '', flight_number: '', vehicle_type: '', passengers: 1, client_name: '', client_email: '', client_phone: '+41', notes: '', distance_km: 0 });
    setEstimatedDistance(0);
    setEstimatedTime(0);
    setPhoneError('');
  };

  const inputClass = "bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-0 h-12 rounded-lg text-sm";
  const labelClass = "text-white/70 text-xs uppercase tracking-wider mb-1 block";

  const cardClass = "bg-black border border-black/40 rounded-xl p-4";
  const darkInputClass = "w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60";
  const darkLabelClass = "text-white/60 text-xs uppercase tracking-wider mb-1 block";

  return (
    <div ref={bookingRef} className="w-full min-h-screen bg-[#F5C300] flex flex-col items-center justify-start py-3 sm:py-6 px-3 sm:px-4">
      {/* Header */}
      <div className="w-full max-w-md mb-3 sm:mb-4 text-center">
        <h1 className="text-black text-3xl sm:text-5xl md:text-6xl font-extralight tracking-[0.2em] sm:tracking-[0.3em] uppercase">ROSINI</h1>
        <p className="text-black/60 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-0.5 sm:mt-2">TRANSPORTS DE PERSONNES</p>
        <div className="w-6 sm:w-8 h-[1px] bg-black/40 mx-auto mt-1.5 sm:mt-3" />
      </div>

      <div className="w-full max-w-md px-0">

      {/* STEP 1 — Booking form */}
        {step === 1 && (
          <div className="space-y-2 sm:space-y-3">
            {/* Departure */}
             <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
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

            {/* Additional stops */}
            {additionalStops.map((stop, i) => (
              <div key={i} className="bg-black border border-white/20 rounded-xl p-3 sm:p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#F5C300] text-xs uppercase tracking-wider font-medium">{t.stopLabel || 'Arrêt'} {i + 1}</span>
                  <button onClick={() => removeStop(i)} className="text-white/40 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <PlacesAutocomplete
                  value={stop.address}
                  onChange={(val) => updateStop(i, 'address', val)}
                  onSelect={(sel) => setAdditionalStops(prev => prev.map((s, idx) => idx === i ? { address: sel.formattedAddress, lat: sel.lat, lng: sel.lng } : s))}
                  placeholder={t.stopPlaceholder ? t.stopPlaceholder(i + 1) : `Arrêt ${i + 1}...`}
                  showLocateButton={true}
                  isLocating={locatingStopIndex === i}
                  onLocate={() => locateStop(i)}
                  t={t}
                />
              </div>
            ))}

            <button
              onClick={addStop}
              className="w-full flex items-center justify-center gap-2 border border-black/40 bg-black/10 rounded-xl py-3 text-black hover:bg-black/20 hover:border-black/60 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> {t.addStop}
            </button>

            {/* Arrival */}
             <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
              <PlacesAutocomplete
                value={form.arrival_point}
                onChange={(val) => update('arrival_point', val)}
                placeholder={t.arrivalPlaceholder}
                label={t.arrival}
                showLocateButton={true}
                isLocating={isLocatingArrival}
                onLocate={locateUserArrival}
                t={t}
                darkMode={false}
              />
            </div>

            {/* Hidden route calculator */}
            {form.departure_point && form.arrival_point && (
              <RouteCalculator
                departure={form.departure_point}
                arrival={form.arrival_point}
                stops={additionalStops.filter(s => s.address?.trim()).map(s => s.address)}
                onRouteCalculated={(data) => {
                  setIsCalculatingRoute(false);
                  handleRouteCalculated(data);
                }}
                onCalculating={() => {
                  setEstimatedDistance(0);
                  setIsCalculatingRoute(true);
                }}
              />
            )}

            {/* Date & Time */}
             <div className="grid grid-cols-2 gap-2 sm:gap-3">
               <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
                <label className={labelClass}>{t.dateLabel}</label>
                <DatePicker
                  value={form.departure_date}
                  onChange={(date) => update('departure_date', date)}
                />
              </div>
              <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
                <label className={labelClass}><Clock className="inline w-3 h-3 mr-1" />{t.timeLabel}</label>
                <input
                  type="time"
                  value={form.departure_time}
                  onChange={(e) => update('departure_time', e.target.value)}
                  onBlur={(e) => e.target.blur()}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  className="w-full bg-transparent text-white text-lg font-medium outline-none border-none [color-scheme:dark] h-10"
                />
              </div>
            </div>

            {/* Short notice warning - below date/time */}
             {isShortNotice && (
               <div className="bg-black border-2 border-red-500 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3 items-start">
                <span className="text-red-400 text-lg mt-0.5">⚠️</span>
                <p className="text-white text-sm leading-relaxed font-medium">{t.shortNoticeWarning}</p>
              </div>
            )}

            {/* Flight (optional) */}
             <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
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
             <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4">
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
               <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4 flex items-center justify-between">
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
              disabled={!canProceedStep1 || isCalculatingRoute}
              className={`w-full h-14 rounded-xl font-bold text-base tracking-wider uppercase transition-all ${
                canProceedStep1 && !isCalculatingRoute
                  ? 'bg-black text-white hover:bg-black/80'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isCalculatingRoute ? t.calculatingRoute || 'Calcul en cours...' : t.continueBtn}
            </button>

            <PriceExamplesCards priceSettings={priceSettings} />
            <RideCounter />
            <MyBookingCard />
          </div>
        )}

        {/* STEP 2 — Vehicle Selection */}
        {step === 2 && (
          <div className="space-y-2 sm:space-y-3">
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
                      CHF {(() => {
                        let p = estimatedDistance * priceSettings.standard_price_per_km + (estimatedDistance <= 50 ? (priceSettings.base_fare || 0) : 0);
                        return p.toFixed(2);
                      })()}
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
                      CHF {(() => {
                        let p = estimatedDistance * (priceSettings.comfort_price_per_km || priceSettings.standard_price_per_km * 1.3) + (estimatedDistance <= 50 ? (priceSettings.base_fare || 0) : 0);
                        return p.toFixed(2);
                      })()}
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

            {/* Preferred driver selection */}
            <div className="bg-black border border-black/40 rounded-xl p-4">
              <PreferredDriverSelector
                lang={lang}
                selectedDriverId={selectedDriver?.id || null}
                onSelect={(driver) => setSelectedDriver(driver)}
                departureDate={form.departure_date}
                departureTime={form.departure_time}
              />
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setStep(1)} className="flex-1 h-10 sm:h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all">{t.backBtn}</button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`flex-[2] h-10 sm:h-12 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${canProceedStep2 ? 'bg-black text-white hover:bg-black/80' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Personal Info */}
        {step === 3 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
              <h3 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider">{t.step3Title}</h3>

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
                  placeholder="+41..."
                  value={form.client_phone}
                  onChange={(e) => update('client_phone', e.target.value)}
                  className={`w-full bg-white/10 border rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60 ${
                    phoneError ? 'border-red-500/50' : 'border-white/20'
                  }`}
                  onBlur={() => {
                    if (form.client_phone && !isValidPhone(form.client_phone)) {
                      setPhoneError(t.phoneRequired || 'Veuillez entrer un numéro avec le préfixe du pays (ex: +41)');
                    }
                  }}
                />
                {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
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

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-10 sm:h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all"
              >
                {t.backBtn}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                style={canProceedStep3 ? { backgroundColor: '#000000', color: '#ffffff' } : {}}
                className={`flex-[2] h-10 sm:h-12 rounded-xl border font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${
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
          <div className="space-y-2 sm:space-y-3">
            {/* Summary */}
            <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4 space-y-2">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">{t.summaryLabel}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/50">{t.departure}</span><span className="text-white text-right max-w-[60%] truncate">{form.departure_point}</span></div>
                {additionalStops.filter(s => s.address?.trim()).map((stop, i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-orange-400/70">Arrêt {i + 1}</span><span className="text-orange-300 text-right max-w-[60%] truncate">{stop.address}</span></div>
                ))}
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
            <div className="bg-black border border-black/40 rounded-xl p-3 sm:p-4 space-y-2">
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">{t.paymentMethod}</h3>
              {[
                { value: 'stripe', label: t.stripeLabel, desc: t.stripeDesc },
                { value: 'twint', label: t.twintLabel, desc: t.twintDesc },
                { value: 'cash', label: t.cashLabel, desc: t.cashDesc },
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setPaymentMethod(opt.value)}
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
                    className="w-4 h-4 accent-[#F5C300] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-white text-sm font-medium flex-1">{opt.label}</span>
                  <span className="text-white/50 text-xs">{opt.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-10 sm:h-12 rounded-xl border border-white/50 bg-[#F5C300]/95 text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all"
              >
                {t.backBtn}
              </button>
              <button
                onClick={handlePayment}
                disabled={isSubmitting}
                className="flex-[2] h-10 sm:h-12 rounded-xl bg-black text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-black/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Footer */}
         <div className="mt-4 sm:mt-8 border-t border-black/20 pt-3 sm:pt-4 text-center space-y-1">
          <a href={createPageUrl('AdminPanel')} className="text-black font-semibold text-xs sm:text-sm tracking-wide hover:opacity-70 cursor-pointer">Rosini Transports et Locations Sàrl</a>
           <p className="text-black/60 text-xs">La Tour-de-Peilz, Suisse</p>
           <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-2">
             <a href="tel:+41772492245" className="text-black/70 text-xs hover:text-black transition-colors">
               +41 77 249 22 45
             </a>
             <span className="text-black/30 hidden sm:block">|</span>
             <a href="mailto:info@rosini.online" className="text-black/70 text-xs hover:text-black transition-colors">
               info@rosini.online
             </a>
           </div>
          <div className="flex justify-center mt-3">
            <AddToHomeScreen />
          </div>
          <div className="flex justify-center mt-3">
            <a
              href="https://wa.me/41772492245"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#1ebe5d] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
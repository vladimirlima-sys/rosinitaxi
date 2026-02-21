import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Plane, User, Mail, Phone, MessageSquare, Loader2, Loader, Navigation2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VehicleCard from './VehicleCard';
import PricingBreakdown from './PricingBreakdown';
import JourneyDetails from './JourneyDetails';
import PlacesAutocomplete from './PlacesAutocomplete';
import RouteCalculator from './RouteCalculator';
import RouteMapDisplay from './RouteMapDisplay';
import RouteCard from './RouteCard';

import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function BookingForm({ bookingRef }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
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
    driver_preference: '',
    distance_km: 0
  });
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [priceSettings, setPriceSettings] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [departureToken, setDepartureToken] = useState(null);
  const [arrivalToken, setArrivalToken] = useState(null);


  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Set vehicle type to economic on mount
  useEffect(() => {
    update('vehicle_type', 'economic');
  }, []);

  // Create new session token
  const createNewToken = () => {
    try {
      if (typeof google !== 'undefined' && google.maps?.places?.AutocompleteSessionToken) {
        return new google.maps.places.AutocompleteSessionToken();
      }
    } catch (err) {
      console.error('Session token creation error:', err);
    }
    return null;
  };

  // Initialize session tokens for Places API
  useEffect(() => {
    const token1 = createNewToken();
    const token2 = createNewToken();
    setDepartureToken(token1);
    setArrivalToken(token2);
  }, []);

  const locateUser = async () => {
    if (!navigator.geolocation) {
      toast.error(t.locationUnavailable || 'Geolocation not available');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          if (typeof google !== 'undefined' && google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                update('departure_point', results[0].formatted_address);
                toast.success(t.locationObtained || 'Location obtained!');
              } else {
                toast.error(t.locationError || 'Error obtaining location');
              }
              setIsLocating(false);
            });
          } else {
            setIsLocating(false);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          toast.error(t.locationError || 'Error obtaining location');
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error(t.locationDenied || 'Location permission denied');
      }
    );
  };

  // Auto-locate and fetch price settings on mount
  useEffect(() => {
    locateUser();

    // Fetch price settings
    const fetchSettings = async () => {
      try {
        const settings = await base44.entities.PriceSettings.list();
        if (settings && settings.length > 0) {
          setPriceSettings(settings[0]);
        }
      } catch (err) {
        console.error('Error fetching price settings:', err);
      }
    };
    fetchSettings();
  }, []);





  // Handle redirect back from Stripe
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('booking') === 'success') {
      setStep(5);
      window.history.replaceState({}, '', window.location.pathname);
      // Send confirmation emails
      const savedBooking = JSON.parse(sessionStorage.getItem('pendingBooking') || '{}');
      if (savedBooking.client_email) {
        base44.functions.invoke('sendBookingConfirmation', savedBooking).catch(() => {});
        sessionStorage.removeItem('pendingBooking');
      }
    }
  }, []);

  const handleRouteCalculated = (routeData) => {
    if (routeData.distance_km > 0) {
      setEstimatedDistance(routeData.distance_km);
      setEstimatedTime(routeData.estimated_time_minutes);
      setCurrentRoute(routeData.route);
      update('distance_km', routeData.distance_km);
    }
  };

  const calculateEstimatedTime = (km) => {
    // Average speed estimation: 80 km/h on highways, 50 km/h on regular roads
    // Simplified: use average of 70 km/h
    return Math.round(km / 70 * 60);
  };

  const calculateTotalPrice = () => {
    if (!priceSettings || estimatedDistance === 0) return null;

    let total = estimatedDistance * priceSettings.standard_price_per_km;
    total += priceSettings.base_fare || 0;

    // Apply night surcharge if conditions met
    if (form.departure_date && form.departure_time && priceSettings.night_surcharge_percentage > 0) {
      const departureDateTime = new Date(`${form.departure_date}T${form.departure_time}:00`);
      const dayOfWeek = departureDateTime.getDay();
      const hour = departureDateTime.getHours();

      if (
      dayOfWeek === priceSettings.night_surcharge_day &&
      hour >= priceSettings.night_surcharge_start_hour &&
      hour < priceSettings.night_surcharge_end_hour)
      {
        total *= 1 + priceSettings.night_surcharge_percentage / 100;
      }
    }

    // Apply airport fee if route contains airport keywords
    const isAirportTransfer =
    form.departure_point.toLowerCase().includes('aeroporto') ||
    form.departure_point.toLowerCase().includes('aéroport') ||
    form.departure_point.toLowerCase().includes('airport') ||
    form.arrival_point.toLowerCase().includes('aeroporto') ||
    form.arrival_point.toLowerCase().includes('aéroport') ||
    form.arrival_point.toLowerCase().includes('airport');


    if (isAirportTransfer && priceSettings.airport_fee) {
      total += priceSettings.airport_fee;
    }

    return total.toFixed(2);
  };

  const basePrice = estimatedDistance > 0 && priceSettings ?
  (estimatedDistance * priceSettings.standard_price_per_km).toFixed(2) :
  null;
  const totalPrice = calculateTotalPrice();

  const canProceedStep1 = form.departure_point && form.arrival_point && form.departure_date && form.departure_time && estimatedDistance > 0;

  const scrollToTop = () => {
    if (bookingRef?.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const canProceedStep2 = form.vehicle_type;
  const canProceedStep3 = form.client_name && form.client_email && form.client_phone;

  const handlePayment = async () => {
    if (!totalPrice) {
      toast.error('Erro ao processar o preço. Tente novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentMethod === 'stripe') {
        if (window.self !== window.top) {
          toast.error(t.checkoutFromPublishedApp || "Le paiement fonctionne uniquement depuis l'application publiée.");
          setIsSubmitting(false);
          return;
        }

        const bookingData = {
          ...form,
          total_price: parseFloat(totalPrice),
          payment_status: 'pending',
          payment_method: 'stripe'
        };

        await base44.entities.Booking.create(bookingData);

        sessionStorage.setItem('pendingBooking', JSON.stringify({
            ...form,
            total_price: parseFloat(totalPrice),
            distance_km: estimatedDistance,
            language: lang
          }));

        const response = await base44.functions.invoke('createCheckout', {
          amount: parseFloat(totalPrice),
          currency: 'chf',
          client_name: form.client_name,
          client_email: form.client_email,
          departure: form.departure_point,
          arrival: form.arrival_point,
          vehicle_type: form.vehicle_type,
          distance_km: estimatedDistance,
          departure_date: form.departure_date,
          departure_time: form.departure_time,
          origin: window.location.origin
        });

        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error(response.data?.error || 'Erreur de paiement');
        }
      } else {
        // Cash or TWINT payment
        await base44.entities.Booking.create({
          ...form,
          total_price: parseFloat(totalPrice),
          payment_status: 'pending',
          payment_method: paymentMethod
        });

        // Send confirmation email
        try {
          await base44.functions.invoke('sendBookingConfirmation', {
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
              language: lang
            });
        } catch (err) {
          console.error('Error sending confirmation email:', err);
          toast.error('Erro ao enviar e-mail de confirmação');
        }

        toast.success('Réservation confirmée!');
        setStep(5);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(t.paymentError || "Erreur lors du paiement. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPaymentMethod('stripe');
    setForm({ departure_point: '', arrival_point: '', departure_date: '', departure_time: '', flight_number: '', vehicle_type: 'economic', passengers: 1, client_name: '', client_email: '', client_phone: '', notes: '', driver_preference: '', distance_km: 0 });
    setEstimatedDistance(0);
    setEstimatedTime(0);
    setDynamicPrice(null);
    setCurrentRoute(null);
  };

  return (
    <section ref={bookingRef} className="py-24 px-6 bg-[#F5C300]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-black/50 text-sm tracking-[0.3em] uppercase mb-4">{t.bookingLabel}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">{t.bookingTitle}</h2>
            <div className="w-12 h-[2px] bg-black mx-auto mb-6" />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((s) =>
          <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step >= s ? 'bg-black text-[#F5C300]' : 'bg-black/20 text-black/40'}`
            }>{s}</div>
              {s < 4 && <div className={`w-12 h-[2px] ${step > s ? 'bg-black' : 'bg-black/20'}`} />}
            </div>
          )}
        </div>

        {/* Step 1: Route */}
        {step === 1 &&
        <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-black text-2xl font-bold mb-2">{t.step1Title}</h3>
              <p className="text-black/60 text-sm">{t.setYourRoute}</p>
            </div>

            {/* Route Section */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.1)] space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h4 className="text-white font-medium">{t.yourRoute}</h4>
                  </div>

              <div className="space-y-6">
                <PlacesAutocomplete
                value={form.departure_point}
                onChange={(val) => update('departure_point', val)}
                placeholder={t.departurePlaceholder}
                label={t.departure}
                showLocateButton={true}
                isLocating={isLocating}
                onLocate={locateUser}
                sessionToken={departureToken}
                onTokenRefresh={() => setDepartureToken(createNewToken())}
                t={t} />


                {/* Route Line */}
                <div className="flex justify-center py-2">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-gray-400 to-transparent" />
                </div>

                <PlacesAutocomplete
                value={form.arrival_point}
                onChange={(val) => update('arrival_point', val)}
                placeholder={t.arrivalPlaceholder}
                label={t.arrival}
                showLocateButton={false}
                sessionToken={arrivalToken}
                onTokenRefresh={() => setArrivalToken(createNewToken())}
                t={t} />


                {/* Route Calculator - hidden component that calculates route */}
                {form.departure_point && form.arrival_point &&
              <RouteCalculator
                departure={form.departure_point}
                arrival={form.arrival_point}
                onRouteCalculated={handleRouteCalculated} />

              }
              </div>
            </div>

            {/* Route Card - Map + Journey Details */}
            {estimatedDistance > 0 && currentRoute &&
          <RouteCard
            departure={form.departure_point}
            arrival={form.arrival_point}
            route={currentRoute}
            distance_km={estimatedDistance}
            estimatedTime={estimatedTime} />

          }

            {/* Date, Time & Flight Section */}
            <div className="bg-transparent p-8 rounded-3xl border-2 border-[#E6B800] space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-black" />
                    </div>
                    <h4 className="text-black font-bold">{t.tripDetails}</h4>
                  </div>

              <div className="bg-transparent grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-black/70 text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black" />
                    {t.dateLabel}
                  </Label>
                  <Input
                  type="date"
                  value={form.departure_date}
                  onChange={(e) => update('departure_date', e.target.value)} className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-black/20 focus:border-black h-12 transition-all" />


                </div>

                <div className="space-y-3">
                  <Label className="text-black/70 text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black" />
                    {t.timeLabel}
                  </Label>
                  <Input
                  type="time"
                  value={form.departure_time}
                  onChange={(e) => update('departure_time', e.target.value)} className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-black/20 focus:border-black h-12 transition-all" />


                </div>

                <div className="space-y-3">
                  <Label className="text-black/70 text-sm font-semibold flex items-center gap-2">
                    <Plane className="w-4 h-4 text-black" />
                    {t.flightLabel}
                  </Label>
                  <Input
                  placeholder={t.flightPlaceholder}
                  value={form.flight_number}
                  onChange={(e) => update('flight_number', e.target.value)} className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-black/20 placeholder:text-black/30 focus:border-black h-12 transition-all" />


                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <Button
              onClick={() => {setStep(2);scrollToTop();}}
              disabled={!canProceedStep1 || estimatedDistance === 0}
              className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-12 h-13 rounded-xl transition-all hover:shadow-lg">

                {t.continueBtn}
              </Button>
            </div>
          </div>
        }

        {/* Step 2: Vehicle */}
        {step === 2 &&
        <div className="space-y-6">
            <h3 className="text-black text-xl font-bold mb-6">{t.step2Title}</h3>
            {priceSettings &&
          <VehicleCard
            type="economic"
            selected={true}
            onSelect={(v) => update('vehicle_type', v)}
            distance={estimatedDistance}
            pricePerKm={priceSettings.standard_price_per_km}
            baseFare={priceSettings.base_fare || 0} />

          }

            {form.vehicle_type &&
          <div className="space-y-2 max-w-xs">
                <Label className="text-black/70 text-sm font-semibold">{t.passengersLabel}</Label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((num) =>
              <button
                key={num}
                onClick={() => update('passengers', num)}
                className={`w-12 h-12 rounded-lg font-bold transition-all ${
                form.passengers === num ?
                'bg-black text-[#F5C300]' :
                'bg-black/10 text-black/40 hover:bg-black/20 hover:text-black'}`
                }>

                      {num}
                    </button>
              )}
                </div>
              </div>
          }

            {totalPrice && form.departure_date && form.departure_time && priceSettings &&
          <PricingBreakdown
            date={form.departure_date}
            time={form.departure_time}
            distance_km={estimatedDistance}
            basePrice={basePrice}
            vehicleType={form.vehicle_type}
            priceSettings={priceSettings}
            departure_point={form.departure_point}
            arrival_point={form.arrival_point} />

          }
            {totalPrice && (!form.departure_date || !form.departure_time) &&
          <div className="text-center p-6 rounded-2xl bg-white border border-black/10">
                <p className="text-black/50 text-sm mb-2">{t.estimatedPrice}</p>
                <p className="text-black text-4xl font-bold">CHF {totalPrice}</p>
              </div>
          }

            <div className="flex justify-between pt-4">
              <Button onClick={() => {setStep(1);scrollToTop();}} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={() => {setStep(3);scrollToTop();}} disabled={!canProceedStep2} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12">{t.continueBtn}</Button>
            </div>
          </div>
        }

        {/* Step 3: Personal info */}
        {step === 3 &&
        <div className="space-y-6">
            <h3 className="text-black text-xl font-bold mb-6">{t.step3Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-black/70 text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-black" /> {t.nameLabel}</Label>
                <Input placeholder={t.namePlaceholder} value={form.client_name} onChange={(e) => update('client_name', e.target.value)} className="bg-white border-black/20 text-black placeholder:text-black/30 focus:border-black h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-black/70 text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-black" /> {t.emailLabel}</Label>
                <Input type="email" placeholder={t.emailPlaceholder} value={form.client_email} onChange={(e) => update('client_email', e.target.value)} className="bg-white border-black/20 text-black placeholder:text-black/30 focus:border-black h-12" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <Label className="text-black/70 text-sm font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-black" /> {t.phoneLabel}</Label>
              <Input type="tel" placeholder={t.phonePlaceholder} value={form.client_phone} onChange={(e) => update('client_phone', e.target.value)} className="bg-white border-black/20 text-black placeholder:text-black/30 focus:border-black h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-black/70 text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-black" /> {t.notesLabel}</Label>
              <Textarea placeholder={t.notesPlaceholder} value={form.notes} onChange={(e) => update('notes', e.target.value)} className="bg-white border-black/20 text-black placeholder:text-black/30 focus:border-black min-h-[100px]" />
            </div>
            <div className="flex justify-between pt-4">
              <Button onClick={() => {setStep(2);scrollToTop();}} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={() => {setStep(4);scrollToTop();}} disabled={!canProceedStep3} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12">{t.paymentBtn}</Button>
            </div>
          </div>
        }

        {/* Step 4: Payment */}
        {step === 4 &&
        <div className="space-y-6">
            <h3 className="text-black text-xl font-bold mb-6">{t.step4Title}</h3>
            <div className="p-6 rounded-2xl bg-white border border-black/10 space-y-3 mb-8">
              <h4 className="text-black/60 text-sm uppercase tracking-wider font-semibold mb-4">{t.summaryLabel}</h4>
              <div className="flex justify-between text-sm"><span className="text-black/50">{t.summaryTrajet}</span><span className="text-black font-medium">{form.departure_point} → {form.arrival_point}</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">{t.summaryDateHeure}</span><span className="text-black font-medium">{form.departure_date} — {form.departure_time}</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">{t.summaryVehicle}</span><span className="text-black font-medium">Standard</span></div>
              <div className="flex justify-between text-sm"><span className="text-black/50">{t.summaryDistance}</span><span className="text-black font-medium">{estimatedDistance} km</span></div>
              <div className="w-full h-[1px] bg-black/10 my-2" />
              <div className="flex justify-between"><span className="text-black font-bold">{t.summaryTotal}</span><span className="text-black text-xl font-bold">CHF {totalPrice}</span></div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 p-6 rounded-2xl bg-white border border-black/10">
              <Label className="text-black font-bold text-sm">{t.paymentMethod}</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all" style={{ borderColor: paymentMethod === 'stripe' ? '#000' : 'rgba(0,0,0,0.15)', backgroundColor: paymentMethod === 'stripe' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.5)' }}>
                  <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: '#000' }} />
                  <span className="text-black font-medium flex-1">{t.stripeLabel}</span>
                  <span className="text-black/50 text-sm">{t.stripeDesc}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all" style={{ borderColor: paymentMethod === 'twint' ? '#000' : 'rgba(0,0,0,0.15)', backgroundColor: paymentMethod === 'twint' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.5)' }}>
                  <input type="radio" name="payment" value="twint" checked={paymentMethod === 'twint'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: '#000' }} />
                  <span className="text-black font-medium flex-1">{t.twintLabel}</span>
                  <span className="text-black/50 text-sm">{t.twintDesc}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all" style={{ borderColor: paymentMethod === 'cash' ? '#000' : 'rgba(0,0,0,0.15)', backgroundColor: paymentMethod === 'cash' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.5)' }}>
                  <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4" style={{ accentColor: '#000' }} />
                  <span className="text-black font-medium flex-1">{t.cashLabel}</span>
                  <span className="text-black/50 text-sm">{t.cashDesc}</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'stripe' &&
          <div className="flex items-center gap-2 text-black/50 text-xs">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                <span>{t.securePayment}</span>
              </div>
          }

            <div className="flex justify-between pt-2">
              <Button onClick={() => {setStep(3);scrollToTop();}} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={handlePayment} disabled={isSubmitting} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 h-12 min-w-[220px]">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.redirecting}</> : `${paymentMethod === 'stripe' ? t.payBtn(totalPrice) : t.confirmBooking}`}
              </Button>
            </div>
          </div>
        }

        {/* Step 5: Confirmation */}
        {step === 5 &&
        <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-black text-2xl font-bold mb-4">{t.confirmTitle}</h3>
            <p className="text-black/60 max-w-md mx-auto mb-2">{t.confirmMsg(form.client_name, form.departure_point, form.arrival_point)}</p>
            <p className="text-black/40 text-sm mb-8">{t.confirmEmail(form.client_email)}</p>
            <Button onClick={resetForm} className="bg-black hover:bg-black/80 text-[#F5C300] font-bold">{t.newBooking}</Button>
          </div>
        }


      </div>
    </section>);

}
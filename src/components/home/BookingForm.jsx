import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Plane, User, Mail, Phone, MessageSquare, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VehicleCard from './VehicleCard';
import RouteMap from './RouteMap.jsx';
import PricingBreakdown from './PricingBreakdown';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function BookingForm({ bookingRef }) {
  const { lang } = useLang();
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    distance_km: 0,
  });
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(null);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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

  const estimateDistance = async () => {
    if (!form.departure_point || !form.arrival_point) return;
    setIsEstimating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Estimate the driving distance in kilometers between "${form.departure_point}" and "${form.arrival_point}". Return ONLY a JSON object with the distance. Be accurate based on real road distances.`,
        response_json_schema: {
          type: "object",
          properties: {
            distance_km: { type: "number", description: "Estimated driving distance in kilometers" }
          }
        }
      });
      const dist = Math.round(result.distance_km);
      setEstimatedDistance(dist);
      update('distance_km', dist);
    } catch {
      toast.error("Impossible d'estimer la distance. Veuillez réessayer.");
    }
    setIsEstimating(false);
  };

  const pricePerKm = form.vehicle_type === 'economic' ? 2.35 : form.vehicle_type === 'comfort' ? 2.95 : 0;
  const basePrice = estimatedDistance > 0 && pricePerKm > 0 ? (estimatedDistance * pricePerKm).toFixed(2) : null;
  const totalPrice = dynamicPrice || basePrice;

  const canProceedStep1 = form.departure_point && form.arrival_point && form.departure_date && form.departure_time;
  const canProceedStep2 = form.vehicle_type;
  const canProceedStep3 = form.client_name && form.client_email && form.client_phone;

  const handleStripeCheckout = async () => {
    if (window.self !== window.top) {
      alert("Le paiement fonctionne uniquement depuis l'application publiée.");
      return;
    }
    setIsSubmitting(true);
    try {
      await base44.entities.Booking.create({
          ...form,
          total_price: parseFloat(totalPrice),
          payment_status: 'pending',
        });

        // Save booking data for post-payment email
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          ...form,
          total_price: parseFloat(totalPrice),
          distance_km: estimatedDistance,
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
        origin: window.location.origin,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data?.error || 'Erreur de paiement');
      }
    } catch (err) {
      toast.error("Erreur lors du paiement. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setForm({ departure_point: '', arrival_point: '', departure_date: '', departure_time: '', flight_number: '', vehicle_type: '', passengers: 1, client_name: '', client_email: '', client_phone: '', notes: '', driver_preference: '', distance_km: 0 });
    setEstimatedDistance(0);
    setDynamicPrice(null);
  };

  return (
    <section ref={bookingRef} className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">{t.bookingLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">{t.bookingTitle}</h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mb-6" />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s ? 'bg-[#C9A96E] text-[#0A0A0A]' : 'bg-white/10 text-white/30'
              }`}>{s}</div>
              {s < 4 && <div className={`w-12 h-[1px] ${step > s ? 'bg-[#C9A96E]' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-white text-xl font-medium mb-6">{t.step1Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A96E]" /> {t.departure}
                </Label>
                <Input placeholder={t.departurePlaceholder} value={form.departure_point} onChange={e => update('departure_point', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A96E]" /> {t.arrival}
                </Label>
                <Input placeholder={t.arrivalPlaceholder} value={form.arrival_point} onChange={e => update('arrival_point', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12" />
              </div>
            </div>

            {form.departure_point && form.arrival_point && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button onClick={estimateDistance} disabled={isEstimating} variant="outline" className="border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10">
                    {isEstimating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.estimating}</> : estimatedDistance > 0 ? t.estimatedDist(estimatedDistance) : t.estimateBtn}
                  </Button>
                </div>
                <RouteMap departure={form.departure_point} arrival={form.arrival_point} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-[#C9A96E]" /> {t.dateLabel}</Label>
                <Input type="date" value={form.departure_date} onChange={e => update('departure_date', e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-[#C9A96E]" /> {t.timeLabel}</Label>
                <Input type="time" value={form.departure_time} onChange={e => update('departure_time', e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2"><Plane className="w-4 h-4 text-[#C9A96E]" /> {t.flightLabel}</Label>
              <Input placeholder={t.flightPlaceholder} value={form.flight_number} onChange={e => update('flight_number', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 max-w-sm" />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => { if (!estimatedDistance && form.departure_point && form.arrival_point) { estimateDistance().then(() => setStep(2)); } else { setStep(2); } }} disabled={!canProceedStep1} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">
                {t.continueBtn}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-white text-xl font-medium mb-6">{t.step2Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VehicleCard type="economic" selected={form.vehicle_type === 'economic'} onSelect={v => update('vehicle_type', v)} distance={estimatedDistance} />
              <VehicleCard type="comfort" selected={form.vehicle_type === 'comfort'} onSelect={v => update('vehicle_type', v)} distance={estimatedDistance} />
            </div>

            {form.vehicle_type && (
              <div className="space-y-2 max-w-xs">
                <Label className="text-white/60 text-sm">{t.passengersLabel}</Label>
                <Input type="number" min={1} max={form.vehicle_type === 'economic' ? 3 : 4} value={form.passengers} onChange={e => update('passengers', parseInt(e.target.value) || 1)} className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </div>
            )}

            {basePrice && form.departure_date && form.departure_time && (
              <PricingBreakdown
                date={form.departure_date}
                time={form.departure_time}
                basePrice={basePrice}
                vehicleType={form.vehicle_type}
                onPriceChange={(price) => setDynamicPrice(price)}
              />
            )}
            {basePrice && (!form.departure_date || !form.departure_time) && (
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-[#C9A96E]/20">
                <p className="text-white/40 text-sm mb-2">{t.estimatedPrice}</p>
                <p className="text-[#C9A96E] text-4xl font-light">CHF {basePrice}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button onClick={() => setStep(1)} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">{t.continueBtn}</Button>
            </div>
          </div>
        )}

        {/* Step 3: Personal info */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-white text-xl font-medium mb-6">{t.step3Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2"><User className="w-4 h-4 text-[#C9A96E]" /> {t.nameLabel}</Label>
                <Input placeholder={t.namePlaceholder} value={form.client_name} onChange={e => update('client_name', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-[#C9A96E]" /> {t.emailLabel}</Label>
                <Input type="email" placeholder={t.emailPlaceholder} value={form.client_email} onChange={e => update('client_email', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <Label className="text-white/60 text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-[#C9A96E]" /> {t.phoneLabel}</Label>
              <Input type="tel" placeholder={t.phonePlaceholder} value={form.client_phone} onChange={e => update('client_phone', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#C9A96E]" /> {t.notesLabel}</Label>
              <Textarea placeholder={t.notesPlaceholder} value={form.notes} onChange={e => update('notes', e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2"><Star className="w-4 h-4 text-[#C9A96E]" /> Préférence chauffeur (optionnel)</Label>
              <Input
                placeholder="Ex: chauffeur anglophone, véhicule Mercedes, etc."
                value={form.driver_preference}
                onChange={e => update('driver_preference', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
              />
              <p className="text-white/20 text-xs">Nous ferons notre possible pour honorer votre préférence.</p>
            </div>
            <div className="flex justify-between pt-4">
              <Button onClick={() => setStep(2)} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={() => setStep(4)} disabled={!canProceedStep3} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">{t.paymentBtn}</Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-white text-xl font-medium mb-6">{t.step4Title}</h3>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 mb-8">
              <h4 className="text-white/60 text-sm uppercase tracking-wider mb-4">{t.summaryLabel}</h4>
              <div className="flex justify-between text-sm"><span className="text-white/40">{t.summaryTrajet}</span><span className="text-white">{form.departure_point} → {form.arrival_point}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">{t.summaryDateHeure}</span><span className="text-white">{form.departure_date} — {form.departure_time}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">{t.summaryVehicle}</span><span className="text-white">{form.vehicle_type === 'economic' ? t.economic : t.comfort}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/40">{t.summaryDistance}</span><span className="text-white">{estimatedDistance} km</span></div>
              <div className="w-full h-[1px] bg-white/10 my-2" />
              <div className="flex justify-between"><span className="text-white font-medium">{t.summaryTotal}</span><span className="text-[#C9A96E] text-xl font-semibold">CHF {totalPrice}</span></div>
            </div>

            <div className="flex items-center gap-2 text-white/30 text-xs mb-6">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              <span>{t.securePayment}</span>
            </div>

            <div className="flex justify-between pt-2">
              <Button onClick={() => setStep(3)} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12">{t.backBtn}</Button>
              <Button onClick={handleStripeCheckout} disabled={isSubmitting} className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12 min-w-[220px]">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.redirecting}</> : t.payBtn(totalPrice)}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white text-2xl font-light mb-4">{t.confirmTitle}</h3>
            <p className="text-white/50 max-w-md mx-auto mb-2">{t.confirmMsg(form.client_name, form.departure_point, form.arrival_point)}</p>
            <p className="text-white/30 text-sm mb-8">{t.confirmEmail(form.client_email)}</p>
            <Button onClick={resetForm} variant="outline" className="border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10">{t.newBooking}</Button>
          </div>
        )}
      </div>
    </section>
  );
}
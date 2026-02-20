import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Plane, User, Mail, Phone, MessageSquare, Loader2, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VehicleCard from './VehicleCard';
import PaymentForm from './PaymentForm';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BookingForm({ bookingRef }) {
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
    distance_km: 0,
  });
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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
  const totalPrice = estimatedDistance > 0 && pricePerKm > 0 ? (estimatedDistance * pricePerKm).toFixed(2) : null;

  const canProceedStep1 = form.departure_point && form.arrival_point && form.departure_date && form.departure_time;
  const canProceedStep2 = form.vehicle_type;
  const canProceedStep3 = form.client_name && form.client_email && form.client_phone;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...form,
        total_price: parseFloat(totalPrice),
        payment_status: 'paid',
      };
      
      await base44.entities.Booking.create(bookingData);

      // Send email
      const emailBody = `
        <h2 style="color:#C9A96E;">Nouvelle Réservation — Rosini Transfert</h2>
        <hr/>
        <h3>Détails du client</h3>
        <p><strong>Nom:</strong> ${form.client_name}</p>
        <p><strong>Email:</strong> ${form.client_email}</p>
        <p><strong>Téléphone:</strong> ${form.client_phone}</p>
        <hr/>
        <h3>Détails du trajet</h3>
        <p><strong>Départ:</strong> ${form.departure_point}</p>
        <p><strong>Arrivée:</strong> ${form.arrival_point}</p>
        <p><strong>Date:</strong> ${form.departure_date}</p>
        <p><strong>Heure:</strong> ${form.departure_time}</p>
        <p><strong>N° de vol:</strong> ${form.flight_number || 'Non spécifié'}</p>
        <hr/>
        <h3>Véhicule & Tarif</h3>
        <p><strong>Véhicule:</strong> ${form.vehicle_type === 'economic' ? 'Économique (3 pers.)' : 'Confort (4 pers.)'}</p>
        <p><strong>Passagers:</strong> ${form.passengers}</p>
        <p><strong>Distance estimée:</strong> ${estimatedDistance} km</p>
        <p><strong>Prix total:</strong> CHF ${totalPrice}</p>
        ${form.notes ? `<p><strong>Notes:</strong> ${form.notes}</p>` : ''}
      `;

      await base44.integrations.Core.SendEmail({
        to: 'taxirosini@gmail.com',
        subject: `Nouvelle réservation — ${form.client_name} — ${form.departure_point} → ${form.arrival_point}`,
        body: emailBody
      });

      // Also send confirmation to client
      await base44.integrations.Core.SendEmail({
        to: form.client_email,
        from_name: 'Rosini Transfert',
        subject: `Confirmation de réservation — Rosini Transfert`,
        body: `
          <h2 style="color:#C9A96E;">Merci pour votre réservation!</h2>
          <p>Cher(e) ${form.client_name},</p>
          <p>Votre réservation a été confirmée avec succès.</p>
          <hr/>
          <p><strong>Trajet:</strong> ${form.departure_point} → ${form.arrival_point}</p>
          <p><strong>Date:</strong> ${form.departure_date} à ${form.departure_time}</p>
          <p><strong>Véhicule:</strong> ${form.vehicle_type === 'economic' ? 'Économique' : 'Confort'}</p>
          <p><strong>Prix:</strong> CHF ${totalPrice}</p>
          <hr/>
          <p>Pour toute question, contactez-nous à taxirosini@gmail.com</p>
          <p>Rosini Transfert — Votre confort, notre priorité.</p>
        `
      });

      setStep(5);
    } catch (err) {
      toast.error("Erreur lors de la réservation. Veuillez réessayer.");
    }
    setIsSubmitting(false);
  };

  return (
    <section ref={bookingRef} className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">Réservation</p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            Réservez votre transfert
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mb-6" />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s ? 'bg-[#C9A96E] text-[#0A0A0A]' : 'bg-white/10 text-white/30'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-[1px] ${step > s ? 'bg-[#C9A96E]' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Route */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-white text-xl font-medium mb-6">Détails du trajet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A96E]" /> Point de départ
                </Label>
                <Input
                  placeholder="Ex: Genève Aéroport"
                  value={form.departure_point}
                  onChange={e => update('departure_point', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A96E]" /> Point d'arrivée
                </Label>
                <Input
                  placeholder="Ex: Zurich Centre"
                  value={form.arrival_point}
                  onChange={e => update('arrival_point', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
                />
              </div>
            </div>

            {form.departure_point && form.arrival_point && (
              <div className="flex justify-center">
                <Button
                  onClick={estimateDistance}
                  disabled={isEstimating}
                  variant="outline"
                  className="border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10"
                >
                  {isEstimating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Estimation en cours...</>
                  ) : estimatedDistance > 0 ? (
                    `Distance estimée: ${estimatedDistance} km — Recalculer`
                  ) : (
                    'Estimer la distance'
                  )}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C9A96E]" /> Date de départ
                </Label>
                <Input
                  type="date"
                  value={form.departure_date}
                  onChange={e => update('departure_date', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C9A96E]" /> Heure de départ
                </Label>
                <Input
                  type="time"
                  value={form.departure_time}
                  onChange={e => update('departure_time', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#C9A96E]" /> Numéro de vol (optionnel)
              </Label>
              <Input
                placeholder="Ex: LX 1234"
                value={form.flight_number}
                onChange={e => update('flight_number', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 max-w-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => { if (!estimatedDistance && form.departure_point && form.arrival_point) { estimateDistance().then(() => setStep(2)); } else { setStep(2); } }}
                disabled={!canProceedStep1}
                className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-white text-xl font-medium mb-6">Choisissez votre véhicule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VehicleCard 
                type="economic" 
                selected={form.vehicle_type === 'economic'} 
                onSelect={v => update('vehicle_type', v)}
                distance={estimatedDistance}
              />
              <VehicleCard 
                type="comfort" 
                selected={form.vehicle_type === 'comfort'} 
                onSelect={v => update('vehicle_type', v)}
                distance={estimatedDistance}
              />
            </div>

            {form.vehicle_type && (
              <div className="space-y-2 max-w-xs">
                <Label className="text-white/60 text-sm">Nombre de passagers</Label>
                <Input
                  type="number"
                  min={1}
                  max={form.vehicle_type === 'economic' ? 3 : 4}
                  value={form.passengers}
                  onChange={e => update('passengers', parseInt(e.target.value) || 1)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
                />
              </div>
            )}

            {totalPrice && (
              <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-[#C9A96E]/20">
                <p className="text-white/40 text-sm mb-2">Prix estimé du trajet</p>
                <p className="text-[#C9A96E] text-4xl font-light">CHF {totalPrice}</p>
                <p className="text-white/30 text-sm mt-2">{estimatedDistance} km × CHF {pricePerKm}/km</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-white/10 text-white/60 hover:bg-white/5 h-12"
              >
                Retour
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12"
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Personal info */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-white text-xl font-medium mb-6">Vos informations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C9A96E]" /> Nom complet
                </Label>
                <Input
                  placeholder="Votre nom et prénom"
                  value={form.client_name}
                  onChange={e => update('client_name', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A96E]" /> Email
                </Label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.client_email}
                  onChange={e => update('client_email', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
                />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <Label className="text-white/60 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A96E]" /> Téléphone
              </Label>
              <Input
                type="tel"
                placeholder="+41 XX XXX XX XX"
                value={form.client_phone}
                onChange={e => update('client_phone', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C9A96E]" /> Notes (optionnel)
              </Label>
              <Textarea
                placeholder="Informations complémentaires (bagages, sièges enfant, etc.)"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] min-h-[100px]"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-white/10 text-white/60 hover:bg-white/5 h-12"
              >
                Retour
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12"
              >
                Paiement
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-white text-xl font-medium mb-6">Paiement</h3>
            
            {/* Summary */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 mb-8">
              <h4 className="text-white/60 text-sm uppercase tracking-wider mb-4">Résumé de la réservation</h4>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Trajet</span>
                <span className="text-white">{form.departure_point} → {form.arrival_point}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Date & Heure</span>
                <span className="text-white">{form.departure_date} à {form.departure_time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Véhicule</span>
                <span className="text-white">{form.vehicle_type === 'economic' ? 'Économique' : 'Confort'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Distance</span>
                <span className="text-white">{estimatedDistance} km</span>
              </div>
              <div className="w-full h-[1px] bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white font-medium">Total</span>
                <span className="text-[#C9A96E] text-xl font-semibold">CHF {totalPrice}</span>
              </div>
            </div>

            <PaymentForm 
              totalPrice={totalPrice}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onBack={() => setStep(3)}
            />
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-12 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white text-2xl font-light mb-4">Réservation confirmée!</h3>
            <p className="text-white/50 max-w-md mx-auto mb-2">
              Merci {form.client_name}. Votre transfert de {form.departure_point} à {form.arrival_point} est confirmé.
            </p>
            <p className="text-white/30 text-sm mb-8">
              Un email de confirmation a été envoyé à {form.client_email}.
            </p>
            <Button
              onClick={() => { setStep(1); setForm({ departure_point: '', arrival_point: '', departure_date: '', departure_time: '', flight_number: '', vehicle_type: '', passengers: 1, client_name: '', client_email: '', client_phone: '', notes: '', distance_km: 0 }); setEstimatedDistance(0); }}
              variant="outline"
              className="border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10"
            >
              Nouvelle réservation
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
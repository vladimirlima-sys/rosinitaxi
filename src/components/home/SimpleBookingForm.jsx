import React, { useState } from 'react';
import { MapPin, Calendar, Phone, Mail, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function SimpleBookingForm() {
  const { lang } = useLang();
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    departure_point: '',
    arrival_point: '',
    departure_date: '',
    client_name: '',
    client_email: '',
    client_phone: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await base44.entities.Booking.create({
        ...form,
        vehicle_type: 'economic',
        departure_time: '09:00',
        payment_status: 'pending',
        payment_method: 'stripe',
        passengers: 1,
        distance_km: 0,
        total_price: 0,
      });
      
      toast.success('Reserva enviada! Entraremos em contato em breve.');
      setForm({
        departure_point: '',
        arrival_point: '',
        departure_date: '',
        client_name: '',
        client_email: '',
        client_phone: '',
      });
    } catch (err) {
      toast.error('Erro ao enviar reserva. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = form.departure_point && form.arrival_point && 
                   form.departure_date && form.client_name && 
                   form.client_email && form.client_phone;

  return (
    <section className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">{t.bookingLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">{t.bookingTitle}</h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mb-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Section */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-[#C9A96E]/30 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <h4 className="text-white font-medium">{t.yourRoute}</h4>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white/70 text-sm font-medium mb-2 block">{t.departure}</Label>
                <Input
                  placeholder={t.departurePlaceholder}
                  value={form.departure_point}
                  onChange={(e) => update('departure_point', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-white/70 text-sm font-medium mb-2 block">{t.arrival}</Label>
                <Input
                  placeholder={t.arrivalPlaceholder}
                  value={form.arrival_point}
                  onChange={(e) => update('arrival_point', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-white/70 text-sm font-medium mb-2 block">{t.dateLabel}</Label>
                <Input
                  type="date"
                  value={form.departure_date}
                  onChange={(e) => update('departure_date', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white focus:border-[#C9A96E] h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-[#C9A96E]/30 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <h4 className="text-white font-medium">{t.step3Title}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70 text-sm font-medium mb-2 block">{t.nameLabel}</Label>
                <Input
                  placeholder={t.namePlaceholder}
                  value={form.client_name}
                  onChange={(e) => update('client_name', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-white/70 text-sm font-medium mb-2 block">{t.emailLabel}</Label>
                <Input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={form.client_email}
                  onChange={(e) => update('client_email', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-white/70 text-sm font-medium mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A96E]" />
                {t.phoneLabel}
              </Label>
              <Input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={form.client_phone}
                onChange={(e) => update('client_phone', e.target.value)}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-16 h-13 rounded-xl transition-all hover:shadow-lg hover:shadow-[#C9A96E]/20 disabled:opacity-50 w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.redirecting}
                </>
              ) : (
                t.cta
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
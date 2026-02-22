import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Plane, Loader2, Navigation2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PlacesAutocomplete from './PlacesAutocomplete';
import RouteCalculator from './RouteCalculator';
import RouteCard from './RouteCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking, onRouteReady, form, update, estimatedDistance, estimatedTime, currentRoute, isLocating, locateUser, priceSettings }) {
  const { lang } = useLang();
  const t = translations[lang];

  const handleRouteCalculated = (routeData) => {
    if (routeData.distance_km > 0 && onRouteReady) {
      onRouteReady(routeData);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#F5C300]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80')" }}
      />
      
      <div className="relative z-10 text-center px-6 pt-16 pb-8 w-full max-w-3xl mx-auto">

        <div className="mb-4 mt-0">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight text-black tracking-[0.15em] mb-1 leading-none">
            ROSINI
          </h1>
          <p className="text-xl md:text-2xl font-light text-black/60 tracking-[0.25em] uppercase">
            TÁXI
          </p>
        </div>

        <div className="w-12 h-[1px] bg-black mx-auto mb-8" />

        {/* Booking block */}
        <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl border border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.15)] space-y-5 text-left">

          {/* Route inputs */}
          <PlacesAutocomplete
            value={form.departure_point}
            onChange={(val) => update('departure_point', val)}
            placeholder={t.departurePlaceholder}
            label={t.departure}
            showLocateButton={true}
            isLocating={isLocating}
            onLocate={locateUser}
            t={t}
          />

          <div className="flex justify-center py-1">
            <div className="w-0.5 h-6 bg-gradient-to-b from-gray-400 to-transparent" />
          </div>

          <PlacesAutocomplete
            value={form.arrival_point}
            onChange={(val) => update('arrival_point', val)}
            placeholder={t.arrivalPlaceholder}
            label={t.arrival}
            showLocateButton={false}
            t={t}
          />

          {/* Hidden route calculator */}
          {form.departure_point && form.arrival_point && (
            <RouteCalculator
              departure={form.departure_point}
              arrival={form.arrival_point}
              onRouteCalculated={handleRouteCalculated}
            />
          )}

          {/* Date, Time, Flight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-zinc-50 text-sm font-semibold flex items-center gap-2">
                <Calendar className="text-[#C9A96E] w-4 h-4" />
                {t.dateLabel}
              </Label>
              <Input
                type="date"
                value={form.departure_date}
                onChange={(e) => update('departure_date', e.target.value)}
                className="bg-[#fcf6ab] text-black rounded-xl border border-black/20 focus:border-black h-12 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-50 text-sm font-semibold flex items-center gap-2">
                <Clock className="text-[#C9A96E] w-4 h-4" />
                {t.timeLabel}
              </Label>
              <Input
                type="time"
                value={form.departure_time}
                onChange={(e) => update('departure_time', e.target.value)}
                className="bg-[#fcf6ab] text-black rounded-xl border border-black/20 focus:border-black h-12 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-50 text-sm font-semibold flex items-center gap-2">
                <Plane className="text-[#C9A96E] w-4 h-4" />
                {t.flightLabel}
              </Label>
              <Input
                placeholder={t.flightPlaceholder}
                value={form.flight_number}
                onChange={(e) => update('flight_number', e.target.value)}
                className="bg-[#fcf6ab] text-black rounded-xl border border-black/20 placeholder:text-black/30 focus:border-black h-12 transition-all"
              />
            </div>
          </div>

          {/* Continue button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={onScrollToBooking}
              disabled={!form.departure_point || !form.arrival_point || !form.departure_date || !form.departure_time || estimatedDistance === 0}
              className="bg-black hover:bg-black/80 text-[#F5C300] font-bold px-12 h-12 rounded-xl transition-all hover:shadow-lg"
            >
              {t.continueBtn}
            </Button>
          </div>
        </div>

        {/* Route card */}
        {estimatedDistance > 0 && currentRoute && (
          <div className="mt-6">
            <RouteCard
              departure={form.departure_point}
              arrival={form.arrival_point}
              route={currentRoute}
              distance_km={estimatedDistance}
              estimatedTime={estimatedTime}
            />
          </div>
        )}
      </div>
    </section>
  );
}
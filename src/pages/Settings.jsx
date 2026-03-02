import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-sm">{label}</Label>
      {hint && <p className="text-white/30 text-xs">{hint}</p>}
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    standard_price_per_km: 2.35,
    comfort_price_per_km: 3.05,
    base_fare: 10,
    airport_fee: 0,
    night_surcharge_percentage: 10,
    night_surcharge_day: 6,
    night_surcharge_start_hour: 22,
    night_surcharge_end_hour: 6,
    valais_fribourg_surcharge_percentage: 15,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
      return;
    }
    const init = async () => {
      try {
        const result = await base44.entities.PriceSettings.list();
        if (result.length > 0) setSettings(result[0]);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const set = (field, value) => setSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settings.id) {
        await base44.entities.PriceSettings.update(settings.id, settings);
      } else {
        const created = await base44.entities.PriceSettings.create(settings);
        setSettings(created);
      }
      toast.success('Configurações salvas com sucesso');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
      <Loader2 className="w-6 h-6 animate-spin text-[#C9A96E]" />
    </div>
  );



  const standardPreview = (settings.standard_price_per_km || 0);
  const comfortPreview = (settings.comfort_price_per_km || standardPreview * 1.3);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Settings className="w-6 h-6 text-[#C9A96E]" />
          <div>
            <h1 className="text-3xl font-light text-white">Configurações de Preço</h1>
            <p className="text-white/40 text-sm mt-0.5">Tarifas e regras de cálculo do valor das corridas</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Tarifas por KM */}
          <Section title="Tarifas por Quilômetro">
            <Field label="Preço por KM — STANDARD (CHF)" hint="Aplicado ao veículo econômico">
              <Input type="number" step="0.01" value={settings.standard_price_per_km}
                onChange={e => set('standard_price_per_km', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            <Field label="Preço por KM — COMFORT (CHF)" hint="Deixe em 0 para usar 1.3× o preço STANDARD automaticamente">
              <Input type="number" step="0.01" value={settings.comfort_price_per_km}
                onChange={e => set('comfort_price_per_km', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            {/* Preview */}
            <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-xl p-4 mt-2">
              <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-3">Simulação — 50 km</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">STANDARD (50 km + taxa base)</span>
                <span className="text-white font-medium">CHF {(50 * standardPreview + (settings.base_fare || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/60">COMFORT (50 km + taxa base)</span>
                <span className="text-white font-medium">CHF {(50 * comfortPreview + (settings.base_fare || 0)).toFixed(2)}</span>
              </div>
            </div>
          </Section>

          {/* Taxas fixas */}
          <Section title="Taxas Fixas">
            <Field label="Taxa Base (CHF)" hint="Adicionada em corridas até 30 km">
              <Input type="number" step="0.01" value={settings.base_fare}
                onChange={e => set('base_fare', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            <Field label="Taxa Aeroporto (CHF)" hint="Adicionada quando origem ou destino é um aeroporto">
              <Input type="number" step="0.01" value={settings.airport_fee}
                onChange={e => set('airport_fee', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
          </Section>

          {/* Adicional Valais & Fribourg */}
          <Section title="Adicional Regional — Valais & Fribourg">
            <Field label="Percentual do adicional (%)" hint="Aplicado automaticamente para corridas originadas nesses cantões">
              <Input type="number" step="0.1" value={settings.valais_fribourg_surcharge_percentage}
                onChange={e => set('valais_fribourg_surcharge_percentage', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            {settings.valais_fribourg_surcharge_percentage > 0 && (
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-xl p-4">
                <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">Adicional ativo</p>
                <p className="text-white/60 text-sm">
                  +{settings.valais_fribourg_surcharge_percentage}% em todas as corridas originadas de Valais ou Fribourg — <strong className="text-white">não visível ao cliente</strong>
                </p>
              </div>
            )}
          </Section>

          {/* Adicional noturno */}
          <Section title="Adicional Noturno">
            <Field label="Percentual do adicional (%)" hint="Ex: 10 = +10% sobre o valor total">
              <Input type="number" step="0.1" value={settings.night_surcharge_percentage}
                onChange={e => set('night_surcharge_percentage', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            <Field label="Dia da semana em que se aplica">
              <select value={settings.night_surcharge_day}
                onChange={e => set('night_surcharge_day', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-md px-3 focus:border-[#C9A96E] outline-none">
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hora início (0–23)">
                <Input type="number" min="0" max="23" value={settings.night_surcharge_start_hour}
                  onChange={e => set('night_surcharge_start_hour', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="Hora fim (0–23)">
                <Input type="number" min="0" max="23" value={settings.night_surcharge_end_hour}
                  onChange={e => set('night_surcharge_end_hour', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
            </div>
            {settings.night_surcharge_percentage > 0 && (
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-xl p-4">
                <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">Adicional ativo</p>
                <p className="text-white/60 text-sm">
                  +{settings.night_surcharge_percentage}% toda <strong className="text-white">{DAYS[settings.night_surcharge_day]}</strong> das <strong className="text-white">{settings.night_surcharge_start_hour}h</strong> às <strong className="text-white">{settings.night_surcharge_end_hour}h</strong>
                </p>
              </div>
            )}
          </Section>

        </div>

        <Button onClick={handleSave} disabled={isSaving}
          className="w-full mt-8 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-14 text-base">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Configurações'}
        </Button>

        <p className="text-white/20 text-xs text-center mt-4">Alterações aplicadas imediatamente em novas reservas.</p>
      </div>
    </div>
  );
}
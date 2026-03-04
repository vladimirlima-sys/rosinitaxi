import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/60 text-xs uppercase tracking-wider">{label}</Label>
      {hint && <p className="text-white/40 text-xs">{hint}</p>}
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-white/10 pb-6 space-y-4">
      <h2 className="text-[#F5C300] text-sm font-semibold uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const [priceSettings, setPriceSettings] = useState({
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
  const [originalPriceSettings, setOriginalPriceSettings] = useState(priceSettings);
  const [companySettings, setCompanySettings] = useState({
    company_name: '',
    company_address: '',
    registration_number: '',
    phone: '',
    email: '',
  });
  const [taxSettings, setTaxSettings] = useState({
    avs_percentage: 5.15,
    ai_percentage: 0.8,
    apg_percentage: 0,
    ac_percentage: 1.1,
    af_percentage: 0,
    pc_percentage: 0,
    cont_frais_admin_percentage: 0,
    impot_source_percentage: 0,
    impot_cantonal_percentage: 8.5,
    impot_communal_percentage: 8,
    other_deductions_percentage: 0,
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
      return;
    }
    const init = async () => {
      try {
        const priceResult = await base44.entities.PriceSettings.list();
        if (priceResult.length > 0) {
          setPriceSettings(priceResult[0]);
          setOriginalPriceSettings(priceResult[0]);
        }
        const companyResult = await base44.entities.CompanySettings.list();
        if (companyResult.length > 0) setCompanySettings(companyResult[0]);
        const taxResult = await base44.entities.TaxSettings.list();
        if (taxResult.length > 0) setTaxSettings(taxResult[0]);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const set = (field, value) => {
    const num = parseFloat(value) || 0;
    setPriceSettings(prev => ({ ...prev, [field]: Math.max(0, num) }));
  };
  
  const setCompany = (field, value) => setCompanySettings(prev => ({ ...prev, [field]: value }));
  const setTax = (field, value) => {
    const num = parseFloat(value) || 0;
    setTaxSettings(prev => ({ ...prev, [field]: Math.max(0, num) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (priceSettings.id) {
        await base44.entities.PriceSettings.update(priceSettings.id, priceSettings);
      } else {
        const created = await base44.entities.PriceSettings.create(priceSettings);
        setPriceSettings(created);
      }
      if (companySettings.id) {
        await base44.entities.CompanySettings.update(companySettings.id, companySettings);
      } else if (companySettings.company_name) {
        await base44.entities.CompanySettings.create(companySettings);
      }
      if (taxSettings.id) {
        await base44.entities.TaxSettings.update(taxSettings.id, taxSettings);
      } else {
        await base44.entities.TaxSettings.create(taxSettings);
      }
      setLastSaved(new Date().toLocaleString('pt-BR'));
      toast.success('✓ Configurações salvas com sucesso');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPriceSettings(originalPriceSettings);
    toast.message('Valores resetados');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
      <Loader2 className="w-6 h-6 animate-spin text-[#F5C300]" />
    </div>
  );



  const standardPreview = (priceSettings.standard_price_per_km || 0);
  const comfortPreview = (priceSettings.comfort_price_per_km || standardPreview * 1.3);

  // Simulador detalhado
  const calculatePrice = (distanceKm, vehicleType = 'standard', isNight = false) => {
    const pricePerKm = vehicleType === 'comfort' ? comfortPreview : standardPreview;
    const baseKm = distanceKm * pricePerKm;
    const baseFare = priceSettings.base_fare || 0;
    const subtotal = baseKm + baseFare;
    
    let surcharges = 0;
    if (isNight && priceSettings.night_surcharge_percentage > 0) {
      surcharges += subtotal * (priceSettings.night_surcharge_percentage / 100);
    }
    if (priceSettings.valais_fribourg_surcharge_percentage > 0) {
      surcharges += subtotal * (priceSettings.valais_fribourg_surcharge_percentage / 100);
    }
    
    return { baseKm, baseFare, subtotal, surcharges, total: subtotal + surcharges };
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <a
            href={createPageUrl('AdminPanel')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-4xl font-light text-white">Configurações</h1>
        </div>

        <div className="space-y-6">
          {/* Informações da Empresa */}
          <Section title="Informações da Empresa">
            <Field label="Nome da Empresa">
              <Input type="text" value={companySettings.company_name || ''}
                onChange={e => setCompany('company_name', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
            </Field>
            <Field label="Endereço">
              <Input type="text" value={companySettings.company_address || ''}
                onChange={e => setCompany('company_address', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número de Registro (CHE)">
                <Input type="text" value={companySettings.registration_number || ''}
                  onChange={e => setCompany('registration_number', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
              </Field>
              <Field label="Telefone">
                <Input type="text" value={companySettings.phone || ''}
                  onChange={e => setCompany('phone', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
              </Field>
            </div>
            <Field label="Email">
              <Input type="email" value={companySettings.email || ''}
                onChange={e => setCompany('email', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
            </Field>
          </Section>

          {/* Tarifas por KM */}
          <Section title="Tarifas por Quilômetro">
            <Field label="Preço por KM — STANDARD (CHF)" hint="Aplicado ao veículo econômico">
              <Input type="number" step="0.01" min="0" value={priceSettings.standard_price_per_km}
                onChange={e => set('standard_price_per_km', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
            </Field>
            <Field label="Preço por KM — COMFORT (CHF)" hint="Deixe em 0 para usar 1.3× o preço STANDARD automaticamente">
              <Input type="number" step="0.01" min="0" value={priceSettings.comfort_price_per_km}
                onChange={e => set('comfort_price_per_km', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#F5C300] h-12" />
            </Field>
            {/* Preview Detalhado */}
            <div className="bg-[#F5C300]/10 border border-[#F5C300]/20 rounded-xl p-4 mt-2 space-y-4">
              <p className="text-[#F5C300] text-xs font-semibold uppercase tracking-wider">Simulação — 50 km</p>
              
              {/* STANDARD */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>STANDARD</span>
                  <span>CHF {calculatePrice(50, 'standard').total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-white/50 space-y-0.5">
                  <div className="flex justify-between">
                    <span>50 km × CHF {standardPreview}</span>
                    <span>CHF {calculatePrice(50, 'standard').baseKm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa base</span>
                    <span>CHF {calculatePrice(50, 'standard').baseFare.toFixed(2)}</span>
                  </div>
                  {calculatePrice(50, 'standard').surcharges > 0 && (
                    <div className="flex justify-between text-[#F5C300]">
                      <span>Adicionais</span>
                      <span>CHF {calculatePrice(50, 'standard').surcharges.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* COMFORT */}
              <div className="space-y-1.5 pt-2 border-t border-[#F5C300]/20">
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>COMFORT</span>
                  <span>CHF {calculatePrice(50, 'comfort').total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-white/50 space-y-0.5">
                  <div className="flex justify-between">
                    <span>50 km × CHF {comfortPreview}</span>
                    <span>CHF {calculatePrice(50, 'comfort').baseKm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa base</span>
                    <span>CHF {calculatePrice(50, 'comfort').baseFare.toFixed(2)}</span>
                  </div>
                  {calculatePrice(50, 'comfort').surcharges > 0 && (
                    <div className="flex justify-between text-[#C9A96E]">
                      <span>Adicionais</span>
                      <span>CHF {calculatePrice(50, 'comfort').surcharges.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </Section>

            {/* Taxas fixas */}
            <Section title="Taxas Fixas">
            <Field label="Taxa Base (CHF)" hint="Adicionada em corridas até 30 km">
              <Input type="number" step="0.01" min="0" value={priceSettings.base_fare}
                onChange={e => set('base_fare', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            <Field label="Taxa Aeroporto (CHF)" hint="Adicionada quando origem ou destino é um aeroporto">
              <Input type="number" step="0.01" min="0" value={priceSettings.airport_fee}
                onChange={e => set('airport_fee', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            </Section>

            {/* Adicional Valais & Fribourg */}
            <Section title="Adicional Regional — Valais & Fribourg">
            <Field label="Percentual do adicional (%)" hint="Aplicado automaticamente para corridas originadas nesses cantões">
              <Input type="number" step="0.1" min="0" value={priceSettings.valais_fribourg_surcharge_percentage}
                onChange={e => set('valais_fribourg_surcharge_percentage', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            {priceSettings.valais_fribourg_surcharge_percentage > 0 && (
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-xl p-4">
                <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">Adicional ativo</p>
                <p className="text-white/60 text-sm">
                  +{priceSettings.valais_fribourg_surcharge_percentage}% em todas as corridas originadas de Valais ou Fribourg — <strong className="text-white">não visível ao cliente</strong>
                </p>
              </div>
            )}
            </Section>

            {/* Adicional noturno */}
            <Section title="Adicional Noturno">
            <Field label="Percentual do adicional (%)" hint="Ex: 10 = +10% sobre o valor total">
              <Input type="number" step="0.1" min="0" value={priceSettings.night_surcharge_percentage}
                onChange={e => set('night_surcharge_percentage', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
            </Field>
            <Field label="Dia da semana em que se aplica">
              <select value={priceSettings.night_surcharge_day}
                onChange={e => set('night_surcharge_day', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-md px-3 focus:border-[#C9A96E] outline-none">
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hora início (0–23)">
                <Input type="number" min="0" max="23" value={priceSettings.night_surcharge_start_hour}
                  onChange={e => set('night_surcharge_start_hour', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="Hora fim (0–23)">
                <Input type="number" min="0" max="23" value={priceSettings.night_surcharge_end_hour}
                  onChange={e => set('night_surcharge_end_hour', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
            </div>
            {priceSettings.night_surcharge_percentage > 0 && (
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-xl p-4">
                <p className="text-[#C9A96E] text-xs font-semibold uppercase tracking-wider mb-1">Adicional ativo</p>
                <p className="text-white/60 text-sm">
                  +{priceSettings.night_surcharge_percentage}% toda <strong className="text-white">{DAYS[priceSettings.night_surcharge_day]}</strong> das <strong className="text-white">{priceSettings.night_surcharge_start_hour}h</strong> às <strong className="text-white">{priceSettings.night_surcharge_end_hour}h</strong>
                </p>
              </div>
            )}
            </Section>

            {/* Configurações de Impostos */}
            <Section title="Configurações de Impostos">
            <div className="grid grid-cols-2 gap-4">
              <Field label="AVS (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.avs_percentage}
                  onChange={e => setTax('avs_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="AI (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.ai_percentage}
                  onChange={e => setTax('ai_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="AC (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.ac_percentage}
                  onChange={e => setTax('ac_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="Impôt Cantonal (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.impot_cantonal_percentage}
                  onChange={e => setTax('impot_cantonal_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="Impôt Comunal (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.impot_communal_percentage}
                  onChange={e => setTax('impot_communal_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
              <Field label="Outras Deduções (%)">
                <Input type="number" step="0.01" min="0" value={taxSettings.other_deductions_percentage}
                  onChange={e => setTax('other_deductions_percentage', e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12" />
              </Field>
            </div>
          </Section>

        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={handleSave} disabled={isSaving}
            className="flex-1 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-12 text-sm md:h-14 md:text-base">
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Configurações'}
          </Button>
          <Button onClick={handleReset}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/5 font-semibold h-12 text-sm md:h-14 md:text-base">
            Resetar
          </Button>
        </div>

        {lastSaved && <p className="text-[#C9A96E] text-xs text-center mt-4">✓ Salvo em {lastSaved}</p>}
        <p className="text-white/20 text-xs text-center mt-2 mb-4">Alterações aplicadas imediatamente em novas reservas.</p>
      </div>
    </div>
  );
}
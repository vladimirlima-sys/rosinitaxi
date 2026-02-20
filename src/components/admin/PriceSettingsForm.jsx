import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PriceSettingsForm() {
  const [settings, setSettings] = useState({
    standard_price_per_km: 2.35,
    base_fare: 10,
    airport_fee: 0,
    night_surcharge_percentage: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await base44.entities.PriceSettings.list();
        if (result.length > 0) {
          setSettings(result[0]);
        }
      } catch (err) {
        toast.error('Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settings.id) {
        await base44.entities.PriceSettings.update(settings.id, settings);
        toast.success('Configurações atualizadas com sucesso');
      } else {
        await base44.entities.PriceSettings.create(settings);
        toast.success('Configurações criadas com sucesso');
      }
    } catch (err) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-white text-center py-8">Carregando...</div>;
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-xl mx-auto">
      <h2 className="text-white text-2xl font-light mb-8">Configurações de Preço</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Preço por KM (STANDARD) - CHF</Label>
          <Input
            type="number"
            step="0.01"
            value={settings.standard_price_per_km}
            onChange={e => handleChange('standard_price_per_km', e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Taxa Base - CHF (opcional)</Label>
          <Input
            type="number"
            step="0.01"
            value={settings.base_fare}
            onChange={e => handleChange('base_fare', e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Taxa Aeroporto - CHF (opcional)</Label>
          <Input
            type="number"
            step="0.01"
            value={settings.airport_fee}
            onChange={e => handleChange('airport_fee', e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Taxa Noturna - % (opcional)</Label>
          <Input
            type="number"
            step="0.1"
            value={settings.night_surcharge_percentage}
            onChange={e => handleChange('night_surcharge_percentage', e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-8 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-12"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Configurações'
        )}
      </Button>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Save, Loader2 } from 'lucide-react';

export default function TaxSettingsForm({ onTaxesUpdated }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      const allSettings = await base44.entities.TaxSettings.list();
      if (allSettings.length > 0) {
        setSettings(allSettings[0]);
      } else {
        // Create default settings
        const defaultSettings = {
          avs_percentage: 5.15,
          ai_percentage: 0.8,
          impot_source_percentage: 0,
          impot_cantonal_percentage: 8.5,
          impot_communal_percentage: 8,
          other_deductions_percentage: 0,
          notes: 'Paramètres par défaut - Vaud, Suisse'
        };
        const created = await base44.entities.TaxSettings.create(defaultSettings);
        setSettings(created);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax settings:', error);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.TaxSettings.update(settings.id, settings);
      if (onTaxesUpdated) onTaxesUpdated();
    } catch (error) {
      console.error('Error saving tax settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-black/50">Chargement...</div>;
  }

  if (!settings) return null;

  const totalTaxPercentage = 
    (settings.avs_percentage || 0) +
    (settings.ai_percentage || 0) +
    (settings.apg_percentage || 0) +
    (settings.ac_percentage || 0) +
    (settings.af_percentage || 0) +
    (settings.pc_percentage || 0) +
    (settings.cont_frais_admin_percentage || 0) +
    (settings.impot_source_percentage || 0) +
    (settings.impot_cantonal_percentage || 0) +
    (settings.impot_communal_percentage || 0) +
    (settings.other_deductions_percentage || 0);

  return (
    <div className="bg-black border border-black/40 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">Configuração de Impostos - Vaud, Suíça</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-white/60 text-sm mb-2">AVS (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.avs_percentage || 0}
            onChange={(e) => handleChange('avs_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Assurance-Vieillesse et Survivants</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">AI (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.ai_percentage || 0}
            onChange={(e) => handleChange('ai_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Assurance-Invalidité</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">APG (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.apg_percentage || 0}
            onChange={(e) => handleChange('apg_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Assurance-Placement Gratuit</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">AC (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.ac_percentage || 0}
            onChange={(e) => handleChange('ac_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Assurance Chômage</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">AF (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.af_percentage || 0}
            onChange={(e) => handleChange('af_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Allocations Familiales</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">PC (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.pc_percentage || 0}
            onChange={(e) => handleChange('pc_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Prestations Complémentaires</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Cont. Frais Admin (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.cont_frais_admin_percentage || 0}
            onChange={(e) => handleChange('cont_frais_admin_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Contribution Frais Administratifs</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Impôt à la Source (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.impot_source_percentage || 0}
            onChange={(e) => handleChange('impot_source_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Optionnel</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Impôt Cantonal (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.impot_cantonal_percentage || 0}
            onChange={(e) => handleChange('impot_cantonal_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Vaud</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Impôt Communal (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.impot_communal_percentage || 0}
            onChange={(e) => handleChange('impot_communal_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Vaud</p>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Autres Déductions (%)</label>
          <input
            type="number"
            step="0.01"
            value={settings.other_deductions_percentage || 0}
            onChange={(e) => handleChange('other_deductions_percentage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          />
          <p className="text-white/40 text-xs mt-1">Autres déductions</p>
        </div>
      </div>

      <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-6">
        <p className="text-white text-sm mb-1">Total de Déductions</p>
        <p className="text-white text-2xl font-bold">{totalTaxPercentage.toFixed(2)}%</p>
      </div>

      <div className="mb-4">
        <label className="block text-white/60 text-sm mb-2">Notes</label>
        <textarea
          value={settings.notes || ''}
          onChange={(e) => setSettings(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          rows="2"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer les configurations
      </button>
    </div>
  );
}
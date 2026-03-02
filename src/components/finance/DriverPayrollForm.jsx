import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function DriverPayrollForm({ drivers, onCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    hourly_rate: 25,
    avs_percentage: 5.15,
    ai_percentage: 0.8,
    apg_percentage: 0,
    ac_percentage: 1.1,
    laa_percentage: 1.3,
    lpp_percentage: 7.7,
    impot_source_percentage: 0,
    holiday_weeks: 4,
    holiday_allowance_percentage: 8.33,
    notes: ''
  });

  const handleDriverChange = (e) => {
    const driverId = e.target.value;
    const driver = drivers.find(d => d.id === driverId);
    setFormData({
      ...formData,
      driver_id: driverId,
      driver_name: driver?.name || ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.driver_id) {
      alert('Sélectionnez un chauffeur');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.DriverPayrollSettings.create(formData);
      alert('Configurations de salaire créées avec succès!');
      setFormData({
        driver_id: '',
        driver_name: '',
        hourly_rate: 25,
        avs_percentage: 5.15,
        ai_percentage: 0.8,
        apg_percentage: 0,
        ac_percentage: 1.1,
        laa_percentage: 1.3,
        lpp_percentage: 7.7,
        impot_source_percentage: 0,
        holiday_weeks: 4,
        holiday_allowance_percentage: 8.33,
        notes: ''
      });
      setExpanded(false);
      onCreated();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des configurations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-bold text-gray-900">Configurer le Salaire du Chauffeur</h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chauffeur *</label>
              <select
                value={formData.driver_id}
                onChange={handleDriverChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Sélectionner un chauffeur</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxa Horária (CHF)</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AVS (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.avs_percentage}
                onChange={(e) => handleInputChange('avs_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.ai_percentage}
                onChange={(e) => handleInputChange('ai_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AC (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.ac_percentage}
                onChange={(e) => handleInputChange('ac_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LAA (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.laa_percentage}
                onChange={(e) => handleInputChange('laa_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LPP (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.lpp_percentage}
                onChange={(e) => handleInputChange('lpp_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Impôt à la Source (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.impot_source_percentage}
                onChange={(e) => handleInputChange('impot_source_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semanas de Férias</label>
              <input
                type="number"
                value={formData.holiday_weeks}
                onChange={(e) => handleInputChange('holiday_weeks', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subsídio de Férias (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.holiday_allowance_percentage}
                onChange={(e) => handleInputChange('holiday_allowance_percentage', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExpanded(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
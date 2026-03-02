import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Mail, Download, Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PayslipManagement() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
      return;
    }
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    setLoading(true);
    const records = await base44.entities.PayslipRecord.list('-created_date', 100);
    setPayslips(records);
    setLoading(false);
  };

  const handleSendPayslip = async (payslip) => {
    if (!payslip.driver_email) {
      alert('Email do motorista não disponível');
      return;
    }

    setSendingId(payslip.id);
    try {
      await base44.functions.invoke('sendPayslipEmail', {
        payslipId: payslip.id,
        driverEmail: payslip.driver_email,
        driverName: payslip.driver_name,
        month: payslip.month,
        year: payslip.year
      });

      // Update record
      await base44.entities.PayslipRecord.update(payslip.id, {
        sent_to_driver: true,
        sent_date: new Date().toISOString()
      });

      alert('Ficha de salário enviada com sucesso!');
      fetchPayslips();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar ficha de salário');
    } finally {
      setSendingId(null);
    }
  };

  const handleDeletePayslip = async (id) => {
    if (confirm('Tem certeza que deseja deletar esta ficha?')) {
      await base44.entities.PayslipRecord.delete(id);
      fetchPayslips();
    }
  };

  const monthNames = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5C300] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <a
          href={createPageUrl('AdminPanel')}
          className="flex items-center gap-1 text-black/40 hover:text-black/70 transition-colors mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
        </a>

        <div className="mb-8">
          <h1 className="text-black text-4xl font-extralight tracking-[0.15em] uppercase">ROSINI</h1>
          <h2 className="text-black/70 text-2xl font-extralight mt-2">Gestão de Fichas de Salário</h2>
          <div className="w-16 h-[1px] bg-black/40 mt-4" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Motorista</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Período</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Valor Bruto</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Valor Líquido</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Nenhuma ficha de salário criada ainda
                    </td>
                  </tr>
                ) : (
                  payslips.map(payslip => (
                    <tr key={payslip.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{payslip.driver_name}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {monthNames[payslip.month]} {payslip.year}
                      </td>
                      <td className="px-6 py-4 text-gray-700">CHF {payslip.gross_amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">CHF {payslip.net_amount?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {payslip.sent_to_driver ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Enviado
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!payslip.sent_to_driver && (
                            <Button
                              onClick={() => handleSendPayslip(payslip)}
                              disabled={sendingId === payslip.id}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                            >
                              {sendingId === payslip.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              Enviar
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeletePayslip(payslip.id)}
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Deletar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
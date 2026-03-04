import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Calendar } from 'lucide-react';

export default function FinancialReports() {
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['financialReports'],
    queryFn: () => base44.entities.FinancialReport.list('-created_date'),
    initialData: [],
  });

  const handleDownloadPDF = (report) => {
    try {
      const binaryString = atob(report.pdf_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-financier-${report.month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Erreur lors du téléchargement du rapport');
    }
  };

  const handleDelete = async (reportId) => {
    if (confirm('Tem certeza que deseja deletar este relatório?')) {
      try {
        await base44.entities.FinancialReport.delete(reportId);
        refetch();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression du rapport');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rapports Financiers</h1>
          <p className="text-gray-600">Consultez et téléchargez tous les rapports mensuels enregistrés</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des rapports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Aucun rapport disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      {report.month_label}
                    </h3>
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-600">Receitas</p>
                        <p className="text-xl font-bold text-green-600">CHF {report.total_revenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Despesas</p>
                        <p className="text-xl font-bold text-red-600">CHF {report.total_expenses.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Impostos</p>
                        <p className="text-xl font-bold text-orange-600">CHF {report.total_taxes.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Resultado</p>
                        <p className={`text-xl font-bold ${report.net_result >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          CHF {report.net_result.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{report.num_bookings} courses | Généré le {new Date(report.created_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadPDF(report)}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleDelete(report.id)}
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
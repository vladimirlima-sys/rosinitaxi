import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function TaximeterSuccess() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sendReceipt = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('Session ID not found');
          return;
        }

        // Send receipt via backend function
        const response = await base44.functions.invoke('sendTaxiReceipt', { sessionId });

        if (response.data?.success) {
          setStatus('success');
          setMessage('Paiement confirmé! Le reçu a été envoyé à l\'email du client.');
          setTimeout(() => {
            window.location.href = createPageUrl('TaximeterDriver');
          }, 5000);
        } else {
          setStatus('warning');
          setMessage('Paiement confirmé, mais l\'envoi du reçu a échoué.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur lors du traitement du paiement');
        console.error(error);
      }
    };

    sendReceipt();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-light text-white mb-2">Traitement du paiement...</h1>
            <p className="text-slate-400">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-white mb-2">Paiement confirmé!</h1>
            <p className="text-slate-300 mb-4">{message}</p>
            <p className="text-slate-400 text-sm">Redirection dans 5 secondes...</p>
          </>
        )}

        {status === 'warning' && (
          <>
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-white mb-2">Paiement confirmé</h1>
            <p className="text-slate-300 mb-4">{message}</p>
            <a
              href={createPageUrl('TaximeterDriver')}
              className="inline-block bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition-all"
            >
              Retour au taximètre
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-white mb-2">Erreur</h1>
            <p className="text-slate-300 mb-4">{message}</p>
            <a
              href={createPageUrl('TaximeterDriver')}
              className="inline-block bg-yellow-400 text-slate-900 font-bold px-6 py-2 rounded-lg hover:bg-yellow-300 transition-all"
            >
              Retour au taximètre
            </a>
          </>
        )}
      </div>
    </div>
  );
}
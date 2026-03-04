import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function CredentialManager({ driver }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasCredential, setHasCredential] = useState(false);

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    if (password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não correspondem');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createDriverCredential', {
        driver_id: driver.id,
        driver_name: driver.name,
        email: email.toLowerCase(),
        password,
        allowed_pages: ['ActiveTrips', 'CompletedTrips', 'Earnings']
      });

      if (data.success) {
        setSuccess('Credencial criada com sucesso!');
        setHasCredential(true);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar credencial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Acesso Seguro
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {hasCredential ? '✓ Credencial ativa' : 'Configure email e senha para acesso seguro'}
          </p>
        </div>
        {hasCredential && <Check className="w-5 h-5 text-green-600" />}
      </div>

      {showForm && (
        <form onSubmit={handleCreateCredential} className="space-y-3 bg-white p-3 rounded border border-blue-100">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="motorista@email.com"
                className="pl-8"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Senha (min. 8 caracteres)</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Confirmar Senha</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 flex gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : ''}
              Criar Credencial
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {!showForm && !hasCredential && (
        <Button onClick={() => setShowForm(true)} size="sm" className="w-full">
          Configurar Acesso Seguro
        </Button>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-2 text-green-700 text-sm flex gap-2 mt-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
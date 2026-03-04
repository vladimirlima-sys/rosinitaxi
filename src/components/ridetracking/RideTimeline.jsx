import { CheckCircle2, Clock, AlertCircle, Navigation2 } from 'lucide-react';

const statusSteps = [
  { status: 'pending', label: 'Pagamento Pendente', icon: Clock },
  { status: 'confirmed', label: 'Reserva Confirmada', icon: CheckCircle2 },
  { status: 'on_the_way', label: 'Motorista a Caminho', icon: Navigation2 },
  { status: 'arrived', label: 'Motorista Chegou', icon: CheckCircle2 },
  { status: 'in_progress', label: 'Corrida em Andamento', icon: Navigation2 },
  { status: 'completed', label: 'Corrida Finalizada', icon: CheckCircle2 },
];

export default function RideTimeline({ booking }) {
  const getStatusIndex = () => {
    if (booking.payment_status === 'paid') {
      if (booking.ride_status === 'completed') return 5;
      if (booking.ride_status === 'in_progress') return 4;
      if (booking.ride_status === 'arrived') return 3;
      if (booking.ride_status === 'on_the_way') return 2;
      return 1;
    }
    return 0;
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white text-sm font-semibold mb-6">Andamento da Corrida</h3>
      <div className="space-y-4">
        {statusSteps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#C9A96E]/20 border border-[#C9A96E]'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isCompleted ? 'text-[#C9A96E]' : 'text-white/40'
                    }`}
                  />
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 ${
                      isCompleted ? 'bg-[#C9A96E]/20' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
              <div className="pt-2">
                <p
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-[#C9A96E]'
                      : isCompleted
                      ? 'text-white/70'
                      : 'text-white/40'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
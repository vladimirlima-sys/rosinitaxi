import { CheckCircle2, Clock, Navigation2, MapPin, Flag } from 'lucide-react';

export default function RideTimeline({ booking, t }) {
  const statusSteps = [
    { key: 'booked',    label: t.statusBooked,    icon: CheckCircle2 },
    { key: 'en_route',  label: t.statusEnRoute,   icon: Navigation2  },
    { key: 'arrived',   label: t.statusArrived,   icon: MapPin       },
    { key: 'completed', label: t.statusCompleted, icon: Flag         },
  ];
  const getStatusIndex = () => {
    const rs = booking.ride_status;
    if (rs === 'completed') return 3;
    if (rs === 'arrived')   return 2;
    if (rs === 'en_route')  return 1;
    return 0; // booked / paid but not yet started
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <h3 className="text-white text-sm font-semibold mb-6">{t.rideStatus}</h3>
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
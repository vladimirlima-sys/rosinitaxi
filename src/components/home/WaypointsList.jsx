import React from 'react';
import { Input } from '@/components/ui/input';
import { X, GripVertical } from 'lucide-react';

export default function WaypointsList({ waypoints, onUpdate, onRemove, suggestions }) {
  return (
    <div className="space-y-2">
      {waypoints.map((waypoint, index) => (
        <div key={index} className="relative">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />
            <div className="flex-1">
              <Input
                placeholder={`Paragem ${index + 1}`}
                value={waypoint.address}
                onChange={e => onUpdate(index, e.target.value)}
                className="bg-white/5 border-white/10 text-[#C9A96E] placeholder:text-[#C9A96E]/60 focus:border-[#C9A96E] h-10"
                autoComplete="off"
              />

              {/* Suggestions dropdown */}
              {suggestions[index]?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-[#C9A96E]/20 rounded-lg overflow-hidden z-40 shadow-lg">
                  {suggestions[index].map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        onUpdate(index, suggestion.display_name);
                      }}
                      className="w-full text-left px-3 py-2 text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors text-xs border-b border-white/5 last:border-b-0"
                    >
                      {suggestion.display_name.split(',').slice(0, 2).join(',')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
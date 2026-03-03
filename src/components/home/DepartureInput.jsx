import React, { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, RotateCw, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartureInput({ value, onChange, placeholder, isLocating, onLocate, t }) {
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef(null);

  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
  }, []);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    onChange(val);

    if (val.length > 2 && autocompleteService.current) {
      try {
        const predictions = await autocompleteService.current.getPlacePredictions({
          input: val,
          componentRestrictions: { country: ['ch', 'fr', 'it', 'de', 'at', 'li'] }
        });
        setSuggestions(predictions.predictions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (description) => {
    onChange(description);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3 relative">
      <Label className="text-white/70 text-sm font-medium">{t.departure}</Label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#C9A96E] z-10" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A96E] focus:bg-white/[0.08] h-12 pl-12 pr-20 transition-all rounded-xl"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setSuggestions([]); setShowSuggestions(false); }}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-white/50 hover:text-white" />
            </button>
          )}
          <button
            type="button"
            onClick={onLocate}
            disabled={isLocating}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            title="Localizar minha posição"
          >
            {isLocating ? (
              <Loader className="w-4 h-4 text-[#C9A96E] animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4 text-[#C9A96E] hover:text-[#B8955D]" />
            )}
          </button>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#C9A96E]/30 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion.description)}
              className="w-full text-left px-4 py-3 hover:bg-[#C9A96E]/10 border-b border-white/5 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">{suggestion.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  showLocateButton,
  isLocating,
  onLocate,
  t
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timeoutRef = useRef(null);

  // Nominatim search
  const searchNominatim = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ch,de,fr,it,at,be,nl,es`
      );
      const results = await response.json();
      setSuggestions(results);
      setShowDropdown(true);
    } catch (err) {
      setError('Erro ao buscar endereços');
      console.error('Nominatim error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchNominatim(val);
    }, 300);
  };

  const handleSelect = (result) => {
    onChange(result.display_name);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div className="relative space-y-2">
      <label className="text-zinc-50 text-sm font-semibold flex items-center gap-2">
        <MapPin className="text-[#C9A96E] w-4 h-4" />
        {label}
      </label>
      
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm placeholder:text-black/30 focus:border-black h-12 transition-all"
        />
        
        {showLocateButton && (
          <button
            onClick={onLocate}
            disabled={isLocating}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          </button>
        )}

        {value && (
          <button
            onClick={() => { onChange(''); setSuggestions([]); }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3 py-2 hover:bg-black/5 border-b border-black/10 last:border-b-0 text-sm text-black"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-black/50">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t.autocompleteLoading || 'Procurando endereços...'}
        </div>
      )}
    </div>
  );
}
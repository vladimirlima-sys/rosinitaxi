import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigation, X, Check, Loader, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function StopAutocomplete({ value, onChange, placeholder, onLocate, isLocating, onSave, onCancel }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);

    suggestionTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await base44.functions.invoke('hereGeocoding', { query: val });
        if (res.data?.results) {
          setSuggestions(res.data.results.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.formattedAddress || suggestion.address);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.trim().length >= 3 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/20 rounded text-white text-xs px-2 py-1 outline-none placeholder:text-white/30"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/20 rounded text-xs z-50">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="px-2 py-1.5 hover:bg-white/10 cursor-pointer text-white/70 hover:text-white transition-colors text-left border-b border-white/5 last:border-b-0"
                >
                  <p className="truncate">{sug.formattedAddress || sug.address}</p>
                  {sug.city && <p className="text-white/40 text-[10px] truncate">{sug.city}</p>}
                </div>
              ))}
            </div>
          )}

          {searching && <Loader className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-white/40" />}
        </div>

        <button onClick={onLocate} disabled={isLocating} title="Géolocalisation" className="text-blue-400 hover:text-blue-300 disabled:opacity-50 shrink-0">
          {isLocating ? <Loader className="w-4 h-4 animate-spin" /> : <Navigation className="w-3 h-3" />}
        </button>
        <button onClick={onSave} className="text-green-400 hover:text-green-300 shrink-0"><Check className="w-4 h-4" /></button>
        <button onClick={onCancel} className="text-white/30 hover:text-red-400 shrink-0"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
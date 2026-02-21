import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hereCache } from '@/components/hereCache';

const DEBOUNCE_DELAY = 500;
const MIN_INPUT_LENGTH = 2;

export default function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  onSelect,
  showLocateButton,
  isLocating,
  onLocate,
  t,
  sessionToken,
  onTokenRefresh
}) {
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  const suggestionsRef = useRef(null);

  // Fetch suggestions using HERE API
  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      let results = hereCache.getGeocoding(input);
      
      if (!results) {
        // Cache miss - fetch from API
        const response = await base44.functions.invoke('hereGeocoding', {
          searchText: input,
          lang: 'pt'
        });

        results = response.data?.results || [];
        
        // Store in cache
        if (results.length > 0) {
          hereCache.setGeocoding(input, results);
        }
      }

      if (results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('HERE Geocoding error:', err);
      setError(t?.autocompleteService || 'Service unavailable');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, DEBOUNCE_DELAY);
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.address);

    if (onSelect) {
      onSelect({
        description: suggestion.address,
        formattedAddress: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng
      });
    }

    // Dispatch event for RouteCalculator
    window.dispatchEvent(new CustomEvent('placeSelected', {
      detail: {
        address: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng
      }
    }));

    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onTokenRefresh) {
      onTokenRefresh();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setError(null);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="space-y-3 relative z-[100]">
      <Label className="bg-transparent text-gray-50 text-sm font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</Label>
      <div className="relative group">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-black/20 placeholder:text-black/30 focus:border-black h-12 transition-all"
          autoComplete="off" />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading &&
            <div className="p-1.5">
              <Loader className="w-4 h-4 text-black/50 animate-spin" />
            </div>
          }
          {!isLoading && value &&
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-black/10 rounded-lg transition-all"
              title={t?.close || 'Clear'}>
              <X className="w-4 h-4 text-black/40 hover:text-black/60" />
            </button>
          }
          {showLocateButton && !isLoading && !value &&
            <button
              type="button"
              onClick={onLocate}
              disabled={isLocating}
              className="p-1.5 hover:bg-black/10 rounded-lg transition-all disabled:opacity-50"
              title={t?.availableNow || 'Use my location'}>
              {isLocating ?
                <Loader className="w-4 h-4 text-black/50 animate-spin" /> :
                <MapPin className="w-4 h-4 text-black/60 hover:text-black" />
              }
            </button>
          }
        </div>
      </div>

      {error &&
        <p className="text-red-400/70 text-xs">{error}</p>
      }

      {showSuggestions && suggestions.length > 0 &&
        <div className="fixed bg-white border border-black/20 rounded-xl shadow-2xl z-[10000] max-h-72 overflow-hidden flex flex-col"
          style={{
            top: inputRef.current?.getBoundingClientRect().bottom + 8,
            left: inputRef.current?.getBoundingClientRect().left,
            width: inputRef.current?.getBoundingClientRect().width
          }}>
          <div
            ref={suggestionsRef}
            className="overflow-y-auto">
            {suggestions.map((suggestion, index) =>
              <button
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-3.5 border-b border-black/5 last:border-b-0 transition-colors ${
                  index === selectedIndex ?
                    'bg-[#F5C300]/30' :
                    'hover:bg-[#F5C300]/20'}`
                }>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-black/60 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-black text-sm font-medium">
                      {suggestion.address}
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      }

      {showSuggestions && isLoading &&
        <div className="fixed bg-white border border-black/20 rounded-xl shadow-2xl z-[10000] p-4 flex items-center justify-center"
          style={{
            top: inputRef.current?.getBoundingClientRect().bottom + 8,
            left: inputRef.current?.getBoundingClientRect().left,
            width: inputRef.current?.getBoundingClientRect().width
          }}>
          <Loader className="w-4 h-4 text-black/50 animate-spin mr-2" />
          <span className="text-black/60 text-sm">{t?.autocompleteLoading || 'Searching...'}</span>
        </div>
      }
    </div>
  );
}
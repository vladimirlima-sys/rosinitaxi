import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader, X } from 'lucide-react';

const DEBOUNCE_DELAY = 300;
const MIN_INPUT_LENGTH = 2;
const COUNTRIES = ['ch', 'fr', 'it', 'de', 'at', 'li'];

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
}) {
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  const suggestionsRef = useRef(null);

  // Initialize Google Places Services
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps?.places) {
      try {
        // Using AutocompleteService for now (legacy but still supported)
        if (google.maps.places.AutocompleteService) {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        }
      } catch (err) {
        console.error('Google Places initialization error:', err);
      }
    }
  }, []);

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    if (!autocompleteServiceRef.current) {
      setError(t?.addressSuggestions || 'Service unavailable');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await autocompleteServiceRef.current.getPlacePredictions({
        input,
        componentRestrictions: { country: COUNTRIES },
        sessionToken,
      });

      const predictions = result.predictions || [];
      setSuggestions(predictions);
      setShowSuggestions(predictions.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Autocomplete fetch error:', err);
      setError(t?.estimateDistanceError || 'Error fetching suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, t]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setError(null);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, DEBOUNCE_DELAY);
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.description);

    if (onSelect) {
      try {
        // Use geocoding to get coordinates if needed
        if (typeof google !== 'undefined' && google.maps?.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: suggestion.description }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              const place = results[0];
              onSelect({
                description: suggestion.description,
                placeId: suggestion.place_id,
                formattedAddress: place.formatted_address,
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
              });
            }
          });
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }

    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
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
    <div className="space-y-3 relative">
      <Label className="text-white/70 text-sm font-medium">{label}</Label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#C9A96E] z-10" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A96E] focus:bg-white/[0.08] h-12 pl-12 pr-12 transition-all rounded-xl"
          autoComplete="off"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="p-1.5">
              <Loader className="w-4 h-4 text-[#C9A96E] animate-spin" />
            </div>
          )}
          {!isLoading && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              title={t?.close || 'Clear'}
            >
              <X className="w-4 h-4 text-white/40 hover:text-white/60" />
            </button>
          )}
          {showLocateButton && !isLoading && !value && (
            <button
              type="button"
              onClick={onLocate}
              disabled={isLocating}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              title={t?.availableNow || 'Use my location'}
            >
              {isLocating ? (
                <Loader className="w-4 h-4 text-[#C9A96E] animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-[#C9A96E] hover:text-[#B8955D]" />
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400/70 text-xs">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#C9A96E]/30 rounded-xl shadow-2xl z-50 max-h-72 overflow-hidden flex flex-col">
          <div
            ref={suggestionsRef}
            className="overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? 'bg-[#C9A96E]/20'
                    : 'hover:bg-[#C9A96E]/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">
                      {suggestion.description}
                    </p>
                    {suggestion.secondary_text && (
                      <p className="text-white/40 text-xs truncate">
                        {suggestion.secondary_text}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && isLoading && (
        <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-[#C9A96E]/30 rounded-xl shadow-2xl z-50 p-4 flex items-center justify-center">
          <Loader className="w-4 h-4 text-[#C9A96E] animate-spin mr-2" />
          <span className="text-white/60 text-sm">{t?.addressSuggestions || 'Searching...'}</span>
        </div>
      )}
    </div>
  );
}
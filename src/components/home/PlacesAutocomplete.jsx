import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader, X } from 'lucide-react';

const DEBOUNCE_DELAY = 300;
const MIN_INPUT_LENGTH = 2;
const COUNTRIES = ['ch', 'fr', 'it', 'de', 'at', 'li'];

const getAddressComponents = (addressComponents) => {
  if (!addressComponents) return {};

  const components = {};
  addressComponents.forEach((component) => {
    const type = component.types[0];
    switch (type) {
      case 'street_number':
        components.street_number = component.long_name;
        break;
      case 'route':
        components.street = component.long_name;
        break;
      case 'locality':
        components.city = component.long_name;
        break;
      case 'administrative_area_level_2':
        components.district = component.long_name;
        break;
      case 'postal_code':
        components.postal_code = component.long_name;
        break;
      case 'country':
        components.country = component.long_name;
        break;
      default:
        break;
    }
  });
  return components;
};

const formatAddressDisplay = (placeDetails) => {
  const comp = getAddressComponents(placeDetails?.address_components);
  const parts = [];

  if (comp.street) parts.push(comp.street);
  if (comp.street_number) parts.push(comp.street_number);
  if (comp.district) parts.push(comp.district);
  if (comp.city) parts.push(comp.city);
  if (comp.postal_code) parts.push(comp.postal_code);

  return parts.join(', ');
};

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
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  const suggestionsRef = useRef(null);

  // Initialize Places API Services
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const initServices = () => {
      attempts++;
      if (typeof google !== 'undefined' && google.maps?.places?.AutocompleteService) {
        try {
          if (!autocompleteServiceRef.current) {
            autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          }
          if (!placesServiceRef.current) {
            const div = document.createElement('div');
            placesServiceRef.current = new google.maps.places.PlacesService(div);
          }
          console.log('✓ Places API initialized');
        } catch (err) {
          console.error('Places API init error:', err);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(initServices, 100);
      }
    };

    initServices();
  }, []);

  // Fetch suggestions using Places API
  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    if (!autocompleteServiceRef.current) {
      setError(t?.autocompleteService || 'Service unavailable');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await autocompleteServiceRef.current.getPlacePredictions({
        input,
        componentRestrictions: { country: COUNTRIES },
        sessionToken
      });

      if (result?.predictions && result.predictions.length > 0) {
        setSuggestions(result.predictions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Places API error:', err);
      setError(t?.autocompleteService || 'Service unavailable');
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

    if (onSelect && placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['formatted_address', 'geometry', 'address_components'],
          sessionToken
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            onSelect({
              description: suggestion.description,
              placeId: suggestion.place_id,
              formattedAddress: place.formatted_address,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng()
            });
          }
        }
      );
    }

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
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-black z-10" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur} className="bg-[#fcf6ab] text-black px-3 py-1 text-base rounded-xl flex w-full shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border border-black/20 placeholder:text-black/30 focus:border-black h-12 transition-all"

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
            key={suggestion.place_id}
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
                      {suggestion.description}
                    </p>
                    {suggestion.secondary_text &&
                <p className="text-black/40 text-xs mt-1">
                        {suggestion.secondary_text}
                      </p>
                }
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
    </div>);

}
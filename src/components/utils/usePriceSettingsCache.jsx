import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'price_settings_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function usePriceSettingsCache() {
  const [priceSettings, setPriceSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPriceSettings(data);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const settings = await base44.entities.PriceSettings.list();
        const freshData = settings?.[0] || null;
        setPriceSettings(freshData);
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error loading price settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.PriceSettings.subscribe((event) => {
      setPriceSettings(event.data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: event.data,
        timestamp: Date.now()
      }));
    });

    return unsubscribe;
  }, []);

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { priceSettings, loading, invalidateCache };
}
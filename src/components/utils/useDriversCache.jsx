import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'drivers_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useDriversCache() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setDrivers(data);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const fresh = await base44.entities.Driver.filter({ status: 'active' });
        setDrivers(fresh);
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: fresh,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error loading drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, []);

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { drivers, loading, invalidateCache };
}
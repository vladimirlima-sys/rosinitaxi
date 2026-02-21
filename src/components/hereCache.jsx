// Cache manager for HERE API calls
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CACHE_PREFIX = 'here_cache_';

export const hereCache = {
  // Get cached geocoding result
  getGeocoding: (searchText) => {
    const key = `${CACHE_PREFIX}geo_${searchText.toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  },

  // Store geocoding result
  setGeocoding: (searchText, data) => {
    const key = `${CACHE_PREFIX}geo_${searchText.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },

  // Get cached route
  getRoute: (depLat, depLng, arrLat, arrLng) => {
    const key = `${CACHE_PREFIX}route_${depLat}_${depLng}_${arrLat}_${arrLng}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  },

  // Store route result
  setRoute: (depLat, depLng, arrLat, arrLng, data) => {
    const key = `${CACHE_PREFIX}route_${depLat}_${depLng}_${arrLat}_${arrLng}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },

  // Clear all cache
  clearAll: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};
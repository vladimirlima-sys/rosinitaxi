import { useEffect } from 'react';

export default function GoogleMapsLoader() {
  useEffect(() => {
    if (window.google?.maps?.places) return;

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAdmO8dotir_WQEV-27tmhZjUh_6T0o010&libraries=places,routes&loading=async';
    script.async = true;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
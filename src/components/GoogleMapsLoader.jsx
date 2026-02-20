import { useEffect } from 'react';

export default function GoogleMapsLoader() {
  useEffect(() => {
    if (window.google) return;

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAdmO8dotir_WQEV-27tmhZjUh_6T0o010&libraries=places,directions';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
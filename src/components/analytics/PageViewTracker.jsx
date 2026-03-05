import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function PageViewTracker({ pageName }) {
  useEffect(() => {
    const trackView = async () => {
      // Get or create session ID
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('session_id', sessionId);
      }

      try {
        await base44.functions.invoke('trackPageView', {
          pageName,
          sessionId,
          referrer: document.referrer
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackView();
  }, [pageName]);

  return null;
}
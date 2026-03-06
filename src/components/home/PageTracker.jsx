import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getOrCreateSessionId() {
  let sid = sessionStorage.getItem('visit_session_id');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visit_session_id', sid);
  }
  return sid;
}

export default function PageTracker({ page = 'Home' }) {
  const visitIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const day = `${month}-${String(now.getDate()).padStart(2, '0')}`;

    // Register visit
    base44.entities.PageVisit.create({
      session_id: sessionId,
      page,
      language: navigator.language || 'fr',
      user_agent: navigator.userAgent.substring(0, 200),
      referrer: document.referrer.substring(0, 200),
      month,
      day,
      hour: now.getHours(),
      device_type: getDeviceType(),
      is_active: true,
      last_seen: Date.now(),
    }).then(visit => {
      visitIdRef.current = visit.id;
    }).catch(() => {});

    // Heartbeat every 30s
    intervalRef.current = setInterval(() => {
      if (visitIdRef.current) {
        base44.entities.PageVisit.update(visitIdRef.current, {
          is_active: true,
          last_seen: Date.now(),
        }).catch(() => {});
      }
    }, 30000);

    // Mark inactive on leave
    const handleLeave = () => {
      if (visitIdRef.current) {
        base44.entities.PageVisit.update(visitIdRef.current, { is_active: false }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', handleLeave);
      handleLeave();
    };
  }, []);

  return null;
}
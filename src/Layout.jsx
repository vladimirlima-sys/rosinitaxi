import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminPushNotifications from '@/components/admin/AdminPushNotifications';

export default function Layout({ children, currentPageName }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const showNotifications = isAdmin && currentPageName !== 'Home' && currentPageName !== 'FAQ';

  return (
    <div>
      {children}
      <AdminPushNotifications isAdmin={showNotifications} />
    </div>
  );
}
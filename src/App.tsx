import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppRouter } from '@/router';

export function App() {
  const hydrate = useAuthStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <AppRouter />;
}

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

export function AuthHydrator() {
  const hydrate = useAuth(state => state.hydrate);
  
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  
  return null;
}

'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Desktop from '@/components/Desktop';

export default function DashboardPage() {
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSystemOverview = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/system/overview');
      setSystemOverview(data);
    } catch (err) {
      console.error('Failed to load system overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemOverview();
    const interval = setInterval(loadSystemOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full">
      <Desktop 
        systemOverview={systemOverview} 
      />
    </div>
  );
}

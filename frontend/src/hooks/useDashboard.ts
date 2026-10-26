import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { DashboardStats, VerificationSummary } from '../types';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<VerificationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, verificationsData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getVerifications(0, 10),
      ]);
      setStats(statsData);
      setRecentVerifications(verificationsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, recentVerifications, loading, error, refresh: fetchData };
}

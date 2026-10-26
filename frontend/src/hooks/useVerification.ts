import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { VerificationDetail } from '../types';

export function useVerification(verificationId: string | null) {
  const [verification, setVerification] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    if (!verificationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getVerification(verificationId);
      setVerification(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load verification detail');
    } finally {
      setLoading(false);
    }
  }, [verificationId]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const approve = async (action: 'APPROVE' | 'CANCEL') => {
    if (!verificationId) return;
    try {
      const updated = await apiClient.approveVerification(verificationId, action);
      setVerification(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to execute approval decision');
      throw err;
    }
  };

  return { verification, loading, error, refresh: fetchVerification, approve };
}

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createAbortController, apiCallWithRetry } from '@/lib/api';

interface UseApiOptions {
  retry?: boolean;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

export const useApi = <T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = createAbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = options.retry 
        ? await apiCallWithRetry(apiCall)
        : await apiCall();

      if (isMountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          data: result, 
          loading: false, 
          error: null 
        }));
        options.onSuccess?.(result);
      }
    } catch (error: any) {
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        const errorMessage = error?.message || 'An error occurred';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          retryCount: prev.retryCount + 1
        }));
        options.onError?.(error);
      }
    }
  }, [apiCall, options]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    isAborted: abortControllerRef.current?.signal.aborted || false
  };
};

// Hook for handling API mutations (POST, PUT, DELETE)
export const useApiMutation = <T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = options.retry 
        ? await apiCallWithRetry(() => mutationFn(params))
        : await mutationFn(params);

      setState(prev => ({ 
        ...prev, 
        data: result, 
        loading: false, 
        error: null 
      }));
      options.onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
      options.onError?.(error);
      throw error;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  return {
    ...state,
    mutate,
    reset
  };
};

// Hook for handling paginated data
export const usePaginatedApi = <T = any>(
  apiCall: (page: number) => Promise<{ results: T[]; count: number }>,
  initialPage: number = 1
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(pageNum);
      
      if (pageNum === 1) {
        setData(result.results);
      } else {
        setData(prev => [...prev, ...result.results]);
      }
      
      setTotalCount(result.count);
      setHasMore(result.results.length > 0);
      setPage(pageNum);
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const loadNextPage = useCallback(() => {
    if (!loading && hasMore) {
      loadPage(page + 1);
    }
  }, [loadPage, page, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    data,
    loading,
    error,
    page,
    totalCount,
    hasMore,
    loadNextPage,
    refresh,
    loadPage
  };
};

export default useApi;

import { useState, useEffect } from 'react';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  config: CacheConfig
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Intentar obtener del cache
        const cached = localStorage.getItem(config.key);
        if (cached) {
          const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
          const age = Date.now() - timestamp;

          // Si el cache es válido, usarlo
          if (age < config.ttl) {
            setData(data);
            setIsLoading(false);
            return;
          }
        }

        // Si no hay cache o expiró, hacer fetch
        const freshData = await fetchFn();
        
        // Guardar en cache
        const cacheEntry: CacheEntry<T> = {
          data: freshData,
          timestamp: Date.now()
        };
        localStorage.setItem(config.key, JSON.stringify(cacheEntry));

        setData(freshData);
        setError(null);

      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, config.key, config.ttl]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const freshData = await fetchFn();
      const cacheEntry: CacheEntry<T> = {
        data: freshData,
        timestamp: Date.now()
      };
      localStorage.setItem(config.key, JSON.stringify(cacheEntry));
      setData(freshData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh
  };
}
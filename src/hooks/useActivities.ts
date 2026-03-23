import { useEffect, useMemo, useState } from 'react';
import {
  buildActivityMeta,
  getCachedProcessedActivities,
  loadProcessedActivities,
} from '@/data/activities';
import type { ProcessedActivity } from '@/utils/utils';

const useActivities = () => {
  const [activities, setActivities] = useState<ProcessedActivity[]>(
    () => getCachedProcessedActivities() ?? []
  );
  const [isLoading, setIsLoading] = useState(!getCachedProcessedActivities());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadProcessedActivities()
      .then((loadedActivities) => {
        if (!cancelled) {
          setActivities(loadedActivities);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActivities([]);
          setIsLoading(false);
          setError('Activity data could not be loaded.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const meta = useMemo(() => buildActivityMeta(activities), [activities]);

  return {
    ...meta,
    error,
    isLoading,
  };
};

export default useActivities;

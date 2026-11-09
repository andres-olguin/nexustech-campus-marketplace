import { useCallback, useEffect, useRef, useState } from 'react';
import { getDollarRate, isFreshDollarRate, readSavedDollarRate, saveDollarRate } from '../services/publicApi.js';

export default function useExchangeRate() {
  const [result, setResult] = useState(() => ({ loading: false, rate: readSavedDollarRate(), error: '' }));
  const request = useRef(null);

  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, []);

  const load = useCallback(async (force = false) => {
    if (request.current || (!force && isFreshDollarRate(result.rate))) return;
    const controller = new AbortController();
    request.current = controller;
    setResult((current) => ({ ...current, loading: true, error: '' }));
    try {
      const rate = await getDollarRate(controller.signal);
      if (!controller.signal.aborted) {
        saveDollarRate(rate);
        setResult({ loading: false, rate, error: '' });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult((current) => ({ ...current, loading: false, error: error.message }));
      }
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [result.rate]);

  return { ...result, load };
}

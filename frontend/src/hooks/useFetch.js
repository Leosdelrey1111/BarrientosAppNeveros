import { useState, useEffect, useCallback } from "react";

/**
 * Hook genérico para llamadas a la API.
 * @param {Function} fetchFn - función que retorna una Promise (axios call)
 * @param {Array}    deps    - dependencias para re-ejecutar
 */
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

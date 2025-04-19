const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";
import { useState, useEffect } from 'react';
import { request } from 'graphql-request';

// 🔹 Function to Get CSRF Token
export function getCSRFToken(): string {
  return Object.fromEntries(
    document.cookie.split('; ').map(c => c.split('='))
  )['csrftoken'] || '';
}

// 🔹 Reusable GraphQL Fetch Hook
export function useFetchGraphQL<T>(query: string, variables: Record<string, any> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const endpoint = GRAPHQL_URL;
        const headers = { 'X-CSRFToken': getCSRFToken() };

        const result = await request<T>(endpoint, query, variables, headers);
        setData(result);
      } catch (err) {
        console.error("GraphQL fetch error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query, JSON.stringify(variables)]); // Re-fetch if query or variables change

  return { data, loading, error };
}
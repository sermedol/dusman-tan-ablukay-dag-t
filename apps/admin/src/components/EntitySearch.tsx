'use client';

import { Input, Card, CardContent, Button } from '@dusman/ui';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  status: string;
  verificationStatus?: string;
}

interface EntitySearchProps {
  onSelect?: (entity: SearchResult) => void;
  className?: string;
  filters?: {
    type?: string;
    status?: string;
  };
}

/**
 * Advanced entity search with Meilisearch integration
 * Supports full-text search with filtering
 */
export function EntitySearch({ onSelect, className, filters }: EntitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build filter array
        const filterParams: string[] = [];
        if (filters?.type) filterParams.push(`type:${filters.type}`);
        if (filters?.status) filterParams.push(`status:${filters.status}`);

        // In a real app, this would call search endpoint
        // For now, using list endpoint as fallback
        const data = await apiClient.get('/entities', {
          params: {
            q: searchQuery,
            filter: filterParams.length > 0 ? filterParams : undefined,
            limit: 10,
          },
        });

        setResults(Array.isArray(data) ? data : data.hits || []);
        setIsOpen(true);
      } catch (err) {
        setError('Search failed');
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSelect = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
    }
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getStatusBadgeColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-slate-100 text-slate-600',
      dissolved: 'bg-rose-100 text-rose-700',
      defunct: 'bg-amber-100 text-amber-700',
    };
    return colorMap[status] || 'bg-slate-100 text-slate-600';
  };

  const getVerificationBadgeColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      verified: 'bg-emerald-100 text-emerald-700',
      unverified: 'bg-slate-100 text-slate-600',
      needs_review: 'bg-amber-100 text-amber-700',
    };
    return colorMap[status || ''] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className={clsx('relative w-full', className)}>
      <Input
        label="Search Entities"
        placeholder="Search by name, type, or keyword..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        helperText={
          filters && Object.keys(filters).length > 0
            ? `Filtering by: ${Object.values(filters).join(', ')}`
            : undefined
        }
      />

      {error && <p className="text-rose-600 text-body-sm mt-xs">{error}</p>}

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-xs left-0 right-0 z-50 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-lg text-center text-slate-500">
                <div className="inline-block animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                <span className="ml-md">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-lg text-center text-slate-500 text-body-sm">
                {query ? 'No results found' : 'Start typing to search'}
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <li
                    key={result.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleSelect(result)}
                  >
                    <Link href={`/entities/${result.id}`}>
                      <div className="p-md hover:no-underline">
                        <div className="flex items-start justify-between gap-md mb-xs">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-body font-semibold text-slate-900 truncate">
                              {result.name}
                            </h4>
                            <p className="text-caption text-slate-500">{result.type}</p>
                          </div>
                          <div className="flex gap-xs flex-shrink-0">
                            <span
                              className={clsx(
                                'text-caption px-xs py-xs rounded-xs font-medium',
                                getStatusBadgeColor(result.status)
                              )}
                            >
                              {result.status}
                            </span>
                            {result.verificationStatus && (
                              <span
                                className={clsx(
                                  'text-caption px-xs py-xs rounded-xs font-medium',
                                  getVerificationBadgeColor(result.verificationStatus)
                                )}
                              >
                                {result.verificationStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {results.length > 0 && (
              <div className="p-md border-t border-slate-200 text-center">
                <Link href={`/entities?search=${encodeURIComponent(query)}`}>
                  <Button variant="tertiary" size="sm">
                    View all results
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@dusman/ui';
import { RelationshipGraph } from '@/components/RelationshipGraph';
import clsx from 'clsx';

interface Entity {
  id: string;
  canonicalName: string;
  shortName?: string;
  description?: string;
  type: string;
  status: string;
  verificationStatus: string;
  visibility: string;
  foundedAt?: string;
  closedAt?: string;
  websiteUrl?: string;
  metadataJson?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function EntityDetailPage() {
  const params = useParams();
  const entityId = params.id as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/entities/${entityId}`);
        setEntity(data);
        setError(null);
      } catch (err) {
        setError('Failed to load entity');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [entityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading entity...</div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rose-600">{error || 'Entity not found'}</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-slate-100 text-slate-600',
      dissolved: 'bg-rose-100 text-rose-700',
      defunct: 'bg-amber-100 text-amber-700',
    };
    return colorMap[status] || 'bg-slate-100 text-slate-600';
  };

  const getVerificationColor = (status: string) => {
    const colorMap: Record<string, string> = {
      verified: 'bg-emerald-100 text-emerald-700',
      unverified: 'bg-slate-100 text-slate-600',
      needs_review: 'bg-amber-100 text-amber-700',
      source_required: 'bg-rose-100 text-rose-700',
    };
    return colorMap[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-lg">
      <div className="max-w-6xl mx-auto space-y-lg">
        {/* Header */}
        <div className="bg-white rounded-base border border-slate-200 p-2xl">
          <div className="flex items-start justify-between mb-lg">
            <div className="flex-1">
              <h1 className="text-h1 font-semibold text-slate-900 mb-md">
                {entity.canonicalName}
              </h1>
              {entity.shortName && (
                <p className="text-body text-slate-600">Also known as: {entity.shortName}</p>
              )}
            </div>
            <div className="flex gap-md flex-shrink-0">
              <span
                className={clsx('text-caption px-md py-xs rounded-base font-medium', getStatusColor(entity.status))}
              >
                {entity.status}
              </span>
              <span
                className={clsx(
                  'text-caption px-md py-xs rounded-base font-medium',
                  getVerificationColor(entity.verificationStatus)
                )}
              >
                {entity.verificationStatus}
              </span>
            </div>
          </div>

          {entity.description && (
            <p className="text-body text-slate-700 mb-lg">{entity.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-md pt-lg border-t border-slate-200">
            <div>
              <p className="text-caption text-slate-600 mb-xs">Type</p>
              <p className="text-body font-semibold text-slate-900">{entity.type}</p>
            </div>
            <div>
              <p className="text-caption text-slate-600 mb-xs">Visibility</p>
              <p className="text-body font-semibold text-slate-900">{entity.visibility}</p>
            </div>
            {entity.foundedAt && (
              <div>
                <p className="text-caption text-slate-600 mb-xs">Founded</p>
                <p className="text-body font-semibold text-slate-900">
                  {new Date(entity.foundedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {entity.websiteUrl && (
              <div>
                <p className="text-caption text-slate-600 mb-xs">Website</p>
                <a
                  href={entity.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body font-semibold text-red-600 hover:text-red-700 truncate"
                >
                  Visit
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Relationship Graph */}
        <RelationshipGraph entityId={entityId} depth={2} />

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-500 text-center py-12">
              Timeline feature - Events for this entity will be displayed here
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {entity.metadataJson && Object.keys(entity.metadataJson).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-50 p-md rounded-base overflow-x-auto text-body-sm text-slate-700">
                {JSON.stringify(entity.metadataJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

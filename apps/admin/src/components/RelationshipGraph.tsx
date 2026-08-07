'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@dusman/ui';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  level: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationType: string;
  confidence: string;
}

interface RelationshipGraphProps {
  entityId: string;
  depth?: number;
  className?: string;
}

/**
 * Relationship Graph visualization component
 * Shows network of connected entities using graph data
 */
export function RelationshipGraph({
  entityId,
  depth = 2,
  className,
}: RelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/relations/graph/${entityId}?depth=${depth}`);
        setGraph(data);
        setError(null);
      } catch (err) {
        setError('Failed to load relationship graph');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [entityId, depth]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Relationship Graph</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-slate-500">Loading relationship data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !graph) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Relationship Graph</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-rose-600">{error || 'No data available'}</div>
        </CardContent>
      </Card>
    );
  }

  const getNodeColor = (level: number) => {
    if (level === 0) return '#dc2626'; // Primary (red)
    if (level === 1) return '#f87171'; // Light red
    return '#fca5a5'; // Lighter red
  };

  const getConfidenceOpacity = (confidence: string) => {
    const opacityMap: Record<string, number> = {
      high: 1,
      medium: 0.7,
      low: 0.4,
      unverified: 0.2,
    };
    return opacityMap[confidence] || 0.5;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Relationship Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Graph Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-base p-md">
              <p className="text-caption text-slate-600">Nodes</p>
              <p className="text-h3 font-semibold text-slate-900">{graph.nodes.length}</p>
            </div>
            <div className="bg-slate-50 rounded-base p-md">
              <p className="text-caption text-slate-600">Connections</p>
              <p className="text-h3 font-semibold text-slate-900">{graph.edges.length}</p>
            </div>
            <div className="bg-slate-50 rounded-base p-md">
              <p className="text-caption text-slate-600">Max Depth</p>
              <p className="text-h3 font-semibold text-slate-900">
                {Math.max(...graph.nodes.map((n) => n.level), 0)}
              </p>
            </div>
          </div>

          {/* Graph Visualization Container */}
          <div
            ref={containerRef}
            className="bg-white border border-slate-200 rounded-base h-96 relative"
            style={{
              background: 'linear-gradient(135deg, #f9f8f6 0%, #f3f4f6 100%)',
            }}
          >
            {/* Simple text-based graph representation */}
            <div className="p-lg overflow-auto h-full">
              <div className="text-caption text-slate-600 mb-md font-semibold">
                Graph Structure (SVG visualization would go here with Sigma.js)
              </div>

              {/* Nodes List */}
              <div className="mb-lg">
                <p className="text-body-sm font-semibold text-slate-900 mb-md">Entities</p>
                <div className="space-y-xs">
                  {graph.nodes.map((node) => (
                    <div
                      key={node.id}
                      className={clsx(
                        'flex items-center gap-md p-sm rounded-base hover:bg-slate-100 cursor-pointer transition-colors',
                        selectedNode?.id === node.id && 'bg-slate-100'
                      )}
                      onClick={() => setSelectedNode(node)}
                      style={{
                        borderLeft: `3px solid ${getNodeColor(node.level)}`,
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getNodeColor(node.level) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-slate-900 truncate">
                          {node.name}
                        </p>
                        <p className="text-caption text-slate-500">{node.type}</p>
                      </div>
                      <span className="text-caption text-slate-400 flex-shrink-0">
                        Level {node.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edges List */}
              <div>
                <p className="text-body-sm font-semibold text-slate-900 mb-md">Connections</p>
                <div className="space-y-xs">
                  {graph.edges.slice(0, 10).map((edge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-md text-body-sm"
                      style={{ opacity: getConfidenceOpacity(edge.confidence) }}
                    >
                      <div className="flex-1 flex items-center gap-md min-w-0">
                        <span className="text-slate-600 truncate text-caption">{edge.source}</span>
                        <span className="text-slate-400 flex-shrink-0">→</span>
                        <span className="text-slate-600 truncate text-caption">{edge.target}</span>
                      </div>
                      <span
                        className={clsx(
                          'text-caption px-md py-xs rounded-base flex-shrink-0',
                          edge.confidence === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : edge.confidence === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {edge.confidence}
                      </span>
                    </div>
                  ))}
                  {graph.edges.length > 10 && (
                    <p className="text-caption text-slate-500">
                      +{graph.edges.length - 10} more connections
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-md text-body-sm">
            <div className="flex items-center gap-md">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }} />
              <span className="text-slate-600">Primary Entity</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f87171' }} />
              <span className="text-slate-600">Direct Connection</span>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fca5a5' }} />
              <span className="text-slate-600">Indirect Connection</span>
            </div>
          </div>

          {/* Note about Sigma.js */}
          <div className="bg-amber-50 border border-amber-200 rounded-base p-md">
            <p className="text-caption text-amber-800">
              ℹ️ Full interactive graph visualization requires Sigma.js integration. This preview
              shows graph structure and data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

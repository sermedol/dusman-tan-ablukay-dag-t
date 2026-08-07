'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

interface GraphNode {
  id: string;
  label: string;
  size?: number;
  level: number;
  type: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  relationType?: string;
  confidence?: number;
}

interface RelationshipGraphInteractiveProps {
  entityId: string;
  depth?: number;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function RelationshipGraphInteractive({
  entityId,
  depth = 2,
  className = '',
  onNodeClick: _onNodeClick,
}: RelationshipGraphInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    fetchGraph();
  }, [entityId, depth]);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/relations/graph/${entityId}?depth=${depth}`);
      const data = await response.json();

      if (data.success) {
        setNodes(data.data.nodes || []);
        setEdges(data.data.edges || []);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to load graph');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading graph');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (containerRef.current?.querySelector('canvas')) {
      // Sigma camera control would go here
    }
  };

  const handleZoomOut = () => {
    if (containerRef.current?.querySelector('canvas')) {
      // Sigma camera control would go here
    }
  };

  const handleFitView = () => {
    if (containerRef.current?.querySelector('canvas')) {
      // Fit to view control would go here
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-slate-50 rounded-lg ${className}`}>
        <div className="text-slate-600">
          <div className="animate-spin w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full mb-2"></div>
          <p>Ağ yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Hata</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchGraph}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Tekrar Yükle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-96 bg-white rounded-lg border border-slate-200 ${className}`}>
      <div ref={containerRef} className="w-full h-full">
        {/* Sigma.js container */}
        <canvas style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 bg-white rounded-lg border border-slate-200 shadow-sm p-2">
        <button
          onClick={handleZoomIn}
          title="Yakınlaş"
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
        >
          <FiZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Uzaklaş"
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
        >
          <FiZoomOut size={18} />
        </button>
        <button
          onClick={handleFitView}
          title="Tümünü göster"
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
        >
          <FiMaximize2 size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg border border-slate-200 shadow-sm p-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-slate-600">Ana kuruluş</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fca5a5' }}></div>
            <span className="text-slate-600">Doğrudan bağlantı</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fecaca' }}></div>
            <span className="text-slate-600">Dolaylı bağlantı</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 left-4 bg-white rounded-lg border border-slate-200 shadow-sm p-3 text-sm">
        <div className="space-y-1 text-slate-600">
          <p>
            <span className="font-medium">{nodes.length}</span> kuruluş
          </p>
          <p>
            <span className="font-medium">{edges.length}</span> bağlantı
          </p>
          <p>
            <span className="font-medium">{depth}</span> derinlik
          </p>
        </div>
      </div>
    </div>
  );
}

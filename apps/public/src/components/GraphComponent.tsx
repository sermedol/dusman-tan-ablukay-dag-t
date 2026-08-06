'use client';

import { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { EdgeDisplayData, NodeDisplayData } from 'sigma/types';

interface Entity {
  id: string;
  canonicalName: string;
}

interface Relation {
  id: string;
  sourceEntity: Entity;
  targetEntity: Entity;
  relationType?: { name: string };
}

interface GraphComponentProps {
  relations: Relation[];
  onNodeSelect?: (entityId: string) => void;
}

export default function GraphComponent({ relations, onNodeSelect }: GraphComponentProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sigmaRef = useRef<any>(null);

  useEffect(() => {
    if (!container.current || !relations.length) return;

    try {
      // Create a new graph
      const graph = new Graph();

      // Add nodes and edges
      const entities = new Map<string, Entity>();

      relations.forEach((rel) => {
        entities.set(rel.sourceEntity.id, rel.sourceEntity);
        entities.set(rel.targetEntity.id, rel.targetEntity);
      });

      // Add nodes to graph
      entities.forEach((entity) => {
        graph.addNode(entity.id, {
          label: entity.canonicalName,
          size: 15,
          color: '#dc2626',
        });
      });

      // Add edges to graph
      relations.forEach((rel, idx) => {
        graph.addEdge(rel.sourceEntity.id, rel.targetEntity.id, {
          label: rel.relationType?.name || 'İlişki',
          type: 'line',
        });
      });

      // Create Sigma instance
      const sigma = new Sigma(graph, container.current, {
        renderLabels: true,
        defaultNodeColor: '#dc2626',
        defaultEdgeColor: '#d1d5db',
      });

      sigmaRef.current = sigma;

      // Add hover effects
      let hoveredNode: string | null = null;
      let highlightedNodes: Set<string> = new Set();

      sigma.on('enterNode', ({ node }) => {
        if (hoveredNode === node) return;

        hoveredNode = node;
        highlightedNodes = new Set([node]);

        // Add connected nodes
        graph.forEachNeighbor(node, (neighbor) => {
          highlightedNodes.add(neighbor);
        });

        // Update node colors
        sigma.getNodeDisplayData(node)!.color = '#b91c1c';
        highlightedNodes.forEach((n) => {
          if (n !== node) {
            sigma.getNodeDisplayData(n)!.color = '#fca5a5';
          }
        });

        // Update edge colors
        graph.forEachEdge(node, (edge) => {
          sigma.getEdgeDisplayData(edge)!.color = '#7f1d1d';
        });

        sigma.refresh();
      });

      sigma.on('leaveNode', () => {
        hoveredNode = null;
        highlightedNodes.clear();

        graph.forEachNode((node) => {
          sigma.getNodeDisplayData(node)!.color = '#dc2626';
        });

        graph.forEachEdge((edge) => {
          sigma.getEdgeDisplayData(edge)!.color = '#d1d5db';
        });

        sigma.refresh();
      });

      // Add click event
      sigma.on('clickNode', ({ node }) => {
        if (onNodeSelect) {
          onNodeSelect(node);
        }
      });

      setIsLoading(false);

      return () => {
        sigma.kill();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [relations, onNodeSelect]);

  return (
    <>
      <div
        ref={container}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#e5e5e5',
        }}
      />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          <p style={{ margin: 0, color: '#666' }}>Ağ yükleniyor...</p>
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '6px',
          zIndex: 10,
          maxWidth: '300px',
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Hata: {error}</p>
        </div>
      )}
    </>
  );
}

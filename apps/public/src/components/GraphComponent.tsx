'use client';

import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { useEffect, useRef, useState } from 'react';
import Sigma from 'sigma';

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

const NODE_COLOR = '#9a2f26';
const NODE_HOVER_COLOR = '#7a2119';
const NODE_NEIGHBOR_COLOR = '#d8a89f';
const EDGE_COLOR = '#e7e3da';
const EDGE_HIGHLIGHT_COLOR = '#9a2f26';

export default function GraphComponent({ relations, onNodeSelect }: GraphComponentProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!container.current || !relations.length) return;

    try {
      const graph = new Graph();
      const entities = new Map<string, Entity>();

      relations.forEach((rel) => {
        entities.set(rel.sourceEntity.id, rel.sourceEntity);
        entities.set(rel.targetEntity.id, rel.targetEntity);
      });

      const degree = new Map<string, number>();
      relations.forEach((rel) => {
        degree.set(rel.sourceEntity.id, (degree.get(rel.sourceEntity.id) ?? 0) + 1);
        degree.set(rel.targetEntity.id, (degree.get(rel.targetEntity.id) ?? 0) + 1);
      });

      const entityList = Array.from(entities.values());
      entityList.forEach((entity, i) => {
        // Seed positions on a circle; forceAtlas2 relaxes them into a readable layout below.
        const angle = (2 * Math.PI * i) / Math.max(entityList.length, 1);
        const d = degree.get(entity.id) ?? 1;
        graph.addNode(entity.id, {
          label: entity.canonicalName,
          size: 6 + Math.min(d, 8) * 1.6,
          color: NODE_COLOR,
          x: Math.cos(angle) * 100,
          y: Math.sin(angle) * 100,
        });
      });

      relations.forEach((rel) => {
        if (!graph.hasEdge(rel.sourceEntity.id, rel.targetEntity.id)) {
          graph.addEdge(rel.sourceEntity.id, rel.targetEntity.id, {
            label: rel.relationType?.name || 'İlişki',
            type: 'line',
            color: EDGE_COLOR,
            size: 1.2,
          });
        }
      });

      // Untangle the initial circular layout into a legible force-directed one.
      forceAtlas2.assign(graph, {
        iterations: 120,
        settings: {
          gravity: 1,
          scalingRatio: 12,
          barnesHutOptimize: entityList.length > 80,
          adjustSizes: true,
          strongGravityMode: true,
        },
      });

      const sigma = new Sigma(graph, container.current, {
        renderLabels: true,
        labelFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        labelSize: 12,
        labelColor: { color: '#17171a' },
        defaultNodeColor: NODE_COLOR,
        defaultEdgeColor: EDGE_COLOR,
        minCameraRatio: 0.15,
        maxCameraRatio: 3,
      });

      sigmaRef.current = sigma;

      // Sigma's default auto-fit frames the graph with zero padding, so nodes
      // land flush against the viewport edges. Zoom out slightly for breathing room.
      const camera = sigma.getCamera();
      camera.setState({ ...camera.getState(), ratio: camera.getState().ratio * 1.35 });

      let hoveredNode: string | null = null;

      sigma.on('enterNode', ({ node }) => {
        if (hoveredNode === node) return;
        hoveredNode = node;

        const highlighted = new Set([node]);
        graph.forEachNeighbor(node, (neighbor) => highlighted.add(neighbor));

        graph.forEachNode((n) => {
          graph.setNodeAttribute(n, 'color', n === node ? NODE_HOVER_COLOR : highlighted.has(n) ? NODE_NEIGHBOR_COLOR : '#e7d9d6');
        });
        graph.forEachEdge((edge, _attrs, source, target) => {
          const isIncident = source === node || target === node;
          graph.setEdgeAttribute(edge, 'color', isIncident ? EDGE_HIGHLIGHT_COLOR : EDGE_COLOR);
          graph.setEdgeAttribute(edge, 'size', isIncident ? 2 : 1);
        });

        sigma.refresh();
      });

      sigma.on('leaveNode', () => {
        hoveredNode = null;
        graph.forEachNode((n) => graph.setNodeAttribute(n, 'color', NODE_COLOR));
        graph.forEachEdge((edge) => {
          graph.setEdgeAttribute(edge, 'color', EDGE_COLOR);
          graph.setEdgeAttribute(edge, 'size', 1.2);
        });
        sigma.refresh();
      });

      sigma.on('clickNode', ({ node }) => {
        onNodeSelect?.(node);
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
      <div ref={container} className="h-full min-h-[500px] w-full bg-surface-sunken" />
      {isLoading && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface px-5 py-3 shadow-md">
          <p className="text-body-sm text-ink-muted">Ağ yükleniyor…</p>
        </div>
      )}
      {error && (
        <div className="absolute left-5 top-5 z-10 max-w-xs rounded-md bg-danger-soft px-3 py-2 text-body-sm text-danger">
          Hata: {error}
        </div>
      )}
    </>
  );
}

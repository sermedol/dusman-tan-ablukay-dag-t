import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  entityCount?: number;
}

interface MapComponentProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

export default function MapComponent({ locations, onLocationSelect }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MaplibreMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !locations.length) return;

    try {
      // Initialize map with OpenStreetMap tiles
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [35.2433, 38.9637], // Turkey center
        zoom: 5,
        pitch: 0,
        bearing: 0,
      });

      map.current.on('load', () => {
        // Create GeoJSON from locations
        const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: 'FeatureCollection',
          features: locations.map((loc) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [loc.longitude, loc.latitude],
            },
            properties: {
              id: loc.id,
              name: loc.name,
              entityCount: loc.entityCount || 0,
            },
          })),
        };

        // Add data source
        if (!map.current?.getSource('locations')) {
          map.current?.addSource('locations', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Add cluster layer
          map.current?.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'locations',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#dc2626',
                10,
                '#b91c1c',
                20,
                '#7f1d1d',
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                30,
                20,
                40,
              ],
            },
          });

          // Add cluster count layer
          map.current?.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'locations',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#fff',
            },
          });

          // Add unclustered point layer
          map.current?.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'locations',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#dc2626',
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff',
            },
          });

          // Show the unclustered point on hover
          let hoveredId: string | null = null;

          map.current?.on('mousemove', 'unclustered-point', (e) => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = 'pointer';
            }

            if (e.features && e.features.length > 0) {
              if (hoveredId !== null) {
                map.current?.setFeatureState(
                  { source: 'locations', id: hoveredId },
                  { hover: false }
                );
              }
              hoveredId = e.features[0].id as string;
              map.current?.setFeatureState(
                { source: 'locations', id: hoveredId },
                { hover: true }
              );
            }
          });

          map.current?.on('mouseleave', 'unclustered-point', () => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = '';
            }
            if (hoveredId !== null) {
              map.current?.setFeatureState(
                { source: 'locations', id: hoveredId },
                { hover: false }
              );
            }
            hoveredId = null;
          });

          // When a cluster is clicked, zoom into it
          map.current?.on('click', 'clusters', (e) => {
            const features = map.current?.queryRenderedFeatures({ layers: ['clusters'] });
            if (features && features.length > 0) {
              const clickedFeature = features[0];
              const clusterId = clickedFeature.properties?.['cluster_id'];
              const clusterSource = map.current?.getSource('locations') as maplibregl.GeoJSONSource;

              if (clusterSource && typeof clusterId === 'number') {
                (clusterSource as any).getClusterExpansionZoom(
                  clusterId,
                  (err: any, zoom: number) => {
                    if (err) return;
                    if (clickedFeature.geometry.type === 'Point') {
                      map.current?.easeTo({
                        center: clickedFeature.geometry.coordinates as [number, number],
                        zoom: zoom,
                      });
                    }
                  }
                );
              }
            }
          });

          // When an unclustered point is clicked
          map.current?.on('click', 'unclustered-point', (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const location = locations.find((l) => l.id === feature.id);
              if (location && onLocationSelect) {
                onLocationSelect(location);
              }

              // Fly to the point
              if (feature.geometry.type === 'Point') {
                map.current?.flyTo({
                  center: feature.geometry.coordinates as [number, number],
                  zoom: 10,
                });
              }
            }
          });

          // Change cursor on hover
          map.current?.on('mouseenter', 'clusters', () => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          });

          map.current?.on('mouseleave', 'clusters', () => {
            if (map.current?.getCanvas()) {
              map.current.getCanvas().style.cursor = '';
            }
          });
        }

        // Fit to bounds if locations exist
        if (locations.length > 0) {
          const bounds = locations.reduce(
            (bounds, loc) => {
              return bounds.extend([loc.longitude, loc.latitude]);
            },
            new maplibregl.LngLatBounds(
              [locations[0].longitude, locations[0].latitude],
              [locations[0].longitude, locations[0].latitude]
            )
          );

          map.current?.fitBounds(bounds, { padding: 50 });
        }

        setIsLoading(false);
      });

      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [locations, onLocationSelect]);

  return (
    <>
      <div
        ref={mapContainer}
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
          <p style={{ margin: 0, color: '#666' }}>Harita yükleniyor...</p>
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

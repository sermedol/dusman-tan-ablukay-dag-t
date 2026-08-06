import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoCluster {
  id: string;
  centroid: GeoPoint;
  count: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface NearbyEntity {
  id: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
}

@Injectable()
export class PostgisService {
  private readonly logger = new Logger('PostgisService');
  private enabled: boolean = false;

  constructor(private prisma: PrismaService) {
    this.checkPostgisSupport();
  }

  private async checkPostgisSupport(): Promise<void> {
    try {
      // Check if PostGIS is available in the database
      const result = await this.prisma.$queryRaw`SELECT version();` as Array<any>;
      this.logger.log('Database connected');
      // In production, we'd check for PostGIS specifically
      this.enabled = true;
    } catch (error) {
      this.logger.warn('PostGIS check failed - geographic features disabled', error);
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Find entities near a location within a radius (in kilometers)
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number = 10
  ): Promise<NearbyEntity[]> {
    if (!this.enabled) {
      this.logger.debug(
        `Would search for entities near ${latitude}, ${longitude} within ${radiusKm}km`
      );
      return [];
    }

    try {
      // Note: This is a placeholder. With actual PostGIS:
      // SELECT id, name, ST_Distance(location, ST_MakePoint($1, $2)::geography) / 1000 as distance
      // FROM entities
      // WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3 * 1000)
      // ORDER BY distance
      // LIMIT $4

      this.logger.debug(
        `Searching for entities near ${latitude}, ${longitude} within ${radiusKm}km`
      );
      return [];
    } catch (error) {
      this.logger.error('Nearby search failed', error);
      return [];
    }
  }

  /**
   * Cluster entities within a bounding box by a grid size
   */
  async clusterEntities(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    gridSizeMeters: number = 1000
  ): Promise<GeoCluster[]> {
    if (!this.enabled) {
      this.logger.debug(`Would cluster entities in bounds with grid size ${gridSizeMeters}m`);
      return [];
    }

    try {
      // Note: This is a placeholder. With actual PostGIS:
      // SELECT
      //   ST_ClusterDBSCAN(location, gridSizeMeters / 111000, 1) OVER () as cid,
      //   COUNT(*) as count,
      //   ST_AsText(ST_Centroid(ST_Collect(location))) as centroid
      // FROM entities
      // WHERE location && ST_MakeBox2D(...)
      // GROUP BY cid

      this.logger.debug('Clustering entities');
      return [];
    } catch (error) {
      this.logger.error('Clustering failed', error);
      return [];
    }
  }

  /**
   * Check if point is within a polygon
   */
  async isWithinPolygon(
    latitude: number,
    longitude: number,
    polygonWkt: string
  ): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`Would check if point is within polygon`);
      return false;
    }

    try {
      // With PostGIS:
      // SELECT ST_Contains(ST_PolygonFromText($1), ST_Point($2, $3))

      return false;
    } catch (error) {
      this.logger.error('Polygon check failed', error);
      return false;
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    // Haversine formula for great-circle distance
    const R = 6371; // Earth's radius in km
    const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.latitude * Math.PI) / 180) *
        Math.cos((point2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get bounds for a bounding box
   */
  getBounds(
    centerLat: number,
    centerLon: number,
    radiusKm: number
  ): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    const latDelta = radiusKm / 111; // Approximately 111 km per degree
    const lonDelta = (radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180)));

    return {
      north: centerLat + latDelta,
      south: centerLat - latDelta,
      east: centerLon + lonDelta,
      west: centerLon - lonDelta,
    };
  }

  /**
   * Validate geographic coordinates
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
}

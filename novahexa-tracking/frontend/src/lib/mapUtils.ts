import type { PackageItem, TransportMode } from '../types';

/**
 * Average speed in km/h for each transport mode (used for ETA estimation)
 */
const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  ROUTIER: 80,
  AERIEN: 800,
  MARITIME: 30,
};

/**
 * Haversine distance between two lat/lng points in km.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Linearly interpolate between two lat/lng points.
 */
function lerp(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): { lat: number; lng: number } {
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lng: lng1 + (lng2 - lng1) * t,
  };
}

/**
 * Build an ordered list of all points along the route:
 * origin → waypoints (sorted by orderIndex) → destination.
 * Only includes points with valid lat/lng.
 */
export function buildRoutePoints(pkg: PackageItem): { lat: number; lng: number; label?: string }[] {
  const points: { lat: number; lng: number; label?: string }[] = [];

  if (pkg.originLat != null && pkg.originLng != null) {
    points.push({ lat: pkg.originLat, lng: pkg.originLng, label: pkg.originAddress });
  }

  if (pkg.waypoints && pkg.waypoints.length > 0) {
    const sorted = [...pkg.waypoints].sort((a, b) => a.orderIndex - b.orderIndex);
    for (const wp of sorted) {
      if (wp.lat != null && wp.lng != null) {
        points.push({ lat: wp.lat, lng: wp.lng, label: wp.label });
      }
    }
  }

  if (pkg.destinationLat != null && pkg.destinationLng != null) {
    points.push({ lat: pkg.destinationLat, lng: pkg.destinationLng, label: pkg.destinationAddress });
  }

  return points;
}

/**
 * Calculate the total route distance in km.
 */
export function totalRouteDistance(points: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat, points[i - 1].lng,
      points[i].lat, points[i].lng,
    );
  }
  return total;
}

/**
 * Simulate the current position of a parcel along its route based on time.
 *
 * For each segment, the progress is estimated from:
 *   - total distance
 *   - transport mode speed
 *   - estimated duration (if provided)
 *   - time elapsed since the first tracking event or creation
 *
 * Returns the interpolated { lat, lng } or null if no valid route points exist.
 */
export function simulatePosition(pkg: PackageItem): { lat: number; lng: number } | null {
  const points = buildRoutePoints(pkg);
  if (points.length < 2) {
    // Fallback: return origin if available
    if (pkg.originLat != null && pkg.originLng != null) {
      return { lat: pkg.originLat, lng: pkg.originLng };
    }
    return null;
  }

  const distKm = totalRouteDistance(points);
  const speed = TRANSPORT_SPEEDS[pkg.transportMode ?? 'ROUTIER'];

  // Estimate total travel time in ms
  let totalTravelMs: number;
  if (pkg.estimatedDuration) {
    // Parse estimatedDuration like "3 jours", "12h", "2 jours 6h"
    totalTravelMs = parseDuration(pkg.estimatedDuration);
  } else {
    totalTravelMs = (distKm / speed) * 3600 * 1000;
  }

  // Determine elapsed time since departure
  const departureTime = pkg.validatedAt
    ? new Date(pkg.validatedAt).getTime()
    : new Date(pkg.createdAt).getTime();
  const now = Date.now();
  const elapsed = Math.max(0, now - departureTime);

  // Calculate progress ratio (0 → 1)
  let ratio = totalTravelMs > 0 ? elapsed / totalTravelMs : 1;
  if (pkg.status === 'DELIVERED') ratio = 1;
  if (pkg.status === 'PENDING' || pkg.status === 'REFUSED') ratio = 0;
  ratio = Math.min(1, Math.max(0, ratio));

  // Interpolate position along the route segments
  const segmentDistances: number[] = [];
  for (let i = 1; i < points.length; i++) {
    segmentDistances.push(
      haversineDistance(
        points[i - 1].lat, points[i - 1].lng,
        points[i].lat, points[i].lng,
      ),
    );
  }
  const totalDist = segmentDistances.reduce((a, b) => a + b, 0);
  const targetDist = ratio * totalDist;

  let accumulated = 0;
  for (let i = 0; i < segmentDistances.length; i++) {
    if (accumulated + segmentDistances[i] >= targetDist) {
      const segRatio =
        segmentDistances[i] > 0
          ? (targetDist - accumulated) / segmentDistances[i]
          : 0;
      return lerp(
        points[i].lat, points[i].lng,
        points[i + 1].lat, points[i + 1].lng,
        segRatio,
      );
    }
    accumulated += segmentDistances[i];
  }

  // Should not reach here, but return last point as fallback
  const last = points[points.length - 1];
  return { lat: last.lat, lng: last.lng };
}

/**
 * Parse a French duration string like "3 jours", "12h", "2 jours 6h" into milliseconds.
 */
export function parseDuration(dur: string): number {
  let ms = 0;
  const dayMatch = dur.match(/(\d+)\s*(jour|day)/i);
  const hourMatch = dur.match(/(\d+)\s*h/i);
  const minMatch = dur.match(/(\d+)\s*min/i);
  if (dayMatch) ms += parseInt(dayMatch[1], 10) * 24 * 3600 * 1000;
  if (hourMatch) ms += parseInt(hourMatch[1], 10) * 3600 * 1000;
  if (minMatch) ms += parseInt(minMatch[1], 10) * 60 * 1000;
  // Fallback: if nothing matched, assume 7 days
  if (ms === 0) ms = 7 * 24 * 3600 * 1000;
  return ms;
}

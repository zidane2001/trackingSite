import type { PackageItem, TransportMode } from '../types';

/**
 * Realistic speed in km/h for each transport mode.
 * Used for demo: admin sets a compressed duration, and the animation
 * uses (now - transitStartedAt) / demoDurationMinutes to calculate progress.
 */
const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  ROUTE: 80,
  AIR: 900,
  MER: 30,
};

/**
 * Get emoji icon for a transport mode.
 */
export function getTransportIcon(mode?: string): string {
  switch (mode) {
    case 'AIR': return '✈️';
    case 'MER': return '🚢';
    case 'ROUTE': return '🚛';
    default: return '📦';
  }
}

/**
 * Get label for a transport mode.
 */
export function getTransportLabel(mode?: string): string {
  switch (mode) {
    case 'AIR': return 'Aérien';
    case 'MER': return 'Maritime';
    case 'ROUTE': return 'Routier';
    default: return 'Non défini';
  }
}

/**
 * Get color for a transport mode (used on map).
 */
export function getTransportColor(mode?: string): string {
  switch (mode) {
    case 'AIR': return '#3b82f6'; // blue
    case 'MER': return '#0ea5e9'; // sky
    case 'ROUTE': return '#f59e0b'; // amber
    default: return '#6b7280'; // gray
  }
}

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
 * Fetch an OSRM driving route between two points.
 * Returns an array of {lat, lng} waypoints along the road.
 * Falls back to a straight line if the request fails.
 */
export async function fetchOSRMRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<{ lat: number; lng: number }[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates as [number, number][];
      return coords.map(([lng, lat]) => ({ lat, lng }));
    }
  } catch {
    // Fallback to straight line
  }
  return [
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng },
  ];
}

/**
 * Fetch an OSRM route through waypoints.
 */
export async function fetchOSRMRouteWithWaypoints(
  origin: { lat: number; lng: number },
  waypoints: { lat: number; lng: number }[],
  destination: { lat: number; lng: number },
): Promise<{ lat: number; lng: number }[]> {
  try {
    const allPoints = [origin, ...waypoints, destination];
    const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const c = data.routes[0].geometry.coordinates as [number, number][];
      return c.map(([lng, lat]) => ({ lat, lng }));
    }
  } catch {
    // Fallback
  }
  return buildRoutePoints({ originLat: origin.lat, originLng: origin.lng, destinationLat: destination.lat, destinationLng: destination.lng } as PackageItem);
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
 * Get the effective duration in milliseconds for a package.
 * Priority: demoDurationMinutes > estimatedDuration > auto-calculated from distance.
 */
function getEffectiveDurationMs(pkg: PackageItem): number {
  // Demo duration (compressed for tests) — admin sets this in minutes
  if (pkg.demoDurationMinutes && pkg.demoDurationMinutes > 0) {
    return pkg.demoDurationMinutes * 60 * 1000;
  }

  // Parsed estimated duration (e.g. "3 jours", "12h")
  if (pkg.estimatedDuration) {
    return parseDuration(pkg.estimatedDuration);
  }

  // Auto-calculate from distance + speed
  const points = buildRoutePoints(pkg);
  if (points.length < 2) return 7 * 24 * 3600 * 1000; // 7 days fallback
  const distKm = totalRouteDistance(points);
  const speed = TRANSPORT_SPEEDS[pkg.transportMode ?? 'ROUTE'];
  return (distKm / speed) * 3600 * 1000;
}

/**
 * Get the departure timestamp in ms for animation purposes.
 * Priority: transitStartedAt > validatedAt > createdAt
 */
function getDepartureTimeMs(pkg: PackageItem): number {
  if (pkg.transitStartedAt) return new Date(pkg.transitStartedAt).getTime();
  if (pkg.validatedAt) return new Date(pkg.validatedAt).getTime();
  return new Date(pkg.createdAt).getTime();
}

/**
 * Calculate the traveled ratio (0 → 1) for a package based on time elapsed.
 * Uses demoDurationMinutes if set, otherwise real duration.
 */
export function getTraveledRatio(pkg: PackageItem): number {
  if (pkg.status === 'DELIVERED') return 1;
  if (pkg.status === 'PENDING' || pkg.status === 'REFUSED') return 0;
  if (pkg.status === 'VALIDATED') return 0; // Validé mais pas encore en transit — reste à l'origine

  const departureMs = getDepartureTimeMs(pkg);
  const elapsed = Math.max(0, Date.now() - departureMs);
  const durationMs = getEffectiveDurationMs(pkg);

  return Math.min(1, elapsed / durationMs);
}

/**
 * Simulate the current position of a parcel along its route based on time.
 *
 * Uses demoDurationMinutes (compressed time) or estimatedDuration to calculate
 * how far along the route the parcel should be.
 *
 * Returns the interpolated { lat, lng } or null if no valid route points exist.
 */
export function simulatePosition(pkg: PackageItem, routeOverride?: { lat: number; lng: number }[]): { lat: number; lng: number } | null {
  const points = routeOverride && routeOverride.length >= 2 ? routeOverride : buildRoutePoints(pkg);
  if (points.length < 2) {
    if (pkg.originLat != null && pkg.originLng != null) {
      return { lat: pkg.originLat, lng: pkg.originLng };
    }
    return null;
  }

  const ratio = getTraveledRatio(pkg);

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
  if (totalDist === 0) return { lat: points[0].lat, lng: points[0].lng };

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

  const last = points[points.length - 1];
  return { lat: last.lat, lng: last.lng };
}

/**
 * Get the bearing (angle in degrees) between the current position and the next point.
 * Used to rotate the transport icon to face the direction of travel.
 */
export function getBearing(pkg: PackageItem, routeOverride?: { lat: number; lng: number }[]): number {
  const points = routeOverride && routeOverride.length >= 2 ? routeOverride : buildRoutePoints(pkg);
  if (points.length < 2) return 0;

  const ratio = getTraveledRatio(pkg);
  const segmentDistances: number[] = [];
  for (let i = 1; i < points.length; i++) {
    segmentDistances.push(
      haversineDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng),
    );
  }
  const totalDist = segmentDistances.reduce((a, b) => a + b, 0);
  if (totalDist === 0) return 0;

  const targetDist = ratio * totalDist;
  let accumulated = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    if (accumulated + segmentDistances[i] >= targetDist) {
      const p1 = points[i];
      const p2 = points[Math.min(i + 1, points.length - 1)];
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;
      const dLng = toRad(p2.lng - p1.lng);
      const y = Math.sin(dLng) * Math.cos(toRad(p2.lat));
      const x =
        Math.cos(toRad(p1.lat)) * Math.sin(toRad(p2.lat)) -
        Math.sin(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.cos(dLng);
      return (toDeg(Math.atan2(y, x)) + 360) % 360;
    }
    accumulated += segmentDistances[i];
  }

  return 0;
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
  if (ms === 0) ms = 7 * 24 * 3600 * 1000;
  return ms;
}

/**
 * Format a duration in minutes to a human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0 ? `${days}j ${remainHours}h` : `${days}j`;
}

/**
 * Reverse geocode coordinates to a human-readable location name
 * using Nominatim (OpenStreetMap).
 * Returns "City, State, Country" or a fallback with coordinates.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { 'User-Agent': 'NovaHexaTracking/1.0' } },
    );
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    if (data?.display_name) {
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality;
      const state = addr.state || addr.region;
      const country = addr.country;
      if (city && state && country) return `${city}, ${state}, ${country}`;
      if (city && country) return `${city}, ${country}`;
      if (state && country) return `${state}, ${country}`;
      // Fallback: first 3 parts of display_name
      return data.display_name.split(', ').slice(0, 3).join(', ');
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Forward geocode an address string to lat/lng using Nominatim.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'NovaHexaTracking/1.0' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

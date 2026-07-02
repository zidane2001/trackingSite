import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PackageItem } from '../types';
import { buildRoutePoints, simulatePosition, parseDuration, haversineDistance } from '../lib/mapUtils';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createIcon(color: string, label?: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
        ${label ? `<span style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;font-weight:700;color:#1e293b;background:rgba(255,255,255,0.92);padding:2px 6px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.12);pointer-events:none;">${label}</span>` : ''}
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createPulseIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:32px;height:32px;background:rgba(200,169,81,0.3);border-radius:50%;animation:pulse-ring 2s infinite;"></div>
        <div style="width:18px;height:18px;background:#C8A951;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(200,169,81,0.5);position:relative;z-index:2;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createWaypointIcon(reached: boolean): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="width:12px;height:12px;background:${reached ? '#22c55e' : '#94a3b8'};border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
        <div style="width:4px;height:4px;background:#fff;border-radius:50%;"></div>
      </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

interface ParcelMapProps {
  pkg: PackageItem;
  height?: string;
  showAll?: boolean;
  allPackages?: PackageItem[];
  readOnly?: boolean;
  onParcelClick?: (pkg: PackageItem) => void;
  showPosition?: boolean;
  editMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

/**
 * Interpolate position along a polyline at a given ratio (0→1).
 */
function interpolateAlongRoute(
  points: { lat: number; lng: number }[],
  ratio: number,
): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 0, lng: 0 };
  if (points.length === 1 || ratio <= 0) return points[0];
  if (ratio >= 1) return points[points.length - 1];

  const cumDist: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cumDist.push(
      cumDist[i - 1] + haversineDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng),
    );
  }
  const totalDist = cumDist[cumDist.length - 1];
  if (totalDist === 0) return points[0];

  const targetDist = ratio * totalDist;
  for (let i = 1; i < points.length; i++) {
    if (cumDist[i] >= targetDist) {
      const segLen = cumDist[i] - cumDist[i - 1];
      const segProgress = segLen > 0 ? (targetDist - cumDist[i - 1]) / segLen : 0;
      return {
        lat: points[i - 1].lat + (points[i].lat - points[i - 1].lat) * segProgress,
        lng: points[i - 1].lng + (points[i].lng - points[i - 1].lng) * segProgress,
      };
    }
  }
  return points[points.length - 1];
}

export function ParcelMap({
  pkg,
  height = '400px',
  showAll = false,
  allPackages = [],
  readOnly = true,
  onParcelClick,
  showPosition = true,
  editMode = false,
  onMapClick,
}: ParcelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    if (editMode && onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
      map.getContainer().style.cursor = 'crosshair';
    }

    const packagesToShow = showAll ? allPackages : [pkg];
    const allPoints: L.LatLngExpression[] = [];

    for (const p of packagesToShow) {
      const routePoints = buildRoutePoints(p);

      // Route polyline (gold solid)
      if (routePoints.length >= 2) {
        const latlngs: L.LatLngExpression[] = routePoints.map((pt) => [pt.lat, pt.lng]);
        L.polyline(latlngs, { color: '#C8A951', weight: 4, opacity: 0.9 }).addTo(map);
        allPoints.push(...latlngs);
      }

      // Origin marker
      if (p.originLat != null && p.originLng != null) {
        L.marker([p.originLat, p.originLng], {
          icon: createIcon('#3b82f6', showAll ? undefined : p.originAddress),
        }).addTo(map).bindPopup(`<div style="font-size:12px;"><strong>Départ</strong><br/>${p.originAddress}</div>`);
        allPoints.push([p.originLat, p.originLng]);
      }

      // Destination marker
      if (p.destinationLat != null && p.destinationLng != null) {
        L.marker([p.destinationLat, p.destinationLng], {
          icon: createIcon('#ef4444', showAll ? undefined : p.destinationAddress),
        }).addTo(map).bindPopup(`<div style="font-size:12px;"><strong>Arrivée</strong><br/>${p.destinationAddress}</div>`);
        allPoints.push([p.destinationLat, p.destinationLng]);
      }

      // Waypoint markers
      if (p.waypoints) {
        const sorted = [...p.waypoints].sort((a, b) => a.orderIndex - b.orderIndex);
        for (const wp of sorted) {
          if (wp.lat != null && wp.lng != null) {
            L.marker([wp.lat, wp.lng], { icon: createWaypointIcon(!!wp.reachedAt) })
              .addTo(map)
              .bindPopup(`<div style="font-size:12px;"><strong>${wp.label}</strong>${
                wp.reachedAt
                  ? `<br/>Atteint le ${new Date(wp.reachedAt).toLocaleString('fr-FR')}`
                  : wp.estimatedArrival
                  ? `<br/>Arrivée estimée : ${new Date(wp.estimatedArrival).toLocaleString('fr-FR')}`
                  : ''
              }</div>`);
          }
        }
      }

      // Position marker — single parcel view only (not showAll)
      if (!showAll && showPosition && p.status !== 'PENDING' && p.status !== 'REFUSED') {
        const initialPos = simulatePosition(p);
        if (initialPos) {
          const animMarker = L.marker([initialPos.lat, initialPos.lng], { icon: createPulseIcon() }).addTo(map);
          animMarker.bindPopup(
            `<div style="font-size:12px;"><strong>📍 Position actuelle</strong><br/>${p.name} (${p.trackingNumber})</div>`,
          );
          if (onParcelClick) animMarker.on('click', () => onParcelClick(p));
          allPoints.push([initialPos.lat, initialPos.lng]);

          // Animated trail + marker for in-transit parcels
          if (routePoints.length >= 2 && p.status !== 'DELIVERED') {
            const traveledRatio = getTraveledRatio(p);
            const totalDist = routePoints.reduce((sum, pt, i) =>
              i === 0 ? 0 : sum + haversineDistance(routePoints[i - 1].lat, routePoints[i - 1].lng, pt.lat, pt.lng), 0);

            // Draw traveled trail (solid gold, from origin to current position)
            const trailPoints = routePoints.slice(0, Math.max(2, Math.ceil(traveledRatio * routePoints.length)));
            if (trailPoints.length >= 2) {
              L.polyline(trailPoints.map((pt) => [pt.lat, pt.lng] as L.LatLngExpression), {
                color: '#f59e0b',
                weight: 5,
                opacity: 0.8,
              }).addTo(map);
            }

            // Animate marker along route (speed tied to distance)
            let progress = traveledRatio;
            let lastTime = performance.now();
            const speedDeg = totalDist > 0 ? (totalDist * 0.015) / 60 : 0.001; // visual speed scaled to route length

            function animate(now: number) {
              const dt = (now - lastTime) / 1000;
              lastTime = now;
              progress = Math.min(1, progress + (speedDeg * dt));
              const pos = interpolateAlongRoute(routePoints, progress);
              animMarker.setLatLng([pos.lat, pos.lng]);
              if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
            }
            animFrameRef.current = requestAnimationFrame(animate);
          }
        }
      }

      // Static position for showAll mode (no animation to avoid chaos)
      if (showAll && showPosition && p.status !== 'PENDING' && p.status !== 'REFUSED') {
        const pos = simulatePosition(p);
        if (pos) {
          L.marker([pos.lat, pos.lng], { icon: createPulseIcon() })
            .addTo(map)
            .bindPopup(`<div style="font-size:12px;"><strong>${p.name}</strong><br/>${p.trackingNumber}</div>`);
          allPoints.push([pos.lat, pos.lng]);
        }
      }
    }

    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([48.8566, 2.3522], 5);
    }

    mapInstance.current = map;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapInstance.current = null;
    };
  }, [pkg, showAll, allPackages, showPosition, readOnly, editMode, onMapClick]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
      className="relative"
    />
  );
}

function getTraveledRatio(pkg: PackageItem): number {
  if (pkg.status === 'DELIVERED') return 1;
  if (pkg.status === 'PENDING' || pkg.status === 'REFUSED') return 0;
  const departureTime = pkg.validatedAt
    ? new Date(pkg.validatedAt).getTime()
    : new Date(pkg.createdAt).getTime();
  const elapsed = Math.max(0, Date.now() - departureTime);
  const dur = pkg.estimatedDuration ? parseDuration(pkg.estimatedDuration) : 7 * 24 * 3600 * 1000;
  return Math.min(1, elapsed / dur);
}

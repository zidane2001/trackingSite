import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PackageItem } from '../types';
import {
  buildRoutePoints,
  simulatePosition,
  getTraveledRatio,
  getBearing,
  getTransportIcon,
  getTransportColor,
  fetchOSRMRouteWithWaypoints,
} from '../lib/mapUtils';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ── Marker factories ──────────────────────────────── */

function createDotIcon(color: string, label?: string): L.DivIcon {
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

/** Transport-mode icon: shows ✈️ 🚢 🚛 emoji with colored ring. */
function createTransportIcon(mode?: string, bearing?: number): L.DivIcon {
  const icon = mode === 'AIR' ? '✈️' : mode === 'MER' ? '🚢' : mode === 'ROUTE' ? '🚛' : '📦';
  const color = getTransportColor(mode);
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;transform:rotate(${bearing ?? 0}deg);">
        <div style="position:absolute;width:40px;height:40px;background:${color}22;border:2px solid ${color}66;border-radius:50%;animation:pulse-ring 2s infinite;"></div>
        <div style="width:32px;height:32px;background:#fff;border:3px solid ${color};border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;position:relative;z-index:2;transform:rotate(-${bearing ?? 0}deg);">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

/* ── Props ─────────────────────────────────────────── */

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

/* ── Component ─────────────────────────────────────── */

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
  const [osrmRoutes, setOsrmRoutes] = useState<Map<string, { lat: number; lng: number }[]>>(new Map());

  // Fetch OSRM routes for packages that have coordinates
  useEffect(() => {
    const packagesToRoute = showAll ? allPackages : [pkg];
    for (const p of packagesToRoute) {
      if (p.originLat == null || p.originLng == null || p.destinationLat == null || p.destinationLng == null) continue;
      // Fetch OSRM road routes for ALL transport modes so the line follows real roads
      if (osrmRoutes.has(p.id)) continue;

      const wpPoints = (p.waypoints || [])
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .filter(w => w.lat != null && w.lng != null)
        .map(w => ({ lat: w.lat, lng: w.lng }));

      fetchOSRMRouteWithWaypoints(
        { lat: p.originLat, lng: p.originLng },
        wpPoints,
        { lat: p.destinationLat, lng: p.destinationLng },
      ).then(route => {
        if (route.length > 2) {
          setOsrmRoutes(prev => {
            const next = new Map(prev);
            next.set(p.id, route);
            return next;
          });
        }
      }).catch(() => {
        // Silently fall back to straight-line route
      });
    }
  }, [pkg, showAll, allPackages]);

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

    // Edit mode: click to place
    if (editMode && onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
      map.getContainer().style.cursor = 'crosshair';
    }

    const packagesToShow = showAll ? allPackages : [pkg];
    const allPoints: L.LatLngExpression[] = [];

    for (const p of packagesToShow) {
      // Get route points: prefer OSRM road route over straight-line segments
      const osrmRoute = osrmRoutes.get(p.id);
      const routeForSim = osrmRoute && osrmRoute.length > 2 ? osrmRoute : undefined;
      const routePoints = routeForSim ?? buildRoutePoints(p);

      const routeColor = getTransportColor(p.transportMode);

      // Route polyline
      if (routePoints.length >= 2) {
        const latlngs: L.LatLngExpression[] = routePoints.map((pt) => [pt.lat, pt.lng]);
        L.polyline(latlngs, {
          color: routeColor,
          weight: 4,
          opacity: 0.8,
          dashArray: p.transportMode === 'AIR' ? '8 6' : p.transportMode === 'MER' ? '12 4' : undefined,
        }).addTo(map);
        allPoints.push(...latlngs);
      }

      // Origin marker
      if (p.originLat != null && p.originLng != null) {
        L.marker([p.originLat, p.originLng], {
          icon: createDotIcon('#3b82f6', showAll ? undefined : `🟢 ${p.originAddress}`),
        }).addTo(map).bindPopup(`<div style="font-size:12px;"><strong>Départ</strong><br/>${p.originAddress}</div>`);
        allPoints.push([p.originLat, p.originLng]);
      }

      // Destination marker
      if (p.destinationLat != null && p.destinationLng != null) {
        L.marker([p.destinationLat, p.destinationLng], {
          icon: createDotIcon('#ef4444', showAll ? undefined : `🔴 ${p.destinationAddress}`),
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
              }${
                wp.stopDurationMinutes && wp.stopDurationMinutes > 0
                  ? `<br/>⏸ Arrêt : ${wp.stopDurationMinutes} min`
                  : ''
              }</div>`);
          }
        }
      }

      // Animated position marker for single parcel view
      if (!showAll && showPosition && p.status !== 'PENDING' && p.status !== 'REFUSED') {
        const initialPos = simulatePosition(p, routeForSim);
        if (initialPos) {
          const bearing = getBearing(p, routeForSim) ?? 0;
          const animMarker = L.marker([initialPos.lat, initialPos.lng], {
            icon: createTransportIcon(p.transportMode, bearing),
          }).addTo(map);

          const iconLabel = p.transportMode === 'AIR' ? '✈️ Avion' : p.transportMode === 'MER' ? '🚢 Bateau' : p.transportMode === 'ROUTE' ? '🚛 Camion' : '📦 Colis';
          animMarker.bindPopup(
            `<div style="font-size:12px;"><strong>${iconLabel}</strong><br/>${p.name} (${p.trackingNumber})</div>`,
          );
          if (onParcelClick) animMarker.on('click', () => onParcelClick(p));
          allPoints.push([initialPos.lat, initialPos.lng]);

          // Animate marker along route
          if (p.status === 'IN_TRANSIT') {
            let progress = getTraveledRatio(p);

            function animate(_now: number) {
              // Recalculate ratio from real time (demo or real duration)
              progress = getTraveledRatio(p);
              const pos = simulatePosition(p, routeForSim);
              if (pos) {
                animMarker.setLatLng([pos.lat, pos.lng]);
              }
              if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
              }
            }
            animFrameRef.current = requestAnimationFrame(animate);
          }
        }
      }

      // Multi-package: static icons
      if (showAll && showPosition && p.status !== 'PENDING' && p.status !== 'REFUSED') {
        const pos = simulatePosition(p, routeForSim);
        if (pos) {
          L.marker([pos.lat, pos.lng], { icon: createTransportIcon(p.transportMode, 0) })
            .addTo(map)
            .bindPopup(`<div style="font-size:12px;"><strong>${getTransportIcon(p.transportMode)} ${p.name}</strong><br/>${p.trackingNumber}</div>`);
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
  }, [pkg, showAll, allPackages, showPosition, readOnly, editMode, onMapClick, osrmRoutes]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
      className="relative"
    />
  );
}


"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type RoutePoint = {
  lat: number;
  lng: number;
  place: string;
  day?: string | null;
};

const EMBER = "#e2552d";
const MIST = "#3a557d";

// Interpole un point à la fraction `p` (0..1) le long du chemin.
function pointAtFraction(pts: L.LatLng[], p: number): { path: L.LatLng[]; head: L.LatLng } {
  if (pts.length < 2) return { path: pts, head: pts[0] };
  const segs = pts.slice(1).map((pt, i) => pts[i].distanceTo(pt));
  const total = segs.reduce((a, b) => a + b, 0);
  let target = Math.max(0, Math.min(1, p)) * total;

  const path: L.LatLng[] = [pts[0]];
  for (let i = 0; i < segs.length; i++) {
    if (target >= segs[i]) {
      path.push(pts[i + 1]);
      target -= segs[i];
    } else {
      const f = segs[i] === 0 ? 0 : target / segs[i];
      const lat = pts[i].lat + (pts[i + 1].lat - pts[i].lat) * f;
      const lng = pts[i].lng + (pts[i + 1].lng - pts[i].lng) * f;
      const head = L.latLng(lat, lng);
      path.push(head);
      return { path, head };
    }
  }
  return { path, head: pts[pts.length - 1] };
}

function MapController({
  points,
  activeIndex,
}: {
  points: RoutePoint[];
  activeIndex: number;
}) {
  const map = useMap();

  // Cadrage initial sur l'ensemble du tracé.
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [60, 60] });
    setTimeout(() => map.invalidateSize(), 60);
  }, [map, points]);

  // Recentrage doux sur l'étape active.
  useEffect(() => {
    const p = points[Math.max(0, Math.min(points.length - 1, activeIndex))];
    if (!p) return;
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 7), {
      duration: 1.1,
      easeLinearity: 0.2,
    });
  }, [map, points, activeIndex]);

  return null;
}

export function RouteMap({
  points,
  progress,
  activeIndex,
}: {
  points: RoutePoint[];
  progress: number;
  activeIndex: number;
}) {
  const latlngs = useMemo(
    () => points.map((p) => L.latLng(p.lat, p.lng)),
    [points]
  );

  const drawn = useMemo(() => {
    if (latlngs.length < 2) return latlngs;
    return pointAtFraction(latlngs, progress).path;
  }, [latlngs, progress]);

  if (points.length === 0) return null;

  return (
    <MapContainer
      center={[points[0].lat, points[0].lng]}
      zoom={7}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />

      {/* Itinéraire complet, en sourdine */}
      <Polyline
        positions={latlngs.map((l) => [l.lat, l.lng])}
        pathOptions={{ color: MIST, weight: 1.5, opacity: 0.5, dashArray: "1 6" }}
      />

      {/* Portion parcourue, en braise */}
      <Polyline
        positions={drawn.map((l) => [l.lat, l.lng])}
        pathOptions={{ color: EMBER, weight: 3, opacity: 0.95, lineCap: "round" }}
      />

      {points.map((p, i) => {
        const active = i === activeIndex;
        const passed = i <= activeIndex;
        return (
          <CircleMarker
            key={`${p.lat}-${p.lng}-${i}`}
            center={[p.lat, p.lng]}
            radius={active ? 7 : 4}
            pathOptions={{
              color: passed ? EMBER : MIST,
              weight: active ? 3 : 1.5,
              fillColor: active ? EMBER : "#0a1626",
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={active}>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>
                {p.day ? `${p.day} · ` : ""}
                {p.place}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      <MapController points={points} activeIndex={activeIndex} />
    </MapContainer>
  );
}

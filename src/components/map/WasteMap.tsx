"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./waste-map.module.css";
import { WasteListingLocation, ItemType, WasteCategory } from "../../types";

// Fix default icons on Webpack/Next.js
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

interface MapClientProps {
  locations: WasteListingLocation[];
  onMarkerClick: (loc: WasteListingLocation) => void;
  focusListingId?: string | null;
}

function MapInteractions({
  locations,
  focusListingId,
}: Omit<MapClientProps, "onMarkerClick">) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      if (locations.length === 0) {
        map.setView([27.1751, 78.0421], 13);
      }
    }, 200);
  }, [map, locations.length]);

  useEffect(() => {
    if (focusListingId) {
      const loc = locations.find((l) => l.id === focusListingId);
      if (loc?.location.latitude != null && loc.location.longitude != null) {
        map.flyTo([loc.location.latitude, loc.location.longitude], 15, {
          animate: true,
          duration: 1,
        });
      }
    }
  }, [focusListingId, locations, map]);

  return null;
}

export default function MapClient({
  locations,
  onMarkerClick,
  focusListingId,
}: MapClientProps) {
  if (typeof window === "undefined") {
    return null;
  }

  const getIcon = useCallback((type: ItemType, cat?: WasteCategory) => {
    const baseColor =
      type === "old_item"
        ? "#FF9800"
        : cat === "hazardous"
        ? "#F44336"
        : cat === "e_waste"
        ? "#607D8B"
        : "#4CAF50";
    return L.divIcon({
      className: styles.customMarker,
      html: `<svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="${baseColor}" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="white"/></svg>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -20],
    });
  }, []);

  return (
    <MapContainer
      center={[27.1751, 78.0421]}
      zoom={13}
      scrollWheelZoom
      className={styles.mapComponent}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {locations.map(
        (l, index) =>
          l.location.latitude != null &&
          l.location.longitude != null && (
            <Marker
              key={l.id || (l as any)._id || `marker-${index}`}
              position={[l.location.latitude, l.location.longitude]}
              icon={getIcon(l.itemType, l.wasteCategory)}
              eventHandlers={{ click: () => onMarkerClick(l) }}
            >
              <Popup>
                <h3>{l.wasteType}</h3>
                <p>{l.description}</p>
                <p>
                  <strong>Qty:</strong> {l.quantity} {l.unit}
                </p>
                <p>
                  <strong>Status:</strong> {l.status}
                </p>
              </Popup>
            </Marker>
          )
      )}
      <MapInteractions locations={locations} focusListingId={focusListingId} />
    </MapContainer>
  );
}

export function WasteMap({
  locations,
  onMarkerClick,
  focusListingId,
}: MapClientProps) {
  return (
    <MapClient
      locations={locations}
      onMarkerClick={onMarkerClick}
      focusListingId={focusListingId}
    />
  );
}
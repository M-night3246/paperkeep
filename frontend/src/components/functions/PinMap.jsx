import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:15px;height:15px;border-radius:50%;background:var(--accent-color);border:2px solid white;"></div>`,
  iconSize: [15, 15],
  iconAnchor: [10, 10],
});

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const FlyToHandler = ({ flyTo, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (flyTo && Array.isArray(flyTo) && flyTo.length === 2) {
      map.flyTo(flyTo, 16, { duration: 0.8 });

      // Find matching marker and open its popup
      const key = flyTo.join(",");
      const marker = markerRefs.current[key];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [flyTo, map, markerRefs]);

  return null;
};

const PinMap = ({ places = [], flyTo = null }) => {
  const defaultCenter = [3.139, 101.6869];
  const markerRefs = useRef({});

  return (
    <MapContainer center={defaultCenter} zoom={10} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToHandler flyTo={flyTo} markerRefs={markerRefs} />

      {places.map((place) => {
        const position = [place.latitude, place.longitude];
        const key = position.join(",");

        return (
          <Marker
            key={place.id}
            position={position}
            icon={customIcon}
            ref={(ref) => {
              if (ref) markerRefs.current[key] = ref;
            }}
          >
            <Popup>
              <strong>{place.name}</strong><br />
              Last Visited: {formatDateTime(place.last_visited)}<br />
              Total Spent: RM{parseFloat(place.purchase_total).toFixed(2)}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default PinMap;

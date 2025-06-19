import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAuthFetch } from "../../hooks/authFetch";

const VisitedPlacesMap = () => {
  const authFetch = useAuthFetch();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    authFetch(`${process.env.REACT_APP_API_BASE_URL}/api/analytics/visited-places/`)
      .then(setPlaces)
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  const defaultCenter = [3.139, 101.6869]; // Kuala Lumpur fallback

  return (
    <MapContainer center={defaultCenter} zoom={6} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
          <Popup>
            <strong>{place.name}</strong><br />
            Visit: {place.last_visited }<br />
            Total Spent: RM{parseFloat(place.purchase_total).toFixed(2)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default VisitedPlacesMap;

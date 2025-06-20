import React, { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import PinMap from "../../components/functions/PinMap";
import GenericSidebar from "../../components/layout/GenericSidebar";
import { useAuthFetch } from "../../hooks/authFetch";

export default function MapPage() {
  const authFetch = useAuthFetch();
  const [places, setPlaces] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    authFetch(`${process.env.REACT_APP_API_BASE_URL}/api/analytics/visited-places/`)
      .then(setPlaces)
      .catch((err) => console.error("Error fetching places:", err));
  }, []);

  return (
    <AppLayout>
      <h1>Map</h1>
      <div style={{ display: "flex", border: "2px solid var(--black)" }}>
        <div style={{ flex: 1 }}>
          <PinMap places={places} flyTo={selectedCoords} />
        </div>
        <GenericSidebar
          title="Locations"
          items={places}
          onItemClick={(place) => {
            setSelectedCoords([place.latitude, place.longitude]);
            console.log(place);
          }}
        />
      </div>
    </AppLayout>
  );
}

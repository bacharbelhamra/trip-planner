import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";

function MapMarker({ place, index, selectedPlace }) {

  const markerRef = useRef(null);

  const isSelected =
    selectedPlace &&
    place.lat === selectedPlace.lat &&
    place.lng === selectedPlace.lng;

  useEffect(() => {

    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }

  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[place.lat, place.lng]}
      icon={
        isSelected
          ? createSelectedIcon(index + 1)
          : createNumberIcon(index + 1)
      }
    >
      <Popup>
        <b>{index + 1}. {place.name}</b>
        <br />
        {place.time}
      </Popup>
    </Marker>
  );
}

function createSelectedIcon(number) {
  return L.divIcon({
    html: `
      <div style="
        background:#111827;
        color:white;
        width:34px;
        height:34px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        border:3px solid #3b82f6;
        box-shadow:0 0 8px rgba(0,0,0,0.5);
      ">
        ${number}
      </div>
    `,
    className: "",
    iconSize: [34, 34],
  });
}

/* ---------- MAP FLY TO SELECTED PLACE ---------- */

function FlyToPlace({ place }) {

  const map = useMap();

  useEffect(() => {

    if (!place) return;

    map.flyTo([place.lat, place.lng], 15, {
      duration: 1.5
    });

  }, [place]);

  return null;
}


/* ---------- NUMBERED MARKER ICON ---------- */

function createNumberIcon(number) {

  return L.divIcon({
    html: `
      <div style="
        background:#2563eb;
        color:white;
        width:28px;
        height:28px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
        border:2px solid white;
        box-shadow:0 0 4px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    className: "",
    iconSize: [28, 28],
  });

}


/* ---------- MAIN MAP COMPONENT ---------- */

function MapView({ places, center, selectedPlace }) {

  const mapCenter = center || [48.8566, 2.3522];

  const [route, setRoute] = useState([]);


  /* ---------- FETCH ROAD ROUTE FROM OSRM ---------- */

  useEffect(() => {

    async function fetchRoute() {

      if (!places || places.length < 2) return;

      const coordinates = places
        .map(p => `${p.lng},${p.lat}`)
        .join(";");

      const url =
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      try {

        const res = await fetch(url);
        const data = await res.json();

        const routeCoords =
          data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

        setRoute(routeCoords);

      } catch (err) {

        console.error("Route error:", err);

      }

    }

    fetchRoute();

  }, [places]);


  return (

    <div style={{ height: "400px", width: "100%" }}>

      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Animate map when clicking a place */}
        <FlyToPlace place={selectedPlace} />


        {/* MARKERS */}

        {places?.map((place, index) => (
          <MapMarker
            key={index}
            place={place}
            index={index}
            selectedPlace={selectedPlace}
          />
        ))}


        {/* ROUTE LINE */}

        {route.length > 0 && (

          <Polyline
            positions={route}
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />

        )}

      </MapContainer>

    </div>

  );

}

export default MapView;
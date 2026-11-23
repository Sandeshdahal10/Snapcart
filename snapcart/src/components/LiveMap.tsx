"use client";
/**
 * LiveMap
 * Shows the customer's delivery address and the delivery boy's live position
 * on an OpenStreetMap (Leaflet) map, with a dashed line between them.
 *
 * Leaflet touches `window` when it is imported, so always load this component
 * with next/dynamic and { ssr: false }:
 *   const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });
 */
import React, { useEffect } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

interface ILocation {
  latitude: number;
  longitude: number;
}

interface Props {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation | null;
}

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/2642/2642502.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const deliveryBoyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/9561/9561688.png",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

const isValid = (loc: ILocation | null): loc is ILocation =>
  !!loc &&
  Number.isFinite(Number(loc.latitude)) &&
  Number.isFinite(Number(loc.longitude)) &&
  !(Number(loc.latitude) === 0 && Number(loc.longitude) === 0);

/** Keeps both markers in view whenever either position changes. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

function LiveMap({ userLocation, deliveryBoyLocation }: Props) {
  const userPos: [number, number] = [
    Number(userLocation.latitude),
    Number(userLocation.longitude),
  ];
  const boyPos: [number, number] | null = isValid(deliveryBoyLocation)
    ? [Number(deliveryBoyLocation.latitude), Number(deliveryBoyLocation.longitude)]
    : null;

  const points: [number, number][] = boyPos ? [userPos, boyPos] : [userPos];

  return (
    <div className="relative w-full h-[450px]">
      <MapContainer
        center={userPos as LatLngExpression}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={userPos} icon={userIcon}>
          <Popup>Delivery address</Popup>
        </Marker>
        {boyPos && (
          <>
            <Marker position={boyPos} icon={deliveryBoyIcon}>
              <Popup>Delivery boy</Popup>
            </Marker>
            <Polyline
              positions={[boyPos, userPos]}
              pathOptions={{ color: "#16a34a", weight: 4, dashArray: "8 8" }}
            />
          </>
        )}
        <FitBounds points={points} />
      </MapContainer>
      {!boyPos && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow">
          Waiting for delivery boy&apos;s location…
        </div>
      )}
    </div>
  );
}

export default LiveMap;

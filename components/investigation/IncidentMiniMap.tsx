"use client";

import { useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface Props {
  lat: number;
  lng: number;
  address: string;
}

export function IncidentMiniMap({ lat, lng, address }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    map.panTo({ lat, lng });
  }, [lat, lng]);

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
        Loading map…
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "192px" }}
        center={{ lat, lng }}
        zoom={15}
        onLoad={onLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
        }}
      >
        <Marker
          position={{ lat, lng }}
          title={address}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#EA580C",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
            scale: 10,
          }}
        />
      </GoogleMap>
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <span>{address}</span>
        <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
      </div>
    </div>
  );
}

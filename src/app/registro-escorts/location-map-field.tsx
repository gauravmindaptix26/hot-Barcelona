"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  initialValue?: string;
};

export default function LocationMapField({ initialValue = "" }: Props) {
  const [value, setValue] = useState(initialValue);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue || value) return;
    if (!("geolocation" in navigator)) {
      setGeoError("Location not supported on this device.");
      return;
    }

    let active = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setValue(`${lat}, ${lng}`);
      },
      () => {
        if (!active) return;
        setGeoError("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    return () => {
      active = false;
    };
  }, [initialValue, value]);

  const mapSrc = useMemo(() => {
    const query = value.trim() || "Barcelona, Spain";
    if (!query) return "";
    const encoded = encodeURIComponent(query);
    return `https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }, [value]);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.6fr] md:items-start">
      <div className="flex min-h-[260px] w-full flex-col justify-between space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4 md:min-h-[300px]">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50">
          Address
        </label>
        <input
          name="address"
          placeholder="Type full address or use current location"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="street-address"
          className="h-14 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
        />
        <p className="text-xs text-white/50">
          {geoError ??
            "We auto-fill your current location. Edit the address to update the map."}
        </p>
      </div>

      <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/50 md:min-h-[300px]">
        {mapSrc ? (
          <iframe
            title="Map preview"
            src={mapSrc}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
            Map preview
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  initialValue?: string;
};

export default function LocationMapField({ initialValue = "" }: Props) {
  const [value, setValue] = useState(initialValue);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { location?: string; formFields?: Record<string, unknown> } }>).detail?.profile;
      const formFields =
        profile?.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
          ? profile.formFields
          : {};
      const rawAddress = formFields.address;
      const savedAddress =
        typeof rawAddress === "string"
          ? rawAddress.trim()
          : Array.isArray(rawAddress)
            ? rawAddress.find(
                (item): item is string => typeof item === "string" && item.trim().length > 0
              )?.trim() ?? ""
            : "";
      setValue(savedAddress || profile?.location || "");
      setGeoError(null);
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, []);

  useEffect(() => {
    if (initialValue || value) return;
    if (!("geolocation" in navigator)) {
      const timeoutId = window.setTimeout(() => {
        setGeoError("Location not supported on this device.");
      }, 0);
      return () => window.clearTimeout(timeoutId);
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
    <div className="grid gap-3 sm:gap-4 md:grid-cols-[1fr_1.6fr] md:items-start">
      <div className="flex min-h-[220px] w-full flex-col justify-between space-y-3 rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(0,0,0,0.56))] p-4 sm:min-h-[260px] sm:p-5 md:min-h-[300px]">
        <label className="text-sm font-medium uppercase tracking-[0.22em] text-white/55">
          Address
        </label>
        <input
          name="address"
          placeholder="Type full address or use current location"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="street-address"
          className="h-12 w-full rounded-[22px] border border-white/10 bg-black/60 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none sm:h-14"
        />
        <p className="text-sm leading-relaxed text-white/55">
          {geoError ?? "We auto-fill your current location. Edit the address to update the map."}
        </p>
      </div>

      <div className="relative h-full min-h-[220px] overflow-hidden rounded-[24px] border border-white/10 bg-black/50 shadow-[0_16px_34px_rgba(0,0,0,0.22)] sm:min-h-[260px] md:min-h-[300px]">
        {mapSrc ? (
          <iframe
            title="Map preview"
            src={mapSrc}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.22em] text-white/40">
            Map preview
          </div>
        )}
      </div>
    </div>
  );
}

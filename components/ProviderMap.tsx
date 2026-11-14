'use client';
import { useEffect, useRef } from 'react';
import { getThanaCoords, distanceKm, RAJSHAHI_CENTRE } from '@/lib/thana-coords';

interface Provider {
  id: string;
  headline?: string;
  location_thana?: string;
  location_district?: string;
  avg_rating: number;
  completed_jobs: number;
  services?: { category_icon: string; category_bn: string }[];
}

interface Props {
  providers: Provider[];
  userCoords?: [number, number] | null;
}

export default function ProviderMap({ providers, userCoords }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inject pin pulse animation CSS once
    if (!document.getElementById('edh-map-animations')) {
      const s = document.createElement('style');
      s.id = 'edh-map-animations';
      s.textContent = `
        @keyframes pinPulse {
          0%,100% { box-shadow:0 2px 8px rgba(0,0,0,0.2); transform:rotate(-45deg) scale(1); }
          50%      { box-shadow:0 4px 20px rgba(22,163,74,0.55),0 0 0 10px rgba(22,163,74,0.12);
                     transform:rotate(-45deg) scale(1.12); }
        }
        @keyframes userPing {
          0%   { transform:translate(-50%,-50%) scale(1); opacity:0.7; }
          100% { transform:translate(-50%,-50%) scale(3.2); opacity:0; }
        }
      `;
      document.head.appendChild(s);
    }

    // Dynamically import leaflet (browser-only)
    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: RAJSHAHI_CENTRE,
        zoom: 12,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Force Leaflet to recalculate container size after dynamic mount
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);

      // User location pin — sonar ping
      if (userCoords) {
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:16px;height:16px;">
            <div style="
              position:absolute;top:50%;left:50%;
              width:16px;height:16px;border-radius:50%;
              background:rgba(59,130,246,0.35);
              animation:userPing 1.8s ease-out infinite;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              width:16px;height:16px;border-radius:50%;
              background:rgba(59,130,246,0.25);
              animation:userPing 1.8s ease-out infinite 0.6s;
            "></div>
            <div style="
              position:absolute;top:0;left:0;
              width:16px;height:16px;border-radius:50%;
              background:#3b82f6;border:3px solid white;
              box-shadow:0 0 0 3px rgba(59,130,246,0.4);
            "></div>
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(userCoords, { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>আপনার অবস্থান</b>');
      }

      // Provider pins
      providers.forEach((p) => {
        const coords = getThanaCoords(p.location_thana);
        if (!coords) return;

        const rating = Number(p.avg_rating);
        const ref = userCoords ?? RAJSHAHI_CENTRE;
        const dist = distanceKm(ref, coords);
        const icon = p.services?.[0]?.category_icon || '👤';
        const service = p.services?.[0]?.category_bn || 'সেবা';

        const pinIcon = L.divIcon({
          className: '',
          html: `<div style="
            background:white;border:2px solid #16a34a;border-radius:50% 50% 50% 0;
            width:36px;height:36px;transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            animation:pinPulse 2.8s ease-in-out infinite;
            animation-delay:${Math.random() * 2}s;
          ">
            <span style="transform:rotate(45deg);font-size:18px">${icon}</span>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        });

        const popup = L.popup({ maxWidth: 220 }).setContent(`
          <div style="font-family:sans-serif;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:2px">${icon} ${service}</div>
            ${p.headline ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px">${p.headline}</div>` : ''}
            <div style="font-size:11px;color:#374151;margin-bottom:8px">
              📍 ${p.location_thana || p.location_district || 'রাজশাহী'}
              ${rating > 0 ? ` &nbsp;⭐ ${rating.toFixed(1)}` : ''}
              &nbsp;· ~${dist.toFixed(1)} km
            </div>
            <div style="display:flex;gap:6px">
              <a href="/providers/${p.id}" style="
                flex:1;text-align:center;padding:5px 8px;border-radius:8px;
                background:#16a34a;color:white;text-decoration:none;font-size:12px;font-weight:600
              ">Profile দেখুন</a>
            </div>
          </div>
        `);

        L.marker(coords, { icon: pinIcon }).addTo(map).bindPopup(popup);
      });

      // Fit bounds to all pins
      const allCoords = providers
        .map((p) => getThanaCoords(p.location_thana))
        .filter(Boolean) as [number, number][];
      if (userCoords) allCoords.push(userCoords);
      if (allCoords.length > 1) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Re-add markers when providers list changes after initial mount
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
      });
      // User pin
      if (userCoords) {
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.4);"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8],
        });
        L.marker(userCoords, { icon: userIcon }).addTo(mapRef.current).bindPopup('<b>আপনার অবস্থান</b>');
      }
      providers.forEach((p) => {
        const coords = getThanaCoords(p.location_thana);
        if (!coords) return;
        const rating = Number(p.avg_rating);
        const ref = userCoords ?? RAJSHAHI_CENTRE;
        const dist = distanceKm(ref, coords);
        const icon = p.services?.[0]?.category_icon || '👤';
        const service = p.services?.[0]?.category_bn || 'সেবা';
        const pinIcon = L.divIcon({
          className: '',
          html: `<div style="background:white;border:2px solid #16a34a;border-radius:50% 50% 50% 0;width:36px;height:36px;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);animation:pinPulse 2.8s ease-in-out infinite;animation-delay:${Math.random() * 2}s;"><span style="transform:rotate(45deg);font-size:18px">${icon}</span></div>`,
          iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -38],
        });
        const popup = L.popup({ maxWidth: 220 }).setContent(`
          <div style="font-family:sans-serif;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:2px">${icon} ${service}</div>
            ${p.headline ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px">${p.headline}</div>` : ''}
            <div style="font-size:11px;color:#374151;margin-bottom:8px">📍 ${p.location_thana || 'রাজশাহী'}${rating > 0 ? ` &nbsp;⭐ ${rating.toFixed(1)}` : ''} &nbsp;· ~${dist.toFixed(1)} km</div>
            <a href="/providers/${p.id}" style="display:block;text-align:center;padding:5px 8px;border-radius:8px;background:#16a34a;color:white;text-decoration:none;font-size:12px;font-weight:600">Profile দেখুন</a>
          </div>
        `);
        L.marker(coords, { icon: pinIcon }).addTo(mapRef.current).bindPopup(popup);
      });
    });
  }, [providers, userCoords]); // eslint-disable-line

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </>
  );
}

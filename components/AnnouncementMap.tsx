'use client';
import { useEffect, useRef } from 'react';
import { getThanaCoords, RAJSHAHI_CENTRE } from '@/lib/thana-coords';

interface Props {
  thana?: string | null;
  userCoords?: [number, number] | null;
  jobTitle?: string;
}

export default function AnnouncementMap({ thana, userCoords, jobTitle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const jobCoords = getThanaCoords(thana) ?? RAJSHAHI_CENTRE;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (!document.getElementById('edh-map-animations')) {
      const s = document.createElement('style');
      s.id = 'edh-map-animations';
      s.textContent = `
        @keyframes userPing {
          0%   { transform:translate(-50%,-50%) scale(1); opacity:0.7; }
          100% { transform:translate(-50%,-50%) scale(3.2); opacity:0; }
        }
      `;
      document.head.appendChild(s);
    }

    import('leaflet').then(async (L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(containerRef.current!, {
        center: jobCoords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Job pin (green teardrop)
      const jobIcon = L.divIcon({
        className: '',
        html: `<div style="
          background:white;border:3px solid #16a34a;border-radius:50% 50% 50% 0;
          width:42px;height:42px;transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 14px rgba(22,163,74,0.45);
        "><span style="transform:rotate(45deg);font-size:20px">📋</span></div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -44],
      });

      L.marker(jobCoords, { icon: jobIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">📍 ${thana || 'রাজশাহী'}</div>
            <div style="font-size:11px;color:#6b7280">${jobTitle || 'কাজের স্থান'}</div>
          </div>
        `);

      // User location (blue sonar) + in-app routing via OSRM
      if (userCoords) {
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:16px;height:16px;">
            <div style="position:absolute;top:50%;left:50%;width:16px;height:16px;border-radius:50%;background:rgba(59,130,246,0.35);animation:userPing 1.8s ease-out infinite;"></div>
            <div style="position:absolute;top:50%;left:50%;width:16px;height:16px;border-radius:50%;background:rgba(59,130,246,0.25);animation:userPing 1.8s ease-out infinite 0.6s;"></div>
            <div style="position:absolute;top:0;left:0;width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.4);"></div>
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(userCoords, { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>আপনার অবস্থান</b>');

        // Fit both pins first
        map.fitBounds(L.latLngBounds([jobCoords, userCoords]), { padding: [55, 55] });

        // Fetch road route from OSRM (free, no API key needed)
        // OSRM expects lng,lat order
        const [uLat, uLng] = userCoords;
        const [jLat, jLng] = jobCoords;
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${jLng},${jLat}?geometries=geojson&overview=full`;

        try {
          const resp = await fetch(osrmUrl);
          const data = await resp.json();

          if (data.code === 'Ok' && data.routes?.[0]) {
            const route = data.routes[0];
            // GeoJSON coordinates are [lng, lat] — swap for Leaflet [lat, lng]
            const latlngs = route.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );

            // Draw route line
            L.polyline(latlngs, {
              color: '#16a34a',
              weight: 5,
              opacity: 0.85,
              dashArray: '10, 6',
              lineCap: 'round',
            }).addTo(map);

            // Distance + time info badge (Leaflet custom control)
            const distKm = (route.distance / 1000).toFixed(1);
            const mins = Math.round(route.duration / 60);
            const timeLabel = mins < 60
              ? `${mins} মিনিট`
              : `${Math.floor(mins / 60)} ঘন্টা ${mins % 60} মিনিট`;

            const InfoControl = L.Control.extend({
              onAdd() {
                const div = L.DomUtil.create('div');
                div.style.cssText = `
                  background:white;border-radius:12px;padding:8px 12px;
                  box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e5e7eb;
                  font-family:sans-serif;font-size:12px;line-height:1.5;
                  pointer-events:none;
                `;
                div.innerHTML = `
                  <div style="font-weight:700;color:#111;margin-bottom:2px">${distKm} কিমি</div>
                  <div style="color:#6b7280">~${timeLabel} দূরত্ব</div>
                `;
                return div;
              },
            });
            new InfoControl({ position: 'bottomleft' }).addTo(map);

          } else {
            // OSRM failed — draw straight dashed fallback line
            L.polyline([userCoords, jobCoords], {
              color: '#16a34a', weight: 3, opacity: 0.5, dashArray: '6, 5',
            }).addTo(map);
          }
        } catch {
          // Network error — straight line fallback
          L.polyline([userCoords, jobCoords], {
            color: '#16a34a', weight: 3, opacity: 0.5, dashArray: '6, 5',
          }).addTo(map);
        }
      }
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </>
  );
}

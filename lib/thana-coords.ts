// Rajshahi thana/upazila coordinates (lat, lng)
export const THANA_COORDS: Record<string, [number, number]> = {
  'বোয়ালিয়া':   [24.3636, 88.6241],
  'রাজপাড়া':    [24.3745, 88.6041],
  'শাহ মখদুম':  [24.3950, 88.5950],
  'মতিহার':     [24.3800, 88.6500],
  'পবা':         [24.4200, 88.5500],
  'কাটাখালী':   [24.3400, 88.6800],
  'দুর্গাপুর':   [24.4500, 88.7200],
  'বাঘা':        [24.3500, 88.9300],
  'চারঘাট':     [24.2400, 88.8300],
};

// City centre fallback (Boalia)
export const RAJSHAHI_CENTRE: [number, number] = [24.3636, 88.6241];

export function getThanaCoords(thana?: string | null): [number, number] | null {
  if (!thana) return null;
  return THANA_COORDS[thana.trim()] ?? null;
}

// Haversine distance in km between two [lat, lng] pairs
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

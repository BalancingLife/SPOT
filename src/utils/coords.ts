export function getRoundedCoords(coords: { lat: number; lng: number }) {
  return {
    lat: Number(coords.lat.toFixed(4)),
    lng: Number(coords.lng.toFixed(4)),
  };
}

export function createCoordsKey(lat: number, lng: number) {
  return `${lat},${lng}`;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Great-circle distance between two {lat, lng} points, in kilometers.
function haversineDistanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

module.exports = { haversineDistanceKm };

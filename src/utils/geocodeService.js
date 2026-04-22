export const geocodePlace = async (placeName) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error("Geocode error:", error);
    return null;
  }
};
const accessKey = "E_yScG20-8ksjerL7QB2j18RX9bLTCZ-YmyoQ9YDEz0";

export async function getPlaceImage(place) {

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(place)}&per_page=1&client_id=${accessKey}`
  );

  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return data.results[0].urls.small;
  }

  return "https://images.unsplash.com/photo-1501785888041-af3ef285b470";
}


export async function getDestinationImage(city) {

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}+city+skyline&per_page=1&client_id=${accessKey}`
  );

  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return data.results[0].urls.regular;
  }

  return "https://picsum.photos/1200/400";
}
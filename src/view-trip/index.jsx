import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// components
import HotelCard from "@/components/HotelCard";
import RestaurantCard from "@/components/RestaurantCard";
import PlaceCard from "@/components/PlaceCard";

const MapView = lazy(() => import("@/components/MapView"));

function ViewTrip() {
  const { state } = useLocation();

  const [mapPlaces, setMapPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [travelTimes, setTravelTimes] = useState({});

  const itemRefs = useRef({});

  // ✅ FIX 1: Normalize data source
  const tripData = useMemo(() => {
    if (state && state.trip) return state;

    const savedTrip = localStorage.getItem("lastTrip");
    if (!savedTrip) return null;

    const parsed = JSON.parse(savedTrip);

    if (parsed.trip) return parsed;

    return {
      trip: parsed,
      location: null,
      days: null,
      budget: null,
      travelers: null,
    };
  }, [state]);

  if (!tripData) {
    return <div className="p-10">No trip data</div>;
  }

  // ✅ FIX 2: correct key
  const trip = tripData?.trip;

  const location = tripData?.location;
  const days = tripData?.days;
  const budget = tripData?.budget;
  const travelers = tripData?.travelers;

  /* ---------- MAP PLACES ---------- */

  useEffect(() => {
    if (!trip?.days) return;

    const results = [];

    for (const day of trip.days) {
      for (const item of day.schedule || []) {
        if (!item.lat || !item.lng) continue;

        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);

        if (isNaN(lat) || isNaN(lng)) continue;

        results.push({
          name: item.place,
          time: item.time,
          lat,
          lng,
          day: day.day,
        });
      }
    }

    results.sort((a, b) =>
      a.time.split(" - ")[0].localeCompare(b.time.split(" - ")[0])
    );

    setMapPlaces(results);
  }, [trip?.days]);

  /* ---------- TRAVEL TIMES ---------- */

  useEffect(() => {
    async function loadTravelTimes() {
      if (!trip?.days) return;

      const times = {};

      for (const day of trip.days) {
        const schedule = day.schedule || [];

        for (let i = 0; i < schedule.length - 1; i++) {
          const from = schedule[i];
          const to = schedule[i + 1];

          if (!from.lat || !to.lat) continue;

          const fromLat = parseFloat(from.lat);
          const fromLng = parseFloat(from.lng);
          const toLat = parseFloat(to.lat);
          const toLng = parseFloat(to.lng);

          if ([fromLat, fromLng, toLat, toLng].some(isNaN)) continue;

          const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

          try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.routes?.length > 0) {
              const duration = data.routes[0].duration / 60;
              times[`${day.day}-${i}`] = Math.round(duration);
            }
          } catch (err) {
            console.error("Travel time error", err);
          }
        }
      }

      setTravelTimes(times);
    }

    loadTravelTimes();
  }, [trip?.days]);

  /* ---------- SCROLL ---------- */

  useEffect(() => {
    if (!selectedPlace) return;

    const element = itemRefs.current[selectedPlace.name];

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedPlace]);

  return (
    <div className="p-8 max-w-screen-xl mx-auto space-y-10">

      {/* HERO */}
      <img
        src={`https://picsum.photos/1200/400?random=${location?.label}`}
        className="w-full h-64 object-cover rounded-xl"
      />

      <h1 className="text-3xl font-bold">
        {trip?.destination || location?.label}
      </h1>

      {/* BADGES */}
      <div className="flex gap-3 mt-3">
        <Badge variant="secondary">{days} Days</Badge>
        <Badge variant="outline">{budget} Budget</Badge>
        <Badge>{travelers}</Badge>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-3 space-y-8">

          {/* HOTELS + RESTAURANTS */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                Stay & Food
              </h2>

              <Tabs defaultValue="hotels">
                <TabsList className="mb-6">
                  <TabsTrigger value="hotels">Hotels</TabsTrigger>
                  <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                </TabsList>

                <TabsContent value="hotels">
                  <div className="grid md:grid-cols-2 gap-6">
                    {trip?.hotels?.map((hotel, index) => (
                      <HotelCard key={index} hotel={hotel} location={location} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="restaurants">
                  <div className="grid md:grid-cols-2 gap-6">
                    {trip?.restaurants?.map((res, index) => (
                      <RestaurantCard key={index} restaurant={res} location={location} />
                    ))}
                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

          {/* TIMELINE */}
          <div className="space-y-8">
            {trip?.days?.map((day) => (
              <Card key={day.day}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Day {day.day}
                  </h2>

                  <div className="relative border-l-2 ml-4">
                    {day.schedule?.map((item, index) => (
                      <div
                        key={index}
                        ref={(el) => (itemRefs.current[item.place] = el)}
                        className="mb-12 ml-6"
                      >
                        <span className="absolute -left-3 w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>

                        <PlaceCard
                          item={{
                            ...item,
                            description: item.description || "No description available",
                          }}
                          location={location}
                          onViewOnMap={() =>
                            setSelectedPlace({
                              name: item.place,
                              lat: item.lat,
                              lng: item.lng,
                            })
                          }
                        />

                        {index < day.schedule.length - 1 && (
                          <p className="text-sm mt-2">
                            🚗 {travelTimes[`${day.day}-${index}`] || "..."} min
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Trip Overview</h3>
                <div className="flex justify-between text-sm">
                  <span>📍 {mapPlaces.length} places</span>
                  <span>🗓 {days} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-2xl font-bold mb-4">
                  Trip Map
                </h2>

                <Suspense fallback={<div>Loading map...</div>}>
                  <MapView
                    center={[
                      parseFloat(trip?.city_lat || location?.value?.lat || 0),
                      parseFloat(trip?.city_lng || location?.value?.lon || 0),
                    ]}
                    places={mapPlaces}
                    selectedPlace={selectedPlace}
                  />
                </Suspense>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ViewTrip;
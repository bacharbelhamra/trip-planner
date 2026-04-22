import { useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔥 AUTH + FETCH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTrips(user);
      } else {
        setTrips([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 FETCH TRIPS
  const fetchTrips = async (user) => {
    try {
      const q = query(
        collection(db, "trips"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTrips(data);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE TRIP
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "trips", id));

      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };


  // 🔥 OPEN TRIP
  const openTrip = (trip) => {

    localStorage.setItem(
      "lastTrip",
      JSON.stringify({
        trip: trip.tripData,
        location: { label: trip.destination },
        days: trip.days,
        budget: trip.budget,
        travelers: trip.travelers,
      })
    );

    navigate("/view-trip", {
      state: {
        trip: trip.tripData, // ✅ FIX HERE
        location: { label: trip.destination },
        days: trip.days,
        budget: trip.budget,
        travelers: trip.travelers,
      },
    });
  };
  // 🔥 LOADING STATE
  if (loading) {
    return <div className="p-10">Loading trips...</div>;
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">My Trips</h1>

      {trips.length === 0 ? (
        <div className="text-muted-foreground">
          No trips yet. Create your first one 🚀
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="cursor-pointer hover:shadow-xl transition duration-300"
            >
              <CardContent className="p-4 space-y-4">

                {/* IMAGE */}
                <img
                  src={`https://picsum.photos/400/200?random=${trip.destination}`}
                  className="rounded-lg w-full h-40 object-cover"
                />

                {/* TITLE */}
                <h2 className="text-lg font-semibold">
                  {trip.destination}
                </h2>

                {/* INFO */}
                <p className="text-sm text-muted-foreground">
                  {trip.days} days • {trip.budget} • {trip.travelers}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  <Button
                    className="w-full"
                    onClick={() => openTrip(trip)}
                  >
                    View
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(trip.id)}
                  >
                    Delete
                  </Button>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </div>
  );
}

export default MyTrips;
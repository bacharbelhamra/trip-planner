import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateTrip } from "@/services/aiService";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function CreateTrip() {
  const [location, setLocation] = useState(null);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");
  const navigate = useNavigate();

  // OpenStreetMap search
  let timeout;

  const loadOptions = (inputValue) => {
    return new Promise((resolve) => {
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        if (!inputValue || inputValue.length < 3) {
          resolve([]);
          return;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              inputValue
            )}&addressdetails=1&limit=5`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          const data = await response.json();

          resolve(
            data.map((place) => ({
              label: place.display_name,
              value: {
                lat: place.lat,
                lon: place.lon,
              },
            }))
          );
        } catch (error) {
          console.error("Search error:", error);
          resolve([]);
        }
      }, 800);
    });
  };

  const budgets = [
    {
      title: "Cheap",
      desc: "Stay conscious of costs",
      value: "cheap",
      icon: "💵",
    },
    {
      title: "Moderate",
      desc: "Keep cost on the average side",
      value: "moderate",
      icon: "💰",
    },
    {
      title: "Luxury",
      desc: "Don't worry about cost",
      value: "luxury",
      icon: "💎",
    },
  ];

  const travelersList = [
    {
      title: "Just Me",
      desc: "A solo traveler in exploration",
      value: "solo",
      icon: "✈️",
    },
    {
      title: "A Couple",
      desc: "Two travelers in tandem",
      value: "couple",
      icon: "🥂",
    },
    {
      title: "Family",
      desc: "A group of fun loving adventurers",
      value: "family",
      icon: "🏡",
    },
    {
      title: "Friends",
      desc: "A bunch of thrill seekers",
      value: "friends",
      icon: "⛵",
    },
  ];

  const handleGenerateTrip = async () => {
    if (!location || !days || !budget || !travelers) {
      alert("Please fill all fields");
      return;
    }

    const prompt = `
You are a professional travel planner.

Create a detailed ${days}-day travel itinerary for ${location.label}.

Traveler type: ${travelers}
Budget: ${budget}

IMPORTANT RULES:
- Use REAL and popular tourist attractions
- Optimize travel (group nearby places together)
- Use realistic times (morning, afternoon, evening flow)
- Avoid repeating places
- Keep activities logical (no jumping across the city)
- Include 3 to 5 activities per day

Return ONLY JSON in this exact format:

{
  "destination": "city name",
  "city_lat": 0,
  "city_lng": 0,

  "hotels":[
  {
    "name":"REAL hotel name",
    "price":"realistic price range (e.g. $120–$250)",
    "rating":"4.0–5.0",
    "area":"central / near attractions",
    "description":"short realistic description",
    "lat":0,
    "lng":0
  }
],

"restaurants":[
  {
    "name":"REAL restaurant name",
    "type":"cuisine type (Moroccan, Italian, etc)",
    "rating":"4.0–5.0",
    "price_range":"$ / $$ / $$$",
    "description":"short description (why it's popular)",
    "lat":0,
    "lng":0
  }
],

  "days":[
    {
      "day":1,
      "schedule":[
        {
          "time":"09:00 - 11:00",
          "place":"Eiffel Tower",
          "description":"Short realistic description",
          "lat":0,
          "lng":0
        }
      ]
    }
  ]
}
`;

    console.log("Generating trip...");

    try {
      const result = await generateTrip(prompt);

      console.log("RESULT:", result);

      if (!result) {
        alert("AI failed to generate trip ❌");
        return;
      }

      if (!result.days || !Array.isArray(result.days)) {
        alert("Invalid trip data ❌");
        return;
      }

      console.log("BEFORE FIREBASE");

      const user = auth.currentUser;

      // ✅ WAIT for save
      const docRef = await addDoc(collection(db, "trips"), {
        userId: user?.uid || "guest",
        destination: location?.label || "Unknown",
        days,
        budget,
        travelers,
        tripData: result,
        createdAt: serverTimestamp(),
      });

      console.log("✅ SAVED:", docRef.id);

      console.log("NAVIGATING 🚀");

      navigate("/view-trip", {
        state: {
          trip: result,
          location,
          days,
          budget,
          travelers,
        },
      });

    } catch (error) {
      console.error("Trip generation failed:", error);
      alert("Something went wrong generating the trip.");
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Plan Your Trip</h1>

      <div>
        <label className="font-medium">Destination</label>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={setLocation}
          placeholder="Search for a city..."
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
            }),
          }}
        />
      </div>

      <div>
        <label className="font-medium">Number of Days</label>
        <Input
          type="number"
          placeholder="Example: 3"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="bg-background"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">
          What is Your Budget?
        </h2>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {budgets.map((item) => (
            <Card
              key={item.value}
              onClick={() => setBudget(item.value)}
              className={`p-4 cursor-pointer transition rounded-xl border border-border bg-card hover:bg-accent ${budget === item.value
                ? "border-white ring-2 ring-white bg-accent"
                : ""
                }`}
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="font-bold mt-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">
          Who do you plan on traveling with?
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {travelersList.map((item) => (
            <Card
              key={item.value}
              onClick={() => setTravelers(item.value)}
              className={`p-4 cursor-pointer hover:shadow-lg transition ${travelers === item.value
                ? "border-white ring-2 ring-white bg-accent"
                : ""
                }`}
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="font-bold mt-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerateTrip} className="w-full mt-6">
        Generate Trip
      </Button>
    </div>
  );
}

export default CreateTrip;
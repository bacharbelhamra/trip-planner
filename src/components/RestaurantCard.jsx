import { useState, useEffect } from "react";
import { getPlaceImage } from "@/utils/imageService";
import { Button } from "@/components/ui/button";

function RestaurantCard({ restaurant, location }) {

  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadImage() {
      try {
        const img = await getPlaceImage(
          `${restaurant.name} restaurant food interior`
        );
        setImage(img || "/fallback.jpg");
      } catch {
        setImage("/fallback.jpg");
      }
    }

    loadImage();
  }, [restaurant.name]);

  return (
    <div className="border border-border bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">

      {/* Image */}
      {!image ? (
        <div className="w-full h-40 bg-muted animate-pulse rounded-lg" />
      ) : (
        <img
          src={image}
          alt={restaurant.name}
          className="w-full h-40 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
        />
      )}

      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-semibold text-base">
          {restaurant.name}
        </h3>

        {restaurant.type && (
          <p className="text-xs text-muted-foreground">
            🍴 {restaurant.type}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm">
          {restaurant.rating && (
            <span className="text-yellow-500">
              ⭐ {restaurant.rating}
            </span>
          )}

          {restaurant.price_range && (
            <span className="text-muted-foreground">
              💰 {restaurant.price_range}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          restaurant.name + " " + (location?.label || "")
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="sm" variant="secondary" className="w-full">
          🧭 View location
        </Button>
      </a>

    </div>
  );
}

export default RestaurantCard;
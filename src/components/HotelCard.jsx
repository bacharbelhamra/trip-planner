import { useState, useEffect } from "react";
import { getPlaceImage } from "@/utils/imageService";
import { Button } from "@/components/ui/button";

function HotelCard({ hotel, location }) {

  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadImage() {
      try {
        const img = await getPlaceImage(
          `${hotel.name} hotel exterior city`
        );
        setImage(img || "/fallback.jpg");
      } catch {
        setImage("/fallback.jpg");
      }
    }

    loadImage();
  }, [hotel.name]);

  return (
    <div className="border border-border bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">

      {/* Image */}
      {!image ? (
        <div className="w-full h-40 bg-muted animate-pulse rounded-lg" />
      ) : (
        <img
          src={image}
          alt={hotel.name}
          className="w-full h-40 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
        />
      )}

      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-semibold text-base">
          {hotel.name}
        </h3>

        {hotel.area && (
          <p className="text-xs text-muted-foreground">
            📍 {hotel.area}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm">
          {hotel.rating && (
            <span className="text-yellow-500">
              ⭐ {hotel.rating}
            </span>
          )}

          {hotel.price && (
            <span className="text-muted-foreground">
              💰 {hotel.price}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          hotel.name + " " + (location?.label || "")
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="sm" className="w-full">
          🧭 View location
        </Button>
      </a>

    </div>
  );
}

export default HotelCard;
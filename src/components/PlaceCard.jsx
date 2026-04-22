import { useState, useEffect } from "react";
import { getPlaceImage } from "@/utils/imageService";
import { Button } from "@/components/ui/button";

function PlaceCard({ item, onViewOnMap, location }) {

  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadImage() {
      try {
        const img = await getPlaceImage(
          `${item.place} landmark city view`
        );
        setImage(img);
      } catch {
        setImage("/fallback.jpg");
      }
    }

    loadImage();
  }, [item.place]);

  return (
    <div className="flex gap-5 border border-border bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all">

      {/* Image */}
      <img
        src={image || "/fallback.jpg"}
        alt={item.place}
        className="w-40 h-28 object-cover rounded-lg"
      />

      {/* Content */}
      <div className="flex-1 space-y-2">

        <p className="text-sm font-medium text-muted-foreground">
          {item.time}
        </p>

        <h3 className="text-lg font-semibold">
          {item.place}
        </h3>

        <p className="text-sm text-muted-foreground">
          {item.description}
        </p>

        {/* Extra info */}
        {item.duration && (
          <p className="text-xs text-muted-foreground">
            ⏱ {item.duration}
          </p>
        )}

        {item.tips && (
          <p className="text-xs text-blue-500">
            💡 {item.tips}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 flex-wrap">

          {onViewOnMap && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onViewOnMap}
            >
              📍 View
            </Button>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              item.place + " " + (location?.label || "")
            )}`} target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline">
              🧭 Maps
            </Button>
          </a>

        </div>

      </div>

    </div>
  );
}

export default PlaceCard;
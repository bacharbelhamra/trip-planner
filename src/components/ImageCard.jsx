import { useState, useEffect } from "react";
import { getPlaceImage } from "@/utils/imageService";

function ImageCard({ name, subtitle }) {

  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadImage() {
      const img = await getPlaceImage(name);
      setImage(img);
    }

    loadImage();
  }, [name]);

  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">

      <img
        src={image}
        alt={name}
        className="h-32 w-full object-cover rounded-lg mb-3"
      />

      <h3 className="font-semibold">{name}</h3>

      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}

    </div>
  );
}

export default ImageCard;
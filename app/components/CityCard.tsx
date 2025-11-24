import { Link } from "react-router";
import { Card, CardContent } from "./ui/card";

interface CityCardProps {
  city: string;
  country: string;
  flagCount: number;
  imageUrl?: string;
}

export default function CityCard({ city, country, flagCount, imageUrl }: CityCardProps) {
  return (
    <Link to={`/explore?city=${city}`} className="block group">
      <Card className="overflow-hidden border-none shadow-none bg-transparent">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <img
            src={imageUrl || `https://source.unsplash.com/800x800/?${city},${country},travel`}
            alt={`${city}, ${country}`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {city}, {country}
          </h3>
          <p className="text-sm text-gray-500">
            {flagCount} {flagCount === 1 ? "Flag" : "Flags"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

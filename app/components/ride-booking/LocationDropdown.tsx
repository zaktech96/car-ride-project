import React from "react";
import { MapPin } from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { LocationSuggestion } from "~/lib/locationService";
import { locationService } from "~/lib/locationService";

interface LocationDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  onLocationSelect: (location: LocationSuggestion) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  filterType?: "all" | "airports" | "cities";
}

export function LocationDropdown({
  label,
  placeholder,
  value,
  onLocationSelect,
  className,
  required = false,
  disabled = false,
  filterType = "all",
}: LocationDropdownProps) {
  // Get all available locations
  const getAllLocations = (): LocationSuggestion[] => {
    const saudiLocations = [
      // Airports
      {
        name: "King Khalid International Airport (RUH)",
        city: "Riyadh",
        types: ["airport"],
        coordinates: { lat: 24.9576, lng: 46.6988 },
      },
      {
        name: "King Abdulaziz International Airport (JED)",
        city: "Jeddah",
        types: ["airport"],
        coordinates: { lat: 21.6796, lng: 39.1565 },
      },
      {
        name: "King Fahd International Airport (DMM)",
        city: "Dammam",
        types: ["airport"],
        coordinates: { lat: 26.4711, lng: 49.7979 },
      },
      {
        name: "Prince Mohammed bin Abdulaziz Airport (MED)",
        city: "Medina",
        types: ["airport"],
        coordinates: { lat: 24.5534, lng: 39.7051 },
      },
      {
        name: "Taif Regional Airport",
        city: "Taif",
        types: ["airport"],
        coordinates: { lat: 21.4827, lng: 40.5444 },
      },

      // Riyadh locations
      {
        name: "Riyadh City Center",
        city: "Riyadh",
        types: ["establishment"],
        coordinates: { lat: 24.7136, lng: 46.6753 },
      },
      {
        name: "King Fahd Road, Riyadh",
        city: "Riyadh",
        types: ["route"],
        coordinates: { lat: 24.7411, lng: 46.6544 },
      },
      {
        name: "Olaya District, Riyadh",
        city: "Riyadh",
        types: ["sublocality"],
        coordinates: { lat: 24.6877, lng: 46.6859 },
      },
      {
        name: "Al Malaz, Riyadh",
        city: "Riyadh",
        types: ["sublocality"],
        coordinates: { lat: 24.6408, lng: 46.7152 },
      },
      {
        name: "Diplomatic Quarter, Riyadh",
        city: "Riyadh",
        types: ["sublocality"],
        coordinates: { lat: 24.6918, lng: 46.6098 },
      },

      // Jeddah locations
      {
        name: "Jeddah City Center",
        city: "Jeddah",
        types: ["establishment"],
        coordinates: { lat: 21.4858, lng: 39.1925 },
      },
      {
        name: "Jeddah Corniche",
        city: "Jeddah",
        types: ["establishment"],
        coordinates: { lat: 21.5169, lng: 39.1748 },
      },
      {
        name: "Al Balad (Old Town), Jeddah",
        city: "Jeddah",
        types: ["establishment"],
        coordinates: { lat: 21.4858, lng: 39.1925 },
      },
      {
        name: "Red Sea Mall, Jeddah",
        city: "Jeddah",
        types: ["establishment"],
        coordinates: { lat: 21.6063, lng: 39.1034 },
      },

      // Mecca locations
      {
        name: "Masjid al-Haram (Grand Mosque)",
        city: "Mecca",
        types: ["establishment"],
        coordinates: { lat: 21.4225, lng: 39.8262 },
      },
      {
        name: "Abraj Al Bait (Clock Tower)",
        city: "Mecca",
        types: ["establishment"],
        coordinates: { lat: 21.4186, lng: 39.8256 },
      },
      {
        name: "Mina, Mecca",
        city: "Mecca",
        types: ["sublocality"],
        coordinates: { lat: 21.4067, lng: 39.8847 },
      },
      {
        name: "Arafat, Mecca",
        city: "Mecca",
        types: ["sublocality"],
        coordinates: { lat: 21.3544, lng: 39.9855 },
      },

      // Medina locations
      {
        name: "Masjid an-Nabawi (Prophet's Mosque)",
        city: "Medina",
        types: ["establishment"],
        coordinates: { lat: 24.4672, lng: 39.6117 },
      },
      {
        name: "Quba Mosque, Medina",
        city: "Medina",
        types: ["establishment"],
        coordinates: { lat: 24.4394, lng: 39.6194 },
      },
      {
        name: "Mount Uhud, Medina",
        city: "Medina",
        types: ["natural_feature"],
        coordinates: { lat: 24.4951, lng: 39.5951 },
      },

      // Eastern Province
      {
        name: "Dammam City Center",
        city: "Dammam",
        types: ["establishment"],
        coordinates: { lat: 26.4207, lng: 50.0888 },
      },
      {
        name: "Dammam Corniche",
        city: "Dammam",
        types: ["establishment"],
        coordinates: { lat: 26.4207, lng: 50.0888 },
      },
      {
        name: "Al Khobar City Center",
        city: "Al Khobar",
        types: ["establishment"],
        coordinates: { lat: 26.2172, lng: 50.1971 },
      },
      {
        name: "Al Khobar Corniche",
        city: "Al Khobar",
        types: ["establishment"],
        coordinates: { lat: 26.2172, lng: 50.1971 },
      },
      {
        name: "Dhahran",
        city: "Dhahran",
        types: ["locality"],
        coordinates: { lat: 26.2361, lng: 50.1328 },
      },
      {
        name: "Half Moon Bay, Al Khobar",
        city: "Al Khobar",
        types: ["natural_feature"],
        coordinates: { lat: 26.1264, lng: 50.164 },
      },

      // Other cities
      {
        name: "Taif City Center",
        city: "Taif",
        types: ["establishment"],
        coordinates: { lat: 21.2703, lng: 40.4158 },
      },
      {
        name: "Abha City Center",
        city: "Abha",
        types: ["establishment"],
        coordinates: { lat: 18.2465, lng: 42.5056 },
      },
      {
        name: "Tabuk City Center",
        city: "Tabuk",
        types: ["establishment"],
        coordinates: { lat: 28.3998, lng: 36.57 },
      },
      {
        name: "Hail City Center",
        city: "Hail",
        types: ["establishment"],
        coordinates: { lat: 27.5114, lng: 41.7208 },
      },

      // Special destinations
      {
        name: "NEOM Bay",
        city: "NEOM",
        types: ["establishment"],
        coordinates: { lat: 28.2636, lng: 34.7892 },
      },
      {
        name: "Al-Ula Old Town",
        city: "Al-Ula",
        types: ["establishment"],
        coordinates: { lat: 26.6083, lng: 37.9267 },
      },
    ];

    return saudiLocations.map((location) => ({
      address: location.name,
      placeId: `location_${location.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")}`,
      city: location.city,
      region: getCityRegion(location.city),
      country: "Saudi Arabia",
      coordinates: location.coordinates,
      types: location.types,
    }));
  };

  // Helper function for region mapping
  const getCityRegion = (city: string): string => {
    const cityRegions: Record<string, string> = {
      Riyadh: "Riyadh Province",
      Jeddah: "Makkah Province",
      Mecca: "Makkah Province",
      Medina: "Medina Province",
      Dammam: "Eastern Province",
      "Al Khobar": "Eastern Province",
      Dhahran: "Eastern Province",
      Taif: "Makkah Province",
      Abha: "Asir Province",
      Tabuk: "Tabuk Province",
      Hail: "Hail Province",
      NEOM: "Tabuk Province",
      "Al-Ula": "Medina Province",
    };
    return cityRegions[city] || "Saudi Arabia";
  };

  // Filter locations based on type
  const getFilteredLocations = (): LocationSuggestion[] => {
    const allLocations = getAllLocations();

    switch (filterType) {
      case "airports":
        return allLocations.filter((loc) => loc.types.includes("airport"));
      case "cities":
        return allLocations.filter((loc) => !loc.types.includes("airport"));
      default:
        return allLocations;
    }
  };

  const locations = getFilteredLocations();

  const handleLocationSelect = (selectedValue: string) => {
    const selectedLocation = locations.find(
      (loc) => loc.address === selectedValue
    );
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
    <div className={className}>
      <Label
        htmlFor={`location-${label}`}
        className="text-sm font-medium text-gray-700 mb-2 block"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Select
        value={value}
        onValueChange={handleLocationSelect}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {/* Group by type */}
          {filterType === "all" && (
            <>
              {/* Airports Section */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                ✈️ Airports
              </div>
              {locations
                .filter((loc) => loc.types.includes("airport"))
                .map((location) => (
                  <SelectItem key={location.placeId} value={location.address}>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">✈️</span>
                      <div>
                        <div className="font-medium">{location.address}</div>
                        <div className="text-xs text-muted-foreground">
                          {location.city}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}

              {/* Cities & Landmarks Section */}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted mt-2">
                🏙️ Cities & Landmarks
              </div>
              {locations
                .filter((loc) => !loc.types.includes("airport"))
                .map((location) => (
                  <SelectItem key={location.placeId} value={location.address}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📍</span>
                      <div>
                        <div className="font-medium">{location.address}</div>
                        <div className="text-xs text-gray-500">
                          {location.city}, {location.region}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
            </>
          )}

          {/* Single category display */}
          {filterType !== "all" &&
            locations.map((location) => (
              <SelectItem key={location.placeId} value={location.address}>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      location.types.includes("airport")
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  >
                    {location.types.includes("airport") ? "✈️" : "📍"}
                  </span>
                  <div>
                    <div className="font-medium">{location.address}</div>
                    <div className="text-xs text-gray-500">
                      {location.city}, {location.region}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LocationDropdown;

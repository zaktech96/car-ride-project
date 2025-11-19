"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react-router";
import { useAction, useQuery } from "convex/react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  MapPin,
  Clock,
  DollarSign,
  Percent,
  Car,
  Crown,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { LocationInput } from "./LocationInput";
import { LivePriceDisplay } from "./LivePriceDisplay";
import type { LocationSuggestion } from "~/lib/locationService";
import { locationService } from "~/lib/locationService";

interface RideBookingFormProps {
  onRideBooked?: (rideData: any) => void;
}

export default function RideBookingForm({
  onRideBooked,
}: RideBookingFormProps) {
  const { isSignedIn, userId } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceData, setPriceData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    rideType: "short",
    distance: 0,
    duration: 0,
    serviceType: "",
    pickupLocation: "",
    destination: "",
    date: "",
    time: "",
    passengers: "1",
    phoneNumber: "",
    specialRequirements: "",
    flightNumber: "",
    airline: "",
    terminal: "",
  });

  // Location state for new components
  const [selectedPickup, setSelectedPickup] =
    useState<LocationSuggestion | null>(null);
  const [selectedDropoff, setSelectedDropoff] =
    useState<LocationSuggestion | null>(null);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  // Format duration for display (convert minutes to hours when appropriate)
  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hr${hours > 1 ? "s" : ""}`;
      } else {
        return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
      }
    }
    return `${minutes} min`;
  };

  // Auto-calculate distance and duration when both locations are selected
  const autoCalculateRoute = async (
    pickup: LocationSuggestion,
    dropoff: LocationSuggestion
  ) => {
    setIsAutoCalculating(true);
    try {
      const route = await locationService.calculateRoute(pickup, dropoff);
      if (route) {
        const distanceKm = route.distance.value / 1000; // Convert meters to km
        const durationMin = route.duration.value / 60; // Convert seconds to minutes

        setFormData((prev) => ({
          ...prev,
          distance: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
          duration: Math.round(durationMin),
          fromLocation: pickup.address,
          toLocation: dropoff.address,
        }));

        // Auto-calculate price if user is signed in
        if (userId) {
          await calculatePriceForRide(distanceKm, durationMin);
        }
      }
    } catch (error) {
      console.error("Auto route calculation error:", error);
    } finally {
      setIsAutoCalculating(false);
    }
  };

  // Handle pickup location selection
  const handlePickupSelect = async (location: LocationSuggestion) => {
    setSelectedPickup(location);
    setFormData((prev) => ({ ...prev, fromLocation: location.address }));

    // Auto-calculate if both locations are selected
    if (selectedDropoff) {
      await autoCalculateRoute(location, selectedDropoff);
    }
  };

  // Handle dropoff location selection
  const handleDropoffSelect = async (location: LocationSuggestion) => {
    setSelectedDropoff(location);
    setFormData((prev) => ({ ...prev, toLocation: location.address }));

    // Auto-calculate if both locations are selected
    if (selectedPickup) {
      await autoCalculateRoute(selectedPickup, location);
    }
  };

  // Calculate distance and duration using Google Maps API
  const calculateDistanceAndDuration = async (
    origin: string,
    destination: string
  ) => {
    if (!origin || !destination) return;

    setIsCalculating(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.warn(
          "Google Maps API key not configured, using fallback calculation"
        );
        // Fallback: Simple distance estimation based on common routes
        const fallbackDistance = estimateDistance(origin, destination);
        const fallbackDuration = estimateDuration(fallbackDistance);

        setFormData((prev) => ({
          ...prev,
          distance: fallbackDistance,
          duration: fallbackDuration,
        }));

        if (userId) {
          await calculatePriceForRide(fallbackDistance, fallbackDuration);
        }
        return;
      }

      // Use Google Maps Distance Matrix API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
        const element = data.rows[0].elements[0];
        const distance = element.distance.value / 1000; // Convert meters to kilometers
        const duration = element.duration.value / 60; // Convert seconds to minutes

        setFormData((prev) => ({
          ...prev,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          duration: Math.round(duration * 100) / 100,
        }));

        // Auto-calculate price when distance/duration changes
        if (userId) {
          await calculatePriceForRide(distance, duration);
        }
      } else {
        console.error("Distance calculation failed:", data);
        // Fallback to manual input
        setFormData((prev) => ({
          ...prev,
          distance: 0,
          duration: 0,
        }));
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      // Fallback to manual input
      setFormData((prev) => ({
        ...prev,
        distance: 0,
        duration: 0,
      }));
    } finally {
      setIsCalculating(false);
    }
  };

  // Fallback distance estimation for common Saudi routes
  const estimateDistance = (origin: string, destination: string): number => {
    const originLower = origin.toLowerCase();
    const destLower = destination.toLowerCase();

    // Common Saudi city distances (in km)
    const cityDistances: Record<string, Record<string, number>> = {
      riyadh: {
        jeddah: 850,
        dammam: 400,
        mecca: 870,
        medina: 800,
        taif: 800,
        khobar: 420,
        dhahran: 420,
        "al khobar": 420,
        airport: 35,
        "king khalid international airport": 35,
      },
      jeddah: {
        riyadh: 850,
        mecca: 80,
        medina: 350,
        taif: 200,
        dammam: 1200,
        airport: 20,
        "king abdulaziz international airport": 20,
      },
      dammam: {
        riyadh: 400,
        jeddah: 1200,
        khobar: 15,
        "al khobar": 15,
        dhahran: 10,
        airport: 25,
        "king fahd international airport": 25,
      },
      mecca: {
        jeddah: 80,
        riyadh: 870,
        medina: 450,
        taif: 120,
      },
      medina: {
        riyadh: 800,
        jeddah: 350,
        mecca: 450,
        airport: 20,
        "prince mohammed bin abdulaziz airport": 20,
      },
    };

    // Try to find a match
    for (const [city1, distances] of Object.entries(cityDistances)) {
      if (originLower.includes(city1)) {
        for (const [city2, distance] of Object.entries(distances)) {
          if (destLower.includes(city2)) {
            return distance;
          }
        }
      }
    }

    // Default fallback: assume 50km for local rides, 200km for inter-city
    if (originLower.includes("airport") || destLower.includes("airport")) {
      return 50; // Airport transfers are usually local
    }

    return 200; // Default inter-city distance
  };

  // Estimate duration based on distance
  const estimateDuration = (distance: number): number => {
    // Assume average speed of 80 km/h for inter-city, 40 km/h for local
    const avgSpeed = distance > 100 ? 80 : 40;
    return Math.round((distance / avgSpeed) * 60); // Convert to minutes
  };

  // Calculate price when distance/duration changes
  const calculatePriceForRide = async (distance: number, duration: number) => {
    if (!userId || distance === 0 || duration === 0) return;

    try {
      const result = await calculatePrice({
        userId,
        rideType: formData.rideType,
        distance,
        duration,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
      });
      setPriceData(result);
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const calculatePrice = useAction(api.ridePricingSimple.calculateRidePrice);
  const userStats = useQuery(
    api.ridePricingSimple.getUserRideStats,
    userId ? { userId } : "skip"
  );
  const pricingTiers = useQuery(api.ridePricingSimple.getPricingTiers, {
    rideType: formData.rideType,
  });

  // Auto-calculate distance when both locations are filled
  useEffect(() => {
    if (formData.fromLocation && formData.toLocation) {
      calculateDistanceAndDuration(formData.fromLocation, formData.toLocation);
    }
  }, [formData.fromLocation, formData.toLocation]);

  // Auto-calculate price when distance/duration changes
  useEffect(() => {
    if (formData.distance > 0 && formData.duration > 0 && userId) {
      calculatePriceForRide(formData.distance, formData.duration);
    }
  }, [formData.distance, formData.duration, formData.rideType, userId]);

  const rideTypes = [
    {
      value: "short",
      label: "Short Ride",
      description: "Up to 10km",
      icon: <Car className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "medium",
      label: "Medium Ride",
      description: "10-30km",
      icon: <Zap className="w-4 h-4" />,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "long",
      label: "Long Ride",
      description: "30km+",
      icon: <MapPin className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "premium",
      label: "Premium Ride",
      description: "Luxury service",
      icon: <Crown className="w-4 h-4" />,
      color: "bg-amber-100 text-amber-800",
    },
  ];

  const handleCalculatePrice = async () => {
    if (!isSignedIn || !userId) {
      alert("Please sign in to book a ride");
      return;
    }

    if (!formData.fromLocation || !formData.toLocation) {
      alert("Please enter both pickup and destination locations");
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculatePrice({
        userId,
        rideType: formData.rideType,
        distance: formData.distance || 5, // Default distance if not provided
        duration: formData.duration || 15, // Default duration if not provided
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
      });

      setPriceData(result);
      if (onRideBooked) {
        onRideBooked(result);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      alert("Error calculating price. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRideTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rideType: value }));
    setPriceData(null); // Reset price when ride type changes
  };

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to book a ride and see personalized pricing.
          </p>
          <Button asChild>
            <a href="/sign-in">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* User Stats */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.totalRides}
              </div>
              <div className="text-sm text-muted-foreground">Total Rides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {userStats.totalSpent} SAR
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userStats.totalSaved} SAR
              </div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {userStats.averageRidePrice} SAR
              </div>
              <div className="text-sm text-muted-foreground">Avg. Price</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Book Your Ride
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LocationInput
              label="Pickup Location"
              placeholder="Enter pickup location"
              value={formData.fromLocation}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, fromLocation: value }))
              }
              onLocationSelect={handlePickupSelect}
              required
            />

            <LocationInput
              label="Destination"
              placeholder="Enter destination"
              value={formData.toLocation}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, toLocation: value }))
              }
              onLocationSelect={handleDropoffSelect}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="rideType">Ride Type</Label>
              <Select
                value={formData.rideType}
                onValueChange={handleRideTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ride type" />
                </SelectTrigger>
                <SelectContent>
                  {rideTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance and Duration Display */}
            {formData.fromLocation && formData.toLocation && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Route Information
                  </span>
                  {isCalculating && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Calculating...</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-blue-700">Distance</Label>
                    <div className="text-lg font-semibold text-blue-900">
                      {formData.distance > 0
                        ? `${formData.distance} km`
                        : "Calculating..."}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-blue-700">Duration</Label>
                    <div className="text-lg font-semibold text-blue-900">
                      {formData.duration > 0
                        ? `${formData.duration} min`
                        : "Calculating..."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-calculated Route Information */}
            {selectedPickup && selectedDropoff && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Distance
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {isAutoCalculating ? (
                      <div className="flex items-center justify-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Calculating...</span>
                      </div>
                    ) : (
                      `${formData.distance || 0} km`
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Duration
                    </span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {isAutoCalculating ? (
                      <div className="flex items-center justify-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Calculating...</span>
                      </div>
                    ) : (
                      formatDuration(formData.duration || 0)
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price will be calculated automatically when locations are selected */}
          </CardContent>
        </Card>

        {/* Price Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priceData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {priceData.finalPrice} {priceData.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Final Price
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Service Type Description */}
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      {priceData.pricingBreakdown?.description ||
                        `${priceData.rideType} service`}
                    </div>
                  </div>

                  {/* Detailed Pricing Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Distance ({priceData.distance} km)
                      </span>
                      <span>
                        {priceData.pricingBreakdown?.distancePrice} SAR
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Duration ({priceData.duration} min)
                      </span>
                      <span>
                        {priceData.pricingBreakdown?.durationPrice} SAR
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>{priceData.pricingBreakdown?.serviceFee} SAR</span>
                    </div>
                    {priceData.pricingBreakdown?.surgeMultiplier &&
                      priceData.pricingBreakdown.surgeMultiplier > 1 && (
                        <div className="flex justify-between items-center text-orange-600">
                          <span>
                            Surge Pricing (
                            {Math.round(
                              (priceData.pricingBreakdown.surgeMultiplier - 1) *
                                100
                            )}
                            %)
                          </span>
                          <span>
                            +
                            {Math.round(
                              (priceData.basePrice /
                                priceData.pricingBreakdown.surgeMultiplier) *
                                (priceData.pricingBreakdown.surgeMultiplier - 1)
                            )}{" "}
                            SAR
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Subtotal</span>
                      <span>{priceData.basePrice} SAR</span>
                    </div>
                  </div>

                  {priceData.discountApplied > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Discount ({priceData.discountPercentage}%)
                        </span>
                        <span className="font-medium text-green-600">
                          -{priceData.discountApplied} SAR
                        </span>
                      </div>
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        💰 You saved {priceData.discountApplied} SAR with your
                        subscription!
                      </div>
                    </>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-lg">
                        {priceData.finalPrice} SAR
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Ride Type: {priceData.rideType}</div>
                  <div>Distance: {priceData.distance} km</div>
                  <div>Duration: {priceData.duration} min</div>
                </div>

                <Form method="post" action="/book">
                  <input
                    type="hidden"
                    name="serviceType"
                    value={formData.serviceType}
                  />
                  <input
                    type="hidden"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                  />
                  <input
                    type="hidden"
                    name="destination"
                    value={formData.destination}
                  />
                  <input type="hidden" name="date" value={formData.date} />
                  <input type="hidden" name="time" value={formData.time} />
                  <input
                    type="hidden"
                    name="passengers"
                    value={formData.passengers}
                  />
                  <input
                    type="hidden"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                  />
                  <input
                    type="hidden"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                  />
                  <input
                    type="hidden"
                    name="flightNumber"
                    value={formData.flightNumber}
                  />
                  <input
                    type="hidden"
                    name="airline"
                    value={formData.airline}
                  />
                  <input
                    type="hidden"
                    name="terminal"
                    value={formData.terminal}
                  />
                  <input
                    type="hidden"
                    name="distance"
                    value={priceData.distance}
                  />
                  <input
                    type="hidden"
                    name="duration"
                    value={priceData.duration}
                  />
                  <input
                    type="hidden"
                    name="rideType"
                    value={priceData.rideType}
                  />
                  <input
                    type="hidden"
                    name="calculatedPrice"
                    value={priceData.finalPrice}
                  />
                  <input
                    type="hidden"
                    name="basePrice"
                    value={priceData.basePrice}
                  />
                  <input
                    type="hidden"
                    name="discountApplied"
                    value={priceData.discountApplied}
                  />
                  <input
                    type="hidden"
                    name="discountPercentage"
                    value={priceData.discountPercentage}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    Book This Ride
                  </Button>
                </Form>
              </motion.div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your ride details to see pricing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Subscription Plans */}
      {pricingTiers && pricingTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Recommended Plans for{" "}
              {rideTypes.find((t) => t.value === formData.rideType)?.label}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Get discounts on your {formData.rideType} rides with these
              subscription plans
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingTiers.map((tier: any, index: number) => (
                <motion.div
                  key={tier._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`border rounded-lg p-6 space-y-3 ${
                    index === 0
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white">
                        Recommended
                      </Badge>
                      <Badge
                        className={
                          rideTypes.find((t) => t.value === formData.rideType)
                            ?.color
                        }
                      >
                        Perfect for {formData.rideType} rides
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{tier.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {tier.baseDiscountPercentage}% off
                      </div>
                      <div className="text-sm text-muted-foreground">
                        your rides
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Max {tier.maxRidesPerMonth} rides/month
                  </div>

                  <ul className="text-sm space-y-2">
                    {tier.features.map(
                      (feature: string, featureIndex: number) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      )
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={index === 0 ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      // Redirect to Polar checkout for subscription
                      const polarPriceId = tier.polarPriceId;
                      const successUrl = encodeURIComponent(
                        `${window.location.origin}/dashboard?subscription=success&plan=${tier.name}`
                      );
                      const cancelUrl = encodeURIComponent(
                        `${window.location.origin}/book-ride`
                      );

                      const polarUrl = `https://polar.sh/checkout?price_id=${polarPriceId}&success_url=${successUrl}&cancel_url=${cancelUrl}`;
                      window.open(
                        polarUrl,
                        "_blank",
                        "width=600,height=700,scrollbars=yes,resizable=yes"
                      );
                    }}
                  >
                    Subscribe to {tier.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

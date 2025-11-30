import React, { useState, useEffect } from "react";
import { useAction } from "convex/react";
import {
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Zap,
  Percent,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "../../../convex/_generated/api";
import type { LocationSuggestion } from "~/lib/locationService";
import { locationService } from "~/lib/locationService";

interface PriceBreakdown {
  rideId: string;
  basePrice: number;
  finalPrice: number;
  discountApplied: number;
  discountPercentage: number;
  currency: string;
  rideType: string;
  distance: number;
  duration: number;
  pricingBreakdown: {
    distancePrice: number;
    durationPrice: number;
    serviceFee: number;
    surgeMultiplier: number;
    locationSurcharge?: number;
    timeSurcharge?: number;
  };
}

interface LivePriceDisplayProps {
  origin: LocationSuggestion | null;
  destination: LocationSuggestion | null;
  rideType: string;
  userId?: string;
  onPriceCalculated?: (pricing: PriceBreakdown) => void;
  onBookingClick?: () => void;
  className?: string;
}

export function LivePriceDisplay({
  origin,
  destination,
  rideType,
  userId,
  onPriceCalculated,
  onBookingClick,
  className,
}: LivePriceDisplayProps) {
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

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

  const calculatePrice = useAction(api.ridePricingSimple.calculateRidePrice);

  // Calculate price when inputs change
  useEffect(() => {
    const calculatePriceForRoute = async () => {
      if (!origin || !destination || !rideType || !userId) {
        setPricing(null);
        setRouteInfo(null);
        return;
      }

      setIsCalculating(true);
      setError(null);

      try {
        // First, get route data
        const route = await locationService.calculateRoute(origin, destination);

        if (!route) {
          throw new Error("Could not calculate route");
        }

        // Update route info for display with proper formatting
        setRouteInfo({
          distance: route.distance.text,
          duration: formatDuration(route.duration.value / 60), // Convert seconds to minutes and format
        });

        // Calculate pricing
        const result = await calculatePrice({
          userId,
          rideType,
          distance: route.distance.value / 1000, // Convert meters to km
          duration: route.duration.value / 60, // Convert seconds to minutes
          fromLocation: origin.address,
          toLocation: destination.address,
        });

        setPricing(result);

        if (onPriceCalculated) {
          onPriceCalculated(result);
        }
      } catch (err) {
        console.error("Price calculation error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to calculate price"
        );
        setPricing(null);
        setRouteInfo(null);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(calculatePriceForRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [
    origin,
    destination,
    rideType,
    userId,
    calculatePrice,
    onPriceCalculated,
  ]);

  // Get location factors for additional info
  const getLocationFactors = () => {
    if (!origin || !destination) return null;

    const originFactors = locationService.getLocationFactors(origin);
    const destFactors = locationService.getLocationFactors(destination);

    return {
      hasAirport: originFactors.isAirport || destFactors.isAirport,
      cityMultiplier: Math.max(
        originFactors.cityMultiplier,
        destFactors.cityMultiplier
      ),
      airportSurcharge:
        originFactors.airportSurcharge + destFactors.airportSurcharge,
    };
  };

  const locationFactors = getLocationFactors();

  if (!origin || !destination) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            Enter pickup and destination to see pricing
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5 text-green-600" />
          Price Estimate
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Loading State */}
        {isCalculating && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-muted-foreground">
              Calculating best price...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Price Display */}
        {pricing && !isCalculating && (
          <div className="space-y-4">
            {/* Main Price */}
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {pricing.finalPrice} {pricing.currency}
              </div>
              {pricing.discountApplied > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-muted-foreground line-through">
                    {pricing.basePrice} {pricing.currency}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  >
                    <Percent className="w-3 h-3 mr-1" />
                    {pricing.discountPercentage}% off
                  </Badge>
                </div>
              )}
            </div>

            {/* Route Info */}
            {routeInfo && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {routeInfo.distance}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Distance
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {routeInfo.duration}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Duration
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Price Breakdown
              </h4>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base fare:</span>
                  <span className="text-foreground">
                    {(pricing.pricingBreakdown?.distancePrice || 0).toFixed(2)}{" "}
                    {pricing.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time charge:</span>
                  <span className="text-foreground">
                    {(pricing.pricingBreakdown?.durationPrice || 0).toFixed(2)}{" "}
                    {pricing.currency}
                  </span>
                </div>

                {pricing.pricingBreakdown?.serviceFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee:</span>
                    <span className="text-foreground">
                      {pricing.pricingBreakdown.serviceFee.toFixed(2)}{" "}
                      {pricing.currency}
                    </span>
                  </div>
                )}

                {locationFactors?.airportSurcharge &&
                  locationFactors.airportSurcharge > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span className="flex items-center gap-1">
                        ✈️ Airport surcharge:
                      </span>
                      <span>
                        +{locationFactors.airportSurcharge} {pricing.currency}
                      </span>
                    </div>
                  )}

                {pricing.pricingBreakdown?.surgeMultiplier &&
                  pricing.pricingBreakdown.surgeMultiplier > 1 && (
                    <div className="flex justify-between text-orange-600">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Surge pricing:
                      </span>
                      <span>{pricing.pricingBreakdown.surgeMultiplier}x</span>
                    </div>
                  )}

                {pricing.discountApplied > 0 && (
                  <div className="flex justify-between text-green-600 font-medium border-t pt-1">
                    <span>Subscription discount:</span>
                    <span>
                      -{pricing.discountApplied.toFixed(2)} {pricing.currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
                  <span>Total:</span>
                  <span>
                    {pricing.finalPrice} {pricing.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Notices */}
            {locationFactors?.hasAirport && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <div className="font-medium">Airport Service</div>
                    <div>Includes meet & greet and waiting time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            {onBookingClick && (
              <Button
                onClick={onBookingClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Book for {pricing.finalPrice} {pricing.currency}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LivePriceDisplay;

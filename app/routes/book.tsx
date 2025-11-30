import type { Route } from "./+types/book";
import { useState, useEffect } from "react";
import { Form, Link, redirect } from "react-router";
import { useAction, useQuery } from "convex/react";
import { getServiceConfig } from "~/../config";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Car,
  Plane,
  Clock,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Percent,
  Crown,
  Zap,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "convex/_generated/api";
import { LocationDropdown } from "~/components/ride-booking/LocationDropdown";
import type { LocationSuggestion } from "~/lib/locationService";
import { locationService } from "~/lib/locationService";

export async function loader({ request }: Route.LoaderArgs) {
  // You can add any server-side data loading here
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  // Extract form data
  const bookingData = {
    id: `RH-${Date.now()}`,
    serviceType: formData.get("serviceType"),
    pickupLocation: formData.get("pickupLocation"),
    destination: formData.get("destination"),
    date: formData.get("date"),
    time: formData.get("time"),
    passengers: formData.get("passengers"),
    phoneNumber: formData.get("phoneNumber"),
    specialRequirements: formData.get("specialRequirements"),
    flightNumber: formData.get("flightNumber"),
    airline: formData.get("airline"),
    terminal: formData.get("terminal"),
    // Pricing data
    distance: formData.get("distance"),
    duration: formData.get("duration"),
    rideType: formData.get("rideType"),
    status: "confirmed",
    driver: {
      name: "Ahmed Al-Rashid",
      phone: "+966 50 123 4567",
      vehicle: "BMW 7 Series",
      license: "ABC-1234",
      rating: 4.9,
      experience: "5 years",
    },
    estimatedPrice: formData.get("calculatedPrice")
      ? `${formData.get("calculatedPrice")} SAR`
      : "Price not calculated",
    // Pricing details
    pricing: {
      basePrice: formData.get("basePrice"),
      finalPrice: formData.get("calculatedPrice"),
      discountApplied: formData.get("discountApplied"),
      discountPercentage: formData.get("discountPercentage"),
    },
    createdAt: new Date().toISOString(),
  };

  // TODO: Save to Convex database
  console.log("Booking data:", bookingData);

  // Store booking data in session or pass as URL params for demo
  const searchParams = new URLSearchParams();
  searchParams.set("bookingId", bookingData.id);
  searchParams.set("serviceType", bookingData.serviceType as string);
  searchParams.set("pickupLocation", bookingData.pickupLocation as string);
  searchParams.set("destination", bookingData.destination as string);
  searchParams.set("date", bookingData.date as string);
  searchParams.set("time", bookingData.time as string);
  searchParams.set("passengers", bookingData.passengers as string);
  searchParams.set("phoneNumber", bookingData.phoneNumber as string);
  searchParams.set("driverName", bookingData.driver.name);
  searchParams.set("driverPhone", bookingData.driver.phone);
  searchParams.set("vehicle", bookingData.driver.vehicle);
  searchParams.set("estimatedPrice", bookingData.estimatedPrice);

  // Add pricing details
  if (bookingData.pricing?.basePrice) {
    searchParams.set("basePrice", bookingData.pricing.basePrice as string);
  }
  if (bookingData.pricing?.finalPrice) {
    searchParams.set(
      "calculatedPrice",
      bookingData.pricing.finalPrice as string
    );
  }
  if (bookingData.pricing?.discountApplied) {
    searchParams.set(
      "discountApplied",
      bookingData.pricing.discountApplied as string
    );
  }
  if (bookingData.pricing?.discountPercentage) {
    searchParams.set(
      "discountPercentage",
      bookingData.pricing.discountPercentage as string
    );
  }

  // In FAKE payments mode, route through fake checkout first
  const testing = getServiceConfig("testing");
  if (testing?.fakePayments) {
    const fake = new URLSearchParams();
    fake.set("bookingId", bookingData.id);
    fake.set("amount", bookingData.estimatedPrice.replace(/[^0-9.]/g, ""));
    fake.set("currency", "SAR");
    return redirect(`/checkout/fake?${fake.toString()}`);
  }

  return redirect(`/booking/confirm?${searchParams.toString()}`);
}

export default function BookRide() {
  const [serviceType, setServiceType] = useState<string>("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    distance: 0, // Will be calculated automatically
    duration: 0, // Will be calculated automatically
    rideType: "short",
  });
  const [priceData, setPriceData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Location state for automatic calculation
  const [selectedPickup, setSelectedPickup] =
    useState<LocationSuggestion | null>(null);
  const [selectedDropoff, setSelectedDropoff] =
    useState<LocationSuggestion | null>(null);
  const [isRouteCalculating, setIsRouteCalculating] = useState(false);

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
    setIsRouteCalculating(true);
    try {
      const route = await locationService.calculateRoute(pickup, dropoff);
      if (route) {
        const distanceKm =
          Math.round((route.distance.value / 1000) * 100) / 100; // Convert meters to km, round to 2 decimals
        const durationMin = Math.round(route.duration.value / 60); // Convert seconds to minutes

        setFormData((prev) => ({
          ...prev,
          distance: distanceKm,
          duration: durationMin,
          fromLocation: pickup.address,
          toLocation: dropoff.address,
        }));

        // Auto-calculate price
        await handleCalculatePrice(
          distanceKm,
          durationMin,
          pickup.address,
          dropoff.address
        );
      }
    } catch (error) {
      console.error("Auto route calculation error:", error);
    } finally {
      setIsRouteCalculating(false);
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

  // Convex queries and actions
  const calculatePrice = useAction(api.ridePricingSimple.calculateRidePrice);
  const pricingTiers = useQuery(api.ridePricingSimple.getPricingTiers, {
    rideType: formData.rideType,
  });
  const userStats = useQuery(api.ridePricingSimple.getUserRideStats, {
    userId: "demo-user", // Replace with actual user ID
  });

  // Calculate price when form data changes
  useEffect(() => {
    if (formData.fromLocation && formData.toLocation && formData.rideType) {
      handleCalculatePrice();
    }
  }, [
    formData.fromLocation,
    formData.toLocation,
    formData.distance,
    formData.duration,
    formData.rideType,
  ]);

  const handleCalculatePrice = async (
    distance?: number,
    duration?: number,
    fromLocation?: string,
    toLocation?: string
  ) => {
    const distanceToUse = distance ?? formData.distance;
    const durationToUse = duration ?? formData.duration;
    const fromLocationToUse = fromLocation ?? formData.fromLocation;
    const toLocationToUse = toLocation ?? formData.toLocation;

    if (
      !fromLocationToUse ||
      !toLocationToUse ||
      distanceToUse === 0 ||
      durationToUse === 0
    )
      return;

    setIsCalculating(true);
    try {
      const result = await calculatePrice({
        userId: "demo-user", // Replace with actual user ID
        fromLocation: fromLocationToUse,
        toLocation: toLocationToUse,
        distance: distanceToUse,
        duration: durationToUse,
        rideType: formData.rideType,
      });
      setPriceData(result);
    } catch (error) {
      console.error("Error calculating price:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setServiceType(serviceId);
    const selectedService = serviceTypes.find((s) => s.id === serviceId);
    if (selectedService) {
      setFormData((prev) => ({
        ...prev,
        rideType: selectedService.rideType || "short",
      }));
    }
  };

  // Dummy data for testing
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const serviceTypes = [
    {
      id: "intercity",
      name: "Inter-City Rides",
      description: "Rides between major cities",
      icon: Car,
      price: "From 30 SAR",
      features: [
        "Inter-city coverage",
        "Comfortable vehicles",
        "Experienced drivers",
      ],
      rideType: "medium",
    },
    {
      id: "airport",
      name: "Airport Pickup",
      description: "Meet & greet service with flight tracking",
      icon: Plane,
      price: "From 150 SAR",
      features: ["Flight tracking", "Meet & greet", "Waiting time included"],
      rideType: "premium",
    },
    {
      id: "hourly",
      name: "Hourly Chauffeur",
      description: "Flexible bookings by the hour",
      icon: Clock,
      price: "80 SAR/hour",
      features: ["Wait & return", "Multiple stops", "Flexible timing"],
      rideType: "premium",
    },
  ];

  const cities = [
    "Riyadh",
    "Jeddah",
    "Dammam",
    "Mecca",
    "Medina",
    "Taif",
    "Tabuk",
    "Hail",
    "Jubail",
    "Al Khobar",
  ];

  const airports = [
    "King Khalid International Airport (RUH)",
    "King Abdulaziz International Airport (JED)",
    "King Fahd International Airport (DMM)",
    "Prince Mohammad Bin Abdulaziz Airport (MED)",
  ];

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Service
        </h2>
        <p className="text-muted-foreground">
          Select the type of chauffeur service you need
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceTypes.map((service) => {
          const IconComponent = service.icon;
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                serviceType === service.id
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleServiceSelect(service.id)}
            >
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
                <div className="text-lg font-semibold text-blue-600">
                  {service.price}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => setStep(2)}
          disabled={!serviceType}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderBookingForm = () => (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="serviceType" value={serviceType} />
      <input type="hidden" name="rideType" value={formData.rideType} />
      <input type="hidden" name="distance" value={formData.distance} />
      <input type="hidden" name="duration" value={formData.duration} />
      <input type="hidden" name="fromLocation" value={formData.fromLocation} />
      <input type="hidden" name="toLocation" value={formData.toLocation} />
      {priceData && (
        <>
          <input
            type="hidden"
            name="calculatedPrice"
            value={priceData.finalPrice}
          />
          <input type="hidden" name="basePrice" value={priceData.basePrice} />
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
        </>
      )}

      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Book Your Ride
        </h2>
        <p className="text-muted-foreground">Fill in your trip details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pickup Location */}
        <LocationDropdown
          label="Pickup Location"
          placeholder="Select pickup location"
          value={formData.fromLocation}
          onLocationSelect={handlePickupSelect}
          required
        />

        {/* Destination */}
        <LocationDropdown
          label="Destination"
          placeholder="Select destination"
          value={formData.toLocation}
          onLocationSelect={handleDropoffSelect}
          required
        />

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </Label>
          <Input
            type="date"
            name="date"
            required
            min={new Date().toISOString().split("T")[0]}
            defaultValue={tomorrowDate}
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </Label>
          <Input type="time" name="time" required defaultValue="14:30" />
        </div>

        {/* Auto-calculated Distance & Duration Display */}
        {selectedPickup && selectedDropoff && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Distance
                </span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {isRouteCalculating ? (
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
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Duration
                </span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {isRouteCalculating ? (
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

        {/* Hidden inputs for form submission */}
        <input
          type="hidden"
          name="pickupLocation"
          value={formData.fromLocation}
        />
        <input type="hidden" name="destination" value={formData.toLocation} />
        <input type="hidden" name="distance" value={formData.distance} />
        <input type="hidden" name="duration" value={formData.duration} />
        <input type="hidden" name="rideType" value={formData.rideType} />

        {/* Passengers */}
        <div className="space-y-2">
          <Label htmlFor="passengers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Number of Passengers
          </Label>
          <Select name="passengers" required>
            <SelectTrigger>
              <SelectValue placeholder="Select passengers" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "passenger" : "passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp Number
          </Label>
          <Input
            type="tel"
            name="phoneNumber"
            placeholder="+966 50 123 4567"
            defaultValue="+966 50 123 4567"
            required
          />
        </div>
      </div>

      {/* Airport-specific fields */}
      {serviceType === "airport" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input name="flightNumber" placeholder="SV 123" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airline">Airline</Label>
            <Input name="airline" placeholder="Saudia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terminal">Terminal</Label>
            <Select name="terminal">
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Terminal 1">Terminal 1</SelectItem>
                <SelectItem value="Terminal 2">Terminal 2</SelectItem>
                <SelectItem value="Terminal 3">Terminal 3</SelectItem>
                <SelectItem value="Terminal 4">Terminal 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Special Requirements */}
      <div className="space-y-2">
        <Label htmlFor="specialRequirements">Special Requirements</Label>
        <Textarea
          name="specialRequirements"
          placeholder="Any special requests, accessibility needs, or additional information..."
          rows={3}
        />
      </div>

      {/* Pricing Display */}
      {priceData && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <DollarSign className="w-5 h-5" />
              Ride Pricing
            </CardTitle>
            <CardDescription>
              {priceData.pricingBreakdown?.description ||
                `${priceData.rideType} service`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pricing Breakdown */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Distance ({priceData.distance} km)
                  </span>
                  <span>{priceData.pricingBreakdown?.distancePrice} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Duration ({priceData.duration} min)
                  </span>
                  <span>{priceData.pricingBreakdown?.durationPrice} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{priceData.pricingBreakdown?.serviceFee} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {priceData.basePrice} SAR
                  </span>
                </div>
              </div>

              {priceData.discountApplied > 0 && (
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      Discount ({priceData.discountPercentage}%)
                    </span>
                    <span>-{priceData.discountApplied} SAR</span>
                  </div>
                </div>
              )}

              <div className="border-t pt-2">
                <div className="flex justify-between items-center text-xl font-bold text-blue-800">
                  <span>Final Price</span>
                  <span>{priceData.finalPrice} SAR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      {pricingTiers && pricingTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Recommended Plans for{" "}
              {serviceTypes.find((s) => s.id === serviceType)?.name}
            </CardTitle>
            <CardDescription>
              Get discounts on your rides with these subscription plans
            </CardDescription>
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
                      <Badge variant="outline">
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
                  >
                    Subscribe to {tier.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          disabled={!priceData}
        >
          {isCalculating ? "Calculating..." : "Confirm Booking"}
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background pt-20 md:pt-24">
      {/* Header */}
      <div className="bg-background border-b border-border shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background font-bold text-sm">
                رحلة
              </div>
              <span className="font-semibold text-foreground">Book a Ride</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {step === 1 ? renderServiceSelection() : renderBookingForm()}
        </div>
      </div>
    </div>
  );
}

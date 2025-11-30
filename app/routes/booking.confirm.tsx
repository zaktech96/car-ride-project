import type { Route } from "./+types/booking.confirm";
import { Link } from "react-router";
import { useEffect } from "react";
import { upsertFakeBooking } from "~/utils/fakeBookings";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  CheckCircle,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Star,
  Phone,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Extract booking data from URL params
  const bookingData = {
    id: searchParams.get("bookingId") || "RH-2024-001",
    serviceType: searchParams.get("serviceType") || "airport",
    pickupLocation:
      searchParams.get("pickupLocation") ||
      "King Khalid International Airport (RUH)",
    destination: searchParams.get("destination") || "Riyadh City Center",
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
    time: searchParams.get("time") || "14:30",
    passengers: searchParams.get("passengers") || "2",
    phoneNumber: searchParams.get("phoneNumber") || "+966 50 123 4567",
    driverName: searchParams.get("driverName") || "Ahmed Al-Rashid",
    driverPhone: searchParams.get("driverPhone") || "+966 50 123 4567",
    vehicle: searchParams.get("vehicle") || "BMW 7 Series",
    estimatedPrice: searchParams.get("estimatedPrice") || "150 SAR",
    // Pricing details
    pricing: {
      basePrice: searchParams.get("basePrice"),
      finalPrice: searchParams.get("calculatedPrice"),
      discountApplied: searchParams.get("discountApplied"),
      discountPercentage: searchParams.get("discountPercentage"),
    },
  };

  return { bookingData };
}

export default function BookingConfirm({ loaderData }: Route.ComponentProps) {
  const { bookingData } = loaderData;
  // Persist into fake store if we came from fake checkout with paid=true
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const paid = url.searchParams.get("paid");
    if (paid === "true") {
      upsertFakeBooking({
        id: bookingData.id,
        serviceType: bookingData.serviceType,
        pickupLocation: bookingData.pickupLocation,
        destination: bookingData.destination,
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        phoneNumber: bookingData.phoneNumber,
        status: "confirmed",
        paymentStatus: "paid",
        driver: {
          name: bookingData.driverName,
          phone: bookingData.driverPhone,
          vehicle: bookingData.vehicle,
        },
        estimatedPrice: bookingData.estimatedPrice,
        createdAt: new Date().toISOString(),
      });
    }
  }, [bookingData]);

  const getServiceTypeDisplay = (type: string) => {
    switch (type) {
      case "airport":
        return "Airport Pickup";
      case "intercity":
        return "Intercity Trip";
      case "hourly":
        return "Hourly Chauffeur";
      default:
        return "Chauffeur Service";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
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
              <span className="font-semibold text-foreground">
                Booking Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Your chauffeur service has been successfully booked
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Booking ID: {bookingData.id}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {getServiceTypeDisplay(bookingData.serviceType)}
                  </Badge>
                  <div className="text-right">
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {bookingData.pricing?.finalPrice
                          ? `${bookingData.pricing.finalPrice} SAR`
                          : bookingData.estimatedPrice}
                      </div>
                      {bookingData.pricing?.discountApplied &&
                        Number(bookingData.pricing.discountApplied) > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">
                              {bookingData.pricing.basePrice} SAR
                            </span>
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              -{bookingData.pricing.discountApplied} SAR (
                              {bookingData.pricing.discountPercentage}% off)
                            </span>
                          </div>
                        )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-foreground">Pickup Location</div>
                      <div className="text-muted-foreground">
                        {bookingData.pickupLocation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-medium text-foreground">Destination</div>
                      <div className="text-muted-foreground">
                        {bookingData.destination}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-foreground">Date</div>
                      <div className="text-muted-foreground">
                        {formatDate(bookingData.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <div className="font-medium text-foreground">Time</div>
                      <div className="text-muted-foreground">
                        {formatTime(bookingData.time)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="font-medium text-foreground">Passengers</div>
                      <div className="text-muted-foreground">
                        {bookingData.passengers}{" "}
                        {bookingData.passengers === "1"
                          ? "passenger"
                          : "passengers"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Your Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {bookingData.driverName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {bookingData.driverName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-foreground">4.9</span>
                      </div>
                      <span className="text-muted-foreground">
                        • 5 years experience
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-foreground">Vehicle</div>
                      <div className="text-muted-foreground">{bookingData.vehicle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-medium text-foreground">Contact</div>
                      <div className="text-muted-foreground">
                        {bookingData.driverPhone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      WhatsApp Updates
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You'll receive real-time updates about your driver's
                    location and arrival time on WhatsApp.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="flex items-center gap-2">
              <a
                href={`https://wa.me/${bookingData.driverPhone.replace(/[^0-9]/g, "")}?text=Hello, I have a booking with you for ${formatDate(bookingData.date)} at ${formatTime(bookingData.time)}. Booking ID: ${bookingData.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Driver on WhatsApp
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Booking
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Driver Assignment</div>
                    <div className="text-muted-foreground">
                      Your driver {bookingData.driverName} has been assigned and
                      will contact you 30 minutes before pickup.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Real-time Tracking</div>
                    <div className="text-muted-foreground">
                      You'll receive WhatsApp updates with your driver's
                      location and estimated arrival time.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Safe Journey</div>
                    <div className="text-muted-foreground">
                      Your professional chauffeur will ensure a comfortable and
                      safe journey to your destination.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

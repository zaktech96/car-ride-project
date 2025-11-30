import type { Route } from "./+types/bookings";
import { useEffect, useState } from "react";
import { Form, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Car,
  Plane,
  Clock,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Star,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  Crown,
  Zap,
} from "lucide-react";
import { getServiceConfig } from "~/../config";

export async function loader({ request }: Route.LoaderArgs) {
  // Server loader still returns a baseline list (used when JS disabled)
  const dummyBookings = [
    {
      id: "RH-2024-001",
      serviceType: "airport",
      pickupLocation: "King Khalid International Airport (RUH)",
      destination: "Riyadh City Center",
      date: "2024-01-15",
      time: "14:30",
      passengers: "2",
      phoneNumber: "+966 50 123 4567",
      status: "confirmed",
      paymentStatus: "pending",
      driver: {
        name: "Ahmed Al-Rashid",
        phone: "+966 50 123 4567",
        vehicle: "BMW 7 Series",
        license: "ABC-1234",
        rating: 4.9,
      },
      estimatedPrice: "150 SAR",
      createdAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "RH-2024-002",
      serviceType: "intercity",
      pickupLocation: "Riyadh",
      destination: "Jeddah",
      date: "2024-01-20",
      time: "08:00",
      passengers: "4",
      phoneNumber: "+966 50 123 4567",
      status: "confirmed",
      paymentStatus: "pending",
      driver: {
        name: "Mohammed Al-Sheikh",
        phone: "+966 50 987 6543",
        vehicle: "Mercedes S-Class",
        license: "XYZ-5678",
        rating: 4.8,
      },
      estimatedPrice: "120 SAR",
      createdAt: "2024-01-12T15:30:00Z",
    },
    {
      id: "RH-2024-003",
      serviceType: "hourly",
      pickupLocation: "Riyadh Business District",
      destination: "Multiple stops",
      date: "2024-01-18",
      time: "10:00",
      passengers: "2",
      phoneNumber: "+966 50 123 4567",
      status: "completed",
      paymentStatus: "paid",
      driver: {
        name: "Khalid Al-Mansouri",
        phone: "+966 50 555 1234",
        vehicle: "Audi A8",
        license: "DEF-9012",
        rating: 4.9,
      },
      estimatedPrice: "80 SAR/hour",
      createdAt: "2024-01-08T09:15:00Z",
    },
  ];

  return { bookings: dummyBookings };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const bookingId = formData.get("bookingId");
  const newServiceType = formData.get("serviceType");

  // TODO: Update booking in Convex database
  console.log(
    "Action:",
    action,
    "Booking ID:",
    bookingId,
    "New Service Type:",
    newServiceType
  );

  // For demo purposes, just return success
  return { success: true, message: "Booking updated successfully" };
}

export default function BookingsDashboard({
  loaderData,
}: Route.ComponentProps) {
  const { bookings: serverBookings } = loaderData;
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [clientBookings, setClientBookings] = useState(serverBookings);

  // Fetch real bookings from Convex if available
  // TODO: Replace "demo-user" with actual userId from auth
  const convexBookings = useQuery(api.ridePricingSimple.getUserRides, {
    userId: "demo-user", // Replace with actual user ID
    limit: 50,
  });

  // Get Polar configuration
  const polarConfig = getServiceConfig("polar");
  const isPolarEnabled = polarConfig?.enabled;

  // Debug logging
  useEffect(() => {
    console.log("🔍 Payment Debug:", {
      isPolarEnabled,
      polarConfig,
      bookingsCount: clientBookings.length,
      pendingBookings: clientBookings.filter(
        (b: any) => b.paymentStatus === "pending"
      ).length,
    });
  }, [isPolarEnabled, polarConfig, clientBookings]);

  // Map service types to ride types for Polar pricing - 3 main types only
  const getRideType = (serviceType: string) => {
    const typeMap: Record<string, string> = {
      intercity: "medium", // Inter-City Rides
      airport: "premium", // Airport Pickup
      hourly: "premium", // Hourly Chauffeur
    };
    return typeMap[serviceType] || "medium";
  };

  // Get Polar Price ID based on ride type (one-time payments) - 3 main types only
  const getPolarPriceId = (rideType: string) => {
    const priceMap: Record<string, string> = {
      medium: "price_intercity_ride", // One-time payment for inter-city rides - $50
      premium: "b84f0935-adb9-4774-8822-66844a636737", // Your Airport Pickup Product ID - $40
    };
    return priceMap[rideType] || "price_intercity_ride";
  };

  // Handle Polar payment
  const handlePolarPayment = (booking: any) => {
    const rideType = getRideType(booking.serviceType);
    const polarPriceId = getPolarPriceId(rideType);

    // Check if we have a real Price ID (not placeholder)
    if (polarPriceId.startsWith("price_intercity_ride")) {
      // Show alert for placeholder Price IDs
      alert(
        `⚠️ Inter-City Price ID not configured yet!\n\nYou need to create:\n1. Inter-City Ride Payment - $50\n\nCurrent Price ID: ${polarPriceId}\nRide Type: ${rideType}\nPayment Type: One-time fixed payment`
      );
      return;
    }

    // Extract amount from estimatedPrice (remove "SAR" and convert to number)
    const amount = booking.estimatedPrice.replace(/[^0-9.]/g, "");

    // Create Polar checkout URL
    const successUrl = encodeURIComponent(
      `${window.location.origin}/dashboard/bookings?payment=success&bookingId=${booking.id}`
    );
    const cancelUrl = encodeURIComponent(
      `${window.location.origin}/dashboard/bookings?payment=cancelled&bookingId=${booking.id}`
    );

    const polarUrl = `https://polar.sh/checkout?price_id=${polarPriceId}&success_url=${successUrl}&cancel_url=${cancelUrl}`;

    // Open Polar checkout in new window
    window.open(
      polarUrl,
      "_blank",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );
  };
  useEffect(() => {
    // Use Convex bookings if available, otherwise fall back to localStorage
    if (convexBookings && convexBookings.length > 0) {
      // Transform Convex rides to booking format
      const transformedBookings = convexBookings.map((ride: any) => ({
        id: ride._id,
        serviceType:
          ride.rideType === "medium"
            ? "intercity"
            : ride.rideType === "premium"
              ? "airport"
              : "hourly",
        pickupLocation: ride.fromLocation,
        destination: ride.toLocation,
        date: new Date(ride.createdAt).toISOString().split("T")[0],
        time: "14:30", // Default time
        passengers: "2", // Default
        phoneNumber: "+966 50 123 4567", // Default
        status: ride.status || "confirmed",
        paymentStatus: "paid", // Assume paid if in Convex
        driver: {
          name: "Driver Name",
          phone: "+966 50 123 4567",
          vehicle: "Luxury Vehicle",
          license: "ABC-1234",
          rating: 4.9,
        },
        estimatedPrice: `${ride.finalPrice} SAR`,
        createdAt: new Date(ride.createdAt).toISOString(),
      }));
      setClientBookings(transformedBookings);
    } else {
      // Fall back to localStorage fake bookings
      try {
        const raw = localStorage.getItem("rahla_fake_bookings");
        if (raw) {
          const fakeBookings = JSON.parse(raw);
          setClientBookings([...serverBookings, ...fakeBookings]);
        }
      } catch {}
    }
  }, [convexBookings, serverBookings]);

  const getServiceTypeDisplay = (type: string) => {
    switch (type) {
      case "intercity":
        return "Inter-City Rides";
      case "airport":
        return "Airport Pickup";
      case "hourly":
        return "Hourly Chauffeur";
      default:
        return "Chauffeur Service";
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "intercity":
        return Car;
      case "airport":
        return Plane;
      case "hourly":
        return Clock;
      default:
        return Car;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300">
            Completed
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="default"
            className="bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 flex items-center gap-1"
          >
            <ClockIcon className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your chauffeur service bookings
          </p>
          {isPolarEnabled && (
            <div className="flex items-center gap-2 mt-2">
              <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Polar payments enabled
              </span>
            </div>
          )}
        </div>
        <Button asChild>
          <Link to="/book">Book New Ride</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {clientBookings.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {
                    clientBookings.filter((b) => b.paymentStatus === "paid")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {
                    clientBookings.filter((b) => b.paymentStatus === "pending")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Pending Payment</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {clientBookings.map((booking) => {
          const ServiceIcon = getServiceTypeIcon(booking.serviceType);
          return (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <ServiceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.id}</CardTitle>
                      <CardDescription>
                        {getServiceTypeDisplay(booking.serviceType)} •{" "}
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {getPaymentStatusBadge(booking.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trip Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Trip Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-foreground">
                          <strong>From:</strong> {booking.pickupLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-foreground">
                          <strong>To:</strong> {booking.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-foreground">
                          <strong>Passengers:</strong> {booking.passengers}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm text-foreground">
                          <strong>Price:</strong> {booking.estimatedPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Driver Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">
                          <strong>Name:</strong> {booking.driver.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          <strong>Vehicle:</strong> {booking.driver.vehicle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-sm text-foreground">
                          <strong>Rating:</strong> {booking.driver.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">
                          <strong>Contact:</strong> {booking.driver.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                  {/* Payment Actions */}
                  {booking.paymentStatus === "pending" && isPolarEnabled && (
                    <Button
                      onClick={() => handlePolarPayment(booking)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Pay with Polar
                    </Button>
                  )}

                  {booking.paymentStatus === "pending" && !isPolarEnabled && (
                    <Button variant="outline" size="sm" disabled>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Pending
                    </Button>
                  )}

                  {/* Service Type Update (for paid bookings) */}
                  {booking.paymentStatus === "paid" && (
                    <Form method="post" className="flex items-center gap-2">
                      <input
                        type="hidden"
                        name="action"
                        value="updateServiceType"
                      />
                      <input
                        type="hidden"
                        name="bookingId"
                        value={booking.id}
                      />
                      <Select
                        name="serviceType"
                        defaultValue={booking.serviceType}
                        onValueChange={(value) => {
                          if (value !== booking.serviceType) {
                            setEditingBooking(booking.id);
                          }
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airport">
                            Airport Pickup
                          </SelectItem>
                          <SelectItem value="intercity">
                            Intercity Trip
                          </SelectItem>
                          <SelectItem value="hourly">
                            Hourly Chauffeur
                          </SelectItem>
                          <SelectItem value="short">City Rides</SelectItem>
                          <SelectItem value="medium">
                            Inter-City Rides
                          </SelectItem>
                          <SelectItem value="long">Long Distance</SelectItem>
                          <SelectItem value="premium">
                            Luxury Service
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {editingBooking === booking.id && (
                        <Button type="submit" size="sm">
                          Update
                        </Button>
                      )}
                    </Form>
                  )}

                  {/* Communication Actions */}
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://wa.me/${booking.driver.phone.replace(/[^0-9]/g, "")}?text=Hello, regarding booking ${booking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Driver
                    </a>
                  </Button>

                  <Button asChild variant="outline" size="sm">
                    <Link
                      to={`/booking/confirm?bookingId=${booking.id}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {clientBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No bookings yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by booking your first chauffeur service
            </p>
            <Button asChild>
              <Link to="/book">Book Your First Ride</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React from "react";
import { Button } from "~/components/ui/button";
import {
  MessageCircle,
  Plane,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LocationDropdown } from "~/components/ride-booking/LocationDropdown";
import type { LocationSuggestion } from "~/lib/locationService";
import { locationService } from "~/lib/locationService";

export default function ContentSection() {
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [dropoffLocation, setDropoffLocation] = React.useState("");
  const [selectedPickup, setSelectedPickup] =
    React.useState<LocationSuggestion | null>(null);
  const [selectedDropoff, setSelectedDropoff] =
    React.useState<LocationSuggestion | null>(null);

  const handlePickupSelect = (location: LocationSuggestion) => {
    setSelectedPickup(location);
    setPickupLocation(location.address);
    console.log("Pickup selected:", location);
  };

  const handleDropoffSelect = (location: LocationSuggestion) => {
    setSelectedDropoff(location);
    setDropoffLocation(location.address);
    console.log("Dropoff selected:", location);
  };

  const handleBookNow = () => {
    if (!selectedPickup || !selectedDropoff) {
      alert("Please select both pickup and dropoff locations");
      return;
    }

    // Navigate to booking page with selected locations
    const params = new URLSearchParams({
      pickup: selectedPickup.address,
      dropoff: selectedDropoff.address,
      pickupCity: selectedPickup.city,
      dropoffCity: selectedDropoff.city,
    });

    window.location.href = `/book?${params.toString()}`;
  };

  return (
    <section
      id="hero"
      className="pt-20 md:pt-24 lg:pt-28 pb-12 md:pb-16 lg:pb-24 relative overflow-hidden"
      role="banner"
      aria-label="Hero section with ride booking form"
    >
      {/* Enhanced Background effects with animated gradients */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-blue-500/5 via-transparent to-indigo-500/8 opacity-60 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,113,227,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.08),transparent_50%)]" />
        
        {/* Floating orbs for depth */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-float-2" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
        <div className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 p-6 md:p-8 lg:p-12 relative overflow-hidden group">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 dark:via-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6">
                {/* Main content area */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight animate-in slide-in-from-left duration-700">
                    <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                      Chauffeur Service
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      in Saudi Arabia
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl animate-in slide-in-from-left duration-700 delay-200 mt-4">
                    Premium rides with vetted drivers. Instant WhatsApp
                    confirmation and live updates.
                  </p>
                </div>

                {/* Key Benefits */}
                <ul className="space-y-4 text-sm text-muted-foreground animate-in slide-in-from-left duration-700 delay-300 mt-6">
                  <li className="flex items-center gap-4 hover:text-foreground transition-all duration-300 group cursor-default stagger-item">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-base">Airport pickups with meet & greet</span>
                  </li>
                  <li className="flex items-center gap-4 hover:text-foreground transition-all duration-300 group cursor-default stagger-item">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-base">WhatsApp confirmation & live updates</span>
                  </li>
                  <li className="flex items-center gap-4 hover:text-foreground transition-all duration-300 group cursor-default stagger-item">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-base">Vetted drivers & transparent pricing</span>
                  </li>
                </ul>

                <div className="pt-2 animate-in slide-in-from-left duration-700 delay-500">
                  <Button
                    asChild
                    size="lg"
                    className="group relative w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                  >
                    <Link to="/book" aria-label="Book a chauffeur ride">
                      <span className="relative z-10">Book a Ride</span>
                      <ArrowRight
                        className="size-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Simple Booking Form */}
              <div className="mt-6 lg:mt-0 animate-in slide-in-from-right duration-700 delay-300">
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 relative overflow-hidden group">
                  {/* Subtle animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-md">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Quick Booking
                      </h2>
                    </div>

                  <div className="space-y-4">
                    <LocationDropdown
                      label="Pickup Location"
                      placeholder="Select pickup location"
                      value={pickupLocation}
                      onLocationSelect={handlePickupSelect}
                      className="mb-2"
                    />

                    <LocationDropdown
                      label="Dropoff Location"
                      placeholder="Select destination"
                      value={dropoffLocation}
                      onLocationSelect={handleDropoffSelect}
                      className="mb-2"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Date
                        </Label>
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Today"
                            className="border-0 focus-visible:ring-0 px-0 bg-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Time
                        </Label>
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Now"
                            className="border-0 focus-visible:ring-0 px-0 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
                      <Button
                        onClick={handleBookNow}
                        className="group relative w-full sm:w-auto px-6 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}
                        type="button"
                      >
                        <span className="relative z-10 font-semibold">Book Now</span>
                        <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </Button>
                      <Link to="/ride-network" className="w-full sm:w-auto" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
                        <Button
                          variant="outline"
                          className="w-full px-6 py-6 border-2 hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:shadow-md transition-all duration-300 font-medium"
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}
                          type="button"
                        >
                          Learn about the Ride Network
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/60">
                    <p className="text-xs text-muted-foreground text-center font-medium">
                      Serving Riyadh, Jeddah, Mecca, Medina, Dammam & more
                    </p>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

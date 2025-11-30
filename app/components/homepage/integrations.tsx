import React, { memo, useState, useEffect } from "react";
import { Link } from "react-router";
import { LogoIcon } from "~/components/logo";
import {
  Convex,
  Polar,
  ReactIcon,
  ReactRouter,
  ClerkLogo,
} from "~/components/logos";
import Resend from "~/components/logos/Resend";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Navbar } from "./navbar";

// Use shared safe framer-motion wrapper
import {
  MotionDiv,
  MotionSpan,
  AnimatePresence,
} from "~/lib/safe-framer-motion";
import {
  ArrowRight,
  Car,
  ShieldCheck,
  Clock,
  MapPin,
  MessageCircle,
  Plane,
  Building2,
  CheckCircle,
} from "lucide-react";

function StatusTime() {
  const [timeString, setTimeString] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const formatTime = () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const update = () => {
      const now = new Date();
      setTimeString(formatTime());
      const pct =
        ((now.getSeconds() * 1000 + now.getMilliseconds()) / 60_000) * 100;
      setProgress(pct);
    };

    update();
    const intervalId = setInterval(update, 250);
    return () => clearInterval(intervalId);
  }, []);

  const now = new Date();
  const t = (now.getHours() + now.getMinutes() / 60) / 24;
  const dayCurve = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
  const hue = 210 - dayCurve * 140;
  const ringColor = `hsl(${Math.round(hue)} 90% 60%)`;

  return (
    <div
      suppressHydrationWarning
      className="text-white text-xs h-5 overflow-visible tabular-nums flex items-center"
    >
      <div
        className="relative w-3.5 h-3.5 rounded-full mr-2 flex-shrink-0"
        style={{
          background: `conic-gradient(${ringColor} ${progress}%, transparent 0)`,
        }}
        aria-hidden
      >
        <div className="absolute inset-[2px] bg-gray-800 rounded-full" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <MotionSpan
          key={timeString ?? "9:41"}
          initial={{ y: 8, opacity: 0, filter: "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -8, opacity: 0, filter: "blur(2px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="leading-none"
        >
          {timeString ?? "9:41"}
        </MotionSpan>
      </AnimatePresence>
    </div>
  );
}

// Error boundary wrapper for framer-motion
class IntegrationsErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "IntegrationsSection error (likely framer-motion):",
      error,
      errorInfo
    );
    // Force state update to show fallback
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          id="hero"
          className="relative overflow-hidden min-h-[600px] bg-background"
        >
          <Navbar loaderData={this.props.loaderData} />
          <div className="container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10 bg-background min-h-[400px]">
            <div className="flex flex-col space-y-6 text-foreground">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground m-0">
                Premium Chauffeur Service in Saudi Arabia
              </h1>
              <p className="text-lg text-muted-foreground m-0">
                Book your luxury ride with vetted drivers. Airport transfers,
                intercity travel, and hourly bookings.
              </p>
              <Link to="/book" className="inline-block mt-4">
                <Button size="lg" className="w-fit">
                  Book Your Ride <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-muted rounded-xl min-h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">App Preview</p>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

function IntegrationsSectionContent({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const screens = [
    "home",
    "service-selection",
    "booking-form",
    "confirmation",
    "whatsapp",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative bg-background overflow-hidden min-h-[600px]"
    >
      <Navbar loaderData={loaderData} />

      <div className="container mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left Side - Visual */}
        <MotionDiv
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex justify-center order-2 md:order-1"
        >
          <div className="relative">
            {/* Interactive App Mockup */}
            <div className="relative bg-foreground rounded-2xl shadow-2xl w-[300px] h-[620px] overflow-hidden">
              {/* Status bar */}
              <div className="flex justify-between items-center px-4 pt-3 pb-2 bg-foreground/80">
                <StatusTime />
                <div className="flex gap-1">
                  <div className="w-4 h-2 bg-background rounded-sm"></div>
                  <div className="w-4 h-2 bg-background rounded-sm"></div>
                  <div className="w-4 h-2 bg-background rounded-sm"></div>
                </div>
              </div>

              {/* App Content */}
              <div className="h-full bg-background flex flex-col">
                <AnimatePresence mode="wait">
                  {currentScreen === 0 && (
                    <MotionDiv
                      key="home"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 h-full flex flex-col"
                    >
                      {/* Header */}
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-foreground rounded-xl mx-auto mb-2 flex items-center justify-center text-background font-bold text-lg">
                          رحلة
                        </div>
                        <h2 className="font-bold text-foreground">
                          Welcome to Rahla
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Luxury chauffeur service
                        </p>
                      </div>

                      {/* Quick actions */}
                      <div className="space-y-3">
                        <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-3 flex items-center gap-3">
                          <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="font-medium text-foreground">
                              Airport Pickup
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Meet & greet service
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-3 flex items-center gap-3">
                          <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="font-medium text-foreground">
                              Intercity Trip
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Riyadh to Jeddah
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-500/10 dark:bg-purple-500/20 rounded-lg p-3 flex items-center gap-3">
                          <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="font-medium text-foreground">
                              Hourly Service
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Flexible bookings
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-auto mb-6">
                        <div className="bg-foreground text-background rounded-lg py-3 text-center font-medium">
                          Book a Ride
                        </div>
                      </div>
                    </MotionDiv>
                  )}

                  {currentScreen === 1 && (
                    <MotionDiv
                      key="service-selection"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 h-full flex flex-col"
                    >
                      <div className="text-center py-6">
                        <h2 className="font-bold text-foreground">
                          Choose Service
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Select your ride type
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="border-2 border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                Airport Pickup
                              </div>
                              <div className="text-xs text-muted-foreground">
                                From 150 SAR
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="border border-border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Car className="w-6 h-6 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                Intercity Trip
                              </div>
                              <div className="text-xs text-muted-foreground">
                                From 300 SAR
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border border-border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                Hourly Service
                              </div>
                              <div className="text-xs text-muted-foreground">
                                80 SAR/hour
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto mb-6">
                        <div className="bg-foreground text-background rounded-lg py-3 text-center font-medium">
                          Continue
                        </div>
                      </div>
                    </MotionDiv>
                  )}

                  {currentScreen === 2 && (
                    <MotionDiv
                      key="booking-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 h-full flex flex-col"
                    >
                      <div className="text-center py-6">
                        <h2 className="font-bold text-foreground">
                          Book Your Ride
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Fill in the details
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Pickup Location
                          </label>
                          <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                            King Khalid Airport
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Destination
                          </label>
                          <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                            Riyadh City Center
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Date & Time
                          </label>
                          <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                            Today, 2:30 PM
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Passengers
                          </label>
                          <div className="bg-muted rounded-lg p-3 text-sm text-foreground">
                            2 passengers
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto mb-6">
                        <div className="bg-foreground text-background rounded-lg py-3 text-center font-medium">
                          Confirm Booking
                        </div>
                      </div>
                    </MotionDiv>
                  )}

                  {currentScreen === 3 && (
                    <MotionDiv
                      key="confirmation"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 h-full flex flex-col items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="font-bold text-foreground mb-2">
                          Booking Confirmed!
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your ride has been booked successfully
                        </p>

                        <div className="bg-muted rounded-lg p-3 text-left w-full">
                          <div className="text-xs text-muted-foreground mb-1">
                            Booking ID
                          </div>
                          <div className="font-mono text-sm text-foreground">
                            #RH-2024-001
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 mb-1">
                            Driver
                          </div>
                          <div className="text-sm text-foreground">
                            Ahmed Al-Rashid
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 mb-1">
                            Vehicle
                          </div>
                          <div className="text-sm text-foreground">
                            BMW 7 Series
                          </div>
                        </div>
                      </div>
                    </MotionDiv>
                  )}

                  {currentScreen === 4 && (
                    <MotionDiv
                      key="whatsapp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 h-full flex flex-col"
                    >
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-bold text-foreground">
                          WhatsApp Confirmation
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          You'll receive updates here
                        </p>
                      </div>

                      <div className="flex-1 bg-muted rounded-lg p-4 mb-4 overflow-y-auto">
                        <div className="space-y-4">
                          <div className="bg-green-500 text-white rounded-lg p-3 text-sm ml-8">
                            ✅ Booking confirmed! Your driver Ahmed will arrive
                            at King Khalid Airport at 2:30 PM. Vehicle: BMW 7
                            Series (License: ABC-1234)
                          </div>
                          <div className="bg-green-500 text-white rounded-lg p-3 text-sm ml-8">
                            📱 Driver contact: +966 50 123 4567
                          </div>
                          <div className="bg-green-500 text-white rounded-lg p-3 text-sm ml-8">
                            🚗 Driver is 5 minutes away. Please wait at Terminal
                            1, Gate 3.
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 flex-shrink-0">
                        <div className="bg-foreground text-background rounded-lg py-3 text-center font-medium">
                          View Booking Details
                        </div>
                      </div>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Right Side - Text Content */}
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 order-1 md:order-2"
        >
          <div className="flex justify-center md:justify-start mb-8">
            <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-foreground">
                رحلة · Rahla
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground text-center md:text-left">
            Luxury Chauffeur Service <br /> in Saudi Arabia
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg text-center md:text-left">
            Private rides with vetted drivers and instant WhatsApp confirmation.
            Airport pickups, intercity routes, and hourly bookings across
            Riyadh, Jeddah & Dammam.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-5 text-foreground justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
              Vetted drivers
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
              On-time pickup
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
              WhatsApp updates
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
              Riyadh • Jeddah • Dammam
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4 justify-center md:justify-start">
            <Button asChild size="lg" className="px-6 py-3">
              <Link to="/book" className="inline-flex items-center gap-2">
                Book a Ride
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 py-3">
              <Link to="#features">Learn More</Link>
            </Button>
          </div>

          {/* Trust Line */}
          <p className="text-sm text-muted-foreground pt-4 text-center md:text-left">
            ⭐ Trusted by 10,000+ travelers across Saudi Arabia
          </p>
        </MotionDiv>
      </div>
    </section>
  );
}

const IntegrationCard = memo(
  ({
    children,
    className,
    borderClassName,
  }: {
    children: React.ReactNode;
    className?: string;
    borderClassName?: string;
  }) => {
    return (
      <div
        className={cn(
          "bg-background relative flex size-20 rounded-xl dark:bg-transparent",
          className
        )}
      >
        <div
          role="presentation"
          className={cn(
            "absolute inset-0 rounded-xl border border-black/20 dark:border-white/25",
            borderClassName
          )}
        />
        <div className="relative z-20 m-auto size-fit *:size-8">{children}</div>
      </div>
    );
  }
);

// Export with error boundary wrapper
export default function IntegrationsSection({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  return (
    <IntegrationsErrorBoundary loaderData={loaderData}>
      <IntegrationsSectionContent loaderData={loaderData} />
    </IntegrationsErrorBoundary>
  );
}

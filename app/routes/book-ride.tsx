import type { Route } from "./+types/book-ride";
import RideBookingForm from "~/components/ride-booking/ride-booking-form";

export default function BookRide(props: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-background py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/3 via-transparent to-indigo-500/5 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,113,227,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.06),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl animate-float-2" />
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Book Your Ride
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get personalized pricing based on your subscription tier. Save more
            with our flexible ride plans!
          </p>
        </div>

        <RideBookingForm />
      </div>
    </div>
  );
}

import { MapPin, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { MotionDiv } from "~/lib/safe-framer-motion";

interface Route {
  from: string;
  to: string;
  price: string;
  estimatedTime: string;
  distance: string;
  popular?: boolean;
  deal?: string;
}

const popularRoutes: Route[] = [
  {
    from: "Riyadh Airport",
    to: "Riyadh City Center",
    price: "95-120 SAR",
    estimatedTime: "30-45 min",
    distance: "35 km",
    popular: true,
    deal: "Fixed Rate",
  },
  {
    from: "Jeddah Airport",
    to: "Jeddah City Center",
    price: "85-110 SAR",
    estimatedTime: "25-35 min",
    distance: "19 km",
    popular: true,
  },
  {
    from: "Riyadh",
    to: "Dammam",
    price: "350-450 SAR",
    estimatedTime: "4-5 hours",
    distance: "420 km",
    popular: true,
    deal: "Save 10%",
  },
  {
    from: "Riyadh",
    to: "Jeddah",
    price: "450-550 SAR",
    estimatedTime: "9-10 hours",
    distance: "950 km",
    popular: true,
  },
  {
    from: "Jeddah",
    to: "Mecca",
    price: "120-150 SAR",
    estimatedTime: "1-1.5 hours",
    distance: "75 km",
    popular: true,
    deal: "Popular Route",
  },
  {
    from: "Mecca",
    to: "Medina",
    price: "180-220 SAR",
    estimatedTime: "2-2.5 hours",
    distance: "420 km",
    popular: true,
  },
  {
    from: "Riyadh",
    to: "Al Khobar",
    price: "320-380 SAR",
    estimatedTime: "3.5-4 hours",
    distance: "395 km",
  },
  {
    from: "Dammam Airport",
    to: "Al Khobar",
    price: "60-80 SAR",
    estimatedTime: "20-30 min",
    distance: "25 km",
  },
  {
    from: "Riyadh",
    to: "Taif",
    price: "400-480 SAR",
    estimatedTime: "8-9 hours",
    distance: "780 km",
  },
];

export default function DealsSection() {
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Popular Routes & Deals</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Transparent Pricing for Popular Routes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See our most popular routes with fixed rates and special deals.
            Prices are approximate and may vary based on traffic and time of
            day.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-6xl mx-auto">
          {popularRoutes.map((route, index) => (
            <MotionDiv
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`group relative rounded-xl border bg-card p-6 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 card-elevated ${
                route.popular ? "border-primary/30 shadow-md" : "border-border"
              }`}
            >
              {route.popular && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                  Popular
                </div>
              )}
              {route.deal && (
                <div className="absolute -top-2 left-2 bg-green-500 dark:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                  {route.deal}
                </div>
              )}

              <div className="space-y-3">
                {/* Route */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {route.from}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground my-1" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {route.to}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and Info */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {route.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{route.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{route.distance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-left sm:text-center">
              <p className="text-foreground font-semibold mb-1">
                Need a different route?
              </p>
              <p className="text-sm text-muted-foreground">
                Get instant pricing for any location in Saudi Arabia
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="whitespace-nowrap">
              <Link to="/book">View All Routes</Link>
            </Button>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          * Prices are approximate and may vary based on traffic, time of day,
          and service type. Final price will be confirmed at booking.
        </p>
      </div>
    </section>
  );
}

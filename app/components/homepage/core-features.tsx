import { Plane, Car, Clock, Building2, Users, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function CoreFeaturesSection() {
  const services = [
    {
      icon: <Plane className="w-6 h-6 text-blue-600" />,
      title: "Airport Transfers",
      description:
        "Meet & greet service with flight tracking. Fixed rates to/from all major airports.",
      price: "From SAR 95",
      features: ["Flight tracking", "Meet & greet", "Waiting time included"],
    },
    {
      icon: <Car className="w-6 h-6 text-green-600" />,
      title: "Intercity Travel",
      description:
        "Comfortable long-distance rides between major cities with professional drivers.",
      price: "From SAR 350",
      features: ["City to city", "Professional drivers", "Fixed pricing"],
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Hourly Service",
      description:
        "Flexible hourly bookings for business meetings, shopping, or multiple stops.",
      price: "From SAR 250/3hrs",
      features: ["Multiple stops", "Wait time", "Flexible schedule"],
    },
    {
      icon: <Building2 className="w-6 h-6 text-orange-600" />,
      title: "Corporate Accounts",
      description:
        "Dedicated service for businesses with centralized billing and priority support.",
      price: "Custom rates",
      features: ["Priority booking", "Invoicing", "Account management"],
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-600" />,
      title: "Group Transport",
      description: "Larger vehicles for families or groups traveling together.",
      price: "From SAR 400",
      features: ["Up to 7 passengers", "Luggage space", "Group discounts"],
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      title: "Special Events",
      description:
        "Wedding, business events, or special occasions with premium vehicles.",
      price: "Custom quotes",
      features: ["Premium vehicles", "Event coordination", "Special requests"],
    },
  ];
  return (
    <section id="features" className="relative py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Service Types
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the perfect ride option for your needs across Saudi Arabia.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm shadow-lg shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden card-elevated"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-shrink-0 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 group-hover:from-primary/30 group-hover:to-primary/20 dark:group-hover:from-primary/40 dark:group-hover:to-primary/30 group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                        {service.title}
                      </h3>
                      <span className="text-sm font-semibold text-primary bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 px-3 py-1.5 rounded-full border border-primary/20 dark:border-primary/30 group-hover:border-primary/40 transition-all duration-300">
                        {service.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-muted-foreground flex items-center gap-2.5 group-hover:text-foreground/80 transition-colors duration-300"
                        >
                          <span className="w-2 h-2 bg-gradient-to-br from-primary to-blue-600 rounded-full group-hover:scale-125 transition-transform duration-300"></span>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl py-10 px-8 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-foreground text-xl font-semibold max-w-2xl mx-auto mb-6 relative z-10">
              Need a custom service or have special requirements?
            </p>
            <Button asChild variant="outline" className="px-8 py-6 border-2 hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:shadow-md transition-all duration-300 font-medium relative z-10">
              <Link to="/book">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

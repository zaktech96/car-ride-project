import { Link } from "react-router";
import { Car, Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rahla
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium chauffeur service across Saudi Arabia. Professional
              drivers, transparent pricing, and instant WhatsApp confirmation.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="https://x.com/_7obaid_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X/Twitter"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/book"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Airport Transfers
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Intercity Travel
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Hourly Service
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Corporate Accounts
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Group Transport
                </Link>
              </li>
            </ul>
          </div>

          {/* Coverage */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Coverage</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                Riyadh & Surrounding Areas
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                Jeddah & Western Region
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                Dammam & Eastern Province
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                Mecca & Medina
              </li>
              <li className="text-xs text-muted-foreground/70 mt-2">
                + More cities across KSA
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">WhatsApp Support</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">24/7 Service</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Email Support</span>
              </div>
            </div>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Book Now
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rahla Chauffeur Service. All rights
            reserved.
          </span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <span>Made in Saudi Arabia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

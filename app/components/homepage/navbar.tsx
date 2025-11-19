"use client";
import { UserButton } from "@clerk/react-router";
import { Menu, X, Loader2, Car } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { config, isFeatureEnabled, isServiceEnabled } from "../../../config";
import { ThemeToggle } from "~/components/theme/theme-toggle";

const getMenuItems = () => {
  const items = [
    { name: "Home", href: "#hero" },
    { name: "Features", href: "#features" },
  ];

  // Only show pricing if payments are enabled
  if (isFeatureEnabled("payments") && config.ui.showPricing) {
    items.push({ name: "Pricing", href: "#pricing" });
  }

  // Add ride booking if payments are enabled
  if (isFeatureEnabled("payments")) {
    items.push({ name: "Book Ride", href: "/book-ride" });
  }

  return items;
};

export const Navbar = ({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const menuItems = getMenuItems();

  React.useEffect(() => {
    // Use RAF for smooth scroll updates
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > 20;

        // Only update state if it actually changed
        setIsScrolled((prev) => {
          if (prev !== shouldBeScrolled) {
            return shouldBeScrolled;
          }
          return prev;
        });
      });
    };

    // Set initial scroll state
    handleScroll();

    // Add single event listener with passive flag
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleNavClick = useCallback((href: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (href.startsWith("#")) {
      // Close menu first
      setMenuState(false);
      
      // Use requestAnimationFrame and multiple attempts to ensure DOM is ready
      const scrollToElement = (attempts = 0) => {
        if (attempts > 10) return; // Max 10 attempts (1 second)
        
        const element = document.querySelector(href);
        if (element) {
          // Scroll to element
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          // Retry if element not found (might not be rendered yet)
          setTimeout(() => scrollToElement(attempts + 1), 100);
        }
      };
      
      // Start scrolling after a small delay to ensure hydration is complete
      requestAnimationFrame(() => {
        setTimeout(() => scrollToElement(), 50);
      });
    } else {
      // For regular links, use proper navigation
      setMenuState(false);
      window.location.href = href;
    }
  }, []);

  const handleDashboardClick = useCallback(() => {
    setIsDashboardLoading(true);
  }, []);

  // Simple computations don't need useMemo
  // Check both feature flag AND service availability (Clerk keys must be set)
  const authEnabled = isFeatureEnabled("auth") && config.ui.showAuth && isServiceEnabled("clerk");

  const dashboardLink = !authEnabled
    ? "/dashboard"
    : !loaderData?.isSignedIn
      ? "/sign-up"
      : "/dashboard";

  const dashboardText = "Dashboard";

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed top-0 left-0 right-0 w-full"
        style={{ pointerEvents: 'auto', zIndex: 1000, position: 'fixed' }}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl transition-all duration-300",
            isScrolled
              ? "bg-background/80 backdrop-blur-xl rounded-b-2xl border-b border-x border-border/50 shadow-xl shadow-primary/5"
              : "bg-background/60 backdrop-blur-sm"
          )}
        >
          {/* Temporary debug indicator */}
          {/* <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs z-10">
            Debug: {isScrolled ? 'SCROLLED' : 'NOT SCROLLED'}
          </div> */}
          <div className="relative flex items-center justify-between gap-6 py-3 px-4 md:px-6 lg:gap-0 lg:py-4">
            <div className="flex-shrink-0">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2 font-bold text-2xl text-foreground hover:text-primary transition-all duration-300 group"
                prefetch="viewport"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Car className="w-5 h-5 text-white relative z-10" />
                  </div>
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300 font-bold text-2xl">
                    Rahla
                  </span>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState == true ? "Close Menu" : "Open Menu"}
              className="relative z-20 block cursor-pointer p-2 lg:hidden"
            >
              <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
              <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block" style={{ pointerEvents: 'auto', zIndex: 10 }}>
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index} style={{ pointerEvents: 'auto' }}>
                    {item.href.startsWith("#") ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNavClick(item.href, e);
                        }}
                        className="hover:cursor-pointer text-muted-foreground block duration-300 transition-all hover:text-foreground relative group"
                        type="button"
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                      >
                        <span className="relative z-10 font-medium">{item.name}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-300 group-hover:w-full group-hover:h-0.5"></span>
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuState(false);
                        }}
                        className="hover:cursor-pointer text-muted-foreground block duration-300 transition-all hover:text-foreground relative group"
                        prefetch="viewport"
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                      >
                        <span className="relative z-10 font-medium">{item.name}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full transition-all duration-300 group-hover:w-full group-hover:h-0.5"></span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      {item.href.startsWith("#") ? (
                        <button
                          onClick={(e) => handleNavClick(item.href, e)}
                          className="text-muted-foreground hover:cursor-pointer block duration-150 transition-colors w-full text-left"
                          type="button"
                        >
                          <span>{item.name}</span>
                        </button>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setMenuState(false)}
                          className="text-muted-foreground hover:cursor-pointer block duration-150 transition-colors w-full text-left"
                          prefetch="viewport"
                        >
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  {authEnabled && loaderData?.isSignedIn ? (
                    <>
                      <Button
                        asChild
                        size="sm"
                        disabled={isDashboardLoading}
                        onClick={handleDashboardClick}
                        className="min-w-[90px]"
                      >
                        <Link to={dashboardLink} prefetch="viewport">
                          {isDashboardLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <span>{dashboardText}</span>
                          )}
                        </Link>
                      </Button>
                      <UserButton />
                    </>
                  ) : authEnabled ? (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/sign-in" prefetch="viewport">
                          <span>Login</span>
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/sign-up" prefetch="viewport">
                          <span>Sign Up</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    // When auth is disabled, show a simple get started button
                    <Button
                      asChild
                      size="sm"
                      disabled={isDashboardLoading}
                      onClick={handleDashboardClick}
                      className="min-w-[90px]"
                    >
                      <Link to={dashboardLink} prefetch="viewport">
                        {isDashboardLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{dashboardText}</span>
                        )}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

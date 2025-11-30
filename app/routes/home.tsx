import { isFeatureEnabled, isServiceEnabled, config } from "../../config";
import IntegrationsSection from "~/components/homepage/integrations";
import type { Route } from "./+types/home";
import { ErrorBoundary } from "~/components/ComponentErrorBoundary";
import ContentSection from "~/components/homepage/content";
import VideoDemo from "~/components/homepage/video-demo";
import DealsSection from "~/components/homepage/deals";
import CoreFeaturesSection from "~/components/homepage/core-features";
import Pricing from "~/components/homepage/pricing";
import FAQ from "~/components/homepage/faq";
import FooterSection from "~/components/homepage/footer";

export function meta({}: Route.MetaArgs) {
  const title = "Rahla — Premium Chauffeur Service in Saudi Arabia";
  const description =
    "Luxury chauffeur service with vetted drivers. Airport pickups, intercity travel, and hourly bookings across Saudi Arabia. Instant WhatsApp confirmation and transparent pricing.";
  const keywords =
    "chauffeur service, ride booking, Saudi Arabia, airport transfer, luxury transport, Riyadh, Jeddah, Dammam, intercity travel, chauffeur driver";
  const siteUrl = "https://www.rahla.com/";
  const imageUrl = "/rahla.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Kaizen" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "Rahla" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "en" },
    { name: "revisit-after", content: "7 days" },
    { name: "application-name", content: "Rahla" },
    { name: "msapplication-TileColor", content: "#000000" },
    { name: "theme-color", content: "#000000" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const authEnabled = isFeatureEnabled("auth") && isServiceEnabled("clerk");
  const convexEnabled =
    isFeatureEnabled("convex") && isServiceEnabled("convex");
  const paymentsEnabled =
    isFeatureEnabled("payments") && isServiceEnabled("polar");

  // 1. Auth: get userId if auth enabled, else null
  let userId: string | null = null;
  if (authEnabled) {
    const { getAuth } = await import("@clerk/react-router/ssr.server");
    ({ userId } = await getAuth(args));
  }

  // 2. Fetch subscription status & plans only if Convex enabled
  // For React Router v7, we skip server-side fetching and let the client handle it
  // The client-side components will use useQuery/useAction hooks
  // TODO: Implement server-side Convex fetching when needed
  const plans: any = null;

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: false,
    plans: plans ?? null,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  // Wrap each component in error boundary to prevent one failure from breaking the entire page
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary
        fallback={
          <div className="min-h-[400px] bg-background p-8">
            Hero section temporarily unavailable
          </div>
        }
      >
        <IntegrationsSection loaderData={loaderData} />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="min-h-[300px] bg-background p-8">
            Booking form temporarily unavailable
          </div>
        }
      >
        <ContentSection />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <VideoDemo
          youtubeId={config.ui.video?.youtubeId}
          vimeoId={config.ui.video?.vimeoId}
          videoSrc={config.ui.video?.videoSrc}
          thumbnailSrc={config.ui.video?.thumbnailSrc}
          title={config.ui.video?.title || "See How It Works"}
          description={
            config.ui.video?.description ||
            "Watch a quick demo of how easy it is to book your ride across Saudi Arabia."
          }
        />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <DealsSection />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <CoreFeaturesSection />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <Pricing loaderData={loaderData} />
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <FAQ />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="min-h-[200px] bg-muted p-8 text-center">
            © {new Date().getFullYear()} Rahla Chauffeur Service
          </div>
        }
      >
        <FooterSection />
      </ErrorBoundary>
    </div>
  );
}

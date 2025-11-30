"use client";
import { useAuth } from "@clerk/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "../../../convex/_generated/api";
import { isFeatureEnabled, config } from "../../../config";

export default function Pricing({ loaderData }: { loaderData: any }) {
  // Early return if payments are not enabled
  if (!isFeatureEnabled("payments") || !config.ui.showPricing) {
    return null;
  }

  // Early return if convex is not enabled to avoid using Convex hooks without a provider
  if (!isFeatureEnabled("convex")) {
    return null;
  }

  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userSubscription = useQuery(api.subscriptions.fetchUserSubscription);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);
  
  // Fetch plans client-side if not provided by loader (using action since it needs fetch)
  const [plans, setPlans] = useState<any>(loaderData?.plans || null);
  const getPlans = useAction(api.subscriptions.getAvailablePlansQuery);
  
  useEffect(() => {
    if (!plans && getPlans) {
      getPlans().then(setPlans).catch((error) => {
        console.error("Failed to fetch plans:", error);
        setError(error.message || "Failed to load pricing plans. Please check your Polar configuration.");
        setPlans(null);
      });
    }
  }, [plans, getPlans]);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      // Ensure user exists in database before action
      await upsertUser();

      // If user has active subscription, redirect to customer portal for plan changes
      if (
        userSubscription?.status === "active" &&
        userSubscription?.customerId
      ) {
        const portalResult = await createPortalUrl({
          customerId: userSubscription.customerId,
        });
        window.open(portalResult.url, "_blank");
        setLoadingPriceId(null);
        return;
      }

      // Otherwise, create new checkout for first-time subscription
      const checkoutUrl = await createCheckout({ priceId });

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Failed to process subscription action:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process request. Please try again.";
      setError(errorMessage);
      setLoadingPriceId(null);
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-32 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-4 text-center mb-12">
          <h1 className="text-center text-4xl font-bold lg:text-5xl text-foreground">
            Pricing that Scales with You
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include full access
            to our platform.
          </p>
        </div>

        {!plans ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading plans...</span>
            </div>
            {error && <p className="text-destructive mt-4 text-center">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
            {plans.items
              .sort((a: any, b: any) => {
                const priceComparison = a.prices[0].amount - b.prices[0].amount;
                return priceComparison !== 0
                  ? priceComparison
                  : a.name.localeCompare(b.name);
              })
              .map((plan: any, index: number) => {
                const isPopular =
                  plans.items.length === 2
                    ? index === 1
                    : index === Math.floor(plans.items.length / 2); // Mark middle/higher priced plan as popular
                const price = plan.prices[0];
                const isCurrentPlan =
                  userSubscription?.status === "active" &&
                  userSubscription?.amount === price.amount;

                return (
                  <Card
                    key={plan.id}
                    className={`relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                      isPopular ? "border-primary/60 shadow-xl shadow-primary/10 bg-gradient-to-br from-card/95 to-card/90" : "border-border/60"
                    } ${isCurrentPlan ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5" : "bg-gradient-to-br from-card/90 to-card/70"} backdrop-blur-sm`}
                  >
                    {isPopular && !isCurrentPlan && (
                      <span className="bg-gradient-to-r from-primary to-blue-600 text-white absolute inset-x-0 -top-4 mx-auto flex h-7 w-fit items-center rounded-full px-4 py-1 text-xs font-bold shadow-lg shadow-primary/25">
                        Popular
                      </span>
                    )}
                    {isCurrentPlan && (
                      <span className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary border-2 border-primary/40 absolute inset-x-0 -top-4 mx-auto flex h-7 w-fit items-center rounded-full px-4 py-1 text-xs font-bold shadow-md">
                        Current Plan
                      </span>
                    )}

                    <CardHeader className="pb-4">
                      <CardTitle className="font-bold text-xl mb-2">{plan.name}</CardTitle>

                      <span className="my-4 block text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        ${(price.amount / 100).toFixed(0)}
                        <span className="text-lg font-semibold text-muted-foreground"> / {price.interval || "mo"}</span>
                      </span>

                      <CardDescription className="text-sm leading-relaxed">
                        {plan.description}
                      </CardDescription>

                      <Button
                        className={`mt-6 w-full py-6 font-semibold transition-all duration-300 ${
                          isCurrentPlan
                            ? "bg-secondary hover:bg-secondary/80"
                            : isPopular
                              ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                              : "border-2 hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:shadow-md"
                        }`}
                        variant={
                          isCurrentPlan
                            ? "secondary"
                            : isPopular
                              ? "default"
                              : "outline"
                        }
                        onClick={() => handleSubscribe(price.id)}
                        disabled={loadingPriceId === price.id}
                      >
                        {loadingPriceId === price.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Setting up checkout...
                          </>
                        ) : isCurrentPlan ? (
                          "✓ Current Plan"
                        ) : userSubscription?.status === "active" ? (
                          (() => {
                            const currentAmount = userSubscription.amount || 0;
                            const newAmount = price.amount;

                            if (newAmount > currentAmount) {
                              return `Upgrade (+$${(
                                (newAmount - currentAmount) /
                                100
                              ).toFixed(0)}/mo)`;
                            } else if (newAmount < currentAmount) {
                              return `Downgrade (-$${(
                                (currentAmount - newAmount) /
                                100
                              ).toFixed(0)}/mo)`;
                            } else {
                              return "Manage Plan";
                            }
                          })()
                        ) : (
                          "Get Started"
                        )}
                      </Button>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6">
                      <hr className="border-dashed border-border/60" />

                      <ul className="list-outside space-y-3.5 text-sm">
                        <li className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Check className="size-3 text-primary" />
                          </div>
                          <span className="font-medium">All features included</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Check className="size-3 text-primary" />
                          </div>
                          <span className="font-medium">Priority support</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Check className="size-3 text-primary" />
                          </div>
                          <span className="font-medium">Cancel anytime</span>
                        </li>
                        {plan.isRecurring && (
                          <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <Check className="size-3 text-primary" />
                            </div>
                            <span className="font-medium">Recurring billing</span>
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-md max-w-md mx-auto">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {userSubscription &&
          !plans?.items.some(
            (plan: any) => plan.prices[0].id === userSubscription.polarPriceId
          ) && (
            <div className="mt-8 p-4 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 rounded-md max-w-md mx-auto">
              <p className="text-amber-600 dark:text-amber-400 text-center text-sm">
                You have an active subscription that's not shown above. Contact
                support for assistance.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}

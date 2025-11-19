import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ========================
// 🚗 SIMPLE RIDE PRICING SYSTEM
// ========================

// Customizable pricing configuration by service type
const PRICING_CONFIG = {
  short: {
    basePricePerKm: 3.0,        // Increased for short rides
    basePricePerMinute: 1.0,    // Higher per-minute rate
    minimumPrice: 20,           // Higher minimum
    maximumPrice: 60,           // Higher maximum
    surgeMultiplier: 1.2,       // 20% surge during peak
    serviceFee: 5,              // Fixed service fee
    description: "Quick city rides"
  },
  medium: {
    basePricePerKm: 2.5,        // Moderate pricing
    basePricePerMinute: 0.8,    // Standard per-minute
    minimumPrice: 30,           // Higher minimum
    maximumPrice: 120,          // Higher maximum
    surgeMultiplier: 1.3,       // 30% surge during peak
    serviceFee: 8,              // Higher service fee
    description: "Inter-city rides"
  },
  long: {
    basePricePerKm: 2.0,        // Cheaper per km for long rides
    basePricePerMinute: 0.6,    // Lower per-minute rate
    minimumPrice: 50,           // Much higher minimum
    maximumPrice: 250,          // Higher maximum
    surgeMultiplier: 1.4,       // 40% surge during peak
    serviceFee: 12,             // Highest service fee
    description: "Long distance rides"
  },
  premium: {
    basePricePerKm: 5.0,        // Premium pricing
    basePricePerMinute: 1.5,    // Premium per-minute rate
    minimumPrice: 40,           // High minimum
    maximumPrice: 400,          // Very high maximum
    surgeMultiplier: 1.1,       // Lower surge (premium service)
    serviceFee: 15,             // Premium service fee
    description: "Luxury service"
  },
};

// Service-specific subscription discounts
const SUBSCRIPTION_DISCOUNTS = {
  // Short ride discounts
  "short-basic": 10,     // 10% off short rides
  "short-premium": 15,   // 15% off short rides
  
  // Medium ride discounts  
  "medium-basic": 8,     // 8% off medium rides
  "medium-premium": 20,  // 20% off medium rides
  
  // Long ride discounts
  "long-basic": 5,       // 5% off long rides
  "long-premium": 15,    // 15% off long rides
  
  // Premium ride discounts
  "premium-premium": 25, // 25% off premium rides
  "premium-enterprise": 35, // 35% off premium rides
};

// Calculate ride price based on distance, duration, and subscription
export const calculateRidePrice = action({
  args: {
    userId: v.string(),
    rideType: v.string(),
    distance: v.number(),
    duration: v.number(),
    fromLocation: v.string(),
    toLocation: v.string(),
  },
  handler: async (ctx, args): Promise<{
    rideId: string;
    basePrice: number;
    finalPrice: number;
    discountApplied: number;
    discountPercentage: number;
    currency: string;
    rideType: string;
    distance: number;
    duration: number;
    pricingBreakdown: any;
  }> => {
    const { userId, rideType, distance, duration, fromLocation, toLocation } = args;

    // Get pricing configuration for this ride type
    const pricing = PRICING_CONFIG[rideType as keyof typeof PRICING_CONFIG];
    if (!pricing) {
      throw new Error(`Pricing not found for ride type: ${rideType}`);
    }

    // Calculate base price with service-specific pricing
    const distancePrice = distance * pricing.basePricePerKm;
    const durationPrice = duration * pricing.basePricePerMinute;
    const serviceFee = pricing.serviceFee || 0;
    
    let basePrice = distancePrice + durationPrice + serviceFee;

    // Apply surge pricing if needed (peak hours, high demand, etc.)
    if (pricing.surgeMultiplier) {
      basePrice *= pricing.surgeMultiplier;
    }

    // Ensure price is within bounds for this service type
    basePrice = Math.max(pricing.minimumPrice, Math.min(pricing.maximumPrice, basePrice));

    // Simulate user subscription (dummy data)
    const hasSubscription = true;
    const subscriptionTier = "premium";
    
    let discountPercentage: number = 0;
    let subscriptionId: string | null = null;

    if (hasSubscription) {
      // Service-specific discount based on ride type and subscription tier
      const discountKey = `${rideType}-${subscriptionTier}`;
      discountPercentage = SUBSCRIPTION_DISCOUNTS[discountKey as keyof typeof SUBSCRIPTION_DISCOUNTS] || 0;
      
      // Fallback to general discount if service-specific not found
      if (discountPercentage === 0) {
        discountPercentage = SUBSCRIPTION_DISCOUNTS[subscriptionTier as keyof typeof SUBSCRIPTION_DISCOUNTS] || 20;
      }
      
      subscriptionId = "dummy-subscription-id";
    }

    // Calculate final price
    const discountAmount: number = (basePrice * discountPercentage) / 100;
    const finalPrice: number = basePrice - discountAmount;

    // Create ride record (dummy)
    const rideId: string = `ride_${Date.now()}`;

    return {
      rideId,
      basePrice: Math.round(basePrice * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountApplied: Math.round(discountAmount * 100) / 100,
      discountPercentage,
      currency: "SAR",
      rideType,
      distance,
      duration,
      // Service-specific pricing breakdown
      pricingBreakdown: {
        distancePrice: Math.round(distancePrice * 100) / 100,
        durationPrice: Math.round(durationPrice * 100) / 100,
        serviceFee: serviceFee,
        surgeMultiplier: pricing.surgeMultiplier,
        minimumPrice: pricing.minimumPrice,
        maximumPrice: pricing.maximumPrice,
        description: pricing.description,
      },
    };
  },
});

// Create ride record
export const createRide = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.optional(v.string()),
    rideType: v.string(),
    distance: v.number(),
    duration: v.number(),
    basePrice: v.number(),
    finalPrice: v.number(),
    discountApplied: v.number(),
    discountPercentage: v.number(),
    fromLocation: v.string(),
    toLocation: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const rideId = await ctx.db.insert("rides", {
      ...args,
      createdAt: Date.now(),
    });

    // If this is a completed ride, send usage event to Polar (if polarUsage exists)
    // TODO: Uncomment when polarUsage functions are implemented
    // Currently commented out because polarUsage module doesn't exist

    return rideId;
  },
});

// Get user's ride history
export const getUserRides = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    return await ctx.db
      .query("rides")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get ride statistics for user
export const getUserRideStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Return dummy data for testing
    return {
      totalRides: 12,
      totalSpent: 450.50,
      totalSaved: 67.25,
      averageRidePrice: 37.54,
      ridesByType: {
        short: 8,
        medium: 3,
        premium: 1
      },
      currentTier: "premium",
      ridesThisMonth: 5,
      ridesRemaining: 45,
      nextBillingDate: "2024-02-15",
      memberSince: "2023-08-15"
    };
  },
});

// Get pricing tiers based on ride type
export const getPricingTiers = query({
  args: { rideType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const rideType = args.rideType || "short";
    
    // Return dummy data for testing
    return [
      {
        _id: "basic",
        name: "Basic Plan",
        polarPriceId: "price_basic_plan",
        rideType: "short",
        baseDiscountPercentage: 10,
        maxRidesPerMonth: 20,
        features: ["10% off short rides", "Up to 20 rides/month", "Basic support"],
        isActive: true,
        price: 29,
        currency: "SAR",
        period: "monthly"
      },
      {
        _id: "premium",
        name: "Premium Plan",
        polarPriceId: "price_premium_plan",
        rideType: "medium",
        baseDiscountPercentage: 20,
        maxRidesPerMonth: 50,
        features: ["20% off ALL rides", "Up to 50 rides/month", "Priority support", "Premium vehicles"],
        isActive: true,
        price: 79,
        currency: "SAR",
        period: "monthly"
      },
      {
        _id: "enterprise",
        name: "Enterprise Plan",
        polarPriceId: "price_enterprise_plan",
        rideType: "premium",
        baseDiscountPercentage: 30,
        maxRidesPerMonth: 100,
        features: ["30% off ALL rides", "Unlimited rides", "24/7 support", "Luxury vehicles", "Corporate account"],
        isActive: true,
        price: 199,
        currency: "SAR",
        period: "monthly"
      },
    ];
  },
});

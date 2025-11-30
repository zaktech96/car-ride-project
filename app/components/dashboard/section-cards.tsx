"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

interface Booking {
  id: string
  estimatedPrice: string
  status: string
  paymentStatus: string
  createdAt: string
}

export function SectionCards() {
  const [bookings, setBookings] = useState<Booking[]>([])
  
  // Fetch bookings from Convex
  const convexBookings = useQuery(api.ridePricingSimple.getUserRides, {
    userId: "demo-user", // TODO: Replace with actual user ID from auth
    limit: 100,
  })

  useEffect(() => {
    if (convexBookings && convexBookings.length > 0) {
      // Transform Convex rides to booking format
      const transformed = convexBookings.map((ride: any) => ({
        id: ride._id,
        estimatedPrice: `${ride.finalPrice} SAR`,
        status: ride.status || "confirmed",
        paymentStatus: "paid",
        createdAt: new Date(ride.createdAt).toISOString(),
      }))
      setBookings(transformed)
    } else {
      // Fall back to localStorage fake bookings
      try {
        const raw = localStorage.getItem("rahla_fake_bookings")
        if (raw) {
          const fakeBookings = JSON.parse(raw)
          setBookings(fakeBookings)
        }
      } catch {}
    }
  }, [convexBookings])

  // Calculate metrics
  const totalBookings = bookings.length
  const totalRevenue = bookings.reduce((sum, booking) => {
    const price = parseFloat(booking.estimatedPrice.replace(/[^0-9.]/g, "")) || 0
    return sum + price
  }, 0)
  const activeRides = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length
  const completedRides = bookings.filter((b) => b.status === "completed").length

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} SAR
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {totalBookings > 0 ? "+" : ""}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From {totalBookings} bookings <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            All-time revenue from rides
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Bookings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalBookings}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All your rides <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total bookings created
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Rides</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeRides}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Confirmed & pending <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Rides in progress</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completed Rides</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completedRides}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Successfully completed <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Finished rides</div>
        </CardFooter>
      </Card>
    </div>
  )
}

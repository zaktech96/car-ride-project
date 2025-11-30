"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", airport: 22, intercity: 15 },
  { date: "2024-04-02", airport: 9, intercity: 18 },
  { date: "2024-04-03", airport: 16, intercity: 12 },
  { date: "2024-04-04", airport: 24, intercity: 26 },
  { date: "2024-04-05", airport: 37, intercity: 29 },
  { date: "2024-04-06", airport: 30, intercity: 34 },
  { date: "2024-04-07", airport: 24, intercity: 18 },
  { date: "2024-04-08", airport: 40, intercity: 32 },
  { date: "2024-04-09", airport: 5, intercity: 11 },
  { date: "2024-04-10", airport: 26, intercity: 19 },
  { date: "2024-04-11", airport: 32, intercity: 35 },
  { date: "2024-04-12", airport: 29, intercity: 21 },
  { date: "2024-04-13", airport: 34, intercity: 38 },
  { date: "2024-04-14", airport: 13, intercity: 22 },
  { date: "2024-04-15", airport: 12, intercity: 17 },
  { date: "2024-04-16", airport: 13, intercity: 19 },
  { date: "2024-04-17", airport: 44, intercity: 36 },
  { date: "2024-04-18", airport: 36, intercity: 41 },
  { date: "2024-04-19", airport: 24, intercity: 18 },
  { date: "2024-04-20", airport: 8, intercity: 15 },
  { date: "2024-04-21", airport: 13, intercity: 20 },
  { date: "2024-04-22", airport: 22, intercity: 17 },
  { date: "2024-04-23", airport: 13, intercity: 23 },
  { date: "2024-04-24", airport: 38, intercity: 29 },
  { date: "2024-04-25", airport: 21, intercity: 25 },
  { date: "2024-04-26", airport: 7, intercity: 13 },
  { date: "2024-04-27", airport: 38, intercity: 42 },
  { date: "2024-04-28", airport: 12, intercity: 18 },
  { date: "2024-04-29", airport: 31, intercity: 24 },
  { date: "2024-04-30", airport: 45, intercity: 38 },
  { date: "2024-05-01", airport: 16, intercity: 22 },
  { date: "2024-05-02", airport: 29, intercity: 31 },
  { date: "2024-05-03", airport: 24, intercity: 19 },
  { date: "2024-05-04", airport: 38, intercity: 42 },
  { date: "2024-05-05", airport: 48, intercity: 39 },
  { date: "2024-05-06", airport: 49, intercity: 52 },
  { date: "2024-05-07", airport: 38, intercity: 30 },
  { date: "2024-05-08", airport: 14, intercity: 21 },
  { date: "2024-05-09", airport: 22, intercity: 18 },
  { date: "2024-05-10", airport: 29, intercity: 33 },
  { date: "2024-05-11", airport: 33, intercity: 27 },
  { date: "2024-05-12", airport: 19, intercity: 24 },
  { date: "2024-05-13", airport: 19, intercity: 16 },
  { date: "2024-05-14", airport: 44, intercity: 49 },
  { date: "2024-05-15", airport: 47, intercity: 38 },
  { date: "2024-05-16", airport: 33, intercity: 40 },
  { date: "2024-05-17", airport: 49, intercity: 42 },
  { date: "2024-05-18", airport: 31, intercity: 35 },
  { date: "2024-05-19", airport: 23, intercity: 18 },
  { date: "2024-05-20", airport: 17, intercity: 23 },
  { date: "2024-05-21", airport: 8, intercity: 14 },
  { date: "2024-05-22", airport: 8, intercity: 12 },
  { date: "2024-05-23", airport: 25, intercity: 29 },
  { date: "2024-05-24", airport: 29, intercity: 22 },
  { date: "2024-05-25", airport: 20, intercity: 25 },
  { date: "2024-05-26", airport: 21, intercity: 17 },
  { date: "2024-05-27", airport: 42, intercity: 46 },
  { date: "2024-05-28", airport: 23, intercity: 19 },
  { date: "2024-05-29", airport: 7, intercity: 13 },
  { date: "2024-05-30", airport: 34, intercity: 28 },
  { date: "2024-05-31", airport: 17, intercity: 23 },
  { date: "2024-06-01", airport: 17, intercity: 20 },
  { date: "2024-06-02", airport: 47, intercity: 41 },
  { date: "2024-06-03", airport: 10, intercity: 16 },
  { date: "2024-06-04", airport: 43, intercity: 38 },
  { date: "2024-06-05", airport: 8, intercity: 14 },
  { date: "2024-06-06", airport: 29, intercity: 25 },
  { date: "2024-06-07", airport: 32, intercity: 37 },
  { date: "2024-06-08", airport: 38, intercity: 32 },
  { date: "2024-06-09", airport: 43, intercity: 48 },
  { date: "2024-06-10", airport: 15, intercity: 20 },
  { date: "2024-06-11", airport: 9, intercity: 15 },
  { date: "2024-06-12", airport: 49, intercity: 42 },
  { date: "2024-06-13", airport: 8, intercity: 13 },
  { date: "2024-06-14", airport: 42, intercity: 38 },
  { date: "2024-06-15", airport: 30, intercity: 35 },
  { date: "2024-06-16", airport: 37, intercity: 31 },
  { date: "2024-06-17", airport: 47, intercity: 52 },
  { date: "2024-06-18", airport: 10, intercity: 17 },
  { date: "2024-06-19", airport: 34, intercity: 29 },
  { date: "2024-06-20", airport: 40, intercity: 45 },
  { date: "2024-06-21", airport: 16, intercity: 21 },
  { date: "2024-06-22", airport: 31, intercity: 27 },
  { date: "2024-06-23", airport: 48, intercity: 53 },
  { date: "2024-06-24", airport: 13, intercity: 18 },
  { date: "2024-06-25", airport: 14, intercity: 19 },
  { date: "2024-06-26", airport: 43, intercity: 38 },
  { date: "2024-06-27", airport: 44, intercity: 49 },
  { date: "2024-06-28", airport: 14, intercity: 20 },
  { date: "2024-06-29", airport: 10, intercity: 16 },
  { date: "2024-06-30", airport: 44, intercity: 40 },
]

const chartConfig = {
  bookings: {
    label: "Bookings",
  },
  airport: {
    label: "Airport Rides",
    color: "var(--primary)",
  },
  intercity: {
    label: "Intercity Rides",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Bookings</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Bookings for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-airport)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-airport)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-intercity)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-intercity)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="intercity"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-intercity)"
              stackId="a"
            />
            <Area
              dataKey="airport"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-airport)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

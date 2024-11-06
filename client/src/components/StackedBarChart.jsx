import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const defaultChartConfig = {
  remaining: {
    label: "Remaining",
    color: "hsl(var(--chart-1))",
  },
  sold: {
    label: "Sold",
    color: "hsl(var(--chart-2))",
  },
  warranty: {
    label: "Warranty",
    color: "hsl(var(--chart-3))",
  },
};

export function StackedBarChart({
  data,
  title = "Bar Chart - Stacked + Legend",
  description = "",
  chartConfig = defaultChartConfig,
  showFooter = false,
  footerTrendPercentage,
  footerText,
}) {
  // Error handling if data is not provided or is empty
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const CustomXAxis = ({
    dataKey = "name",
    tickLine = false,
    tickMargin = 10,
    axisLine = false,
    tickFormatter = (value = "") =>
      value.slice(0, 15) + (value.length > 15 ? "..." : ""),
  }) => {
    return (
      <XAxis
        dataKey={dataKey}
        tickLine={tickLine}
        tickMargin={tickMargin}
        axisLine={axisLine}
        tickFormatter={tickFormatter}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <CustomXAxis />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={chartConfig[key].color}
                radius={[
                  index === 0 ? 4 : 0,
                  index === 0 ? 4 : 0,
                  index === Object.keys(chartConfig).length - 1 ? 4 : 0,
                  index === Object.keys(chartConfig).length - 1 ? 4 : 0,
                ]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {footerTrendPercentage && (
            <div className="flex gap-2 font-medium leading-none">
              Trending up by {footerTrendPercentage}% this month{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {footerText && (
            <div className="leading-none text-muted-foreground">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

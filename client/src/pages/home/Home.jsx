import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format, parseISO } from "date-fns";
import StatCards from "./StatCards";
import { useToast } from "@/hooks/use-toast";
import {
  fetchClaimWarranties,
  fetchLedgerEntries,
  fetchPurchases,
  fetchSales,
} from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LineChart, PieChart } from "@/components/charts/Charts";

function Home() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const {
    data: sales,
    isLoading: saleIsLoading,
    error: saleError,
  } = useQuery({
    queryKey: ["sales", { from: dateRange.from, to: dateRange.to }],
    queryFn: fetchSales,
  });

  const {
    data: purchases,
    isLoading: purchaseIsLoading,
    error: purchaseError,
  } = useQuery({
    queryKey: ["purchases", { from: dateRange.from, to: dateRange.to }],
    queryFn: fetchPurchases,
  });

  // console.log(sales)
  const {
    data: ledgers,
    isLoading: ledgerIsLoading,
    error: ledgerError,
  } = useQuery({
    queryKey: ["ledgers", { from: dateRange.from, to: dateRange.to }],
    queryFn: fetchLedgerEntries,
  });

  const {
    data: claimWarranties,
    isLoading: warrantiesIsLoading,
    error: warrantiesError,
  } = useQuery({
    queryKey: ["claimWarranties", { from: dateRange.from, to: dateRange.to }],
    queryFn: fetchClaimWarranties,
  });

  useEffect(() => {
    if (saleError || purchaseError || ledgerError || warrantiesError) {
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [saleError, purchaseError, ledgerError, warrantiesError, toast]);

  const expenseBreakdown =
    purchases?.map((purchase) => ({
      product: purchase.purchaseItems[0].product?.name,
      value: purchase.totalAmount,
    })) || [];

  // const salesTrends =
  //   sales?.map((sale) => ({
  //     date: format(parseISO(sale.createdAt), "MM/dd/yyyy"),
  //     sales: sale.totalAmount,
  //   })) || [];

  const salesTrends = (sales || []).reduce((acc, sale) => {
    const date = format(parseISO(sale.createdAt), "MM/dd/yyyy");

    if (!acc[date]) {
      acc[date] = { date, sales: 0 };
    }

    acc[date].sales += sale.totalAmount;
    return acc;
  }, {});

  const salesTrendsArray = Object.values(salesTrends);

  // console.log(salesTrendsArray);

  if (
    saleIsLoading ||
    ledgerIsLoading ||
    purchaseIsLoading ||
    warrantiesIsLoading
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>
      <StatCards
        sales={sales}
        ledgers={ledgers}
        purchases={purchases}
        claimWarranties={claimWarranties}
        dateRange={dateRange}
      />
      <div className="space-y-4">
        <PieChart data={expenseBreakdown} title="Expense Breakdown" />
        <LineChart
          data={salesTrendsArray}
          title="Sales Trends"
          xAxisLabel="Date"
          yAxisLabel="Amount"
        />
      </div>
    </div>
  );
}

export default Home;

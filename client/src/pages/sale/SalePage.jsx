import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchSales } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { getColumns } from "./SaleColumns";
import { useToast } from "@/hooks/use-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import StatCard from "@/components/StatCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalePage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    data: sales,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch sales data. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleGlobalFilter = (event) => {
    setGlobalFilter(event.target.value);
  };

  const handleRowClick = (sale) => {
    navigate(`/sale/${sale.id}`);
  };

  const filteredData = useMemo(() => {
    if (!globalFilter || !sales) return sales;
    return sales.filter((sale) =>
      Object.values(sale).some((value) =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [sales, globalFilter]);

  const columns = getColumns();

  // Calculate stats
  const totalSales =
    sales?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const averageSale = sales?.length ? totalSales / sales.length : 0;
  const totalProducts =
    sales?.reduce(
      (sum, sale) =>
        sum +
        sale.saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    ) || 0;

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        Error fetching data
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Sales"
          value={`Rs ${totalSales.toLocaleString()}`}
          color="bg-green-100"
        />
        <StatCard
          title="Average Sale"
          value={`Rs ${averageSale.toLocaleString()}`}
          color="bg-yellow-100"
        />
        <StatCard
          title="Total Products Sold"
          value={`${totalProducts.toLocaleString()}`}
          color="bg-blue-100"
        />
      </div>
      {/* Sales Table */}
      <div className="bg-white rounded-md shadow-md p-4 md:p-6">
        <div className="flex justify-between px-2 mb-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={handleGlobalFilter}
            className="max-w-sm"
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredData || []}
          pagination
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default SalePage;

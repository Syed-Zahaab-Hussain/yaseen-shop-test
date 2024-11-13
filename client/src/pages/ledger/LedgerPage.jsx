import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchLedgerEntries } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { getColumns } from "./LedgerColumns";
import StatCard from "@/components/StatCard";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "@/components/charts/Charts";
import ErrorState from "@/components/ErrorState";
import AddLedgerDialog from "./AddLedgerDialog";

const LedgerPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: ledgerEntries,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ledgers"],
    queryFn: fetchLedgerEntries,
    retry: 2,
    refetchOnWindowFocus: false,
    // staleTime: 5 * 60 * 1000,
  });

  const processedData = useMemo(() => {
    if (!ledgerEntries) return [];

    const aggregatedData = ledgerEntries.reduce((acc, entry) => {
      const key = entry.entity.id;

      if (!acc[key]) {
        acc[key] = {
          id: entry.entity.id,
          name: entry.entity.name,
          type: entry.entity.type,
          totalAmount: 0,
          receivedAmount: 0,
          remainingAmount: 0,
          overpaidAmount: 0,
          lastTransactionDate: new Date(entry.createdAt),
          transactionCount: 0,
        };
      }

      acc[key].totalAmount += entry.totalAmount;
      acc[key].receivedAmount += entry.receivedAmount;
      acc[key].remainingAmount += entry.remainingAmount;
      acc[key].overpaidAmount += entry.overpaidAmount;
      acc[key].transactionCount += 1;

      if (new Date(entry.createdAt) > acc[key].lastTransactionDate) {
        acc[key].lastTransactionDate = new Date(entry.createdAt);
      }

      return acc;
    }, {});

    // console.log(aggregatedData);
    return Object.values(aggregatedData);
  }, [ledgerEntries]);

  const filteredDataByType = useMemo(() => {
    if (activeTab === "all") return processedData;
    return processedData.filter(
      (item) => item.type.toLowerCase() === activeTab.toLowerCase()
    );
  }, [processedData, activeTab]);

  const { totalDebt, totalPayments, totalOverpaid } = useMemo(() => {
    return filteredDataByType.reduce(
      (acc, entry) => ({
        totalDebt: acc.totalDebt + entry.remainingAmount,
        totalPayments: acc.totalPayments + entry.receivedAmount,
        totalOverpaid: acc.totalOverpaid + entry.overpaidAmount,
      }),
      { totalDebt: 0, totalPayments: 0, totalOverpaid: 0 }
    );
  }, [filteredDataByType]);

  const numberOfTransactions = filteredDataByType.reduce(
    (acc, item) => acc + item.transactionCount,
    0
  );

  const filteredData = useMemo(() => {
    if (!globalFilter) return filteredDataByType;
    const searchTerm = globalFilter.toLowerCase();
    return filteredDataByType.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        if (key === "lastTransactionDate") {
          return value.toLocaleDateString().toLowerCase().includes(searchTerm);
        }
        return String(value).toLowerCase().includes(searchTerm);
      })
    );
  }, [filteredDataByType, globalFilter]);

  const chartData = useMemo(() => {
    const labels = filteredDataByType
      .filter((entry) => entry.remainingAmount > 0)
      .map((entry) => entry.name);

    const data = filteredDataByType
      .filter((entry) => entry.remainingAmount > 0)
      .map((entry) => entry.remainingAmount);

    return {
      labels,
      datasets: [
        {
          label: "Outstanding Debt",
          data,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [filteredDataByType]);

  // console.log(chartData);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState error={error} refetch={refetch} />;

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="all">All Entities</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
          <TabsTrigger value="supplier">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Outstanding Debt"
              value={`Rs ${totalDebt.toLocaleString()}`}
              description="Amount yet to be collected"
              color="bg-red-100"
            />
            <StatCard
              title="Total Payments Received"
              value={`Rs ${totalPayments.toLocaleString()}`}
              description="Collected payments"
              color="bg-green-100"
            />
            <StatCard
              title="Total Overpaid Amount"
              value={`Rs ${totalOverpaid.toLocaleString()}`}
              description="Amount overpaid by entities"
              color="bg-yellow-100"
            />
            <StatCard
              title="Number of Transactions"
              value={numberOfTransactions.toString()}
              description="Total ledger transactions"
              color="bg-blue-100"
            />
          </div>

          {/* Table Section */}
          {/* Table Section */}
          <div className="p-6 bg-white rounded-md shadow-md">
            <div className="flex justify-between items-center px-2 mb-4 gap-4">
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Ledger Entry
              </Button>
            </div>
            <DataTable
              columns={getColumns()}
              data={filteredData}
              pagination
              onRowClick={(row) => navigate(`/ledger/${row.id}`)}
            />
          </div>

          {/* Charts Section */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <BarChart data={chartData} title="Outstanding Debt by Entity" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add the AddLedgerDialog component */}
      <AddLedgerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default LedgerPage;

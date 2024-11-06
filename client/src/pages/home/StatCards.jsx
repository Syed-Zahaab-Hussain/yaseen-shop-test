import { useEffect, useState } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import StatCard from "@/components/StatCard";

function StatCards({ sales, ledgers, claimWarranties, purchases, dateRange }) {
  const [statsData, setStatsData] = useState({
    periodExpenses: 0,
    numberOfDebts: 0,
    currentWarrantyClaims: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    if (sales && ledgers && claimWarranties && purchases) {
      // Calculate period expenses
      const filteredPurchases = purchases.filter((purchase) =>
        isWithinInterval(parseISO(purchase.createdAt), {
          start: dateRange.from,
          end: dateRange.to,
        })
      );

      const periodExpenses = filteredPurchases.reduce(
        (total, purchase) => total + purchase.totalAmount,
        0
      );

      // Calculate total expenses (all time)
      const totalExpenses = purchases.reduce(
        (total, purchase) => total + purchase.totalAmount,
        0
      );

      const debts = ledgers.filter((ledger) => ledger.remainingAmount > 0);

      const currentWarrantyClaims = claimWarranties.filter(
        (warranty) =>
          (warranty.status === "CUSTOMER_CLAIMED" ||
            warranty.status === "SUPPLIER_CLAIMED") &&
          !warranty.claimResolveDate
      ).length;

      setStatsData({
        periodExpenses,
        numberOfDebts: debts.length,
        currentWarrantyClaims,
        totalExpenses,
      });
    }
  }, [sales, ledgers, claimWarranties, purchases, dateRange]);

  // Calculate expense percentage trend
  const expensePercentage =
    statsData.totalExpenses > 0
      ? ((statsData.periodExpenses / statsData.totalExpenses) * 100).toFixed(2)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Period Expenses"
        value={`Rs ${statsData.periodExpenses.toLocaleString()}`}
        description={`${expensePercentage}% of total expenses`}
        color="bg-orange-100"
      />
      <StatCard
        title="Number of Debts"
        value={statsData.numberOfDebts.toString()}
        description="Outstanding debts"
        color="bg-red-100"
      />
      <StatCard
        title="Current Warranty Claims"
        value={statsData.currentWarrantyClaims}
        description="Active warranty claims"
        color="bg-yellow-100"
      />
      <StatCard
        title="Total Expenses"
        value={`Rs ${statsData.totalExpenses.toLocaleString()}`}
        description="Total expenses to date"
        color="bg-blue-100"
      />
    </div>
  );
}

export default StatCards;

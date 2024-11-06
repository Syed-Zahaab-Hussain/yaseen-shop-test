import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SupplierStats = ({ suppliers, error }) => {
  const { toast } = useToast();

  const statsData = useMemo(() => {
    if (!suppliers) return null;

    try {
      // Calculate total purchases value
      const totalPurchasesValue = suppliers.reduce((sum, supplier) => {
        const purchases = supplier.purchases || [];
        return (
          sum +
          purchases.reduce((pSum, purchase) => pSum + purchase.totalAmount, 0)
        );
      }, 0);

      // Calculate active suppliers
      const activeSuppliers = suppliers.filter(
        (supplier) => supplier.isActive
      ).length;

      // Calculate suppliers with pending payments
      const suppliersWithPendingPayments = suppliers.filter((supplier) => {
        const purchases = supplier.purchases || [];
        return purchases.some(
          (purchase) => purchase.totalAmount > purchase.paidAmount
        );
      }).length;

      // Calculate total outstanding amount
      const totalOutstandingAmount = suppliers.reduce((sum, supplier) => {
        const purchases = supplier.purchases || [];
        return (
          sum +
          purchases.reduce(
            (pSum, purchase) =>
              pSum + (purchase.totalAmount - purchase.paidAmount),
            0
          )
        );
      }, 0);

      return {
        totalSuppliers: suppliers.length,
        activeSuppliers,
        suppliersWithPendingPayments,
        totalPurchasesValue,
        totalOutstandingAmount,
      };
    } catch (err) {
      console.error("Error calculating supplier statistics:", err);
      return null;
    }
  }, [suppliers]);

  if (error) {
    return toast({
      variant: "destructive",
      title: "Error",
      description:
        "Failed to load supplier statistics. Please try again later.",
    });
  }

  if (!statsData) {
    return toast({
      title: "No supplier data available",
    });
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-blue-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalSuppliers}</div>
          <p className="text-xs text-gray-500 mt-1">
            {statsData.activeSuppliers} active suppliers
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalPurchasesValue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Lifetime purchase value</p>
        </CardContent>
      </Card>

      <Card className="bg-yellow-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsData.suppliersWithPendingPayments}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suppliers with outstanding payments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Outstanding Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalOutstandingAmount)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total pending payments</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierStats;

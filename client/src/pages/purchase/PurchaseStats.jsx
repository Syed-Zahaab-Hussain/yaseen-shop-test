import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PurchaseStats = ({ purchases, error }) => {
  const { toast } = useToast();

  const statsData = useMemo(() => {
    if (!purchases) return null;

    try {
      // Calculate various purchase statistics
      const totalAmount = purchases.reduce(
        (sum, purchase) => sum + purchase.totalAmount,
        0
      );
      const totalPaidAmount = purchases.reduce(
        (sum, purchase) => sum + purchase.paidAmount,
        0
      );
      const pendingPayments = totalAmount - totalPaidAmount;

      return {
        totalPurchases: purchases.length,
        totalAmount,
        pendingPayments,
        cashPurchases: purchases.filter((p) => p.paymentMethod === "CASH")
          .length,
        bankTransfers: purchases.filter(
          (p) => p.paymentMethod === "BANK_TRANSFER"
        ).length,
        digitalWalletTransfers: purchases.filter(
          (p) => p.paymentMethod === "DIGITAL_WALLET"
        ).length,
      };
    } catch (err) {
      console.error("Error calculating purchase statistics:", err);
      return null;
    }
  }, [purchases]);

  if (error) {
    return toast({
      variant: "destructive",
      title: "Error",
      description:
        "Failed to load purchase statistics. Please try again later.",
    });
  }

  if (!statsData) {
    return toast({
      title: "No purchase data available",
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-blue-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalPurchases}</div>
          <p className="text-xs text-gray-500 mt-1">All time purchase orders</p>
        </CardContent>
      </Card>

      <Card className="bg-green-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalAmount)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total purchase value</p>
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
            {formatCurrency(statsData.pendingPayments)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Outstanding supplier payments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-indigo-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cash Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.cashPurchases}</div>
          <p className="text-xs text-gray-500 mt-1">Paid in cash</p>
        </CardContent>
      </Card>

      <Card className="bg-sky-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.bankTransfers}</div>
          <p className="text-xs text-gray-500 mt-1">Paid via bank transfer</p>
        </CardContent>
      </Card>
      <Card className="bg-sky-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Digital Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsData.digitalWalletTransfers}
          </div>
          <p className="text-xs text-gray-500 mt-1">Paid via Easypaisa etc</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseStats;

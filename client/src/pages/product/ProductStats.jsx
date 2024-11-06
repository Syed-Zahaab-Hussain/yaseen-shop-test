import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ProductStats = ({ products, error }) => {
  const toast = useToast();

  const statsData = useMemo(() => {
    if (!products) return null;

    try {
    // Calculate total value from PurchaseItems
      const totalValue = products.reduce((sum, product) => {
        const purchaseItems = product.purchaseItems || [];
        return (
          sum +
          purchaseItems.reduce(
            (itemSum, item) =>
              itemSum +
              (item.initialQuantity - item.soldQuantity) * item.unitPrice,
            0
          )
        );
      }, 0);

      return {
        totalProducts: products.length,
        totalValue,
        lowStockItems: products.filter((product) => {
          const remainingStock =
            product.purchaseItems?.reduce(
              (total, item) =>
                total + (item.initialQuantity - item.soldQuantity),
              0
            ) || 0;
          return remainingStock > 0 && remainingStock < 10;
        }).length,
        outOfStockItems: products.filter((product) => {
          const remainingStock =
            product.purchaseItems?.reduce(
              (total, item) =>
                total + (item.initialQuantity - item.soldQuantity),
              0
            ) || 0;
          return remainingStock === 0;
        }).length,
      };
    } catch (err) {
      console.error("Error calculating product statistics:", err);
      return null;
    }
  }, [products]);

  if (error) {
    return toast({
      variant: "destructive",
      title: "Error",
      description: ` Failed to load product statistics. Please try again later.`,
    });
  }

  if (!statsData) {
    return toast({
      title: "No product data available",
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
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalProducts}</div>
          <p className="text-xs text-gray-500 mt-1">
            Active products in inventory
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalValue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Based on current stock and unit prices
          </p>
        </CardContent>
      </Card>

      <Card className="bg-yellow-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.lowStockItems}</div>
          <p className="text-xs text-gray-500 mt-1">
            Products with less than 10 units
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.outOfStockItems}</div>
          <p className="text-xs text-gray-500 mt-1">
            Products with zero inventory
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductStats;

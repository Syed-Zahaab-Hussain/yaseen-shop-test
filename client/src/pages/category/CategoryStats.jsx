import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CategoryStats = ({ categories, error }) => {
  const { toast } = useToast();

  const statsData = useMemo(() => {
    if (!categories) return null;

    try {
      // Calculate total products across all categories
      const totalProducts = categories.reduce(
        (sum, category) => sum + (category.products?.length || 0),
        0
      );

      // Calculate active categories
      const activeCategories = categories.filter(
        (category) => category.isActive
      ).length;

      // Calculate categories with products
      const categoriesWithProducts = categories.filter(
        (category) => (category.products?.length || 0) > 0
      ).length;

      // Calculate average products per category
      const avgProductsPerCategory =
        totalProducts / Math.max(categories.length, 1);

      // Calculate total inventory value by category
      const totalInventoryValue = categories.reduce((sum, category) => {
        const categoryValue =
          category.products?.reduce((pSum, product) => {
            const productValue =
              product.purchaseItems?.reduce(
                (itemSum, item) =>
                  itemSum +
                  (item.initialQuantity - item.soldQuantity) * item.unitPrice,
                0
              ) || 0;
            return pSum + productValue;
          }, 0) || 0;
        return sum + categoryValue;
      }, 0);

      return {
        totalCategories: categories.length,
        activeCategories,
        categoriesWithProducts,
        totalProducts,
        avgProductsPerCategory,
        totalInventoryValue,
      };
    } catch (err) {
      console.error("Error calculating category statistics:", err);
      return null;
    }
  }, [categories]);

  if (error) {
    return toast({
      variant: "destructive",
      title: "Error",
      description:
        "Failed to load category statistics. Please try again later.",
    });
  }

  if (!statsData) {
    return toast({
      title: "No category data available",
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
          <CardTitle className="text-sm font-medium">
            Total Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalCategories}</div>
          <p className="text-xs text-gray-500 mt-1">
            {statsData.activeCategories} active categories
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.totalProducts}</div>
          <p className="text-xs text-gray-500 mt-1">
            {statsData.avgProductsPerCategory.toFixed(1)} avg products per
            category
          </p>
        </CardContent>
      </Card>

      <Card className="bg-yellow-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Categories with Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statsData.categoriesWithProducts}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {categories.length - statsData.categoriesWithProducts} empty
            categories
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-100 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Inventory Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(statsData.totalInventoryValue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Value across all categories
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryStats;

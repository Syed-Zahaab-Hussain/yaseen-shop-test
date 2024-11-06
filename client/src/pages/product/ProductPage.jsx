import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, updateProduct, deleteProduct } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import EditProductDialog from "./EditProductDialog";
import AddProductDialog from "./AddProductDialog";
import { Input } from "@/components/ui/input";
import { getColumns } from "./ProductColumns";
import ProductStats from "./ProductStats";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const ProductPage = () => {
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Query and Mutations
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateProduct(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update product: ${error.message}`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
      });
    },
  });

  // Memoized Handlers
  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
  }, []);

  const handleSaveEdit = useCallback(
    async (updatedProduct) => {
      try {
        await updateMutation.mutateAsync(updatedProduct);
        setEditingProduct(null);
      } catch (error) {
        console.error("Failed to update product:", error);
      }
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    },
    [deleteMutation]
  );

  const handleGlobalFilter = useCallback((event) => {
    setGlobalFilter(event.target.value);
  }, []);

  // Memoized Values
  const filteredData = useMemo(() => {
    if (!globalFilter) return products;
    const lowercasedFilter = globalFilter.toLowerCase();
    return products.filter((product) =>
      Object.values(product).some((value) =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [products, globalFilter]);

  const columns = useMemo(
    () => getColumns({ handleEdit, handleDelete }),
    [handleEdit, handleDelete]
  );

  // Loading and Error States
  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to load products: ${error.message}`,
    });
    return (
      <div className="p-6">
        <ProductStats products={[]} error={error} />
        <div className="text-center text-red-600 mt-4">
          Failed to load products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ProductStats products={products} />

      <div className="bg-white rounded-md shadow-md">
        <div className="flex justify-between p-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={handleGlobalFilter}
            className="max-w-sm"
            aria-label="Search products"
          />
          <AddProductDialog />
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          initialState={{
            pagination: {
              pageSize: 10,
            },
          }}
        />
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ProductPage;

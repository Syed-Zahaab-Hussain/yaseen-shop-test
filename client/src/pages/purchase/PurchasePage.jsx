import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchPurchases, addPurchase } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import AddPurchaseDialog from "./AddPurchaseDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getColumns } from "./PurchaseColumns";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PurchaseStats from "./PurchaseStats";

const PurchasePage = () => {
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: purchases,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["purchases", {}], // Passing an empty object for consistency
    queryFn: fetchPurchases,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });

  const addMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "Success",
        description: "Purchase added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add purchase. Please try again later.  Error: ${error.message}  `,
      });
    },
  });

  const handleAddPurchase = async (newPurchase) => {
    try {
      await addMutation.mutateAsync(newPurchase);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add purchase:", error);
    }
  };

  const handleGlobalFilter = (event) => {
    setGlobalFilter(event.target.value);
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleRowClick = (purchase) => {
    navigate(`/purchase/${purchase.id}`);
  };

  const filteredData = useMemo(() => {
    if (!globalFilter || !purchases) return purchases;
    return purchases.filter((purchase) =>
      Object.values(purchase).some((value) =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [purchases, globalFilter]);

  const columns = getColumns();

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to load products: ${error.message}`,
    });
    return (
      <div className="p-6">
        <PurchaseStats purchases={[]} error={error} />
        <div className="text-center text-red-600 mt-4">
          Failed to load products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PurchaseStats purchases={purchases} />

      <div className="p-4 bg-white rounded-md shadow-md">
        <div className="flex justify-between px-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={handleGlobalFilter}
            className="max-w-sm mb-4"
          />
          <Button onClick={openAddDialog} className="mb-4">
            Add Purchase
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={filteredData || []}
          pagination
          onRowClick={handleRowClick}
        />

        <AddPurchaseDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleAddPurchase}
        />
      </div>
    </div>
  );
};

export default PurchasePage;

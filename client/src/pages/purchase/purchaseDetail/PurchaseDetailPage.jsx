import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePurchase,
  deletePurchaseItem,
  fetchPurchaseById,
  fetchSuppliers,
  addPurchaseItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, AlertTriangle, Barcode } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "./PurchaseDetailColumns";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import PurchaseInformation from "./PurchaseInformation";
import AddPurchaseItemDialog from "./AddPurchaseItemDialog";
import EditPurchaseItemDialog from "./EditPurchaseItemDialog";
import WarrantyClaimDialog from "@/components/WarrantyClaimDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StackedBarChart } from "@/components/charts/Charts";
import { generateBulkBarcodes } from "@/lib/generateBulkBarcodes";

const PurchaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [warrantyClaimItem, setWarrantyClaimItem] = useState(false);

  const {
    data: purchase,
    isLoading: isPurchaseLoading,
    isError: isPurchaseError,
    error: purchaseError,
  } = useQuery({
    queryKey: ["purchase", id],
    queryFn: () => fetchPurchaseById(id),
  });

  const {
    data: suppliers,
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchase", id]);
      toast({
        title: "Purchase deleted",
        description: "The purchase has been successfully deleted.",
      });
      navigate("/purchases");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete purchase: ${error.message}`,
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => deletePurchaseItem(itemId),
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["purchase", id]);

      // Snapshot the previous value
      const previousPurchase = queryClient.getQueryData(["purchase", id]);

      // Optimistically update the purchase
      queryClient.setQueryData(["purchase", id], (old) => ({
        ...old,
        purchaseItems: old.purchaseItems.filter((item) => item.id !== itemId),
      }));

      return { previousPurchase };
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: "The purchase item has been successfully deleted.",
      });
    },
    onError: (error, itemId, context) => {
      queryClient.setQueryData(["purchase", id], context.previousPurchase);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["purchase", id]);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: (item) => addPurchaseItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchase", id]);
      setIsAddingItem(false);
      toast({
        title: "Item added",
        description: "New item has been successfully added to the purchase.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add item: ${error.message}`,
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(purchase.id);
  };

  const handleItemDelete = (itemId) => {
    deleteItemMutation.mutate(itemId);
  };

  const handleItemAdd = (newItem) => {
    addItemMutation.mutate(newItem);
  };

  if (isPurchaseLoading || isSuppliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isPurchaseError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Purchase</AlertTitle>
          <AlertDescription>
            {purchaseError?.message ||
              "Failed to fetch purchase data. Please try again later."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isSuppliersError) {
    toast({
      variant: "destructive",
      title: "Error",
      description:
        "Failed to load suppliers data. Some features might be limited.",
    });
  }

  // console.log(purchase.purchaseItems[0].warranty.claims);
  const chartData = {
    labels: purchase.purchaseItems.map((item) => item.product.name),
    datasets: [
      {
        label: "Available Stock",
        data: purchase.purchaseItems.map(
          (item) => item.initialQuantity - item.soldQuantity
        ),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
        stack: "Stack 0",
      },
      {
        label: "Sold Items",
        data: purchase.purchaseItems.map((item) => item.soldQuantity),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        stack: "Stack 0",
      },
      {
        label: "Warranty Claims",
        data: purchase.purchaseItems.map((item) =>
          item.warranty?.claims.reduce(
            (sum, claim) =>
              claim.claimStatus === "PENDING" ? sum + claim.claimQuantity : sum,
            0
          )
        ),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
        stack: "Stack 0",
      },
    ],
  };

  console.log(chartData);

  const columns = getColumns({
    onEdit: setEditingItem,
    onDelete: handleItemDelete,
    onWarrantyClaim: setWarrantyClaimItem,
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="group flex items-center space-x-2 hover:bg-secondary mb-4"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span>Back to List</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
            <CardDescription>
              Created on {format(new Date(purchase.createdAt), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseInformation purchase={purchase} suppliers={suppliers} />
          </CardContent>
        </Card>
        {/* 
        <Card>
          <CardHeader>
            <CardTitle>Items Overview</CardTitle>
            <CardDescription>
              Showing distribution of items across categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <StackedBarChart data={chartData} />
          </CardContent>
        </Card> */}
        <StackedBarChart chartData={chartData} title="Product Stock Analysis" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Purchase Items</CardTitle>
            <CardDescription>
              Manage and track all items in this purchase
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                generateBulkBarcodes(purchase.purchaseItems).catch((error) => {
                  toast({
                    variant: "destructive",
                    title: "Failed to generate barcodes",
                    description: error.message,
                  });
                });
              }}
            >
              <Barcode className="h-4 w-4 mr-2" /> Generate All Barcodes
            </Button>
            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={purchase.purchaseItems || []} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <ConfirmationAlert
          buttonText="Delete Purchase"
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete the purchase and all associated data."
          action={handleDelete}
        />
      </div>

      {editingItem && (
        <EditPurchaseItemDialog
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          purchaseItem={editingItem}
        />
      )}

      <AddPurchaseItemDialog
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onSave={handleItemAdd}
        purchaseId={id}
      />
      {warrantyClaimItem && (
        <WarrantyClaimDialog
          item={warrantyClaimItem}
          type="SUPPLIER"
          isOpen={!!warrantyClaimItem}
          onClose={() => setWarrantyClaimItem(null)}
        />
      )}
    </div>
  );
};

export default PurchaseDetailPage;

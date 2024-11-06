import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSale,
  deleteSaleItem,
  fetchSaleById,
  fetchSuppliers,
  updateSaleItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SaleInformation from "./SaleInformation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "./SaleDetailColumns";
import EditSaleItemDialog from "./EditSaleItemDialog";
import ConfirmationAlert from "@/components/ConfirmationAlert";
// import WarrantyClaimDialog from "./WarrantyClaimDialog";
import WarrantyClaimDialog from "@/components/WarrantyClaimDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PieChart } from "@/components/charts/Charts";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <LoadingSpinner />
  </div>
);

const ErrorDisplay = ({ message }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const SaleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState(null);
  const [warrantyClaimItem, setWarrantyClaimItem] = useState(null);

  const {
    data: sale,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sale", id],
    queryFn: () => fetchSaleById(id),
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", id]);
      navigate("/sales");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => deleteSaleItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", id]);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (item) => updateSaleItem(item.id, item),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", id]);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay message={error?.message || "Error fetching sale data"} />
      </div>
    );
  }

  // Payment Overview Data
  const paymentData = [
    { name: "Total Amount", value: sale.totalAmount },
    { name: "Received Amount", value: sale.receivedAmount },
    { name: "Discount", value: sale.discount },
  ];

  // Product Breakdown Data
  // console.log(sale.saleItems[0]);
  const productBreakdownData = sale.saleItems.map((item) => ({
    product: item.product.name,
    value: item.totalPrice,
  }));

  const columns = getColumns({
    openReceipt: () => navigate(`/receipt/${sale.id}`),
    onEdit: setEditingItem,
    onDelete: deleteItemMutation.mutate,
    onWarrantyClaim: setWarrantyClaimItem,
  });

  return (
    <div className="container mx-auto px-4 max-w-full py-4">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="group flex items-center space-x-2 hover:bg-secondary mb-4"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span>Back to List</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleInformation sale={sale} suppliers={suppliers} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <PieChart data={productBreakdownData} title="Payment Overview" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sold Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sale.saleItems || []} />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <ConfirmationAlert
          buttonText="Delete Sale"
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete the sale and all associated data."
          action={() => deleteMutation.mutate(sale.id)}
        />
      </div>

      {editingItem && (
        <EditSaleItemDialog
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateItemMutation.mutate}
          saleItem={editingItem}
        />
      )}
      {/* {console.log(warrantyClaimItem)} */}
      {warrantyClaimItem && (
        <WarrantyClaimDialog
          item={warrantyClaimItem}
          type="CUSTOMER"
          isOpen={!!warrantyClaimItem}
          onClose={() => setWarrantyClaimItem(null)}
        />
      )}
    </div>
  );
};

export default SaleDetailPage;

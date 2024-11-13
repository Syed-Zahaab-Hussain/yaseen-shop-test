import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, updatePurchaseItem } from "@/lib/api";
import FilteredDropdown from "@/components/FilteredDropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const EditPurchaseItemDialog = ({ isOpen, onClose, purchaseItem }) => {
  const { toast } = useToast();
  const [editedItem, setEditedItem] = useState(purchaseItem);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add retry configuration for better network reliability
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  //   mutationFn: async (data) => {
  //     setIsSubmitting(true);
  //     try {
  //       const response = await updatePurchaseItem(data.id, data);
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.error || "Failed to update purchase item");
  //       }
  //       return response.json();
  //     } catch (error) {
  //       throw new Error(error.message || "Network error occurred");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   },
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries(["purchaseItems"]);
  //     console.log(data)
  //     toast({
  //       title: "Success",
  //       description: data.message || "Purchase item updated successfully",
  //     });
  //     onClose();
  //   },
  //   onError: (error) => {
  //     console.log(error)
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: `Failed to update purchase item: ${error.message}`,
  //     });
  //     // Log error for debugging
  //     console.error("Update error:", error);
  //   },
  // });

  const editMutation = useMutation({
    mutationFn: async (data) => {
      setIsSubmitting(true);
      try {
        const result = await updatePurchaseItem(data.id, data);
        return result;
      } catch (error) {
        throw new Error(error.message || "Network error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["purchaseItems"]);
      toast({
        title: "Success",
        description: "Purchase item updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update purchase item: ${error.message}`,
      });
      console.error("Update error:", error);
    },
  });

  useEffect(() => {
    if (purchaseItem) {
      setEditedItem({
        ...purchaseItem,
        warranty: purchaseItem.warranty || {
          retailerWarrantyDuration: 0,
          customerWarrantyDuration: 0,
        },
      });
      setErrors({});
    }
  }, [purchaseItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Handle numeric inputs
    if (
      [
        "initialQuantity",
        "unitPrice",
        "salePrice",
        "retailerWarrantyDuration",
        "customerWarrantyDuration",
      ].includes(name)
    ) {
      parsedValue = value === "" ? "" : parseFloat(value);
      if (isNaN(parsedValue)) return;
    }

    if (name.includes("Warranty")) {
      setEditedItem((prev) => ({
        ...prev,
        warranty: {
          ...prev.warranty,
          [name]: parsedValue,
        },
      }));
    } else {
      setEditedItem((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    }

    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProductChange = (product) => {
    if (!product) return;
    setEditedItem((prev) => ({ ...prev, productId: product.id }));
    setErrors((prev) => ({ ...prev, productId: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editedItem.productId) newErrors.productId = "Product is required";
    if (!editedItem.initialQuantity || editedItem.initialQuantity <= 0)
      newErrors.initialQuantity = "Initial quantity must be greater than 0";
    if (!editedItem.unitPrice || editedItem.unitPrice <= 0)
      newErrors.unitPrice = "Unit price must be greater than 0";
    if (!editedItem.salePrice || editedItem.salePrice <= 0)
      newErrors.salePrice = "Sale price must be greater than 0";
    if (editedItem.warranty.retailerWarrantyDuration < 0)
      newErrors.retailerWarrantyDuration =
        "Retailer warranty duration must be 0 or greater";
    if (editedItem.warranty.customerWarrantyDuration < 0)
      newErrors.customerWarrantyDuration =
        "Customer warranty duration must be 0 or greater";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Ensure all numeric fields are properly formatted
    const formattedItem = {
      ...editedItem,
      initialQuantity: parseInt(editedItem.initialQuantity),
      unitPrice: parseFloat(editedItem.unitPrice),
      salePrice: parseFloat(editedItem.salePrice),
      warranty: {
        ...editedItem.warranty,
        retailerWarrantyDuration: parseFloat(
          editedItem.warranty.retailerWarrantyDuration
        ),
        customerWarrantyDuration: parseFloat(
          editedItem.warranty.customerWarrantyDuration
        ),
      },
    };

    editMutation.mutate(formattedItem);
  };

  if (productsError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              Error Loading Products
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              {productsError.message}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => refetchProducts()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            Edit Purchase Item
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Form fields remain the same but with improved error handling */}
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="product" className="text-right">
                Product <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <FilteredDropdown
                  items={products}
                  value={
                    products.find((p) => p.id === editedItem.productId) || null
                  }
                  onChange={handleProductChange}
                  displayField="name"
                  idField="id"
                  placeholder="Select product"
                  isLoading={isProductsLoading}
                  error={errors.productId}
                />
                {errors.productId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.productId}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="initialQuantity" className="text-right">
                Initial Quantity
              </Label>
              <div className="col-span-3">
                <Input
                  id="initialQuantity"
                  name="initialQuantity"
                  type="number"
                  min="0"
                  value={editedItem.initialQuantity}
                  onChange={handleInputChange}
                />
                {errors.initialQuantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.initialQuantity}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="unitPrice" className="text-right">
                Unit Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedItem.unitPrice}
                  onChange={handleInputChange}
                />
                {errors.unitPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.unitPrice}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="salePrice" className="text-right">
                Sale Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="salePrice"
                  name="salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedItem.salePrice}
                  onChange={handleInputChange}
                />
                {errors.salePrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.salePrice}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="retailerWarrantyDuration" className="text-right">
                Retailer Warranty (months)
              </Label>
              <div className="col-span-3">
                <Input
                  id="retailerWarrantyDuration"
                  name="retailerWarrantyDuration"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editedItem.warranty?.retailerWarrantyDuration}
                  onChange={handleInputChange}
                />
                {errors.retailerWarrantyDuration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.retailerWarrantyDuration}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="customerWarrantyDuration" className="text-right">
                Customer Warranty (months)
              </Label>
              <div className="col-span-3">
                <Input
                  id="customerWarrantyDuration"
                  name="customerWarrantyDuration"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editedItem.warranty?.customerWarrantyDuration}
                  onChange={handleInputChange}
                />
                {errors.customerWarrantyDuration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerWarrantyDuration}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-6">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSave}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPurchaseItemDialog;

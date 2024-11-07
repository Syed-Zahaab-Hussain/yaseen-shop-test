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
import { fetchProducts, addPurchaseItem } from "@/lib/api";
import { Loader2 } from "lucide-react";
import FilteredDropdown from "@/components/FilteredDropdown";

const AddPurchaseItemDialog = ({ isOpen, onClose, purchaseId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialState = {
    purchaseId,
    productId: "",
    quantity: "",
    unitPrice: "",
    salePrice: "",
    retailerWarrantyDuration: "",
    customerWarrantyDuration: "",
  };

  const [newItem, setNewItem] = useState(initialState);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 2,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const addItemMutation = useMutation({
    mutationFn: (data) => addPurchaseItem(data),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["purchaseItems", purchaseId]);
      toast({
        title: "Success",
        description: "Purchase item added successfully",
        duration: 3000,
      });
      onClose();
      setNewItem(initialState);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add purchase item",
        duration: 5000,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (isOpen) {
      setNewItem(initialState);
      setErrors({});
      setSelectedProduct(null);
    }
  }, [isOpen, purchaseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProductChange = (product) => {
    setSelectedProduct(product);
    setNewItem((prev) => ({
      ...prev,
      productId: product?.id?.toString() || "",
    }));
    setErrors((prev) => ({ ...prev, productId: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newItem.productId) newErrors.productId = "Product is required";
    if (!newItem.quantity || newItem.quantity <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!newItem.unitPrice || newItem.unitPrice <= 0)
      newErrors.unitPrice = "Valid unit price is required";
    if (!newItem.salePrice || newItem.salePrice <= 0)
      newErrors.salePrice = "Valid sale price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      addItemMutation.mutate(newItem);
    }
  };

  const renderErrorState = () => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error Loading Products</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-red-500 mb-4">
            {productsError?.message || "Failed to load products"}
          </p>
          <Button onClick={() => refetchProducts()} variant="secondary">
            Try Again
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isProductsError) {
    return renderErrorState();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Purchase Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div className="col-span-3">
              <FilteredDropdown
                items={products}
                value={selectedProduct}
                onChange={handleProductChange}
                placeholder="Select a product"
                disabled={isSubmitting}
                loading={isLoadingProducts}
                error={!!errors.productId}
              />
              {errors.productId && (
                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
              )}
            </div>
          </div>

          {/* Other form fields */}
          {[
            "quantity",
            "unitPrice",
            "salePrice",
            "retailerWarrantyDuration",
            "customerWarrantyDuration",
          ].map((field) => (
            <div key={field} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field} className="text-right">
                {field.charAt(0).toUpperCase() +
                  field.slice(1).replace(/([A-Z])/g, " $1")}
              </Label>
              <div className="col-span-3">
                <Input
                  id={field}
                  name={field}
                  type="number"
                  value={newItem[field]}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={errors[field] ? "border-red-500" : ""}
                />
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isSubmitting || isLoadingProducts}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPurchaseItemDialog;

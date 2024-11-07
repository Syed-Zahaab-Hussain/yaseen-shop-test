import { useState, useEffect, useMemo } from "react";
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
import FilteredDropdown from "@/components/FilteredDropdown";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, fetchSuppliers, addPurchase } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { format, formatISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Digital Wallet", value: "DIGITAL_WALLET" },
];

const AddPurchaseDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialPurchase = {
    supplierId: "",
    supplier: null,
    createdAt: format(new Date(), "yyyy-MM-dd"), // Change 'date' to 'createdAt'
    totalAmount: "",
    paymentMethod: "CASH",
    paidAmount: "",
    purchaseItems: [],
    proofOfPurchase: "",
  };

  const [purchase, setPurchase] = useState(initialPurchase);
  const [errors, setErrors] = useState({});

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return purchase.purchaseItems.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }, [purchase.purchaseItems]);

  useEffect(() => {
    setPurchase((prev) => ({
      ...prev,
      totalAmount: totalAmount,
      paidAmount: totalAmount,
    }));
  }, [totalAmount]);

  // Add Purchase Mutation
  const addMutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({ title: "Purchase added successfully!" });
      onClose();
      setPurchase(initialPurchase);
      setErrors({});
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding purchase",
        description: error.message,
      });
    },
  });

  const handleAddItem = () => {
    setPurchase((prev) => ({
      ...prev,
      purchaseItems: [
        ...prev.purchaseItems,
        {
          productId: "",
          product: null,
          quantity: "",
          unitPrice: "",
          salePrice: "",
          retailerWarrantyDuration: "",
          customerWarrantyDuration: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setPurchase((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
    }));
    // Clear errors for removed item
    const newErrors = { ...errors };
    delete newErrors[`purchaseItems.${index}`];
    setErrors(newErrors);
  };

  const handleItemChange = (index, field, value) => {
    setPurchase((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    // Clear error for the changed field
    setErrors((prev) => ({
      ...prev,
      [`purchaseItems.${index}.${field}`]: undefined,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!purchase.supplier) {
      newErrors.supplier = "Supplier is required";
    }
    if (!purchase.createdAt) {
      newErrors.createdAt = "Date is required";
    }
    if (purchase.purchaseItems.length === 0) {
      newErrors.purchaseItems = "At least one item is required";
    }

    purchase.purchaseItems.forEach((item, index) => {
      const itemErrors = {};
      if (!item.product) itemErrors.product = "Product is required";
      if (!item.quantity || Number(item.quantity) <= 0)
        itemErrors.quantity = "Valid quantity is required";
      if (!item.unitPrice || Number(item.unitPrice) <= 0)
        itemErrors.unitPrice = "Valid unit price is required";
      if (Object.keys(itemErrors).length > 0) {
        newErrors[`purchaseItems.${index}`] = itemErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductSelect = (index, selectedProduct) => {
    handleItemChange(index, "product", selectedProduct);
    handleItemChange(index, "productId", selectedProduct.id);
  };

  const handleSupplierSelect = (selectedSupplier) => {
    setPurchase((prev) => ({
      ...prev,
      supplier: selectedSupplier,
      supplierId: selectedSupplier.id,
    }));
    setErrors((prev) => ({ ...prev, supplier: undefined }));
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors",
      });
      return;
    }

    const formattedPurchase = {
      ...purchase,
      date: formatISO(new Date(purchase.createdAt)),
      supplierId: parseInt(purchase.supplierId),
      totalAmount: parseFloat(purchase.totalAmount),
      paidAmount: parseFloat(purchase.paidAmount),
      purchaseItems: purchase.purchaseItems.map((item) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        salePrice: parseFloat(item.salePrice || 0),
        retailerWarrantyDuration: parseFloat(
          item.retailerWarrantyDuration || 0
        ),
        customerWarrantyDuration: parseFloat(
          item.customerWarrantyDuration || 0
        ),
      })),
    };

    addMutation.mutate(formattedPurchase);
  };

  if (isLoadingProducts || isLoadingSuppliers) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Purchase</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Supplier Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <div className="col-span-3">
              <FilteredDropdown
                items={suppliers}
                value={purchase.supplier}
                onChange={handleSupplierSelect}
                displayField="name"
                placeholder="Select supplier"
                error={!!errors.supplier}
              />
              {errors.supplier && (
                <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>
              )}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <Input
              type="date"
              value={purchase.createdAt}
              onChange={(e) => {
                setPurchase((prev) => ({ ...prev, createdAt: e.target.value }));
                setErrors((prev) => ({ ...prev, createdAt: undefined }));
              }}
              className={`col-span-3 ${
                errors.createdAt ? "border-red-500" : ""
              }`}
            />
            {errors.createdAt && (
              <p className="text-sm text-red-500 col-start-2 col-span-3">
                {errors.createdAt}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Payment Method</Label>
            <Select
              value={purchase.paymentMethod}
              onValueChange={(value) =>
                setPurchase((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purchase Items */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Purchase Items</h3>
            {errors.purchaseItems &&
              typeof errors.purchaseItems === "string" && (
                <p className="text-sm text-red-500 mb-2">
                  {errors.purchaseItems}
                </p>
              )}

            {purchase.purchaseItems.map((item, index) => (
              <div
                key={index}
                className="grid gap-4 mb-4 p-4 border rounded-lg"
              >
                <div>
                  <FilteredDropdown
                    items={products}
                    value={item.product}
                    onChange={(product) => handleProductSelect(index, product)}
                    displayField="name"
                    placeholder="Select product"
                    error={!!errors[`purchaseItems.${index}`]?.product}
                  />
                  {errors[`purchaseItems.${index}`]?.product && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`purchaseItems.${index}`].product}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className={
                        errors[`purchaseItems.${index}`]?.quantity
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`purchaseItems.${index}`]?.quantity && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`purchaseItems.${index}`].quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="number"
                      placeholder="Cost price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                      className={
                        errors[`purchaseItems.${index}`]?.unitPrice
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`purchaseItems.${index}`]?.unitPrice && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`purchaseItems.${index}`].unitPrice}
                      </p>
                    )}
                  </div>

                  <Input
                    type="number"
                    placeholder="Sale Price"
                    value={item.salePrice}
                    onChange={(e) =>
                      handleItemChange(index, "salePrice", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Retailer Warranty (years)"
                    value={item.retailerWarrantyDuration}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "retailerWarrantyDuration",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Customer Warranty (years)"
                    value={item.customerWarrantyDuration}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "customerWarrantyDuration",
                        e.target.value
                      )
                    }
                  />
                </div>

                <Button
                  variant="destructive"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Item
                </Button>
              </div>
            ))}

            <Button onClick={handleAddItem} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {/* Total and Paid Amount */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total Amount</Label>
            <Input
              type="number"
              value={purchase.totalAmount}
              readOnly
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Paid Amount</Label>
            <Input
              type="number"
              value={purchase.paidAmount}
              onChange={(e) =>
                setPurchase((prev) => ({ ...prev, paidAmount: e.target.value }))
              }
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPurchaseDialog;

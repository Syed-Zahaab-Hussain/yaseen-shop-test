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
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchSuppliers } from "@/lib/api";
import FilteredDropdown from "@/components/FilteredDropdown";
import { Plus, Trash2 } from "lucide-react";
import { format, formatISO } from "date-fns";

const initialPurchase = {
  supplierId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  totalAmount: "0.00",
  paymentMethod: "CASH",
  paidAmount: "0.00",
  purchaseItems: [],
  proofOfPurchase: "",
};

const AddPurchaseDialog = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [newPurchase, setNewPurchase] = useState(initialPurchase);
  const [errors, setErrors] = useState({});

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const calculateTotal = useMemo(() => {
    return newPurchase.purchaseItems.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }, [newPurchase.purchaseItems]);

  useEffect(() => {
    setNewPurchase((prev) => ({
      ...prev,
      totalAmount: calculateTotal.toFixed(2),
      paidAmount: calculateTotal.toFixed(2),
    }));
  }, [calculateTotal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPurchase((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSupplierChange = (supplier) => {
    setNewPurchase((prev) => ({ ...prev, supplierId: supplier.id }));
    setErrors((prev) => ({ ...prev, supplierId: "" }));
  };

  const handleAddItem = () => {
    setNewPurchase((prev) => ({
      ...prev,
      purchaseItems: [
        ...prev.purchaseItems,
        {
          productId: "",
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
    setNewPurchase((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setNewPurchase((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    setErrors((prev) => ({ ...prev, [`purchaseItems.${index}.${field}`]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newPurchase.supplierId) newErrors.supplierId = "Supplier is required";
    if (!newPurchase.date) newErrors.date = "Date is required";
    // if (Number(newPurchase.paidAmount) > Number(newPurchase.totalAmount)) {
    //   newErrors.paidAmount = "Paid amount cannot exceed total amount";
    // }
    if (newPurchase.purchaseItems.length === 0) {
      newErrors.purchaseItems = "At least one item is required";
    }
    newPurchase.purchaseItems.forEach((item, index) => {
      if (!item.productId)
        newErrors[`purchaseItems.${index}.productId`] = "Product is required";
      if (!item.quantity || Number(item.quantity) <= 0)
        newErrors[`purchaseItems.${index}.quantity`] =
          "Valid quantity is required";
      if (!item.unitPrice || Number(item.unitPrice) <= 0)
        newErrors[`purchaseItems.${index}.unitPrice`] =
          "Valid unit price is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form",
      });
      return;
    }

    const formattedPurchase = {
      ...newPurchase,
      date: formatISO(new Date(newPurchase.date)),
      supplierId: parseInt(newPurchase.supplierId),
      totalAmount: parseFloat(newPurchase.totalAmount),
      paidAmount: parseFloat(newPurchase.paidAmount),
      purchaseItems: newPurchase.purchaseItems.map((item) => ({
        ...item,
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        salePrice: parseFloat(item.salePrice),
        retailerWarrantyDuration: parseFloat(item.retailerWarrantyDuration),
        customerWarrantyDuration: parseFloat(item.customerWarrantyDuration),
      })),
    };

    onSave(formattedPurchase);
    onClose();
  };

  const renderField = (label, name, type = "text", options = null) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={name} className="text-right">
        {label}
      </Label>
      {options ? (
        <select
          id={name}
          name={name}
          value={newPurchase[name]}
          onChange={handleInputChange}
          className={`col-span-3 ${errors[name] ? "border-red-500" : ""}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={newPurchase[name]}
          onChange={handleInputChange}
          className={`col-span-3 ${errors[name] ? "border-red-500" : ""}`}
          readOnly={name === "totalAmount"}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-sm col-start-2 col-span-3">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const renderPurchaseItem = (item, index) => (
    <div key={index} className="grid grid-cols-12 gap-2 mb-4">
      <div className="col-span-12 mb-2">
        <FilteredDropdown
          items={products}
          value={products.find((p) => p.id === item.productId) || null}
          onChange={(product) =>
            handleItemChange(index, "productId", product.id)
          }
          displayField="name"
          idField="id"
          placeholder="Select product"
          className={
            errors[`purchaseItems.${index}.productId`] ? "border-red-500" : ""
          }
        />
        {errors[`purchaseItems.${index}.productId`] && (
          <p className="text-red-500 text-sm">
            {errors[`purchaseItems.${index}.productId`]}
          </p>
        )}
      </div>
      <div className="col-span-12 grid grid-cols-3 gap-2">
        {["quantity", "unitPrice", "salePrice"].map((field) => (
          <div key={field}>
            <Input
              type="number"
              value={item[field]}
              onChange={(e) => handleItemChange(index, field, e.target.value)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className={
                errors[`purchaseItems.${index}.${field}`]
                  ? "border-red-500"
                  : ""
              }
            />
            {errors[`purchaseItems.${index}.${field}`] && (
              <p className="text-red-500 text-sm">
                {errors[`purchaseItems.${index}.${field}`]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="col-span-12 grid grid-cols-2 gap-2">
        {["retailerWarrantyDuration", "customerWarrantyDuration"].map(
          (field) => (
            <Input
              key={field}
              type="number"
              value={item[field]}
              onChange={(e) => handleItemChange(index, field, e.target.value)}
              placeholder={field.replace(/([A-Z])/g, " $1").trim()}
            />
          )
        )}
      </div>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => handleRemoveItem(index)}
        className="col-span-12 mt-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <div className="col-span-3">
              <FilteredDropdown
                items={suppliers}
                value={
                  suppliers.find((s) => s.id === newPurchase.supplierId) || null
                }
                onChange={handleSupplierChange}
                displayField="name"
                idField="id"
                placeholder="Select supplier"
                className={errors.supplierId ? "border-red-500" : ""}
              />
              {errors.supplierId && (
                <p className="text-red-500 text-sm">{errors.supplierId}</p>
              )}
            </div>
          </div>
          {renderField("Date", "date", "date")}
          {renderField("Total Amount", "totalAmount", "number")}
          {renderField("Payment Method", "paymentMethod", "select", [
            { value: "CASH", label: "Cash" },
            { value: "CREDIT_CARD", label: "Credit Card" },
            { value: "BANK_TRANSFER", label: "Bank Transfer" },
            { value: "DIGITAL_WALLET", label: "Digital Wallet" },
          ])}
          {renderField("Paid Amount", "paidAmount", "number")}
          {renderField("Proof of Purchase", "proofOfPurchase")}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Purchase Items</h3>
            {newPurchase.purchaseItems.map(renderPurchaseItem)}
            <Button onClick={handleAddItem} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
            {errors.purchaseItems && (
              <p className="text-red-500 text-sm mt-2">
                {errors.purchaseItems}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Add Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPurchaseDialog;

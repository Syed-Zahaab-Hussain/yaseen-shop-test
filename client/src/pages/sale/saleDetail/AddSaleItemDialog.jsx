import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import FilteredDropdown from "@/components/FilteredDropdown";

const commonConditions = [
  "Covers manufacturing defects",
  "Does not cover physical damage",
  "Covers accidental damage",
];

const commonCoverage = ["Repairs", "Replacements", "Refunds"];

const AddSaleItemDialog = ({ isOpen, onClose, onSave, saleId }) => {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({
    saleId,
    productId: "",
    initialQuantity: "",
    currentQuantity: "",
    unitPrice: "",
    salePrice: "",
    barcode: "",
    warrantyTerm: {
      retailerWarrantyDuration: "",
      customerWarrantyDuration: "",
      conditions: [],
      coverage: [],
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (product) => {
    setNewItem((prev) => ({ ...prev, productId: product.id }));
  };

  const handleWarrantyChange = (field, value, checked) => {
    setNewItem((prev) => ({
      ...prev,
      warrantyTerm: {
        ...prev.warrantyTerm,
        [field]: checked
          ? [...prev.warrantyTerm[field], value]
          : prev.warrantyTerm[field].filter((v) => v !== value),
      },
    }));
  };

  const handleCustomWarrantyAdd = (field, value) => {
    if (value.trim()) {
      setNewItem((prev) => ({
        ...prev,
        warrantyTerm: {
          ...prev.warrantyTerm,
          [field]: [...prev.warrantyTerm[field], value.trim()],
        },
      }));
    }
  };

  const validateForm = () => {
    return (
      newItem.productId &&
      newItem.initialQuantity > 0 &&
      newItem.currentQuantity > 0 &&
      newItem.unitPrice > 0
    );
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "Please fill all the required fields",
      });
      return;
    }
    onSave(newItem);
    onClose();
  };

  const renderField = (label, name, type = "text") => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={name} className="text-right">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={newItem[name]}
        onChange={handleInputChange}
        className="col-span-3"
      />
    </div>
  );

  const renderWarrantySection = (field, label) => (
    <div className="col-span-12 mt-2">
      <Label>{label}</Label>
      {(field === "conditions" ? commonConditions : commonCoverage).map(
        (value) => (
          <div key={value} className="flex items-center">
            <Checkbox
              id={`${field}-${value}`}
              checked={newItem.warrantyTerm[field].includes(value)}
              onCheckedChange={(checked) =>
                handleWarrantyChange(field, value, checked)
              }
            />
            <Label htmlFor={`${field}-${value}`} className="ml-2">
              {value}
            </Label>
          </div>
        )
      )}
      <div className="flex items-center mt-2">
        <Input
          placeholder={`Add custom ${field}`}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleCustomWarrantyAdd(field, e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Sale Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div className="col-span-3">
              <FilteredDropdown
                items={products}
                value={products.find((p) => p.id === newItem.productId) || null}
                onChange={handleProductChange}
                displayField="name"
                idField="id"
                placeholder="Select product"
              />
            </div>
          </div>
          {renderField("Initial Quantity", "initialQuantity", "number")}
          {renderField("Current Quantity", "currentQuantity", "number")}
          {renderField("Unit Price", "unitPrice", "number")}
          {renderField("Sale Price", "salePrice", "number")}
          {renderField("Barcode", "barcode")}
          {renderField(
            "Retailer Warranty (years)",
            "retailerWarrantyDuration",
            "number"
          )}
          {renderField(
            "Customer Warranty (years)",
            "customerWarrantyDuration",
            "number"
          )}
          {renderWarrantySection("conditions", "Warranty Conditions")}
          {renderWarrantySection("coverage", "Warranty Coverage")}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleItemDialog;

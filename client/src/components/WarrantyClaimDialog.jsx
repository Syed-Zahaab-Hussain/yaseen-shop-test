import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimWarranty } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WarrantyClaimDialog = ({
  item,
  isOpen,
  onClose,
  type = "SUPPLIER", // SUPPLIER or CUSTOMER
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [warrantyForm, setWarrantyForm] = useState({
    claimDate: null,
    claimQuantity: "",
    claimDetails: "",
    claimType: type,
    status: type === "SUPPLIER" ? "SUPPLIER_CLAIMED" : "CUSTOMER_CLAIMED",
  });

  const queryClient = useQueryClient();

  console.log(item);
  // Get relevant dates and quantities based on item type
  const itemDate = new Date(item?.createdAt || item?.purchaseDate);
  const maxQuantity =
    type === "SUPPLIER"
      ? item?.initialQuantity - item?.soldQuantity || 0 // For purchase items: remaining unsold quantity
      : item?.quantity || 0; // For sale items: sold quantity
  const itemName = item?.product?.name || item?.productName || "this item";
  const itemId = item?.warranty?.id;

  useEffect(() => {
    if (isOpen) {
      setWarrantyForm({
        claimDate: null,
        claimQuantity: "",
        claimDetails: "",
        claimType: type,
        status: type === "SUPPLIER" ? "SUPPLIER_CLAIMED" : "CUSTOMER_CLAIMED",
      });
      setFormErrors({});
    }
  }, [isOpen, type]);

  const claimWarrantyMutation = useMutation({
    mutationFn: (data) => {
      if (!itemId) {
        throw new Error("Item ID is required");
      }
      return claimWarranty(itemId, data);
    },
    onSuccess: () => {
      // Invalidate both possible query types
      queryClient.invalidateQueries(["purchase", itemId]);
      queryClient.invalidateQueries(["sale", itemId]);
      onClose();
      toast({
        title: "Success",
        description: "Your warranty claim has been successfully submitted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit warranty claim: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const errors = {};

    // Validate claim date
    if (!warrantyForm.claimDate) {
      errors.claimDate = "Claim date is required";
    } else if (warrantyForm.claimDate < itemDate) {
      errors.claimDate = `Claim date cannot be before the ${
        type === "SUPPLIER" ? "purchase" : "sale"
      } date`;
    }

    // Validate claim quantity
    if (!warrantyForm.claimQuantity) {
      errors.claimQuantity = "Claim quantity is required";
    } else {
      const quantity = parseInt(warrantyForm.claimQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.claimQuantity = "Claim quantity must be greater than 0";
      } else if (quantity > maxQuantity) {
        errors.claimQuantity = `Claim quantity cannot exceed ${
          type === "SUPPLIER" ? "purchase" : "sale"
        } quantity (${maxQuantity})`;
      }
    }

    // Validate claim details
    if (!warrantyForm.claimDetails.trim()) {
      errors.claimDetails = "Claim details are required";
    } else if (warrantyForm.claimDetails.length < 10) {
      errors.claimDetails =
        "Please provide more detailed description (minimum 10 characters)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWarrantyFormChange = (field, value) => {
    setWarrantyForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClaimWarranty = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    if (!itemId) {
      toast({
        title: "Error",
        description: "Invalid item data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    claimWarrantyMutation.mutate(warrantyForm);
  };

  // Early return if no item data
  if (!item || !itemId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim Warranty</DialogTitle>
          <DialogDescription>
            Enter warranty claim details for {itemName}
          </DialogDescription>
        </DialogHeader>

        {claimWarrantyMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {claimWarrantyMutation.error?.message ||
                "An error occurred while submitting your claim"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="claimDate">
              Claim Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !warrantyForm.claimDate && "text-muted-foreground",
                    formErrors.claimDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {warrantyForm.claimDate ? (
                    format(warrantyForm.claimDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={warrantyForm.claimDate}
                  onSelect={(date) =>
                    handleWarrantyFormChange("claimDate", date)
                  }
                  disabled={(date) => date < itemDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formErrors.claimDate && (
              <span className="text-sm text-red-500">
                {formErrors.claimDate}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="claimQuantity">
              Claim Quantity <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">
                (Max: {maxQuantity})
              </span>
            </Label>
            <Input
              id="claimQuantity"
              type="number"
              value={warrantyForm.claimQuantity}
              onChange={(e) =>
                handleWarrantyFormChange("claimQuantity", e.target.value)
              }
              min="1"
              max={maxQuantity}
              placeholder="Enter quantity"
              className={cn(formErrors.claimQuantity && "border-red-500")}
              disabled={claimWarrantyMutation.isLoading}
            />
            {formErrors.claimQuantity && (
              <span className="text-sm text-red-500">
                {formErrors.claimQuantity}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="claimDetails">
              Claim Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="claimDetails"
              value={warrantyForm.claimDetails}
              onChange={(e) =>
                handleWarrantyFormChange("claimDetails", e.target.value)
              }
              placeholder="Describe the issue in detail..."
              rows={4}
              className={cn(formErrors.claimDetails && "border-red-500")}
              disabled={claimWarrantyMutation.isLoading}
            />
            {formErrors.claimDetails && (
              <span className="text-sm text-red-500">
                {formErrors.claimDetails}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={claimWarrantyMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClaimWarranty}
            disabled={claimWarrantyMutation.isLoading}
          >
            {claimWarrantyMutation.isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {claimWarrantyMutation.isLoading
              ? "Submitting..."
              : "Claim Warranty"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WarrantyClaimDialog;

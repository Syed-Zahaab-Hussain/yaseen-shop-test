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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateWarrantyClaim } from "@/lib/api";
import { Loader2 } from "lucide-react";

const EditWarrantyDialog = ({ warranty, isOpen, onClose }) => {
  const [editedClaim, setEditedClaim] = useState({
    claimDate: null,
    claimQuantity: 0,
    claimDetails: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateClaimMutation = useMutation({
    mutationFn: (data) => updateWarrantyClaim(warranty.currentClaim.id, data),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["warranty", warranty.id]);
      toast({
        title: "Success",
        description: "Claim details updated successfully.",
        duration: 3000,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update claim details",
        duration: 5000,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    // console.log(warranty);
    if (warranty?.currentClaim) {
      setEditedClaim({
        claimDate: warranty.currentClaim.claimDate
          ? new Date(warranty.currentClaim.claimDate)
              .toISOString()
              .split("T")[0]
          : null,
        claimQuantity: warranty.currentClaim.claimQuantity || 0,
        claimDetails: warranty.currentClaim.claimDetails || "",
      });
    }
    setErrors({});
  }, [warranty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedClaim((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const purchaseDate = new Date(warranty.purchaseItem.createdAt);
    const claimDate = new Date(editedClaim.claimDate);

    // Date validation
    if (!editedClaim.claimDate) {
      newErrors.claimDate = "Claim date is required";
    } else if (!isValidDate(editedClaim.claimDate)) {
      newErrors.claimDate = "Invalid date format";
    } else if (claimDate < purchaseDate) {
      newErrors.claimDate = "Claim date cannot be before purchase date";
    }

    // Quantity validation
    const maxQuantity = warranty.purchaseItem.initialQuantity;
    if (!editedClaim.claimQuantity) {
      newErrors.claimQuantity = "Claim quantity is required";
    } else if (
      isNaN(editedClaim.claimQuantity) ||
      editedClaim.claimQuantity <= 0
    ) {
      newErrors.claimQuantity = "Quantity must be a positive number";
    } else if (editedClaim.claimQuantity > maxQuantity) {
      newErrors.claimQuantity = `Quantity cannot exceed ${maxQuantity}`;
    }

    // Details validation
    if (!editedClaim.claimDetails.trim()) {
      newErrors.claimDetails = "Claim details are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString) => {
    return !isNaN(Date.parse(dateString));
  };

  const handleSave = () => {
    if (validateForm()) {
      const updatedClaim = {
        ...warranty.currentClaim,
        ...editedClaim,
      };
      updateClaimMutation.mutate(updatedClaim);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please correct the errors before saving.",
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Claim</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimDate" className="text-right">
              Claim Date
            </Label>
            <Input
              id="claimDate"
              name="claimDate"
              type="date"
              value={editedClaim.claimDate ?? ""}
              onChange={handleInputChange}
              className="col-span-3"
              disabled={isSubmitting}
            />
            {errors.claimDate && (
              <p className="text-red-500 col-span-4 text-right">
                {errors.claimDate}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimQuantity" className="text-right">
              Claim Quantity
            </Label>
            <Input
              id="claimQuantity"
              name="claimQuantity"
              type="number"
              value={editedClaim.claimQuantity}
              onChange={handleInputChange}
              className="col-span-3"
              disabled={isSubmitting}
            />
            {errors.claimQuantity && (
              <p className="text-red-500 col-span-4 text-right">
                {errors.claimQuantity}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimDetails" className="text-right">
              Claim Details
            </Label>
            <Textarea
              id="claimDetails"
              name="claimDetails"
              value={editedClaim.claimDetails ?? ""}
              onChange={handleInputChange}
              className="col-span-3"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.claimDetails && (
              <p className="text-red-500 col-span-4 text-right">
                {errors.claimDetails}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditWarrantyDialog;

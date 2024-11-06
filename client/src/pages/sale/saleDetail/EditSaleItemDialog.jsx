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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSaleItem } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const EditSaleItemDialog = ({ isOpen, onClose, saleItem }) => {
  const { toast } = useToast();
  const [editedItem, setEditedItem] = useState(saleItem);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationFn: (data) => updateSaleItem(data.id, data),
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      queryClient.invalidateQueries(["saleItems"]);
      toast({
        title: "Success",
        description: "Sale item updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update sale item: ${error.message}`,
      });
    },
    onSettled: () => setIsLoading(false),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: value,
    });
  };

  const validateForm = () => {
    let errors = {};
    if (!editedItem.quantity) {
      errors.quantity = "Quantity is required";
    } else if (editedItem.quantity <= 0) {
      errors.quantity = "Quantity must be greater than zero";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      editMutation.mutate(editedItem);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            Edit Sale Item
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-4 items-center gap-4 mb-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <div className="col-span-3">
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={editedItem.quantity}
                onChange={handleInputChange}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={handleSave}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleItemDialog;

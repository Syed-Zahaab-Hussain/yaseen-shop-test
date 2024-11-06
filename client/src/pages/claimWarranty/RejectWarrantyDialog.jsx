// RejectWarrantyDialog.jsx
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectWarrantyClaim } from "@/lib/api";

const RejectWarrantyDialog = ({ claim, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [rejectData, setRejectData] = useState({
    claimRejectDate: "",
    claimRejectDetail: "",
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (claim) {
      setRejectData({
        claimRejectDate: claim.claimRejectDate
          ? new Date(claim.claimRejectDate).toISOString().split("T")[0]
          : "",
        claimRejectDetail: claim.claimRejectDetail || "",
      });
    }
    setErrors({});
  }, [claim]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRejectData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!rejectData.claimRejectDate) {
      newErrors.claimRejectDate = "Claim Reject Date is required";
    }
    if (
      !rejectData.claimRejectDetail ||
      rejectData.claimRejectDetail.trim() === ""
    ) {
      newErrors.claimRejectDetail = "Rejection details are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const rejectMutation = useMutation({
    mutationFn: (data) => rejectWarrantyClaim(claim.currentClaim.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claimWarranties"] });
      toast({
        title: "Success",
        description: "Warranty claim rejected successfully.",
        duration: 3000,
      });
      onClose();
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject warranty claim.",
        duration: 5000,
      });
    },
  });

  const handleSave = async () => {
    if (validateForm()) {
      await rejectMutation.mutateAsync(rejectData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Warranty Claim</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimRejectDate" className="text-right">
              Rejection Date
            </Label>
            <Input
              id="claimRejectDate"
              name="claimRejectDate"
              type="date"
              value={rejectData.claimRejectDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
            {errors.claimRejectDate && (
              <p className="text-red-500 col-span-4 text-right">
                {errors.claimRejectDate}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="claimRejectDetail" className="text-right mt-2">
              Rejection Details
            </Label>
            <div className="col-span-3">
              <Textarea
                id="claimRejectDetail"
                name="claimRejectDetail"
                value={rejectData.claimRejectDetail}
                onChange={handleInputChange}
                className="min-h-[100px]"
                placeholder="Enter rejection details..."
              />
              {errors.claimRejectDetail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.claimRejectDetail}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={rejectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSave}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectWarrantyDialog;

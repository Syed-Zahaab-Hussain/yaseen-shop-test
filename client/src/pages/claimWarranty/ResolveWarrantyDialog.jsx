// ResolveWarrantyDialog.jsx
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
import { resolveWarrantyClaim } from "@/lib/api";

const ResolveWarrantyDialog = ({ claim, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [resolveData, setResolveData] = useState({
    claimResolveDate: "",
    claimResolveDetail: "",
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (claim) {
      setResolveData({
        claimResolveDate: claim.claimResolveDate
          ? new Date(claim.claimResolveDate).toISOString().split("T")[0]
          : "",
        claimResolveDetail: claim.claimResolveDetail || "",
      });
    }
    setErrors({});
  }, [claim]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResolveData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!resolveData.claimResolveDate) {
      newErrors.claimResolveDate = "Claim Resolve Date is required";
    }
    if (
      !resolveData.claimResolveDetail ||
      resolveData.claimResolveDetail.trim() === ""
    ) {
      newErrors.claimResolveDetail = "Resolution details are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resolveMutation = useMutation({
    mutationFn: (data) => resolveWarrantyClaim(claim.currentClaim.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claimWarranties"] });
      toast({
        title: "Success",
        description: "Warranty claim resolved successfully.",
        duration: 3000,
      });
      onClose();
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resolve warranty claim.",
        duration: 5000,
      });
    },
  });

  const handleSave = async () => {
    if (validateForm()) {
      // console.log(resolveData);
      await resolveMutation.mutateAsync(resolveData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Warranty Claim</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="claimResolveDate" className="text-right">
              Resolution Date
            </Label>
            <Input
              id="claimResolveDate"
              name="claimResolveDate"
              type="date"
              value={resolveData.claimResolveDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
            {errors.claimResolveDate && (
              <p className="text-red-500 col-span-4 text-right">
                {errors.claimResolveDate}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="claimResolveDetail" className="text-right mt-2">
              Resolution Details
            </Label>
            <div className="col-span-3">
              <Textarea
                id="claimResolveDetail"
                name="claimResolveDetail"
                value={resolveData.claimResolveDetail}
                onChange={handleInputChange}
                className="min-h-[100px]"
                placeholder="Enter resolution details..."
              />
              {errors.claimResolveDetail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.claimResolveDetail}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={resolveMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={resolveMutation.isPending}>
            {resolveMutation.isPending ? "Saving..." : "Resolve Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolveWarrantyDialog;

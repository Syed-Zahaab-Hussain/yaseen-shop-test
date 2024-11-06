import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSuppliers, updatePurchase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import FilteredDropdown from "@/components/FilteredDropdown";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const PurchaseInformation = ({ purchase }) => {
  const [editedPurchase, setEditedPurchase] = useState(purchase);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });
  // console.log(purchase);

  useEffect(() => {
    setEditedPurchase(purchase);
  }, [purchase]);

  const updateMutation = useMutation({
    mutationFn: (data) => updatePurchase(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["purchase", purchase.id]);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Purchase information updated successfully.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: `Failed to update purchase: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(editedPurchase);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPurchase((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSupplierChange = (supplier) => {
    setEditedPurchase((prev) => ({ ...prev, supplier }));
  };

  const handleDateChange = (createdAt) => {
    setEditedPurchase((prev) => ({
      ...prev,
      createdAt: createdAt ? createdAt.toISOString() : null, // Sets 'date'
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setEditedPurchase((prev) => ({ ...prev, paymentMethod: value }));
  };

  const remainingAmount = purchase?.paidAmount - purchase?.totalAmount;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Purchase Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Supplier</Label>
            <p>{purchase.supplier.name}</p>
          </div>
          <div>
            <Label className="font-semibold">Date</Label>
            <p>{format(new Date(purchase?.createdAt), "dd MMMM yyyy")}</p>
          </div>
          <div>
            <Label className="font-semibold">Total Amount</Label>
            <p>Rs {purchase?.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Paid Amount</Label>
            <p>Rs {purchase?.paidAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Remaining Amount</Label>
            {remainingAmount < 0 ? (
              <p className="text-red-500">{remainingAmount.toLocaleString()}</p>
            ) : (
              <p className="text-green-500">
                {remainingAmount.toLocaleString()}
              </p>
            )}
            {/* <p>Rs {remainingAmount > 0.toLocaleString()}</p> */}
          </div>
          <div>
            <Label className="font-semibold">Payment Method</Label>
            <p>{purchase?.paymentMethod}</p>
          </div>
          <div>
            <Label className="font-semibold">Payment Status</Label>
            {purchase?.paidAmount >= purchase?.totalAmount ? (
              <p className="text-green-500">Complete</p>
            ) : (
              <p className="text-red-500">Partial</p>
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">Update Purchase</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Purchase</DialogTitle>
              <DialogDescription>
                Make changes to the purchase information here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Supplier
                </Label>
                <div className="col-span-3">
                  <FilteredDropdown
                    items={suppliers || []}
                    value={editedPurchase.supplier}
                    onChange={handleSupplierChange}
                    displayField="name"
                    idField="id"
                    placeholder="Select Supplier"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`col-span-3 justify-start text-left font-normal ${
                        !editedPurchase.createdAt && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedPurchase.createdAt ? (
                        format(new Date(editedPurchase.createdAt), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editedPurchase.createdAt
                          ? new Date(editedPurchase.createdAt)
                          : undefined
                      }
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalAmount" className="text-right">
                  Total Amount
                </Label>
                <div className="col-span-3 font-semibold">
                  Rs {editedPurchase.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paidAmount" className="text-right">
                  Paid Amount
                </Label>
                <Input
                  id="paidAmount"
                  name="paidAmount"
                  type="number"
                  value={editedPurchase.paidAmount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Payment Method</Label>
                <Select
                  value={editedPurchase.paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Method</SelectLabel>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="DIGITAL_WALLET">
                        Digital Wallet
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PurchaseInformation;

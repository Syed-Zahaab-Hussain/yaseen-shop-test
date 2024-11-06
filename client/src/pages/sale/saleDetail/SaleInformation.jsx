import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, updateSale } from "@/lib/api";
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

const SaleInformation = ({ sale }) => {
  const [editedSale, setEditedSale] = useState(sale);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  useEffect(() => {
    setEditedSale(sale);
  }, [sale]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateSale(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", sale.id]);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Sale information updated successfully.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: `Failed to update sale: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(editedSale);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSale((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCustomerChange = (customer) => {
    setEditedSale((prev) => ({ ...prev, customer }));
  };

  const handleDateChange = (createdAt) => {
    setEditedSale((prev) => ({
      ...prev,
      createdAt: createdAt ? createdAt.toISOString() : null,
    }));
  };

  const handlePaymentMethodChange = (value) => {
    setEditedSale((prev) => ({ ...prev, paymentMethod: value }));
  };

  const discountedTotal = useMemo(() => {
    return editedSale.totalAmount - editedSale.discount;
  }, [editedSale.totalAmount, editedSale.discount]);

  const change = useMemo(() => {
    return Math.max(0, editedSale.receivedAmount - discountedTotal);
  }, [editedSale.receivedAmount, discountedTotal]);

  const debt = useMemo(() => {
    return Math.max(0, discountedTotal - editedSale.receivedAmount);
  }, [discountedTotal, editedSale.receivedAmount]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sale Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Customer</Label>
            <p>{sale?.customer.name}</p>
          </div>
          <div>
            <Label className="font-semibold">Date</Label>
            <p>{format(new Date(sale?.createdAt), "dd MMMM yyyy")}</p>
          </div>
          <div>
            <Label className="font-semibold">Total Amount</Label>
            <p>Rs {sale?.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Received Amount</Label>
            <p>Rs {sale?.receivedAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Discount Amount</Label>
            <p>Rs {sale?.discount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Payment Method</Label>
            <p>{sale?.paymentMethod}</p>
          </div>
          <div>
            <Label className="font-semibold">Customer Type</Label>
            <p>{sale?.customer.type}</p>
          </div>

          <div>
            <Label className="font-semibold">Payment Status</Label>
            {sale?.receivedAmount >= sale?.totalAmount ? (
              <p className="text-green-500">Complete</p>
            ) : (
              <p className="text-red-500">Partial</p>
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">Update Sale</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Sale</DialogTitle>
              <DialogDescription>
                Make changes to the sale information here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Customer
                </Label>
                <div className="col-span-3">
                  <FilteredDropdown
                    items={customers || []}
                    value={editedSale.customer}
                    onChange={handleCustomerChange}
                    displayField="name"
                    idField="id"
                    placeholder="Select Customer"
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
                        !editedSale.createdAt && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedSale.createdAt ? (
                        format(new Date(editedSale.createdAt), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editedSale.createdAt
                          ? new Date(editedSale.createdAt)
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
                  Rs {editedSale.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">
                  Discount Amount
                </Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  value={editedSale.discount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Discounted Total</Label>
                <div className="col-span-3 font-semibold">
                  Rs {discountedTotal.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="receivedAmount" className="text-right">
                  Received Amount
                </Label>
                <Input
                  id="receivedAmount"
                  name="receivedAmount"
                  type="number"
                  value={editedSale.receivedAmount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              {change > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Change</Label>
                  <div className="col-span-3 font-semibold text-green-600">
                    Rs {change.toLocaleString()}
                  </div>
                </div>
              )}
              {debt > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Debt</Label>
                  <div className="col-span-3 font-semibold text-red-600">
                    Rs {debt.toLocaleString()}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Payment Method</Label>
                <Select
                  value={editedSale.paymentMethod}
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

export default SaleInformation;

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEntity } from "@/lib/api";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const LedgerInformation = ({ entity }) => {
  const [editedEntity, setEditedEntity] = useState(entity);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditedEntity(entity);
  }, [entity]);

  // console.log(entity);
  const updateMutation = useMutation({
    mutationFn: (data) => updateEntity(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["entity", entity.id]);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Entity information updated successfully.",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: `Failed to update entity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(editedEntity);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEntity((prev) => ({ ...prev, [name]: value }));
  };

  const totalAmount = entity.ledger.reduce(
    (sum, entry) => sum + entry.totalAmount,
    0
  );
  const receivedAmount = entity.ledger.reduce(
    (sum, entry) => sum + entry.receivedAmount,
    0
  );

  const remainingAmount = entity.ledger.reduce(
    (sum, entry) => sum + entry.remainingAmount,
    0
  );
  const overpaidAmount = entity.ledger.reduce(
    (sum, entry) => sum + entry.overpaidAmount,
    0
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Entity Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Name</Label>
            <p>{entity.name}</p>
          </div>
          <div>
            <Label className="font-semibold">Type</Label>
            <p>{entity.type}</p>
          </div>
          <div>
            <Label className="font-semibold">Customer Type</Label>
            <p>{entity.customerType}</p>
          </div>
          <div>
            <Label className="font-semibold">Contact</Label>
            <p>{entity.contact || "-"}</p>
          </div>
          <div>
            <Label className="font-semibold">Email</Label>
            <p>{entity.email || "-"}</p>
          </div>

          <div>
            <Label className="font-semibold">Last Updated</Label>
            <p>{format(new Date(entity.updatedAt), "dd MMMM yyyy")}</p>
          </div>

          <div>
            <Label className="font-semibold">Total Amount</Label>
            <p>Rs {totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Received Amount</Label>
            <p>Rs {receivedAmount.toLocaleString()}</p>
          </div>
          <div>
            <Label className="font-semibold">Over Paid Amount</Label>
            <p className="text-green-500">
              Rs {overpaidAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <Label className="font-semibold">Remaining Amount</Label>
            <p className="text-red-500">
              Rs {remainingAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">Update Entity Information</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Entity Information</DialogTitle>
              <DialogDescription>
                Make changes to the entity information here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editedEntity.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contact"
                  name="contact"
                  value={editedEntity.contact}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={editedEntity.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={editedEntity.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
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

export default LedgerInformation;

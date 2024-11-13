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
import FilteredDropdown from "@/components/FilteredDropdown";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLedgerEntries, addLedgerEntry } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { format, formatISO } from "date-fns";


const AddLedgerDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialLedger = {
    entityId: "",
    entity: null,
    createdAt: format(new Date(), "yyyy-MM-dd"),
    ledgerEntries: [
      {
        description: "",
        totalAmount: "",
        receivedAmount: "",
      },
    ],
  };

  const [ledger, setLedger] = useState(initialLedger);
  const [errors, setErrors] = useState({});

  const { data: entities = [], isLoading: isLoadingEntities } = useQuery({
    queryKey: ["entities"],
    queryFn: fetchLedgerEntries,
  });

  // Calculate totals
  const totalAmount = ledger.ledgerEntries.reduce(
    (sum, entry) => sum + (Number(entry.totalAmount) || 0),
    0
  );

  const totalReceivedAmount = ledger.ledgerEntries.reduce(
    (sum, entry) => sum + (Number(entry.receivedAmount) || 0),
    0
  );

  const remainingAmount = totalAmount - totalReceivedAmount;

  // Add Ledger Mutation
  const addMutation = useMutation({
    mutationFn: addLedgerEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      toast({ title: "Ledger entry added successfully!" });
      onClose();
      setLedger(initialLedger);
      setErrors({});
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding ledger entry",
        description: error.message,
      });
    },
  });

  const handleAddEntry = () => {
    setLedger((prev) => ({
      ...prev,
      ledgerEntries: [
        ...prev.ledgerEntries,
        {
          description: "",
          totalAmount: "",
          receivedAmount: "",
        },
      ],
    }));
  };

  const handleRemoveEntry = (index) => {
    setLedger((prev) => ({
      ...prev,
      ledgerEntries: prev.ledgerEntries.filter((_, i) => i !== index),
    }));
    const newErrors = { ...errors };
    delete newErrors[`ledgerEntries.${index}`];
    setErrors(newErrors);
  };

  const handleEntryChange = (index, field, value) => {
    setLedger((prev) => ({
      ...prev,
      ledgerEntries: prev.ledgerEntries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
    setErrors((prev) => ({
      ...prev,
      [`ledgerEntries.${index}.${field}`]: undefined,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ledger.entity) {
      newErrors.entity = "Entity is required";
    }
    if (!ledger.createdAt) {
      newErrors.createdAt = "Date is required";
    }

    ledger.ledgerEntries.forEach((entry, index) => {
      const entryErrors = {};
      if (!entry.description)
        entryErrors.description = "Description is required";
      if (!entry.totalAmount || Number(entry.totalAmount) <= 0)
        entryErrors.totalAmount = "Valid total amount is required";
      if (
        !entry.receivedAmount ||
        Number(entry.receivedAmount) < 0 ||
        Number(entry.receivedAmount) > Number(entry.totalAmount)
      )
        entryErrors.receivedAmount = "Valid received amount is required";

      if (Object.keys(entryErrors).length > 0) {
        newErrors[`ledgerEntries.${index}`] = entryErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEntitySelect = (selectedEntity) => {
    setLedger((prev) => ({
      ...prev,
      entity: selectedEntity,
      entityId: selectedEntity.id,
    }));
    setErrors((prev) => ({ ...prev, entity: undefined }));
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors",
      });
      return;
    }

    const formattedLedger = {
      entityId: parseInt(ledger.entityId),
      date: formatISO(new Date(ledger.createdAt)),
      ledgerEntries: ledger.ledgerEntries.map((entry) => ({
        description: entry.description,
        totalAmount: parseFloat(entry.totalAmount),
        receivedAmount: parseFloat(entry.receivedAmount),
        remainingAmount:
          parseFloat(entry.totalAmount) - parseFloat(entry.receivedAmount),
      })),
    };

    addMutation.mutate(formattedLedger);
  };

  if (isLoadingEntities) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Ledger Entry</DialogTitle>
        </DialogHeader>
{console.log(ledger)}
        <div className="grid gap-4 py-4">
          {/* Entity Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="entity" className="text-right">
              Entity
            </Label>
            <div className="col-span-3">
              <FilteredDropdown
                items={entities}
                value={ledger?.entity?.name}
                onChange={handleEntitySelect}
                displayField="name"
                placeholder="Select entity"
                error={!!errors.entity}
              />
              {errors.entity && (
                <p className="text-sm text-red-500 mt-1">{errors.entity}</p>
              )}
            </div>
          </div>

          {/* Date Field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <Input
              type="date"
              value={ledger.createdAt}
              onChange={(e) => {
                setLedger((prev) => ({ ...prev, createdAt: e.target.value }));
                setErrors((prev) => ({ ...prev, createdAt: undefined }));
              }}
              className={`col-span-3 ${
                errors.createdAt ? "border-red-500" : ""
              }`}
            />
            {errors.createdAt && (
              <p className="text-sm text-red-500 col-start-2 col-span-3">
                {errors.createdAt}
              </p>
            )}
          </div>

          {/* Ledger Entries */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Ledger Entries</h3>

            {ledger.ledgerEntries.map((entry, index) => (
              <div
                key={index}
                className="grid gap-4 mb-4 p-4 border rounded-lg"
              >
                <div>
                  <Label>Description</Label>
                  <Input
                    value={entry.description}
                    onChange={(e) =>
                      handleEntryChange(index, "description", e.target.value)
                    }
                    placeholder="Enter description"
                    className={
                      errors[`ledgerEntries.${index}`]?.description
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors[`ledgerEntries.${index}`]?.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`ledgerEntries.${index}`].description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Amount</Label>
                    <Input
                      type="number"
                      value={entry.totalAmount}
                      onChange={(e) =>
                        handleEntryChange(index, "totalAmount", e.target.value)
                      }
                      placeholder="Enter total amount"
                      className={
                        errors[`ledgerEntries.${index}`]?.totalAmount
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`ledgerEntries.${index}`]?.totalAmount && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`ledgerEntries.${index}`].totalAmount}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Received Amount</Label>
                    <Input
                      type="number"
                      value={entry.receivedAmount}
                      onChange={(e) =>
                        handleEntryChange(
                          index,
                          "receivedAmount",
                          e.target.value
                        )
                      }
                      placeholder="Enter received amount"
                      className={
                        errors[`ledgerEntries.${index}`]?.receivedAmount
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`ledgerEntries.${index}`]?.receivedAmount && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors[`ledgerEntries.${index}`].receivedAmount}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => handleRemoveEntry(index)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Entry
                </Button>
              </div>
            ))}

            <Button onClick={handleAddEntry} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Entry
            </Button>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Total Amount</Label>
              <Input type="number" value={totalAmount} readOnly />
            </div>
            <div>
              <Label>Total Received</Label>
              <Input type="number" value={totalReceivedAmount} readOnly />
            </div>
            <div className="col-span-2">
              <Label>Remaining Amount</Label>
              <Input type="number" value={remainingAmount} readOnly />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add Ledger Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLedgerDialog;

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSuppliers,
  updateSupplier,
  deleteSupplier,
  addSupplier,
} from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import EditSupplierDialog from "./EditSupplierDialog";
import AddSupplierDialog from "./AddSupplierDialog";
import { Input } from "@/components/ui/input";
import { getColumns } from "./SupplierColumns";
import SupplierStats from "./SupplierStats";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const SupplierPage = () => {
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query and Mutations
  const {
    data: suppliers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateSupplier(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update supplier: ${error.message}`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete supplier: ${error.message}`,
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: addSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add supplier: ${error.message}`,
      });
    },
  });

  // Memoized Handlers
  const handleEdit = useCallback((supplier) => {
    setEditingSupplier(supplier);
  }, []);

  const handleSaveEdit = useCallback(
    async (updatedSupplier) => {
      try {
        await updateMutation.mutateAsync(updatedSupplier);
        setEditingSupplier(null);
      } catch (error) {
        console.error("Failed to update supplier:", error);
      }
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete supplier:", error);
      }
    },
    [deleteMutation]
  );

  const handleAddSupplier = useCallback(
    async (newSupplier) => {
      try {
        await addMutation.mutateAsync(newSupplier);
      } catch (error) {
        console.error("Failed to add supplier:", error);
      }
    },
    [addMutation]
  );

  const handleGlobalFilter = useCallback((event) => {
    setGlobalFilter(event.target.value);
  }, []);

  // Memoized Values
  const filteredData = useMemo(() => {
    if (!globalFilter) return suppliers;
    const lowercasedFilter = globalFilter.toLowerCase();
    return suppliers.filter((supplier) =>
      Object.values(supplier).some((value) =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [suppliers, globalFilter]);

  const columns = useMemo(
    () => getColumns({ handleEdit, handleDelete }),
    [handleEdit, handleDelete]
  );

  // Loading and Error States
  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="p-6">
        <SupplierStats suppliers={[]} error={error} />
        <div className="text-center text-red-600 mt-4">
          Failed to load suppliers. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SupplierStats suppliers={suppliers} />

      <div className="bg-white rounded-md shadow-md">
        <div className="flex justify-between p-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={handleGlobalFilter}
            className="max-w-sm"
            aria-label="Search suppliers"
          />
          <AddSupplierDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSave={handleAddSupplier}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          initialState={{
            pagination: {
              pageSize: 10,
            },
          }}
        />
      </div>

      {editingSupplier && (
        <EditSupplierDialog
          supplier={editingSupplier}
          isOpen={true}
          onClose={() => setEditingSupplier(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default SupplierPage;

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  updateCategory,
  deleteCategory,
  addCategory,
} from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import EditCategoryDialog from "./EditCategoryDialog";
import AddCategoryDialog from "./AddCategoryDialog";
import { Input } from "@/components/ui/input";
import { getColumns } from "./CategoryColumns";
import CategoryStats from "./CategoryStats";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const CategoryPage = () => {
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query and Mutations
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateCategory(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update category: ${error.message}`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add category: ${error.message}`,
      });
    },
  });

  // Memoized Handlers
  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
  }, []);

  const handleSaveEdit = useCallback(
    async (updatedCategory) => {
      try {
        await updateMutation.mutateAsync(updatedCategory);
        setEditingCategory(null);
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    },
    [deleteMutation]
  );

  const handleAddCategory = useCallback(
    async (newCategory) => {
      try {
        await addMutation.mutateAsync(newCategory);
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    },
    [addMutation]
  );

  const handleGlobalFilter = useCallback((event) => {
    setGlobalFilter(event.target.value);
  }, []);

  // Memoized Values
  const filteredData = useMemo(() => {
    if (!globalFilter) return categories;
    const lowercasedFilter = globalFilter.toLowerCase();
    return categories.filter((category) =>
      Object.values(category).some((value) =>
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [categories, globalFilter]);

  const columns = useMemo(
    () => getColumns({ handleEdit, handleDelete }),
    [handleEdit, handleDelete]
  );

  // Loading and Error States
  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="p-6">
        <CategoryStats categories={[]} error={error} />
        <div className="text-center text-red-600 mt-4">
          Failed to load categories. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <CategoryStats categories={categories} />

      <div className="bg-white rounded-md shadow-md">
        <div className="flex justify-between p-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={handleGlobalFilter}
            className="max-w-sm"
            aria-label="Search categories"
          />
          <AddCategoryDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSave={handleAddCategory}
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

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default CategoryPage;

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProduct, fetchCategories } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const AddProductDialog = () => {
  const queryClient = useQueryClient();

  const initialProduct = {
    name: "",
    brand: "",
    model: "",
    ampereHours: "",
    category: "",
  };
  const [newProduct, setNewProduct] = useState(initialProduct);
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    const { brand, model, ampereHours } = newProduct;
    let generatedName = [brand, model, ampereHours].filter(Boolean).join("-");
    setNewProduct((prev) => ({ ...prev, name: generatedName }));
  }, [newProduct.brand, newProduct.model, newProduct.ampereHours]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setNewProduct((prev) => ({ ...prev, category: value }));
  };

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast({ title: "Product successfully added!" });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setNewProduct(initialProduct);
    },
    onError: (error) => {
      console.error("Error adding product:", error.response.data.error);
      if (error.response?.status === 409) {
        toast({
          variant: "destructive",

          title: "Product already exists.",
        });
      } else {
        toast({
          variant: "destructive",

          title: "Failed to add product. Please try again.",
        });
      }
    },
  });
  const handleSave = () => {
    const preparedProduct = {
      name: newProduct.name,
      brand: newProduct.brand,
      model: newProduct.model,
      ampereHours: newProduct.ampereHours
        ? parseFloat(newProduct.ampereHours)
        : null,
      category: newProduct.category,
    };
    addMutation.mutate(preparedProduct);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Add Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <Input
              id="brand"
              name="brand"
              value={newProduct.brand}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input
              id="model"
              name="model"
              value={newProduct.model}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ampereHours" className="text-right">
              Ampere Hours (Ah)
            </Label>
            <Input
              id="ampereHours"
              name="ampereHours"
              type="number"
              value={newProduct.ampereHours}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              onValueChange={handleCategoryChange}
              value={newProduct.category}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="">Loading...</SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;

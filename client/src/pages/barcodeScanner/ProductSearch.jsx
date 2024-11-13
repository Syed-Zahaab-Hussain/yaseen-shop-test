import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProductsByName, fetchPurchaseItemsByProductId } from "@/lib/api";

export default function ProductSearch({ onProductScanned, disabled }) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["products", searchInput],
    queryFn: () => fetchProductsByName(searchInput),
    enabled: searchInput.length >= 2,
  });

  console.log(searchResults);
  // Purchase items query for selected product
  const {
    data: purchaseItems,
    isLoading: isPurchaseItemsLoading,
    error: purchaseItemsError,
  } = useQuery({
    queryKey: ["purchaseItems", selectedProduct?.id],
    queryFn: () => fetchPurchaseItemsByProductId(selectedProduct.id),
    enabled: !!selectedProduct?.id,
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handlePurchaseItemSelect = (purchaseItem) => {
    onProductScanned({
      ...purchaseItem,
      product: selectedProduct,
    });
    setSelectedProduct(null);
    setSearchInput("");
  };

  const calculateTotalQuantity = (purchaseItems) => {
    if (!purchaseItems || !Array.isArray(purchaseItems)) {
      return 0;
    }
    return purchaseItems.reduce((total, item) => {
      console.log("Item:", item);
      return total + (item.initialQuantity - item.soldQuantity);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search products by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={disabled}
        />
        {isSearching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {searchError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error searching products. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {searchResults && !selectedProduct && (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      {calculateTotalQuantity(product.purchaseItems)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleProductSelect(product)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedProduct && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">
              Available Stock for {selectedProduct.name}
            </h3>
            {isPurchaseItemsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : purchaseItemsError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading purchase items. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Available Quantity</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {item.initialQuantity - item.soldQuantity}
                      </TableCell>
                      <TableCell>Rs {item.salePrice}</TableCell>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePurchaseItemSelect(item)}
                          disabled={item.initialQuantity <= item.soldQuantity}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

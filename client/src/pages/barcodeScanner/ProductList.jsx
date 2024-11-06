// File: components/ProductList.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ProductList({
  products,
  onQuantityChange,
  onRemoveProduct,
}) {
  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.product.name}</TableCell>
              <TableCell>Rs {product.salePrice.toLocaleString()}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={product.quantity.toString()}
                  onChange={(e) => onQuantityChange(product.id, e.target.value)}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                Rs {(product.salePrice * product.quantity).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <span className="text-red-500">Remove</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

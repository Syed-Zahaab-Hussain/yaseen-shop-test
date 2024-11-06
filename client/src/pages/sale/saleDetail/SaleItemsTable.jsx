import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSaleItem, deleteSaleItem } from "@/lib/api";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WarrantyClaimDialog from "./WarrantyClaimDialog";
import AddSaleItemDialog from "./AddSaleItemDialog";
import { Edit, Save, Trash2 } from "lucide-react";

const SaleItemsTable = ({ sale }) => {
  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const queryClient = useQueryClient();

  const updateItemMutation = useMutation({
    mutationFn: (data) => updateSaleItem(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", sale.id]);
      setEditingId(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => deleteSaleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["sale", sale.id]);
    },
  });

  const handleInputChange = (e, itemId) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (itemId) => {
    updateItemMutation.mutate({
      id: itemId,
      ...editedItem,
    });
  };

  const handleDelete = (itemId) => {
    deleteItemMutation.mutate(itemId);
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditedItem(item);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sale Items</CardTitle>
        <AddSaleItemDialog
          saleId={sale.id}
          onSuccess={() =>
            queryClient.invalidateQueries(["sale", sale.id])
          }
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Warranty Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.saleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="quantity"
                      value={editedItem.quantity}
                      onChange={(e) => handleInputChange(e, item.id)}
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="unitPrice"
                      value={editedItem.unitPrice}
                      onChange={(e) => handleInputChange(e, item.id)}
                    />
                  ) : (
                    `Rs ${item.unitPrice.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  Rs {(item.quantity * item.unitPrice).toFixed(2)}
                </TableCell>
                <TableCell>
                  {item.warrantyQuantity > 0
                    ? `${item.warrantyQuantity} under warranty`
                    : "No warranty"}
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Button onClick={() => handleUpdate(item.id)} size="sm">
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  ) : (
                    <Button onClick={() => startEditing(item)} size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="ml-2">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this item?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <WarrantyClaimDialog item={item} saleId={sale.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SaleItemsTable;

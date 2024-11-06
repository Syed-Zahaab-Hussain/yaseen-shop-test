import { Pencil, Trash } from "lucide-react";
import DynamicDropdownMenu from "@/components/DynamicDropdownMenu";

export const getColumns = ({ handleEdit, handleDelete }) => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "ampereHours",
    header: "Ampere Hours (Ah)",
    cell: ({ row }) => {
      const ampereHours = row.getValue("ampereHours");
      return ampereHours !== null ? `${ampereHours} W` : "-";
    },
  },
  {
    accessorKey: "purchaseItems",
    header: "In Inventory",
    cell: ({ row }) => {
      // console.log(row.original);
      const purchaseItems = row.original.purchaseItems;
      return purchaseItems.reduce(
        (total, item) => total + item.initialQuantity - item.soldQuantity,
        0
      );
    },
  },
  {
    accessorKey: "brand",
    header: "brand",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category?.name;
      return category ? category : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      const menuItems = [
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => handleEdit(product),
        },
        {
          type: "alert",
          label: "Delete",
          icon: Trash,
          alertTitle: "Are you absolutely sure?",
          alertDescription:
            "This action cannot be undone. This will delete the product.",
          onConfirm: () => handleDelete(product.id),
          confirmText: "Delete",
        },
      ];

      return <DynamicDropdownMenu menuItems={menuItems} />;
    },
  },
];

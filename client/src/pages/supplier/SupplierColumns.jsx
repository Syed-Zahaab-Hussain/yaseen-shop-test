import DynamicDropdownMenu from "@/components/DynamicDropdownMenu";
import { Pencil, Trash } from "lucide-react";

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
    accessorKey: "contact",
    header: "Contact Number",
  },
  {
    accessorKey: "address",
    header: "Address",
  },

  {
    accessorKey: "purchases",
    header: "purchases Items",
    cell: ({ row }) => {
      return row.original.purchases.length;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const supplier = row.original;

      const menuItems = [
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => handleEdit(supplier),
        },
        {
          type: "alert",
          label: "Delete",
          icon: Trash,
          alertTitle: "Are you absolutely sure?",
          alertDescription:
            "This action cannot be undone. This will delete the supplier.",
          onConfirm: () => handleDelete(supplier.id),
          confirmText: "Delete",
        },
      ];

      return <DynamicDropdownMenu menuItems={menuItems} />;
    },
  },
];

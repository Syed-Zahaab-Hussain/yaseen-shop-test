import { Pencil, Trash } from "lucide-react";
import DynamicDropdownMenu from "@/components/DynamicDropdownMenu";
import { addYears, format } from "date-fns";

export const getColumns = ({
  openReceipt,
  onEdit,
  onDelete,
  onWarrantyClaim,
}) => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "product",
    header: "Product Name",
    cell: ({ row }) => {
      const product = row.getValue("product");
      return product?.name || "-";
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "salePrice",
    header: "Sale Price",
    cell: ({ row }) => {
      const salePrice = row.getValue("salePrice");
      return salePrice.toLocaleString() || "-";
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => {
      const totalPrice = row.getValue("totalPrice");
      return totalPrice.toLocaleString() || "-";
    },
  },
  {
    accessorKey: "warranty.customerWarrantyDuration",
    header: "Warranty duration (Years)",
    cell: ({ row }) => {
      const customerEndDate = row.original.warranty.customerWarrantyDuration;
      return `${customerEndDate} year` || "-";
    },
  },
  {
    accessorKey: "warranty.endDate",
    header: "Warranty end date",
    cell: ({ row }) => {
      // console.log(row.original);
      const warrantyDuration = row.original.warranty.customerWarrantyDuration;
      const warrantyStartDate = row.original.warranty.createdAt.split("T")[0];
      const warrantyEndDate = format(
        addYears(warrantyStartDate, warrantyDuration),
        "dd MMMM yyyy"
      );
      return warrantyEndDate ? warrantyEndDate : "-";
    },
  },
  {
    accessorKey: "warranty.status",
    header: "Warranty Status",
    cell: ({ row }) => {
      const status = row.original.warranty.status;
      return status || "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const saleItem = row.original;
      console.log(saleItem);
      const menuItems = [
        {
          label: "Receipt",
          icon: Pencil,
          onClick: () => openReceipt(saleItem),
        },
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => onEdit(saleItem),
        },
        {
          label: "Claim Warranty",
          icon: Pencil,
          onClick: () => onWarrantyClaim(saleItem),
        },
        {
          type: "alert",
          label: "Delete",
          icon: Trash,
          alertTitle: "Are you absolutely sure?",
          alertDescription:
            "This action cannot be undone. This will delete the saleItem.",
          onConfirm: () => onDelete(saleItem.id),
          confirmText: "Delete",
        },
      ];

      return <DynamicDropdownMenu menuItems={menuItems} />;
    },
  },
];

import { format } from "date-fns";

export const getColumns = () => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => {
      // console.log(row.original);
      const supplier = row.original?.supplier.name;
      return supplier ? supplier : "-";
    },
  },

  {
    accessorKey: "date",
    header: "Purchase Date",
    cell: ({ row }) => {
      const date = format(row.original?.createdAt, "dd-MM-yyyy");
      return date ? date : "-";
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },

  {
    accessorKey: "paidAmount",
    header: "Paid Amount",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },

  {
    accessorKey: "purchaseItems",
    header: "Purchase Items",
    cell: ({ row }) => {
      return row.original.purchaseItems.length;
    },
  },
];

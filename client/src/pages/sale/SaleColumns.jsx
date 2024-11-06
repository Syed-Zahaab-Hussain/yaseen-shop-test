import { format } from "date-fns";

export const getColumns = () => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
  },

  {
    accessorKey: "date",
    header: "Sale Date",
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
    accessorKey: "receivedAmount",
    header: "Received Amount",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "discount",
    header: "Discount",
  },

  {
    accessorKey: "saleItems",
    header: "Sale Items",
    cell: ({ row }) => {
      return row.original.saleItems.length;
    },
  },
];

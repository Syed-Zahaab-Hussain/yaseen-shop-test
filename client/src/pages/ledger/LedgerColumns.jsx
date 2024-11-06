import { format } from "date-fns";

export const getColumns = () => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return row.original.type === "CUSTOMER" ? "Customer" : "Supplier";
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      return `Rs ${row.original.totalAmount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "receivedAmount",
    header: "Received Amount",
    cell: ({ row }) => {
      return `Rs ${row.original.receivedAmount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "remainingAmount",
    header: "Remaining Amount",
    cell: ({ row }) => {
      return `Rs ${row.original.remainingAmount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "overpaidAmount",
    header: "Overpaid Amount",
    cell: ({ row }) => {
      return `Rs ${row.original.overpaidAmount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "lastTransactionDate",
    header: "Last Transaction",
    cell: ({ row }) => {
      return format(row.original.lastTransactionDate, "dd-MM-yyyy");
    },
  },
];

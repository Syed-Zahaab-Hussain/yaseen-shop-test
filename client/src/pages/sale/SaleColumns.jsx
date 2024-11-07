import { format } from "date-fns";

export const getColumns = () => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "customer.name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.customer.name;
      return name ? name : "-";
    },
  },
  {
    accessorKey: "customer.contact",
    header: "Contact Number",
    cell: ({ row }) => {
      const contact = row.original.customer.contact;
      return contact ? contact : "-";
    },
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

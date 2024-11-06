import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const getColumns = () => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      console.log(row.original);
      return format(new Date(row.original.createdAt), "dd MMMM yyyy");
    },
  },
  {
    accessorKey: "description",
    header: "Description",
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
    id: "view",
    header: "View",
    cell: ({ row }) => {
      const page = row.original;
      console.log(page);
      if (page.purchaseId) {
        return (
          <Link to={`/purchase/${page?.purchaseId}`}>
            {" "}
            <Button> Purchase Page</Button>
          </Link>
        );
      } else {
        return (
          <Link to={`/sale/${page?.saleId}`}>
            <Button>Sale Page</Button>
          </Link>
        );
      }
    },
  },
];

import { Pencil, Trash } from "lucide-react";
import DynamicDropdownMenu from "@/components/DynamicDropdownMenu";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const getColumns = ({
  setResolveClaimWarranty,
  setRejectClaimWarranty,
  handleDelete,
  setEditClaimWarranty,
}) => [
  {
    accessorKey: "id",
    header: "ID",
    size: 80,
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => {
      const name =
        row.original.purchaseItem?.product.name ||
        row.original.saleItem?.product.name;
      return name || "-";
    },
  },
  {
    accessorKey: "claimType",
    header: "Claim Type",
    cell: ({ row }) => row.original.currentClaim.claimType || "-",
  },
  {
    accessorKey: "claimQuantity",
    header: "Quantity",
    size: 100,
    cell: ({ row }) => row.original.currentClaim.claimQuantity || "-",
  },
  {
    accessorKey: "claimDetails",
    header: "Details",
    cell: ({ row }) => row.original.currentClaim.claimDetails || "-",
  },
  {
    accessorKey: "claimDate",
    header: "Date",
    size: 120,
    cell: ({ row }) => {
      const date = row.original.currentClaim.claimDate;
      return date ? format(new Date(date), "dd-MM-yyyy") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = row.original.currentClaim.claimStatus;
      const getStatusColor = (status) => {
        switch (status) {
          case "PENDING":
            return "text-yellow-600";
          case "RESOLVED":
            return "text-green-600";
          case "REJECTED":
            return "text-red-600";
          default:
            return "text-gray-600";
        }
      };

      return (
        <span className={`font-medium ${getStatusColor(status)}`}>
          {status || "-"}
        </span>
      );
    },
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => {
      const page = row.original;
      console.log(page);
      if (page.currentClaim.claimType !== "CUSTOMER") {
        return (
          <Link to={`/purchase/${page.purchaseItem?.purchaseId}`}>
            <Button>Purchase Page</Button>
          </Link>
        );
      } else {
        return (
          <Link to={`/sale/${page.saleItem?.saleId}`}>
            <Button>Sale Page</Button>
          </Link>
        );
      }
    },
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const warranty = row.original;
      // console.log(warranty);
      const menuItems = [
        {
          label: "Resolve",
          icon: Pencil,
          onClick: () => setResolveClaimWarranty(warranty),
        },
        {
          label: "Reject",
          icon: Pencil,
          onClick: () => setRejectClaimWarranty(warranty),
        },
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => setEditClaimWarranty(warranty),
        },
        {
          type: "alert",
          label: "Delete",
          icon: Trash,
          alertTitle: "Delete Warranty Claim",
          alertDescription:
            "This action cannot be undone. Are you sure you want to delete this warranty claim?",
          onConfirm: () => handleDelete(warranty.id),
          confirmText: "Delete",
          variant: "destructive",
        },
      ];
      return <DynamicDropdownMenu menuItems={menuItems} />;
    },
  },
];

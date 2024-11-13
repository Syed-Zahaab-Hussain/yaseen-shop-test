import { Barcode, Pencil, Trash } from "lucide-react";
import DynamicDropdownMenu from "@/components/DynamicDropdownMenu";
import { addMonths, format, isValid, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

export const getColumns = ({ onEdit, onDelete, onWarrantyClaim }) => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      try {
        return row.original.id || "-";
      } catch (error) {
        console.error("Error displaying ID:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "product",
    header: "Product Name",
    cell: ({ row }) => {
      try {
        const product = row.original?.product;
        return product?.name || "-";
      } catch (error) {
        console.error("Error displaying product name:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "initialQuantity",
    header: "Original Quantity",
    cell: ({ row }) => {
      try {
        const quantity = row.original?.initialQuantity;
        return typeof quantity === "number" ? quantity.toString() : "-";
      } catch (error) {
        console.error("Error displaying initial quantity:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "soldQuantity",
    header: "Sold Quantity",
    cell: ({ row }) => {
      try {
        const soldQuantity = row.original?.soldQuantity;
        return typeof soldQuantity === "number"
          ? soldQuantity.toLocaleString()
          : "-";
      } catch (error) {
        console.error("Error displaying sold quantity:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ row }) => {
      try {
        const unitPrice = row.original?.unitPrice;
        return typeof unitPrice === "number"
          ? `Rs ${unitPrice.toLocaleString()}`
          : "-";
      } catch (error) {
        console.error("Error displaying unit price:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "salePrice",
    header: "Sale Price",
    cell: ({ row }) => {
      try {
        const salePrice = row.original?.salePrice;
        return typeof salePrice === "number"
          ? `Rs ${salePrice.toLocaleString()}`
          : "-";
      } catch (error) {
        console.error("Error displaying sale price:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => {
      try {
        return row.original?.barcode || "-";
      } catch (error) {
        console.error("Error displaying barcode:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "retailerWarrantyDuration",
    header: "Retailer Warranty (Months)",
    cell: ({ row }) => {
      try {
        const warrantyDuration =
          row.original?.warranty?.retailerWarrantyDuration;
        return warrantyDuration ? `${warrantyDuration} Months` : "-";
      } catch (error) {
        console.error("Error displaying warranty duration:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "warranty.endDate",
    header: "Retailer Warranty end date",
    cell: ({ row }) => {
      try {
        const warrantyDuration =
          row.original?.warranty?.retailerWarrantyDuration;
        const warrantyStartDate = row.original?.warranty?.createdAt;

        if (!warrantyStartDate || !warrantyDuration) return "-";

        const startDate = parseISO(warrantyStartDate);
        if (!isValid(startDate)) return "-";

        const warrantyEndDate = format(
          addMonths(startDate, warrantyDuration),
          "dd MMMM yyyy"
        );
        return warrantyEndDate || "-";
      } catch (error) {
        console.error("Error calculating warranty end date:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "status",
    header: "Warranty Status",
    cell: ({ row }) => {
      try {
        return row.original?.warranty?.status || "-";
      } catch (error) {
        console.error("Error displaying warranty status:", error);
        return "-";
      }
    },
  },
  {
    accessorKey: "totalClaimQuantity",
    header: "Total Claimed Quantity",
    cell: ({ row }) => {
      try {
        const purchaseItem = row.original;
        const claims = purchaseItem?.warranty?.claims || [];

        const totalClaimQuantity = claims.reduce((total, claim) => {
          // Only count claims that are either pending or resolved
          if (claim.claimStatus !== "REJECTED") {
            return total + (claim.claimQuantity || 0);
          }
          return total;
        }, 0);

        return totalClaimQuantity > 0 ? totalClaimQuantity.toString() : "-";
      } catch (error) {
        console.error("Error displaying total claim quantity:", error);
        return "-";
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const purchaseItem = row.original;

      const generateBarcode = async () => {
        try {
          if (!purchaseItem?.barcode) {
            toast({
              variant: "destructive",
              title: "No barcode available",
            });
            return;
          }

          const canvas = document.createElement("canvas");
          JsBarcode(canvas, purchaseItem.barcode, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true,
          });

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: [100, 50],
          });

          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 80, 30);
          pdf.save(`barcode_${purchaseItem.barcode}.pdf`);
        } catch (error) {
          console.error("Error generating barcode:", error);
          toast({
            variant: "destructive",
            title: "Failed to generate barcode",
            description: "Please try again later",
          });
        }
      };

      const menuItems = [
        {
          label: "Edit",
          icon: Pencil,
          onClick: () => {
            try {
              onEdit(purchaseItem);
            } catch (error) {
              console.error("Error editing item:", error);
              toast({
                variant: "destructive",
                title: "Failed to edit item",
              });
            }
          },
        },
        {
          label: "Claim Warranty",
          icon: Pencil,
          onClick: () => {
            try {
              if (purchaseItem?.warranty) {
                onWarrantyClaim(purchaseItem);
              } else {
                toast({
                  variant: "destructive",
                  title: "No warranty available for this item",
                });
              }
            } catch (error) {
              console.error("Error claiming warranty:", error);
              toast({
                variant: "destructive",
                title: "Failed to claim warranty",
              });
            }
          },
        },
        {
          label: "Generate Barcode",
          icon: Barcode,
          onClick: generateBarcode,
        },
        {
          type: "alert",
          label: "Delete",
          icon: Trash,
          alertTitle: "Are you absolutely sure?",
          alertDescription:
            "This action cannot be undone. This will delete the purchaseItem.",
          onConfirm: () => {
            try {
              onDelete(purchaseItem.id);
            } catch (error) {
              console.error("Error deleting item:", error);
              toast({
                variant: "destructive",
                title: "Failed to delete item",
              });
            }
          },
          confirmText: "Delete",
        },
      ];

      try {
        return <DynamicDropdownMenu menuItems={menuItems} />;
      } catch (error) {
        console.error("Error rendering dropdown menu:", error);
        return null;
      }
    },
  },
];

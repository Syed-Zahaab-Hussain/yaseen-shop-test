import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { fetchSaleById } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const SHOP_NAME_URDU = "یسین بیٹری زون ";
const SHOP_NAME_ENG = "YASEEN BATTERY ZONE";
const SHOP_SUBTITLE = "(الیکٹرک سائیکل اینڈ بلاسٹر)";
const SHOP_INFO = "نئین چوک ڈیری شلوچستان";
const MOBILE_NUMBERS = ["0300-9387788", "0321-8000881", "0812-866046"];

export default function Receipt() {
  const { toast } = useToast();

  const { id } = useParams();
  const {
    data: sale,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["sale", id],
    queryFn: () => fetchSaleById(id),
  });

  const generatePDF = () => {
    const input = document.getElementById("receipt-content");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate desired width (60% of PDF width)
      const desiredWidth = pdfWidth * 0.6;

      // Calculate height while maintaining aspect ratio
      const aspectRatio = canvas.height / canvas.width;
      const desiredHeight = desiredWidth * aspectRatio;

      // Center the receipt on the page
      // const xOffset = (pdfWidth - desiredWidth) / 2;
      // const yOffset = (pdfHeight - desiredHeight) / 2;
      const xOffset = 0;
      const yOffset = 0;

      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        desiredWidth,
        desiredHeight
      );

      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, "_blank");
    });
  };

  // Loading and Error States
  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to load recipt: ${error.message}`,
    });
  }

  return (
    <Card className="max-w-3xl mx-auto mt-8 bg-white shadow-lg">
      <CardContent className="p-6" id="receipt-content">
        {/* Rest of the component remains the same */}
        <div className="text-center mb-4 bg-[#1a237e] text-white py-2">
          <h3 className="text-xl font-bold my-1">{SHOP_NAME_ENG}</h3>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "Noto Nastaliq Urdu, serif" }}
          >
            {SHOP_NAME_URDU}
          </h2>
          <div className="flex justify-center space-x-4 mt-2">
            {MOBILE_NUMBERS.map((number) => (
              <span key={number} className="text-sm">
                {number}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[2fr,1fr] gap-4 mb-4">
          <div className="flex flex-col">
            <div className="flex">
              <span className="w-20">Name</span>
              <span className="flex-1 border-b border-gray-300">
                {sale.customer?.name || ""}
              </span>
            </div>
            <div className="flex mt-2">
              <span className="w-20">Address</span>
              <span className="flex-1 border-b border-gray-300">
                {sale.customer?.address || ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex">
              <span className="w-20">No:</span>
              <span className="flex-1 border-b border-gray-300">
                {sale.customer?.contact || ""}
              </span>
            </div>
            <div className="flex mt-2">
              <span className="w-20">Date</span>
              <span className="flex-1 border-b border-gray-300">
                {new Date(sale.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-400 bg-[#1a237e] text-white p-2 text-left">
                Product Name
              </th>
              <th className="border border-gray-400 bg-[#1a237e] text-white p-2">
                Quantity
              </th>
              <th className="border border-gray-400 bg-[#1a237e] text-white p-2">
                Unit RSP Rs.
              </th>
              <th className="border border-gray-400 bg-[#1a237e] text-white p-2">
                Net Amount Rs.
              </th>
            </tr>
          </thead>
          <tbody>
            {sale.saleItems.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-2">
                  {item.product.name}
                </td>
                <td className="border border-gray-400 p-2 text-center">
                  {item.quantity}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {item.salePrice.toLocaleString()}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {item.totalPrice.toLocaleString()}
                </td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - sale.saleItems.length))].map(
              (_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-gray-400 p-2">&nbsp;</td>
                  <td className="border border-gray-400 p-2">&nbsp;</td>
                  <td className="border border-gray-400 p-2">&nbsp;</td>
                  <td className="border border-gray-400 p-2">&nbsp;</td>
                </tr>
              )
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  New Bill <span className="urdu-font">نیا بل</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">
                {sale.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  Old Balance <span className="urdu-font">پرانا بقایا</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">0</div>
            </div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  Total Amount <span className="urdu-font">کل رقم</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">
                {sale.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  Bill Amount <span className="urdu-font">بل رقم</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">
                {sale.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  Received <span className="urdu-font">وصول</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">
                {sale.receivedAmount.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 mb-1">
              <div className="bg-[#1a237e] text-white p-2 flex justify-between">
                <span>
                  Net Bill <span className="urdu-font">باقی بل</span>
                </span>
              </div>
              <div className="border border-gray-300 p-2 text-right">
                {(sale.totalAmount - sale.receivedAmount).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <Button onClick={generatePDF} className="mt-6 w-full">
        View PDF
      </Button>
    </Card>
  );
}

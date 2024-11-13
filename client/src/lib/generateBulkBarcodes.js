import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

export const generateBulkBarcodes = async (purchaseItems) => {
  try {
    // Filter out items without barcodes
    const itemsWithBarcodes = purchaseItems.filter((item) => item.barcode);

    if (itemsWithBarcodes.length === 0) {
      throw new Error("No valid barcodes found in purchase items");
    }

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // PDF dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Barcode dimensions and spacing
    const barcodeWidth = 80; // mm
    const barcodeHeight = 30; // mm
    const margin = 10; // mm
    const spacing = 5; // mm between barcodes

    // Calculate how many barcodes can fit per row and column
    const barcodesPerRow = Math.floor(
      (pageWidth - 2 * margin) / (barcodeWidth + spacing)
    );
    const barcodesPerColumn = Math.floor(
      (pageHeight - 2 * margin) / (barcodeHeight + spacing)
    );
    const barcodesPerPage = barcodesPerRow * barcodesPerColumn;

    // Generate barcodes page by page
    for (let i = 0; i < itemsWithBarcodes.length; i++) {
      const item = itemsWithBarcodes[i];

      // Add new page if needed
      if (i > 0 && i % barcodesPerPage === 0) {
        pdf.addPage();
      }

      // Calculate position on current page
      const positionOnPage = i % barcodesPerPage;
      const row = Math.floor(positionOnPage / barcodesPerRow);
      const col = positionOnPage % barcodesPerRow;

      const x = margin + col * (barcodeWidth + spacing);
      const y = margin + row * (barcodeHeight + spacing);

      // Create canvas and generate barcode
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, item.barcode, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
      });

      // Add product name
      pdf.setFontSize(8);
      pdf.text(item.product.name, x, y - 2);

      // Add barcode image
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        x,
        y,
        barcodeWidth,
        barcodeHeight
      );
    }

    // Open PDF in new tab
    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  } catch (error) {
    console.error("Error generating bulk barcodes:", error);
    throw error;
  }
};

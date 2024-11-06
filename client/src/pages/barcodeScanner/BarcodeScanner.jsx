import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useZxing } from "react-zxing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProductByBarcode } from "@/lib/api";
import { Loader2, Camera, CameraOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarcodeScanner({ onProductScanned, disabled }) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [isScannerEnabled, setIsScannerEnabled] = useState(true);
  const barcodeInputRef = useRef(null);

  const { ref, torch, stop, start } = useZxing({
    onResult(result) {
      handleBarcodeScanned(result.getText());
    },
    paused: !isScannerEnabled,
  });

  const {
    data: scannedProduct,
    refetch: refetchProduct,
    isLoading,
    error,
    isError,
    status,
  } = useQuery({
    queryKey: ["product", searchBarcode],
    queryFn: () => fetchProductByBarcode(searchBarcode),
    enabled: false,
    retry: 1,
  });

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (scannedProduct) {
      onProductScanned(scannedProduct);
      setBarcodeInput("");
      setSearchBarcode("");
    }
  }, [scannedProduct, onProductScanned]);

  const handleBarcodeScanned = (barcode) => {
    setSearchBarcode(barcode);
    refetchProduct();
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleBarcodeScanned(barcodeInput);
  };

  // console.log(error?.response?.data);
  const toggleScanner = () => {
    setIsScannerEnabled((prev) => !prev);
    if (isScannerEnabled) {
      stop();
    } else {
      start();
    }
  };

  // Function to determine if we should show the error alert
  const shouldShowError = () => {
    // Only show error if:
    // 1. There's an error (isError is true)
    // 2. We have a searchBarcode (meaning we've attempted a search)
    // 3. We're not currently loading
    // 4. We don't have a scanned product
    return isError && searchBarcode && !isLoading && !scannedProduct;
  };

  return (
    <>
      <form onSubmit={handleBarcodeSubmit} className="mb-4">
        <div className="flex space-x-2">
          <Input
            ref={barcodeInputRef}
            type="number"
            placeholder="Enter barcode"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            disabled={disabled || isLoading}
          />
          <Button
            type="submit"
            disabled={disabled || isLoading || !barcodeInput.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </form>

      {shouldShowError() && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error?.response?.data?.error ||
              "Error scanning product. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4 relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={toggleScanner}
        >
          {isScannerEnabled ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              Disable Scanner
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Enable Scanner
            </>
          )}
        </Button>
        <video
          ref={ref}
          className="w-full h-48 object-cover"
          style={{
            opacity: disabled || !isScannerEnabled ? 0.5 : 1,
            display: isScannerEnabled ? "block" : "none",
          }}
        />
      </div>
    </>
  );
}

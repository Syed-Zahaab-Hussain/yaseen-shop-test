import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addSale } from "@/lib/api";
import ProductList from "./ProductList";
import CustomerForm from "./CustomerForm";
import PaymentSection from "./PaymentSection";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProductSearchSystem from "./ProductSearchSystem";

export default function BarcodeScannerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scannedProducts, setScannedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    id: null,
    name: "",
    type: "INDIVIDUAL",
    email: null,
    contact: null,
    address: null,
  });
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [change, setChange] = useState(0);
  const [debt, setDebt] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: addSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["sales"]);
      resetForm();
      toast({
        title: "Success!",
        description: "Transaction completed successfully",
      });
      navigate(`/receipt/${data.id}`);
    },
    onError: (error) => {
      console.error("Error in completeMutation:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // console.log(isLoading);
  const resetForm = () => {
    setScannedProducts([]);
    setCustomerInfo({
      name: "",
      type: "INDIVIDUAL",
      email: null,
      contact: null,
      address: null,
    });
    setPaymentMethod("credit_card");
    setReceivedAmount("");
    setDiscount("");
    setChange(0);
    setDebt(0);
    setErrors({});
  };

  const validateTransaction = () => {
    const newErrors = {};

    if (scannedProducts.length === 0) {
      newErrors.products = "Please scan at least one product";
    }

    if (finalAmount <= 0) {
      newErrors.amount = "Total amount must be greater than 0";
    }

    // Always require customer name
    if (!customerInfo.name.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    // Additional validation for shop owner type
    if (customerInfo.type === "SHOPOWNER" && !customerInfo.name.trim()) {
      newErrors.customerName = "Shop owner name is required";
    }

    // Always require received amount
    if (!receivedAmount || parseFloat(receivedAmount) <= 0) {
      newErrors.receivedAmount = "Please enter received amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteTransaction = async () => {
    // Early return if basic validations fail
    if (
      scannedProducts.length === 0 ||
      finalAmount <= 0 ||
      !customerInfo.name.trim() ||
      !receivedAmount ||
      parseFloat(receivedAmount) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateTransaction()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const transaction = {
      saleItems: scannedProducts.map((item) => ({
        purchaseItemId: item.id,
        productId: item.product.id,
        quantity: item.quantity,
        salePrice: parseFloat(item.salePrice),
        totalPrice: parseFloat(item.quantity) * parseFloat(item.salePrice),
      })),
      customerInfo: {
        ...customerInfo,
        // If id is null, it will be treated as a new customer
        // If id exists, it will be treated as an existing customer
        id: customerInfo.id || null,
      },
      paymentMethod: paymentMethod.toUpperCase(),
      totalAmount: parseFloat(finalAmount),
      receivedAmount: parseFloat(receivedAmount) || 0,
      discount: parseFloat(discount) || 0,
      change: parseFloat(change) || 0,
      debt: parseFloat(debt) || 0,
      date: new Date().toISOString(),
    };
    // Use mutateAsync to properly handle the loading state
    try {
      await completeMutation.mutateAsync(transaction);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleProductScanned = (product) => {
    if (!product) return;

    setScannedProducts((prevProducts) => {
      const existingProductIndex = prevProducts.findIndex(
        (p) => p.id === product.id
      );

      if (existingProductIndex !== -1) {
        const existingProduct = prevProducts[existingProductIndex];
        const availableQuantity =
          product.initialQuantity - product.soldQuantity;

        if (existingProduct.quantity >= availableQuantity) {
          toast({
            title: "Maximum quantity reached",
            description: `Only ${availableQuantity} units available`,
            variant: "warning",
          });
          return prevProducts;
        }

        const updatedProducts = [...prevProducts];
        updatedProducts[existingProductIndex] = {
          ...existingProduct,
          quantity: existingProduct.quantity + 1,
        };
        return updatedProducts;
      } else {
        // New product
        return [...prevProducts, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (id, quantity) => {
    setScannedProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === id) {
          const availableQuantity =
            product.initialQuantity - product.soldQuantity;
          const newQuantity = parseInt(quantity) || 0;

          if (newQuantity > availableQuantity) {
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Only ${availableQuantity} units available
              </AlertDescription>
            </Alert>;

            return { ...product, quantity: availableQuantity };
          }

          return { ...product, quantity: newQuantity };
        }
        return product;
      })
    );
  };

  const handleRemoveProduct = (id) => {
    setScannedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  };

  const totalAmount = scannedProducts.reduce(
    (sum, product) => sum + product.salePrice * product.quantity,
    0
  );

  const discountAmount = parseFloat(discount) || 0;
  const finalAmount = totalAmount - discountAmount;

  useEffect(() => {
    const receivedAmountValue = parseFloat(receivedAmount) || 0;
    if (receivedAmountValue >= finalAmount) {
      setChange(receivedAmountValue - finalAmount);
      setDebt(0);
    } else {
      setChange(0);
      setDebt(finalAmount - receivedAmountValue);
    }
  }, [receivedAmount, finalAmount]);

  // return (
  //   <div className="max-w-7xl mx-auto space-y-6">
  //     {Object.keys(errors).length > 0 && (
  //       <Alert variant="destructive">
  //         <AlertDescription>
  //           <ul className="list-disc pl-4">
  //             {Object.values(errors).map((error, index) => (
  //               <li key={index}>{error}</li>
  //             ))}
  //           </ul>
  //         </AlertDescription>
  //       </Alert>
  //     )}

  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Scanned Products</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <ProductSearchSystem
  //           onProductScanned={handleProductScanned}
  //           disabled={isLoading}
  //         />
  //         <ProductList
  //           products={scannedProducts}
  //           onQuantityChange={handleQuantityChange}
  //           onRemoveProduct={handleRemoveProduct}
  //           disabled={isLoading}
  //         />
  //       </CardContent>
  //     </Card>

  //     <CustomerForm
  //       customerInfo={customerInfo}
  //       onCustomerInfoChange={setCustomerInfo}
  //       errors={errors}
  //       disabled={isLoading}
  //     />

  //     <PaymentSection
  //       paymentMethod={paymentMethod}
  //       onPaymentMethodChange={setPaymentMethod}
  //       discount={discount}
  //       onDiscountChange={setDiscount}
  //       receivedAmount={receivedAmount}
  //       onReceivedAmountChange={setReceivedAmount}
  //       change={change}
  //       debt={debt}
  //       totalAmount={totalAmount}
  //       discountAmount={discountAmount}
  //       finalAmount={finalAmount}
  //       disabled={isLoading}
  //     />

  //     <Button
  //       className="w-full"
  //       size="lg"
  //       onClick={handleCompleteTransaction}
  //       disabled={isLoading}
  //     >
  //       {isLoading ? (
  //         <>
  //           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //           Processing...
  //         </>
  //       ) : (
  //         "Complete Transaction"
  //       )}
  //     </Button>
  //   </div>
  // );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scanned Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearchSystem
              onProductScanned={handleProductScanned}
              disabled={isLoading}
            />
            <ProductList
              products={scannedProducts}
              onQuantityChange={handleQuantityChange}
              onRemoveProduct={handleRemoveProduct}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <CustomerForm
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          errors={errors}
          disabled={isLoading}
        />
      </div>

      <PaymentSection
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        discount={discount}
        onDiscountChange={setDiscount}
        receivedAmount={receivedAmount}
        onReceivedAmountChange={setReceivedAmount}
        change={change}
        debt={debt}
        totalAmount={totalAmount}
        discountAmount={discountAmount}
        finalAmount={finalAmount}
        disabled={isLoading}
      />

      <Button
        className="w-full"
        size="lg"
        onClick={handleCompleteTransaction}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Transaction"
        )}
      </Button>
    </div>
  );
}

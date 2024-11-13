// ProductSearchSystem.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSearch from "./ProductSearch";
import BarcodeScanner from "./BarcodeScanner";

export default function ProductSearchSystem({ onProductScanned, disabled }) {
  const [activeTab, setActiveTab] = useState("search");

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search Product</TabsTrigger>
        <TabsTrigger value="scanner">Barcode Scanner</TabsTrigger>
      </TabsList>

      <TabsContent value="search">
        <ProductSearch
          onProductScanned={onProductScanned}
          disabled={disabled}
        />
      </TabsContent>

      <TabsContent value="scanner">
        <BarcodeScanner
          onProductScanned={onProductScanned}
          disabled={disabled}
          isActive={activeTab === "scanner"}
        />
      </TabsContent>
    </Tabs>
  );
}

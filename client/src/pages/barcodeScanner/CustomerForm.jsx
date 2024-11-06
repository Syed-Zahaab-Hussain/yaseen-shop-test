import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCustomerByInfo } from "@/lib/api";

export default function CustomerForm({
  customerInfo,
  onCustomerInfoChange,
  errors,
  disabled,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const formRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // const handleInputChange = async (field, value) => {
  //   onCustomerInfoChange({ ...customerInfo, [field]: value });

  //   // Clear previous timeout
  //   if (searchTimeoutRef.current) {
  //     clearTimeout(searchTimeoutRef.current);
  //   }

  //   // Only search if there's a value
  //   if (value.trim()) {
  //     // Debounce the search with 300ms delay
  //     searchTimeoutRef.current = setTimeout(async () => {
  //       try {
  //         const results = await fetchCustomerByInfo({ [field]: value });
  //         if (Array.isArray(results)) {
  //           setSearchResults(results);
  //         } else {
  //           setSearchResults([]);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching customers:", error);
  //         setSearchResults([]);
  //       }
  //     }, 300);
  //   } else {
  //     setSearchResults([]);
  //   }
  // };

  const handleSuggestionSelect = (customer) => {
    const updatedCustomerInfo = {
      type: customerInfo.type,
      name: customer.name,
      // Include the customer ID
      id: customer.id,
      ...(customer.email && { email: customer.email }),
      ...(customer.contact && { contact: customer.contact }),
      ...(customer.address && { address: customer.address }),
    };

    onCustomerInfoChange(updatedCustomerInfo);
    setSearchResults([]);
    setActiveField(null);
  };

  const handleInputChange = async (field, value) => {
    // If user modifies any field manually, remove the ID
    // as it might no longer correspond to the existing customer
    const updatedInfo = {
      ...customerInfo,
      [field]: value,
      id: null,
    };
    onCustomerInfoChange(updatedInfo);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await fetchCustomerByInfo({ [field]: value });
          if (Array.isArray(results)) {
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
          setSearchResults([]);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleFieldFocus = (field) => {
    setActiveField(field);
    // If there's a value in the field, trigger search again to show results
    if (customerInfo[field]?.trim()) {
      handleInputChange(field, customerInfo[field]);
    }
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      setActiveField(null);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResults = (field) => {
    if (activeField !== field || !searchResults.length) return null;

    return (
      <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
        {searchResults.map((customer, index) => (
          <li
            key={customer.id || index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleSuggestionSelect(customer)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{customer[field]}</span>
              {field !== "name" && customer.name && (
                <span className="text-sm text-gray-500">{customer.name}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" ref={formRef}>
          <div className="relative">
            <Label htmlFor="name" className="text-sm font-medium">
              Name{" "}
              {customerInfo.type === "SHOPOWNER" && (
                <span className="text-red-500">*</span>
              )}
            </Label>
            <Input
              id="name"
              value={customerInfo.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onFocus={() => handleFieldFocus("name")}
              placeholder="Search by customer name"
              className={errors?.customerName ? "border-red-500" : ""}
              disabled={disabled}
            />
            {errors?.customerName && (
              <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
            )}
            {renderSearchResults("name")}
          </div>

          {/* Optional fields */}
          {["email", "contact", "address"].map((field) => (
            <div key={field} className="relative">
              <Label htmlFor={field} className="text-sm font-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)} (Optional)
              </Label>
              <Input
                id={field}
                type={
                  field === "email"
                    ? "email"
                    : field === "contact"
                    ? "tel"
                    : "text"
                }
                value={customerInfo[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onFocus={() => handleFieldFocus(field)}
                placeholder={`Search by ${field}`}
                disabled={disabled}
              />
              {renderSearchResults(field)}
            </div>
          ))}

          <RadioGroup
            value={customerInfo.type}
            onValueChange={(value) =>
              onCustomerInfoChange({ ...customerInfo, type: value })
            }
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="INDIVIDUAL" id="individual" />
              <Label htmlFor="individual">Individual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SHOPOWNER" id="shopowner" />
              <Label htmlFor="shopowner">Shop Owner</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}

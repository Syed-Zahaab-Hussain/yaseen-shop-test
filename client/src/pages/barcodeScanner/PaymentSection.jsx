import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Banknote, Wallet } from "lucide-react";

export default function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  discount,
  onDiscountChange,
  receivedAmount,
  onReceivedAmountChange,
  change,
  debt,
  totalAmount,
  discountAmount,
  finalAmount,
  disabled = false,
}) {
  return (
    <Card className="w-full mt-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Totals Section */}
          <div className="col-span-4 space-y-4 border-r pr-4">
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  Rs {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">
                  Rs {discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span>Rs {finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="col-span-4 space-y-4 border-r px-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={onPaymentMethodChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">
                    <div className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="CREDIT_CARD">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="DIGITAL_WALLET">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Digital Wallet
                    </div>
                  </SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => onDiscountChange(e.target.value)}
                placeholder="Enter discount"
                disabled={disabled}
                className="w-full"
              />
            </div>
          </div>

          {/* Amount Received and Change Section */}
          <div className="col-span-4 space-y-4 pl-4">
            <div className="space-y-2">
              <Label
                htmlFor="received-amount"
                className="text-base font-semibold"
              >
                Amount Received
              </Label>
              <Input
                id="received-amount"
                type="number"
                min="0"
                value={receivedAmount}
                onChange={(e) => onReceivedAmountChange(e.target.value)}
                placeholder="Enter received amount"
                disabled={disabled}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Change</Label>
                <div className="p-2 bg-secondary rounded-md text-right font-mono">
                  Rs {change.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Debt</Label>
                <div className="p-2 bg-secondary rounded-md text-right font-mono">
                  Rs {debt.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

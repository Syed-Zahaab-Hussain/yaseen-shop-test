// File: components/PaymentForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CreditCard, Banknote, Wallet } from "lucide-react";

export default function PaymentForm({
  paymentMethod,
  onPaymentMethodChange,
  discount,
  onDiscountChange,
  receivedAmount,
  onReceivedAmountChange,
  change,
  debt,
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={onPaymentMethodChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash" className="flex items-center">
                <Banknote className="mr-2" /> Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CREDIT_CARD" id="credit_card" />
              <Label htmlFor="credit" className="flex items-center">
                <CreditCard className="mr-2" /> Credit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DIGITAL_WALLET" id="digital_wallet" />
              <Label htmlFor="digital" className="flex items-center">
                <Wallet className="mr-2" /> Digital Wallet
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BANK_TRANSFER" id="bank_transfer" />
              <Label htmlFor="bank" className="flex items-center">
                <Wallet className="mr-2" /> Bank Transfer
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              // step="0.01"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="received-amount">Amount Received</Label>
            <Input
              id="received-amount"
              type="number"
              min="0"
              // step="0.01"
              value={receivedAmount}
              onChange={(e) => onReceivedAmountChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Change</Label>
            <Input value={change.toLocaleString()} readOnly />
          </div>
          <div>
            <Label>Debt</Label>
            <Input value={debt.toLocaleString()} readOnly />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

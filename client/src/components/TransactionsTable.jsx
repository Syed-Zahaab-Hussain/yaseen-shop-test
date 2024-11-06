import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TransactionsTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Today&#39;s (Wednesday 12th July, 2023) Transactions
        </CardTitle>
        <CardDescription>A list of your recent transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Select defaultValue="10">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="20">Show 20</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
            </SelectContent>
          </Select>
          <Input className="w-[180px]" placeholder="Search..." />
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>PAYMENT</th>
                <th>AMOUNT</th>
                <th>ATTENDANT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr>
                <td colSpan={6}>No data available in table</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Showing 0 to 0 of 0 entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DashboardCharts = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "stock",
    direction: "desc",
  });

  // Calculate stock and expense data
  const productData =
    products?.map((product) => {
      const stock = product.purchaseItems.reduce(
        (total, item) => total + (item.initialQuantity - item.soldQuantity),
        0
      );
      const expense = product.purchaseItems.reduce(
        (total, item) => total + item.unitPrice * item.initialQuantity,
        0
      );
      return {
        name: product.name,
        stock,
        expense,
      };
    }) || [];

  // Filter and sort data
  const filteredData = productData
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a[sortConfig.key] - b[sortConfig.key];
      }
      return b[sortConfig.key] - a[sortConfig.key];
    });

  // Get top 10 items for charts
  const top10Stock = [...filteredData]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10);

  const top10Expense = [...filteredData]
    .sort((a, b) => b.expense - a.expense)
    .slice(0, 10);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Custom color scale for the charts
  const colors = [
    "#2563eb",
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
    "#dbeafe",
    "#eff6ff",
    "#f1f5f9",
    "#f8fafc",
    "#ffffff",
  ];

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="w-full">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Stock Levels Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Stock Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10Stock}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#2563eb">
                    {top10Stock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10Expense}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="expense" fill="#2563eb">
                    {top10Expense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th
                    className="px-6 py-3 cursor-pointer"
                    onClick={() => handleSort("stock")}
                  >
                    Stock Level
                    {sortConfig.key === "stock" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 cursor-pointer"
                    onClick={() => handleSort("expense")}
                  >
                    Total Expense
                    {sortConfig.key === "expense" && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">{item.stock}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(item.expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;

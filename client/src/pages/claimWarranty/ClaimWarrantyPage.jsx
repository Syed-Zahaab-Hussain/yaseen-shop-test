import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClaimWarranties, deleteClaimWarranty } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResolveWarrantyDialog from "./ResolveWarrantyDialog";
import { getColumns } from "./ClaimWarrantyColumns";
import { AlertCircle } from "lucide-react";
import EditWarrantyDialog from "./EditClaimWarrantyDialog";
import RejectWarrantyDialog from "./RejectWarrantyDialog";

const ClaimWarrantyPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [resolveClaimWarranty, setResolveClaimWarranty] = useState(null);
  const [rejectClaimWarranty, setRejectClaimWarranty] = useState(null);
  const [editClaimWarranty, setEditClaimWarranty] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  const {
    data: rawClaimWarranties = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["claimWarranties"],
    queryFn: fetchClaimWarranties,
    retry: 2,
  });

  console.log(rawClaimWarranties);

  const processedWarranties = useMemo(() => {
    return rawClaimWarranties.flatMap((warranty) =>
      warranty.claims.map((claim) => ({
        ...warranty,
        currentClaim: claim,
        claims: undefined,
      }))
    );
  }, [rawClaimWarranties]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedWarranties.length) return null;

    const totalClaims = processedWarranties.length;
    const pendingClaims = processedWarranties.filter(
      (w) => w.currentClaim.claimStatus === "PENDING"
    ).length;
    const resolvedClaims = processedWarranties.filter(
      (w) => w.currentClaim.claimStatus === "RESOLVED"
    ).length;
    const rejectedClaims = processedWarranties.filter(
      (w) => w.currentClaim.claimStatus === "REJECTED"
    ).length;
    const customerClaims = processedWarranties.filter(
      (w) => w.currentClaim.claimType === "CUSTOMER"
    ).length;
    const supplierClaims = processedWarranties.filter(
      (w) => w.currentClaim.claimType === "SUPPLIER"
    ).length;

    return {
      totalClaims,
      pendingClaims,
      resolvedClaims,
      rejectedClaims,
      customerClaims,
      supplierClaims,
      resolutionRate: ((resolvedClaims / totalClaims) * 100).toFixed(1),
    };
  }, [processedWarranties]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClaimWarranty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claimWarranties"] });
    },
  });

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete warranty claim:", error);
    }
  };

  // Filter data based on global search and active tab
  const filteredData = useMemo(() => {
    let filtered = processedWarranties;

    // First apply status filter based on active tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (warranty) =>
          warranty.currentClaim.claimStatus === activeTab.toUpperCase()
      );
    }

    // Then apply search filter
    if (globalFilter) {
      const searchStr = globalFilter.toLowerCase();
      filtered = filtered.filter((warranty) => {
        return (
          warranty.currentClaim.claimDetails
            ?.toLowerCase()
            .includes(searchStr) ||
          warranty.currentClaim.claimType?.toLowerCase().includes(searchStr) ||
          warranty.purchaseItem?.product.name
            ?.toLowerCase()
            .includes(searchStr) ||
          warranty.saleItem?.product.name?.toLowerCase().includes(searchStr) ||
          String(warranty.currentClaim.claimQuantity).includes(searchStr)
        );
      });
    }

    return filtered;
  }, [processedWarranties, globalFilter, activeTab]);

  const columns = getColumns({
    setResolveClaimWarranty,
    setRejectClaimWarranty,
    handleDelete,
    setEditClaimWarranty,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mx-6 mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message ||
            "Failed to fetch warranty claims. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClaims}</div>
              <p className="text-xs text-gray-500 mt-1">
                Resolution Rate: {stats.resolutionRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Pending Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting resolution</p>
            </CardContent>
          </Card>

          <Card className="bg-green-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Customer Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customerClaims}</div>
              <p className="text-xs text-gray-500 mt-1">End-user warranties</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Supplier Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supplierClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Vendor warranties</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Table Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">
              All Claims ({stats?.totalClaims || 0})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats?.pendingClaims || 0})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({stats?.resolvedClaims || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats?.rejectedClaims || 0})
            </TabsTrigger>
          </TabsList>

          <Input
            placeholder="Search claims..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="bg-white rounded-md shadow-md">
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              defaultPageSize={10}
            />
          </div>
        </TabsContent>
      </Tabs>

      {resolveClaimWarranty && (
        <ResolveWarrantyDialog
          claim={resolveClaimWarranty}
          isOpen={!!resolveClaimWarranty}
          onClose={() => setResolveClaimWarranty(null)}
        />
      )}
      {rejectClaimWarranty && (
        <RejectWarrantyDialog
          claim={rejectClaimWarranty}
          isOpen={!!rejectClaimWarranty}
          onClose={() => setRejectClaimWarranty(null)}
        />
      )}
      {editClaimWarranty && (
        <EditWarrantyDialog
          warranty={editClaimWarranty}
          isOpen={!!editClaimWarranty}
          onClose={() => setEditClaimWarranty(null)}
        />
      )}
    </div>
  );
};

export default ClaimWarrantyPage;

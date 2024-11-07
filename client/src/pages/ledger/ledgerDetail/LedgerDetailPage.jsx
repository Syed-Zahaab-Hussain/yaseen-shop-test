import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEntityById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LedgerInformation from "./LedgerInformation";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "./LedgerDetailColumns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "@/components/charts/Charts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const LedgerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: entity,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entity", id],
    queryFn: () => fetchEntityById(id),
    retry: 2,
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load entity details. {error?.message}
            <Button
              variant="link"
              onClick={() => refetch()}
              className="p-0 h-auto font-normal text-destructive-foreground underline"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const updatedEntity = {
    ...entity,
    ledger: entity.ledger.map((entry) => {
      const purchase = entity.purchases.find(
        (p) => p.entityId === entry.entityId
      );
      const sale = entity.sales.find((s) => s.entityId === entry.entityId);

      return {
        ...entry,
        ...(purchase ? { purchaseId: purchase.id } : {}),
        ...(sale ? { saleId: sale.id } : {}),
      };
    }),
  };

  const columns = getColumns();

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="group flex items-center space-x-2 hover:bg-secondary mb-4"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span>Back to List</span>
      </Button>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LedgerInformation
            entity={entity}
            title={`${
              entity.type.charAt(0).toUpperCase() +
              entity.type.slice(1).toLowerCase()
            } Information`}
          />

          {/* <div className="w-full h-full min-h-[300px]">
            <PieChart
              data={pieChartData}
              title={entity.type == "CUSTOMER" ? "CUSTOMER" : "SUPPLIER"}
            />
          </div> */}
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Ledger Entries</h2>
            <DataTable
              columns={columns}
              data={updatedEntity.ledger || []}
              pagination
              searchable
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LedgerDetailPage;

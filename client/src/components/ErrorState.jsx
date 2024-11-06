import { ReloadIcon } from "@radix-ui/react-icons";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";

const ErrorState = ({ error, refetch }) => {
  return (
    <Alert variant="destructive" className="m-6">
      <div className="flex flex-col space-y-4">
        <h3 className="font-medium">Error fetching ledger data</h3>
        <p className="text-sm">
          {error?.message || "An unknown error occurred"}
        </p>
        <Button
          variant="outline"
          onClick={refetch}
          className="w-fit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            "Try Again"
          )}
        </Button>
      </div>
    </Alert>
  );
};

export default ErrorState;

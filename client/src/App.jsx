import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { checkAuth } from "./lib/api";

import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./lib/useAuth";

// Lazy load all pages
const Login = lazy(() => import("./pages/auth/Login"));
const Home = lazy(() => import("./pages/home/Home"));
const ProductPage = lazy(() => import("./pages/product/ProductPage"));
const PurchasePage = lazy(() => import("./pages/purchase/PurchasePage"));
const PurchaseDetailPage = lazy(() =>
  import("./pages/purchase/purchaseDetail/PurchaseDetailPage")
);
const SupplierPage = lazy(() => import("./pages/supplier/SupplierPage"));
const CategoryPage = lazy(() => import("./pages/category/CategoryPage"));
const BarcodeScannerPage = lazy(() =>
  import("./pages/barcodeScanner/BarcodeScannerPage")
);
const SalePage = lazy(() => import("./pages/sale/SalePage"));
const SaleDetailPage = lazy(() =>
  import("./pages/sale/saleDetail/SaleDetailPage")
);
const Receipt = lazy(() => import("./pages/barcodeScanner/Receipt"));
const ClaimWarrantyPage = lazy(() =>
  import("./pages/claimWarranty/ClaimWarrantyPage")
);
const LedgerPage = lazy(() => import("./pages/ledger/LedgerPage"));
const LedgerDetailPage = lazy(() =>
  import("./pages/ledger/ledgerDetail/LedgerDetailPage")
);

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { clearState } = useAuth();
  const {
    data: isAuthenticated,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: checkAuth,
    retry: false,
    staleTime: 1000,
    refetchInterval: 30000,
    onError: () => {
      clearState();
      navigate("/login", { replace: true });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearState();
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, clearState]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || error) {
    return null;
  }

  return <Outlet />;
};

const LazyComponent = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Login route */}
            <Route path="login" element={<LazyComponent component={Login} />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/home" replace />} />

              <Route path="home" element={<LazyComponent component={Home} />} />
              <Route
                path="products"
                element={<LazyComponent component={ProductPage} />}
              />
              <Route
                path="suppliers"
                element={<LazyComponent component={SupplierPage} />}
              />
              <Route
                path="category"
                element={<LazyComponent component={CategoryPage} />}
              />
              <Route
                path="purchases"
                element={<LazyComponent component={PurchasePage} />}
              />
              <Route
                path="ledger"
                element={<LazyComponent component={LedgerPage} />}
              />
              <Route
                path="ledger/:id"
                element={<LazyComponent component={LedgerDetailPage} />}
              />
              <Route
                path="purchase/:id"
                element={<LazyComponent component={PurchaseDetailPage} />}
              />
              <Route
                path="sales"
                element={<LazyComponent component={SalePage} />}
              />
              <Route
                path="sale/:id"
                element={<LazyComponent component={SaleDetailPage} />}
              />
              <Route
                path="receipt/:id"
                element={<LazyComponent component={Receipt} />}
              />
              <Route
                path="barcode-scanner"
                element={<LazyComponent component={BarcodeScannerPage} />}
              />
              <Route
                path="claim-Warranties"
                element={<LazyComponent component={ClaimWarrantyPage} />}
              />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;

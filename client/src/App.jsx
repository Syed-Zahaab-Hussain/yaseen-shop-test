// import { useEffect, useState } from "react";
// import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import useAuth from "./lib/useAuth";
// import { publicApi } from "./lib/axios";
// import Layout from "./components/Layout";
// import Register from "./pages/auth/Register";
// import Login from "./pages/auth/Login";
// import Home from "./pages/home/Home";
// import ProtectedRoute from "./components/ProtectedRoute";
// import ProductPage from "./pages/product/ProductPage";
// import PurchasePage from "./pages/purchase/PurchasePage";
// import PurchaseDetailPage from "./pages/purchase/purchaseDetail/PurchaseDetailPage";
// import SupplierPage from "./pages/supplier/SupplierPage";
// import CategoryPage from "./pages/category/CategoryPage";
// import BarcodeScannerPage from "./pages/barcodeScanner/BarcodeScannerPage";
// import SalePage from "./pages/sale/SalePage";
// import SaleDetailPage from "./pages/sale/saleDetail/SaleDetailPage";
// import Receipt from "./pages/barcodeScanner/Receipt";
// import ClaimWarrantyPage from "./pages/claimWarranty/ClaimWarrantyPage";
// import LedgerPage from "./pages/ledger/LedgerPage";
// import LedgerDetailPage from "./pages/ledger/ledgerDetail/LedgerDetailPage";

// function App() {
//   const navigate = useNavigate();
//   const [adminExist, setAdminExist] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { user, clearState } = useAuth();

//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const { data } = await publicApi.get("auth/check-user");
//         if (data) {
//           setAdminExist(true);
//         } else {
//           setAdminExist(false);
//           clearState();
//           navigate("/register");
//         }
//       } catch (error) {
//         console.error("Error checking user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkUser();
//   }, [navigate]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="app">
//       <Routes>
//         <Route path="/" element={<Layout />}>
//           {/* Public routes */}
//           <Route
//             index
//             element={
//               !adminExist ? (
//                 <Navigate to="/register" replace />
//               ) : user ? (
//                 <Navigate to="home" replace />
//               ) : (
//                 <Navigate to="/login" replace />
//               )
//             }
//           />
//           <Route path="login" element={<Login />} />
//           <Route path="register" element={<Register />} />
//           {/* Protected routes */}
//           <Route element={<ProtectedRoute />}>
//             <Route path="home" element={<Home />} />
//             <Route path="products" element={<ProductPage />} />
//             <Route path="suppliers" element={<SupplierPage />} />
//             <Route path="category" element={<CategoryPage />} />
//             <Route path="purchases" element={<PurchasePage />} />
//             <Route path="ledger" element={<LedgerPage />} />
//             <Route path="ledger/:id" element={<LedgerDetailPage />} />
//             <Route path="purchase/:id" element={<PurchaseDetailPage />} />
//             <Route path="sales" element={<SalePage />} />
//             <Route path="sale/:id" element={<SaleDetailPage />} />
//             <Route path="receipt/:id" element={<Receipt />} />
//             <Route path="barcode-scanner" element={<BarcodeScannerPage />} />
//             <Route path="claim-Warranties" element={<ClaimWarrantyPage />} />
//           </Route>
//           {/* Catch-all route */}
//           <Route path="*" element={<Navigate to="/home" replace />} />
//         </Route>
//       </Routes>
//     </div>
//   );
// }

// export default App;

// import { useEffect, useState, Suspense, lazy } from "react";
// import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import useAuth from "./lib/useAuth";
// import { publicApi } from "./lib/axios";
// import Layout from "./components/Layout";
// import ErrorBoundary from "./components/ErrorBoundary";
// import { LoadingSpinner } from "./components/LoadingSpinner";

// // Lazy load all pages
// const Register = lazy(() => import("./pages/auth/Register"));
// const Login = lazy(() => import("./pages/auth/Login"));
// const Home = lazy(() => import("./pages/home/Home"));
// const ProductPage = lazy(() => import("./pages/product/ProductPage"));
// const PurchasePage = lazy(() => import("./pages/purchase/PurchasePage"));
// const PurchaseDetailPage = lazy(() =>
//   import("./pages/purchase/purchaseDetail/PurchaseDetailPage")
// );
// const SupplierPage = lazy(() => import("./pages/supplier/SupplierPage"));
// const CategoryPage = lazy(() => import("./pages/category/CategoryPage"));
// const BarcodeScannerPage = lazy(() =>
//   import("./pages/barcodeScanner/BarcodeScannerPage")
// );
// const SalePage = lazy(() => import("./pages/sale/SalePage"));
// const SaleDetailPage = lazy(() =>
//   import("./pages/sale/saleDetail/SaleDetailPage")
// );
// const Receipt = lazy(() => import("./pages/barcodeScanner/Receipt"));
// const ClaimWarrantyPage = lazy(() =>
//   import("./pages/claimWarranty/ClaimWarrantyPage")
// );
// const LedgerPage = lazy(() => import("./pages/ledger/LedgerPage"));
// const LedgerDetailPage = lazy(() =>
//   import("./pages/ledger/ledgerDetail/LedgerDetailPage")
// );
// const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// function App() {
//   const navigate = useNavigate();
//   const [adminExist, setAdminExist] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { user, clearState } = useAuth();

//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const { data } = await publicApi.get("auth/check-user");
//         if (data) {
//           setAdminExist(true);
//         } else {
//           setAdminExist(false);
//           clearState();
//           navigate("/register");
//         }
//       } catch (error) {
//         console.error("Error checking user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkUser();
//   }, [navigate, clearState]);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="app">
//       <ErrorBoundary>
//         <Suspense fallback={<LoadingSpinner />}>
//           <Routes>
//             <Route path="/" element={<Layout />}>
//               {/* Public routes */}
//               <Route
//                 index
//                 element={
//                   !adminExist ? (
//                     <Navigate to="/register" replace />
//                   ) : user ? (
//                     <Navigate to="home" replace />
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />
//               <Route path="login" element={<Login />} />
//               <Route path="register" element={<Register />} />

//               {/* Protected routes */}
//               <Route element={<ProtectedRoute />}>
//                 <Route
//                   path="home"
//                   element={
//                     <Suspense fallback={<LoadingSpinner />}>
//                       <Home />
//                     </Suspense>
//                   }
//                 />
//                 <Route path="products" element={<ProductPage />} />
//                 <Route path="suppliers" element={<SupplierPage />} />
//                 <Route path="category" element={<CategoryPage />} />
//                 <Route path="purchases" element={<PurchasePage />} />
//                 <Route path="ledger" element={<LedgerPage />} />
//                 <Route path="ledger/:id" element={<LedgerDetailPage />} />
//                 <Route path="purchase/:id" element={<PurchaseDetailPage />} />
//                 <Route path="sales" element={<SalePage />} />
//                 <Route path="sale/:id" element={<SaleDetailPage />} />
//                 <Route path="receipt/:id" element={<Receipt />} />
//                 <Route
//                   path="barcode-scanner"
//                   element={<BarcodeScannerPage />}
//                 />
//                 <Route
//                   path="claim-Warranties"
//                   element={<ClaimWarrantyPage />}
//                 />
//               </Route>

//               {/* Catch-all route */}
//               <Route path="*" element={<Navigate to="/home" replace />} />
//             </Route>
//           </Routes>
//         </Suspense>
//       </ErrorBoundary>
//     </div>
//   );
// }

// export default App;

import { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import useAuth from "./lib/useAuth";
import { publicApi } from "./lib/axios";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load all pages
const Register = lazy(() => import("./pages/auth/Register"));
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
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Create a wrapper component for lazy-loaded routes
const LazyComponent = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

function App() {
  const navigate = useNavigate();
  const [adminExist, setAdminExist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, clearState } = useAuth();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await publicApi.get("auth/check-user");
        if (data) {
          setAdminExist(true);
        } else {
          setAdminExist(false);
          clearState();
          navigate("/register");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, clearState]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route
              index
              element={
                !adminExist ? (
                  <Navigate to="/register" replace />
                ) : user ? (
                  <Navigate to="home" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="login" element={<LazyComponent component={Login} />} />
            <Route
              path="register"
              element={<LazyComponent component={Register} />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
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

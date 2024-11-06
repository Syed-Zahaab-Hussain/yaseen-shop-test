import { privateApi, publicApi } from "./axios";

// ==========================================================================
export const register = async () => {
  const response = await publicApi.post("/auth/register");
  // console.log(response.data);
  return response.data;
};
export const login = async (data) => {
  const response = await publicApi.post("/auth/login", data);
  // console.log(response.data);
  return response.data;
};

export const updateUser = async (data) => {
  const response = await privateApi.put(`/auth/update`, data);
  return response.data;
};

export const logout = async () => {
  const response = await privateApi.delete("/auth/logout");
  // console.log(response.data);
  return response;
};
// ==========================================================================

export const fetchCategories = async () => {
  const response = await privateApi.get("/category/get/all");
  // console.log(response.data);

  return response.data;
};

export const addCategory = async (data) => {
  const response = await privateApi.post(`/category/add`, data);
  // console.log(Category.parse(response.data));
  return response.data;
};

export const updateCategory = async (id, data) => {
  // console.log("incoming: ", data);
  const response = await privateApi.put(`/category/update/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  await privateApi.delete(`/category/delete/${id}`);
};
// ==========================================================================
export const fetchProducts = async ({ queryKey }) => {
  const [, { startDate = null, endDate = null } = {}] = queryKey;
  const response = await privateApi.get("/product/get/all", {
    params: { startDate, endDate },
  });
  // console.log(response.data);

  return response.data;
};

export const addProduct = async (data) => {
  const response = await privateApi.post(`/product/add`, data);
  // console.log(Product.parse(response.data));
  return response.data;
};

export const updateProduct = async (id, data) => {
  // console.log("incoming: ", data);
  const response = await privateApi.put(`/product/update/${id}`, data);
  // console.log(Product.parse(response.data));
  return response.data;
};

export const deleteProduct = async (id) => {
  await privateApi.delete(`/product/delete/${id}`);
};

// ==========================================================================

export const fetchPurchases = async ({ queryKey }) => {
  const [, { startDate = null, endDate = null } = {}] = queryKey;
  const response = await privateApi.get("/purchase/get/all", {
    params: { startDate, endDate },
  });
  return response.data;
};
export const fetchPurchaseById = async (id) => {
  const response = await privateApi.get(`/purchase/get/${id}`);
  // console.log("fetchPurchaseById: ", response.data);
  return response.data;
};

export const addPurchase = async (data) => {
  const response = await privateApi.post(`/purchase/add`, data);
  return response.data;
};

export const updatePurchase = async (id, data) => {
  // console.log("api update: ",data);

  const response = await privateApi.put(`/purchase/update/${id}`, data);
  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await privateApi.delete(`/purchase/delete/${id}`);
  return response.data;
};

// ==========================================================================

export const addPurchaseItem = async (data) => {
  console.log(data);

  const response = await privateApi.post(`/purchase/purchaseItem/add`, data);
  return response.data;
};
export const deletePurchaseItem = async (id) => {
  const response = await privateApi.delete(
    `/purchase/purchaseItem/delete/${id}`
  );
  return response.data;
};

export const updatePurchaseItem = async (id, data) => {
  const response = await privateApi.put(
    `/purchase/purchaseItem/update/${id}`,
    data
  );
  return response.data;
};

// ==========================================================================

export const fetchSuppliers = async () => {
  const response = await privateApi.get("/supplier/get/all");
  // console.log(response.data);
  return response.data;
};

export const addSupplier = async (data) => {
  const response = await privateApi.post(`/supplier/add`, data);
  // console.log(Supplier.parse(response.data));
  return response.data;
};

export const updateSupplier = async (id, data) => {
  // console.log("incoming: ", data);
  const response = await privateApi.put(`/supplier/update/${id}`, data);
  // console.log(Supplier.parse(response.data));
  return response.data;
};

export const deleteSupplier = async (id) => {
  await privateApi.delete(`/supplier/delete/${id}`);
};
// ==========================================================================
export const claimWarranty = async (id, data) => {
  // console.log(id);

  // console.log(data);

  const response = await privateApi.post(`/warranty/add/${id}`, data);
  return response.data;
};

export const updateWarranty = async (id, data) => {
  const response = await privateApi.put(`/warranty/update/${id}`, data);
  return response.data;
};

// ==========================================================================

export const fetchProductByBarcode = async (id) => {
  console.log(id);

  const response = await privateApi.get(`/sale/barcode/get/${id}`);
  // console.log(response.data);
  return response.data;
};

// ==========================================================================
export const addCustomer = async (data) => {
  const response = await privateApi.post(`/customer/add`, data);
  // console.log(Supplier.parse(response.data));
  return response.data;
};

export const fetchCustomers = async () => {
  const response = await privateApi.get("/customer/get/all");
  // console.log(response.data);
  return response.data;
};

export const fetchCustomerByInfo = async (data) => {
  try {
    const response = await privateApi.get("/customer/get", {
      params: data,
    });
    // console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching customer info:", error);
    throw error;
  }
};

export const addSale = async (data) => {
  const response = await privateApi.post(`/sale/add`, data);
  // console.log(Supplier.parse(response.data));
  return response.data;
};

export const fetchSales = async ({ queryKey }) => {
  const [, { startDate = null, endDate = null } = {}] = queryKey;

  const response = await privateApi.get("/sale/get/all", {
    params: { startDate, endDate },
  });
  // console.log(response.data);
  return response.data;
};

export const fetchSaleById = async (id) => {
  const response = await privateApi.get(`/sale/get/${id}`);

  // console.log("fetchPurchaseById: ", response.data);
  return response.data;
};

export const updateSale = async (id, data) => {
  console.log(data);

  const response = await privateApi.put(`/sale/update/${id}`, data);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await privateApi.delete(`/sale/delete/${id}`);
  return response.data;
};
// ==========================================================================

export const addSaleItem = async (data) => {
  console.log(data);

  const response = await privateApi.post(`/sale/saleItem/add`, data);
  return response.data;
};

export const updateSaleItem = async (id, data) => {
  // console.log("id:", id);
  // console.log("data: ", data);

  const response = await privateApi.put(`/sale/saleItem/update/${id}`, data);
  return response.data;
};

export const deleteSaleItem = async (id) => {
  console.log(id);

  const response = await privateApi.delete(`/sale/saleItem/delete/${id}`);
  return response.data;
};

export const addWarrantyClaim = async (id, data) => {
  console.log(data);

  const response = await privateApi.post(`/warranty/add/${id}`, data);
  return response.data;
};

// ==========================================================================
export const fetchClaimWarranties = async ({ queryKey }) => {
  const [, { startDate = null, endDate = null } = {}] = queryKey;

  const response = await privateApi.get("/warranty/get/all", {
    params: { startDate, endDate },
  });
  // console.log(response.data);
  return response.data;
};

export const addClaimWarranty = async (data) => {
  const response = await privateApi.post(`/warranty/add`, data);
  // console.log(ClaimWarranties.parse(response.data));
  return response.data;
};

export const updateWarrantyClaim = async (id, data) => {
  // console.log("incoming: ", data);
  const response = await privateApi.put(`/warranty/claim/update/${id}`, data);
  // console.log(ClaimWarranties.parse(response.data));
  return response.data;
};

export const deleteClaimWarranty = async (id) => {
  await privateApi.delete(`/warranty/delete/${id}`);
};

export const resolveWarrantyClaim = async (id, data) => {
  await privateApi.put(`/warranty/claim/resolve/${id}`, data);
};
export const rejectWarrantyClaim = async (id, data) => {
  await privateApi.put(`/warranty/claim/reject/${id}`, data);
};

// ==========================================================================
export const fetchLedgerEntries = async ({ queryKey }) => {
  const [, { startDate = null, endDate = null } = {}] = queryKey;

  const response = await privateApi.get("/ledger/get/all", {
    params: { startDate, endDate },
  });
  // console.log(response.data);
  return response.data;
};

export const fetchEntityById = async (id) => {
  const response = await privateApi.get(`/ledger/get/${id}`);
  return response.data;
};

export const updateEntity = async (id, data) => {
  const response = await privateApi.put(`/ledger/update/${id}`, data);
  return response.data;
};

export const deleteEntity = async (id) => {
  await privateApi.delete(`/ledger/delete/${id}`);
};
export const deleteLedger = async (id) => {
  await privateApi.delete(`/ledger/delete/${id}`);
};
// ==========================================================================

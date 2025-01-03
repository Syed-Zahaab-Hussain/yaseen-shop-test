import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// ----------------------------------------------------------------

import authRoute, { verifyJWT } from "./routes/authRoute.js";
import supplierRoute from "./routes/supplierRoute.js";
import warrantyRoute from "./routes/warrantyRoute.js";
import productRoute from "./routes/productRoute.js";
import purchaseRoute from "./routes/purchaseRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import customerRoute from "./routes/customerRoute.js";
import salesRoute from "./routes/salesRoute.js";
import ledgerRoute from "./routes/ledgerRoute.js";
// Seeds
import seedCategories from "./seed/seedCategories.js";
import seedSuppliers from "./seed/seedSuppliers.js";
import seedProducts from "./seed/seedProducts&User.js";

// ----------------------------------------------------------------

const allowedDomains = process.env.BASE_URL.split(",");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedDomains,
    credentials: true,
  })
);

// -------------------Run this Function after reseting the database---------------------

async function initializeDatabase() {
  const initCheck = await prisma.user.findFirst({
    where: { id: 1001 },
  });

  if (!initCheck) {
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Entity_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Sale_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "SaleItem_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Purchase_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "PurchaseItem_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Warranty_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Claim_id_seq" RESTART WITH 1001;`;
    await prisma.$executeRaw`ALTER SEQUENCE "LedgerEntry_id_seq" RESTART WITH 1001;`;
    console.log("Database initialized with custom sequence start value.");

    const seedCategoriesResult = await seedCategories();
    if (seedCategoriesResult) console.log("Categories seeded successfully.");

    const seedSuppliersResult = await seedSuppliers();
    if (seedSuppliersResult) console.log("Suppliers seeded successfully.");

    const seedProductsResult = await seedProducts();
    if (seedProductsResult) console.log("Products seeded successfully.");
  } else {
    console.log("Database already initialized.");
  }
}

initializeDatabase()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

// ----------------------------------------------------------------

app.use("/api/auth", authRoute);
app.use("/api/category", verifyJWT, categoryRoute);
app.use("/api/product", verifyJWT, productRoute);
app.use("/api/purchase", verifyJWT, purchaseRoute);
app.use("/api/supplier", verifyJWT, supplierRoute);
app.use("/api/warranty", verifyJWT, warrantyRoute);
app.use("/api/customer", verifyJWT, customerRoute);
app.use("/api/sale", verifyJWT, salesRoute);
app.use("/api/ledger", verifyJWT, ledgerRoute);

// ----------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

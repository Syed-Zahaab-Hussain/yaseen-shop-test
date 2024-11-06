import express from "express";
import { PrismaClient } from "@prisma/client";
import { parseISO } from "date-fns";

const router = express.Router();
const prisma = new PrismaClient();

// Utility function to generate unique barcode
async function generateUniqueBarcode(productId, date) {
  const dateStr = date.slice(0, 10).replace(/-/g, "");
  const baseBarcode = `${productId}${dateStr}`;

  // Find existing barcodes for this product on this date
  const existingItems = await prisma.purchaseItem.findMany({
    where: {
      productId: parseInt(productId),
      barcode: {
        startsWith: baseBarcode,
      },
    },
    orderBy: {
      barcode: "desc",
    },
    take: 1,
  });

  // If no existing items, use sequence 1, otherwise increment the last sequence
  if (existingItems.length === 0) {
    return `${baseBarcode}1`;
  }

  const lastBarcode = existingItems[0].barcode;
  const lastSequence = parseInt(lastBarcode.slice(-1));
  return `${baseBarcode}${lastSequence + 1}`;
}

router.get("/get/all", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: parseISO(startDate),
          lte: parseISO(endDate),
        },
      };
    }

    // First, get all active purchases with their items and warranties
    const purchases = await prisma.purchase.findMany({
      where: {
        isActive: true,
        ...dateFilter,
      },
      include: {
        supplier: true,
        purchaseItems: {
          include: {
            product: true,
            warranty: true,
          },
        },
      },
    });

    // Check and update warranty status for each purchase item
    for (const purchase of purchases) {
      for (const item of purchase.purchaseItems) {
        if (item.warranty && item.warranty.status === "ACTIVE") {
          const purchaseDate = purchase.createdAt;
          const retailerWarrantyDuration =
            item.warranty.retailerWarrantyDuration;

          // Calculate warranty end date
          const warrantyEndDate = new Date(purchaseDate);
          warrantyEndDate.setMonth(
            warrantyEndDate.getMonth() + Math.floor(retailerWarrantyDuration)
          );

          // If current date is past warranty end date, update warranty status
          if (new Date() > warrantyEndDate) {
            await prisma.warranty.update({
              where: {
                id: item.warranty.id,
              },
              data: {
                status: "EXPIRED",
              },
            });

            // Update the warranty status in the current response data
            item.warranty.status = "EXPIRED";
          }
        }
      }
    }

    res.json(purchases || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching purchases" });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchase.findUnique({
      where: {
        id: parseInt(id),
        isActive: true,
      },
      include: {
        supplier: true,
        purchaseItems: {
          where: { isActive: true },
          include: {
            product: true,
            warranty: {
              include: {
                claims: true,
              },
            },
          },
        },
      },
    });

    res.json(purchase ? purchase : {});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching purchases" });
  }
});

router.post("/add", async (req, res) => {
  const {
    supplierId,
    date,
    totalAmount,
    paymentMethod,
    paidAmount,
    purchaseItems,
    proofOfPurchase,
  } = req.body;

  const createdAt = date ? parseISO(date) : new Date();

  try {
    const newPurchase = await prisma.$transaction(async (prisma) => {
      // Generate unique barcodes for all items first
      const itemsWithBarcodes = await Promise.all(
        purchaseItems.map(async (item) => ({
          ...item,
          barcode: await generateUniqueBarcode(
            item.productId,
            createdAt.toISOString()
          ),
        }))
      );

      // Create the purchase with the generated barcodes
      const purchase = await prisma.purchase.create({
        data: {
          entityId: parseInt(supplierId),
          createdAt,
          totalAmount: parseFloat(totalAmount),
          paymentMethod,
          paidAmount: parseFloat(paidAmount),
          proofOfPurchase,
          purchaseItems: {
            create: itemsWithBarcodes.map((item) => ({
              productId: parseInt(item.productId),
              initialQuantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              salePrice: parseFloat(item.salePrice),
              barcode: item.barcode,
              createdAt,
              warranty:
                item.retailerWarrantyDuration || item.customerWarrantyDuration
                  ? {
                      create: {
                        retailerWarrantyDuration: parseFloat(
                          item.retailerWarrantyDuration
                        ),
                        customerWarrantyDuration: parseFloat(
                          item.customerWarrantyDuration
                        ),
                        status: "ACTIVE",
                        createdAt,
                      },
                    }
                  : undefined,
            })),
          },
        },
        include: {
          purchaseItems: {
            include: {
              warranty: true,
            },
          },
          supplier: true,
        },
      });

      // Calculate remaining or overpaid amounts
      const totalAmountFloat = parseFloat(totalAmount);
      const paidAmountFloat = parseFloat(paidAmount);
      const remainingAmount =
        totalAmountFloat > paidAmountFloat
          ? totalAmountFloat - paidAmountFloat
          : 0;
      const overpaidAmount =
        paidAmountFloat > totalAmountFloat
          ? paidAmountFloat - totalAmountFloat
          : 0;

      // Create the ledger entry
      const ledgerEntry = await prisma.ledgerEntry.create({
        data: {
          entityId: parseInt(supplierId),
          createdAt,
          description: `Purchase of goods from supplier #${supplierId}`,
          totalAmount: totalAmountFloat,
          receivedAmount: paidAmountFloat,
          remainingAmount,
          overpaidAmount,
        },
      });

      return { purchase, ledgerEntry };
    });

    res.status(201).json(newPurchase);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to create purchase and ledger entry" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier: { id: supplierId },
      createdAt: date,
      paidAmount,
      paymentMethod,
    } = req.body;

    console.log(date);

    const updatedAt = date ? parseISO(date) : new Date();

    // Fetch the original purchase to check if the supplier has changed and get the totalAmount
    const originalPurchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchaseItems: true,
      },
    });

    if (!originalPurchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const totalAmountFloat = originalPurchase.totalAmount;
    const paidAmountFloat = parseFloat(paidAmount);

    const remainingAmount =
      totalAmountFloat > paidAmountFloat
        ? totalAmountFloat - paidAmountFloat
        : 0;
    const overpaidAmount =
      paidAmountFloat > totalAmountFloat
        ? paidAmountFloat - totalAmountFloat
        : 0;

    const updatedPurchase = await prisma.$transaction(async (prisma) => {
      const purchase = await prisma.purchase.update({
        where: { id: parseInt(id), isActive: true },
        data: {
          entityId: supplierId,
          createdAt: updatedAt,
          updatedAt,
          paidAmount: paidAmountFloat,
          paymentMethod,
        },
        include: {
          supplier: true,
          purchaseItems: { include: { product: true } },
        },
      });

      const ledgerEntry = await prisma.ledgerEntry.upsert({
        where: { id: purchase.entityId },
        create: {
          entityId: supplierId,
          createdAt: updatedAt,
          description: `Updated purchase of goods from supplier #${supplierId}`,
          totalAmount: totalAmountFloat,
          receivedAmount: paidAmountFloat,
          remainingAmount,
          overpaidAmount,
        },
        update: {
          updatedAt,
          totalAmount: totalAmountFloat,
          receivedAmount: paidAmountFloat,
          remainingAmount,
          overpaidAmount,
        },
      });

      return { purchase, ledgerEntry };
    });

    res.json(updatedPurchase);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating purchase" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAt = new Date();

    await prisma.$transaction(async (prisma) => {
      await prisma.purchase.update({
        where: { id: parseInt(id), isActive: true },
        data: {
          isActive: false,
          deletedAt,
          purchaseItems: {
            updateMany: {
              where: { isActive: true },
              data: {
                isActive: false,
                deletedAt,
              },
            },
          },
        },
      });
    });

    res.json({ message: "Purchase and associated items deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting purchase and its items" });
  }
});

router.post("/purchaseItem/add", async (req, res) => {
  const {
    purchaseId,
    productId,
    quantity,
    unitPrice,
    salePrice,
    retailerWarrantyDuration,
    customerWarrantyDuration,
    date,
  } = req.body;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(purchaseId) },
    });

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }
    const createdAt = purchase.createdAt;

    const barcode = await generateUniqueBarcode(
      productId,
      createdAt.toISOString()
    );

    const newPurchaseItem = await prisma.purchaseItem.create({
      data: {
        purchaseId: parseInt(purchaseId),
        productId: parseInt(productId),
        initialQuantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        salePrice: parseFloat(salePrice),
        barcode,
        createdAt,
        warranty:
          retailerWarrantyDuration || customerWarrantyDuration
            ? {
                create: {
                  retailerWarrantyDuration: parseFloat(
                    retailerWarrantyDuration
                  ),
                  customerWarrantyDuration: parseFloat(
                    customerWarrantyDuration
                  ),
                  status: "ACTIVE",
                  createdAt,
                },
              }
            : undefined,
      },
      include: { product: true },
    });

    res.status(201).json(newPurchaseItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create purchase item" });
  }
});

const validateId = (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error("Invalid ID provided");
  }
  return parseInt(id);
};

const updatePurchaseAndLedger = async (
  prisma,
  purchaseId,
  supplierId,
  updatedAt,
  paidAmount
) => {
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { purchaseId, isActive: true },
  });

  const newTotalAmount = purchaseItems.reduce(
    (total, item) => total + item.unitPrice * item.initialQuantity,
    0
  );

  const updatedPurchase = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      totalAmount: newTotalAmount,
      updatedAt,
    },
  });

  if (supplierId) {
    await prisma.ledgerEntry.updateMany({
      where: {
        entityId: supplierId,
        isActive: true,
      },
      data: {
        totalAmount: newTotalAmount,
        remainingAmount: newTotalAmount - (paidAmount || 0),
        updatedAt,
      },
    });
  }

  return updatedPurchase;
};

router.put("/purchaseItem/update/:id", async (req, res) => {
  try {
    const id = validateId(req.params.id);
    const {
      purchaseId,
      productId,
      initialQuantity,
      unitPrice,
      salePrice,
      warranty,
      date,
    } = req.body;

    const updatedAt = date ? parseISO(date) : new Date();

    if (
      !purchaseId ||
      !productId ||
      !initialQuantity ||
      !unitPrice ||
      !salePrice
    ) {
      throw new Error("Missing required fields");
    }

    const result = await prisma.$transaction(async (prisma) => {
      const existingItem = await prisma.purchaseItem.findUnique({
        where: { id },
        include: {
          warranty: true,
          purchase: { include: { supplier: true } },
        },
      });

      if (!existingItem) throw new Error("Purchase item not found");
      if (existingItem.soldQuantity > 0)
        throw new Error("Cannot update sold items");

      const [product, purchase] = await Promise.all([
        prisma.product.findUnique({ where: { id: parseInt(productId) } }),
        prisma.purchase.findUnique({ where: { id: parseInt(purchaseId) } }),
      ]);

      if (!product || !purchase) throw new Error("Related records not found");

      const warrantyData = warranty
        ? {
            warranty: {
              [existingItem.warranty ? "update" : "create"]: {
                retailerWarrantyDuration: parseFloat(
                  warranty.retailerWarrantyDuration
                ),
                customerWarrantyDuration: parseFloat(
                  warranty.customerWarrantyDuration
                ),
                status: "ACTIVE",
                updatedAt,
              },
            },
          }
        : {};

      const updatedItem = await prisma.purchaseItem.update({
        where: { id },
        data: {
          purchaseId: parseInt(purchaseId),
          productId: parseInt(productId),
          initialQuantity: parseInt(initialQuantity),
          unitPrice: parseFloat(unitPrice),
          salePrice: parseFloat(salePrice),
          updatedAt,
          ...warrantyData,
        },
        include: { product: true, warranty: true, purchase: true },
      });

      const updatedPurchase = await updatePurchaseAndLedger(
        prisma,
        purchase.id,
        existingItem.purchase.supplier?.id,
        updatedAt,
        purchase.paidAmount
      );

      return { purchaseItem: updatedItem, purchase: updatedPurchase };
    });

    res.json({
      success: true,
      data: result,
      message: "Purchase item updated successfully",
    });
  } catch (error) {
    console.error("Purchase item update error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/purchaseItem/delete/:id", async (req, res) => {
  try {
    const id = validateId(req.params.id);
    const deletedAt = new Date();

    const result = await prisma.$transaction(async (prisma) => {
      const purchaseItem = await prisma.purchaseItem.findUnique({
        where: { id, isActive: true },
        include: {
          purchase: { include: { supplier: true } },
          warranty: true,
        },
      });

      if (!purchaseItem) throw new Error("Purchase item not found");
      if (purchaseItem.soldQuantity > 0)
        throw new Error("Cannot delete sold items");

      // Soft delete warranty and purchase item
      if (purchaseItem.warranty) {
        await prisma.warranty.update({
          where: { id: purchaseItem.warranty.id },
          data: {
            isActive: false,
            deletedAt,
          },
        });
      }

      await prisma.purchaseItem.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt,
        },
      });

      // Update purchase and ledger
      const updatedPurchase = await updatePurchaseAndLedger(
        prisma,
        purchaseItem.purchaseId,
        purchaseItem.purchase.supplier?.id,
        deletedAt,
        purchaseItem.purchase.paidAmount
      );

      return { purchaseItem, updatedPurchase };
    });

    res.json({
      success: true,
      data: result,
      message: "Purchase item deleted successfully",
    });
  } catch (error) {
    console.error("Purchase item deletion error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

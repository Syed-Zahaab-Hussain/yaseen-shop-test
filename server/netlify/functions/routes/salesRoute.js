import express from "express";
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const router = express.Router();
const prisma = new PrismaClient();

// -----------------------------------------------------------------------------------------
// -----------------------------SALES MANAGEMENT--------------------------------------------
// -----------------------------------------------------------------------------------------

// ---------------------GET receipt data from sale table--------------------
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

    const sales = await prisma.sale.findMany({
      where: {
        isActive: true,
        ...dateFilter,
      },
      include: {
        customer: true,
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(sales || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching sales" });
  }
});

// ---------------------GET SaleItem data from sale table--------------------
router.get("/get/:saleId", async (req, res) => {
  try {
    const { saleId } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(saleId), isActive: true },
      include: {
        customer: true,
        saleItems: {
          where: { isActive: true },
          include: {
            product: true,
            warranty: true,
          },
        },
      },
    });

    res.json(sale ? sale : {});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/barcode/get/:barcode", async (req, res) => {
  const { barcode } = req.params;
  // console.log(barcode);

  try {
    const productFound = await prisma.purchaseItem.findUnique({
      where: { barcode, isActive: true },
      include: { product: true },
    });

    if (productFound) {
      return res.status(200).json(productFound);
    } else {
      return res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to scan barcode" });
  }
});

// router.post("/add", async (req, res) => {
//   console.log(req.body);

//   const {
//     saleItems,
//     customerInfo,
//     paymentMethod,
//     totalAmount,
//     receivedAmount,
//     discount,
//     debt,
//     date,
//   } = req.body;

//   const createdAt = date ? new Date(date) : new Date();

//   try {
//     const result = await prisma.$transaction(async (prisma) => {
//       // Create or update customer
//       let customer;
//       if (customerInfo.id) {
//         customer = await prisma.entity.update({
//           where: { id: customerInfo.id },
//           data: {
//             name: customerInfo.name,
//             customerType: customerInfo.type,
//             email: customerInfo.email,
//             contact: customerInfo.contact,
//             address: customerInfo.address,
//             updatedAt: createdAt,
//           },
//         });
//       } else {
//         customer = await prisma.entity.create({
//           data: {
//             name: customerInfo.name,
//             customerType: customerInfo.type,
//             email: customerInfo.email,
//             contact: customerInfo.contact,
//             address: customerInfo.address,
//             type: "CUSTOMER",
//             createdAt,
//             updatedAt: createdAt,
//           },
//         });
//       }

//       // Create sale
//       const sale = await prisma.sale.create({
//         data: {
//           entityId: customer.id,
//           totalAmount,
//           paymentMethod,
//           receivedAmount,
//           discount,
//           debtRepaymentDate: debt > 0 ? addDays(createdAt, 30) : null,
//           createdAt,
//           updatedAt: createdAt,
//           saleItems: {
//             create: saleItems.map((item) => ({
//               productId: item.productId,
//               quantity: item.quantity,
//               salePrice: item.salePrice,
//               totalPrice: item.totalPrice,
//               purchaseItemId: item.purchaseItemId,
//               createdAt,
//               updatedAt: createdAt,
//             })),
//           },
//         },
//         include: {
//           saleItems: true,
//           customer: true,
//         },
//       });

//       // Update product quantities and handle warranties
//       for (const item of saleItems) {
//         await prisma.purchaseItem.update({
//           where: { id: item.purchaseItemId },
//           data: {
//             soldQuantity: {
//               increment: item.quantity,
//             },
//             updatedAt: createdAt,
//           },
//         });

//         const saleItem = sale.saleItems.find(
//           (si) => si.purchaseItemId === item.purchaseItemId
//         );

//         const warranty = await prisma.warranty.findUnique({
//           where: { purchaseItemId: item.purchaseItemId },
//         });

//         if (warranty) {
//           await prisma.warranty.create({
//             data: {
//               saleItemId: saleItem.id,
//               retailerWarrantyDuration: warranty.retailerWarrantyDuration,
//               customerWarrantyDuration: warranty.customerWarrantyDuration,
//               createdAt,
//               updatedAt: createdAt,
//             },
//           });
//         }
//       }

//       return sale;
//     });

//     res.status(201).json(result);
//   } catch (error) {
//     console.error("Error creating sale:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating the sale." });
//   }
// });

router.post("/add", async (req, res) => {
  const {
    saleItems,
    customerInfo,
    paymentMethod,
    totalAmount,
    receivedAmount,
    discount,
    debt,
    date,
  } = req.body;

  const createdAt = date ? new Date(date) : new Date();

  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Create or update customer
      let customer;
      if (customerInfo.id) {
        customer = await prisma.entity.update({
          where: { id: customerInfo.id },
          data: {
            name: customerInfo.name,
            customerType: customerInfo.type,
            email: customerInfo.email,
            contact: customerInfo.contact,
            address: customerInfo.address,
            updatedAt: createdAt,
          },
        });
      } else {
        customer = await prisma.entity.create({
          data: {
            name: customerInfo.name,
            customerType: customerInfo.type,
            email: customerInfo.email,
            contact: customerInfo.contact,
            address: customerInfo.address,
            type: "CUSTOMER",
            createdAt,
            updatedAt: createdAt,
          },
        });
      }

      // Create sale
      const sale = await prisma.sale.create({
        data: {
          entityId: customer.id,
          totalAmount,
          paymentMethod,
          receivedAmount,
          discount,
          debtRepaymentDate: debt > 0 ? addDays(createdAt, 30) : null,
          createdAt,
          updatedAt: createdAt,
          saleItems: {
            create: saleItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              salePrice: item.salePrice,
              totalPrice: item.totalPrice,
              purchaseItemId: item.purchaseItemId,
              createdAt,
              updatedAt: createdAt,
            })),
          },
        },
        include: {
          saleItems: true,
          customer: true,
        },
      });

      // Create ledger entry if there's a debt or payment
      if (totalAmount > 0) {
        await prisma.ledgerEntry.create({
          data: {
            entityId: customer.id,
            description: `Sale ID: ${sale.id}`,
            totalAmount,
            receivedAmount,
            remainingAmount: debt,
            overpaidAmount: Math.max(
              receivedAmount - (totalAmount - discount),
              0
            ),
            createdAt,
            updatedAt: createdAt,
          },
        });
      }

      // Update product quantities and handle warranties
      for (const item of saleItems) {
        await prisma.purchaseItem.update({
          where: { id: item.purchaseItemId },
          data: {
            soldQuantity: {
              increment: item.quantity,
            },
            updatedAt: createdAt,
          },
        });

        const saleItem = sale.saleItems.find(
          (si) => si.purchaseItemId === item.purchaseItemId
        );

        const warranty = await prisma.warranty.findUnique({
          where: { purchaseItemId: item.purchaseItemId },
        });

        if (warranty) {
          await prisma.warranty.create({
            data: {
              saleItemId: saleItem.id,
              retailerWarrantyDuration: warranty.retailerWarrantyDuration,
              customerWarrantyDuration: warranty.customerWarrantyDuration,
              createdAt,
              updatedAt: createdAt,
            },
          });
        }
      }

      return sale;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating sale:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the sale." });
  }
});
// router.put("/update/:id", async (req, res) => {
//   const { id } = req.params;

//   console.log(req.body);

//   const {
//     customer,
//     createdAt: date,
//     totalAmount,
//     receivedAmount,
//     discount,
//     paymentMethod,
//   } = req.body;

//   const updatedAt = date ? new Date(date) : new Date();

//   try {
//     const result = await prisma.$transaction(async (prisma) => {
//       const existingSale = await prisma.sale.findUnique({
//         where: { id: parseInt(id) },
//         include: {
//           customer: true,
//         },
//       });

//       if (!existingSale) {
//         throw new Error("Sale not found");
//       }

//       if (customer && customer.id) {
//         await prisma.entity.update({
//           where: { id: customer.id },
//           data: {
//             name: customer.name,
//             customerType: customer.customerType,
//             email: customer.email,
//             contact: customer.contact,
//             address: customer.address,
//             createdAt: updatedAt,
//             updatedAt: updatedAt,
//           },
//         });
//       }

//       const newDebt = Math.max(0, totalAmount - discount - receivedAmount);
//       const hadDebt =
//         existingSale.totalAmount - existingSale.receivedAmount > 0;

//       const updatedSale = await prisma.sale.update({
//         where: { id: parseInt(id) },
//         data: {
//           entityId: customer?.id || existingSale.entityId,
//           totalAmount,
//           receivedAmount,
//           discount,
//           paymentMethod,
//           debtRepaymentDate:
//             newDebt > 0 && !hadDebt
//               ? addDays(updatedAt, 30)
//               : newDebt === 0
//               ? null
//               : existingSale.debtRepaymentDate,
//           updatedAt,
//         },
//         include: {
//           customer: true,
//           saleItems: {
//             include: {
//               product: true,
//               warranty: true,
//             },
//           },
//         },
//       });

//       const existingLedgerEntry = await prisma.ledgerEntry.findFirst({
//         where: {
//           entityId: customer?.id || existingSale.entityId,
//           createdAt: existingSale.createdAt,
//         },
//       });

//       if (existingLedgerEntry) {
//         await prisma.ledgerEntry.update({
//           where: { id: existingLedgerEntry.id },
//           data: {
//             totalAmount,
//             receivedAmount,
//             remainingAmount: newDebt,
//             overpaidAmount: Math.max(
//               0,
//               receivedAmount - (totalAmount - discount)
//             ),
//             createdAt: updatedAt,
//             updatedAt,
//           },
//         });
//       } else if (newDebt > 0) {
//         await prisma.ledgerEntry.create({
//           data: {
//             entityId: customer?.id || existingSale.entityId,
//             description: `Sale ID: ${id}`,
//             totalAmount,
//             receivedAmount,
//             remainingAmount: newDebt,
//             overpaidAmount: 0,
//             createdAt: updatedAt,
//             updatedAt: updatedAt,
//           },
//         });
//       }

//       return updatedSale;
//     });

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error updating sale:", error);
//     res.status(500).json({
//       error: "An error occurred while updating the sale.",
//       details: error.message,
//     });
//   }
// });

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;

  const {
    customer,
    createdAt: date,
    totalAmount,
    receivedAmount,
    discount,
    paymentMethod,
  } = req.body;

  const newDate = date ? new Date(date) : new Date();

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const existingSale = await prisma.sale.findUnique({
        where: { id: parseInt(id) },
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
              warranty: true,
            },
          },
        },
      });

      if (!existingSale) {
        throw new Error("Sale not found");
      }

      // Update customer if provided
      if (customer && customer.id) {
        await prisma.entity.update({
          where: { id: customer.id },
          data: {
            name: customer.name,
            customerType: customer.customerType,
            email: customer.email,
            contact: customer.contact,
            address: customer.address,
            updatedAt: newDate,
          },
        });
      }

      const newDebt = Math.max(0, totalAmount - discount - receivedAmount);
      const hadDebt =
        existingSale.totalAmount - existingSale.receivedAmount > 0;

      // Update sale with new dates
      const updatedSale = await prisma.sale.update({
        where: { id: parseInt(id) },
        data: {
          entityId: customer?.id || existingSale.entityId,
          totalAmount,
          receivedAmount,
          discount,
          paymentMethod,
          debtRepaymentDate:
            newDebt > 0 && !hadDebt
              ? addDays(newDate, 30)
              : newDebt === 0
              ? null
              : existingSale.debtRepaymentDate,
          createdAt: newDate,
          updatedAt: newDate,
        },
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
              warranty: true,
            },
          },
        },
      });

      // Update all related saleItems
      await Promise.all(
        existingSale.saleItems.map(async (item) => {
          await prisma.saleItem.update({
            where: { id: item.id },
            data: {
              createdAt: newDate,
              updatedAt: newDate,
            },
          });

          // Update warranty if exists
          if (item.warranty) {
            await prisma.warranty.update({
              where: { id: item.warranty.id },
              data: {
                createdAt: newDate,
                updatedAt: newDate,
              },
            });
          }
        })
      );

      // Handle ledger entry
      const existingLedgerEntry = await prisma.ledgerEntry.findFirst({
        where: {
          entityId: customer?.id || existingSale.entityId,
          createdAt: existingSale.createdAt,
        },
      });

      if (existingLedgerEntry) {
        await prisma.ledgerEntry.update({
          where: { id: existingLedgerEntry.id },
          data: {
            totalAmount,
            receivedAmount,
            remainingAmount: newDebt,
            overpaidAmount: Math.max(
              0,
              receivedAmount - (totalAmount - discount)
            ),
            createdAt: newDate,
            updatedAt: newDate,
          },
        });
      } else if (newDebt > 0) {
        await prisma.ledgerEntry.create({
          data: {
            entityId: customer?.id || existingSale.entityId,
            description: `Sale ID: ${id}`,
            totalAmount,
            receivedAmount,
            remainingAmount: newDebt,
            overpaidAmount: 0,
            createdAt: newDate,
            updatedAt: newDate,
          },
        });
      }

      return updatedSale;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({
      error: "An error occurred while updating the sale.",
      details: error.message,
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const deletedAt = new Date();

  try {
    await prisma.$transaction(async (prisma) => {
      // First get all saleItems for this sale to update purchase items
      const saleItems = await prisma.saleItem.findMany({
        where: {
          saleId: parseInt(id),
          isActive: true,
        },
        include: {
          purchaseItem: true,
        },
      });

      // Update each associated purchaseItem's soldQuantity
      for (const saleItem of saleItems) {
        await prisma.purchaseItem.update({
          where: { id: saleItem.purchaseItemId },
          data: {
            soldQuantity: {
              decrement: saleItem.quantity,
            },
            updatedAt: deletedAt,
          },
        });
      }

      // Soft delete all saleItems
      await prisma.saleItem.updateMany({
        where: { saleId: parseInt(id) },
        data: {
          isActive: false,
          deletedAt,
          updatedAt: deletedAt,
        },
      });

      // Soft delete the sale
      await prisma.sale.update({
        where: { id: parseInt(id) },
        data: {
          isActive: false,
          deletedAt,
          updatedAt: deletedAt,
        },
      });

      // If there's a related ledger entry, update it
      await prisma.ledgerEntry.updateMany({
        where: {
          description: {
            contains: `Sale #${id}`,
          },
          isActive: true,
        },
        data: {
          isActive: false,
          updatedAt: deletedAt,
        },
      });
    });

    res.json({ message: "Sales transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete sales transaction" });
  }
});

router.put("/saleItem/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, date } = req.body;
    const updatedAt = date ? new Date(date) : new Date();

    const saleItem = await prisma.saleItem.findUnique({
      where: { id: parseInt(id) },
      include: { sale: true },
    });

    if (!saleItem) {
      return res.status(404).json({ error: "Sale item not found" });
    }

    const newTotalPrice = saleItem.salePrice * parseInt(quantity);

    await prisma.saleItem.update({
      where: { id: saleItem.id },
      data: {
        quantity: parseInt(quantity),
        totalPrice: newTotalPrice,
        updatedAt,
      },
    });

    const saleItems = await prisma.saleItem.findMany({
      where: { id: saleItem.saleId },
    });

    const newTotalAmount = saleItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const updatedSale = await prisma.sale.update({
      where: { id: saleItem.saleId },
      data: {
        totalAmount: newTotalAmount,
        updatedAt,
      },
    });

    await prisma.ledgerEntry.updateMany({
      where: { entityId: updatedSale.customerId },
      data: {
        totalAmount: newTotalAmount,
        remainingAmount: newTotalAmount - saleItem.sale.receivedAmount,
        updatedAt,
      },
    });

    res.json({ message: "Sale and associated records updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to update sale" });
  }
});

router.delete("/saleItem/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAt = new Date();

    await prisma.$transaction(async (prisma) => {
      // First get the saleItem with its related sale and purchaseItem
      const saleItem = await prisma.saleItem.findUnique({
        where: { id: parseInt(id) },
        include: {
          sale: true,
          purchaseItem: true,
        },
      });

      if (!saleItem) {
        return res.status(404).json({ error: "SaleItem not found" });
      }

      // Update the purchaseItem's soldQuantity
      await prisma.purchaseItem.update({
        where: { id: saleItem.purchaseItemId },
        data: {
          soldQuantity: {
            decrement: saleItem.quantity,
          },
          updatedAt: deletedAt,
        },
      });

      // Soft delete the saleItem
      await prisma.saleItem.update({
        where: { id: parseInt(id) },
        data: {
          isActive: false,
          deletedAt,
          updatedAt: deletedAt,
        },
      });

      // Update the sale's totalAmount
      await prisma.sale.update({
        where: { id: saleItem.saleId },
        data: {
          totalAmount: {
            decrement: saleItem.totalPrice,
          },
          updatedAt: deletedAt,
        },
      });

      // If there's a related ledger entry, update it
      await prisma.ledgerEntry.updateMany({
        where: {
          description: {
            contains: `Sale #${saleItem.saleId}`,
          },
          isActive: true,
        },
        data: {
          totalAmount: {
            decrement: saleItem.totalPrice,
          },
          remainingAmount: {
            decrement: saleItem.totalPrice,
          },
          updatedAt: deletedAt,
        },
      });
    });

    res.json({ message: "SaleItem deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting SaleItem" });
  }
});

export default router;

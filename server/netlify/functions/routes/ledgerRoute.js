import express from "express";
import { PrismaClient } from "@prisma/client";
import { parseISO } from "date-fns";

const router = express.Router();
const prisma = new PrismaClient();

// -----------------------------------------------------------------------------

const dateObject = new Date();
let date = dateObject.toISOString();
// -----------------------------------------------------------------------------------------
// -----------------------------LEDGER ENTRY MANAGEMENT--------------------------------------------
// -----------------------------------------------------------------------------------------

// ---------------------Get all the customers info along with their transactions---------------
// router.get("/get/all", async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     let dateFilter = {};
//     if (startDate && endDate) {
//       createdAt = {
//         date: {
//           gte: parseISO(startDate),
//           lte: parseISO(endDate),
//         },
//       };
//     }

//     const ledgerEntries = await prisma.ledgerEntry.findMany({
//       where: {
//         isActive: true,
//         ...dateFilter,
//       },
//       include: {
//         entity: { where: { isActive: true } },
//       },
//     });

//     res.json(ledgerEntries || []);
//     console.log(ledgerEntries);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to retrieve ledger info" });
//   }
// });

router.get("/get/all", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        isActive: true,
        entity: {
          isActive: true,
        },
        ...dateFilter,
      },
      include: {
        entity: true,
      },
    });

    res.json(ledgerEntries || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve ledger info" });
  }
});

// ---------------------Get all Entity and their info along with their LedgerEntry---------------
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const entity = await prisma.entity.findUnique({
      where: { id: parseInt(id) },
      include: {
        ledger: true,
        sales: true,
        purchases: true,
      },
    });

    if (!entity) return res.status(404).json({ error: "Customer not found" });
    // console.log(entity);

    res.json(entity ? entity : {});
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve entity" });
  }
});

// ---------------------Update an Entity info------------------------
router.put("/update/:id", async (req, res) => {
  console.log(req.body);

  const { id } = req.params;
  const { name, contact, email, address } = req.body;
  // console.log("id", id);
  // console.log("wattage", wattage);

  try {
    const updatedCustomer = await prisma.entity.update({
      where: {
        id: parseInt(id),
        isActive: true,
      },
      data: {
        name,
        contact,
        email,
        address,
      },
      include: {
        sales: true,
      },
    });

    if (!updatedCustomer)
      return res.status(200).json({ message: "Customer not updated found" });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// -----------------------------------------------------------------------------------------

export default router;

import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
// -----------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// --------------------------SUPPLIER MANAGEMENT----------------------------------
// ------------------------------------------------------------------------------

// --------------------------Get all active Suppliers----------------------
router.get("/get/all", async (req, res) => {
  try {
    const suppliers = await prisma.entity.findMany({
      where: { isActive: true, type: "SUPPLIER" },
      include: { purchases: true },
    });

    res.json(suppliers ? suppliers : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Add supplier----------------------
router.post("/add", async (req, res) => {
  const { name, contact, address } = req.body;
  console.log(contact, address);

  try {
    const newSupplier = await prisma.entity.create({
      data: {
        name,
        contact,
        address,
        type: "SUPPLIER",
      },
    });
    res
      .status(201)
      .json({ supplier: newSupplier, message: "Supplier added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// --------------------------Update supplier information----------------------

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;

  const { name, contact, address } = req.body;

  try {
    const updatedSupplier = await prisma.entity.update({
      where: {
        id: parseInt(id),
        isActive: true,
      },
      data: {
        name,
        contact,
        address,
      },
    });

    if (!updatedSupplier)
      return res.status(200).json({ message: "Supplier not updated found" });

    res
      .status(200)
      .json({ updatedSupplier, message: "Supplier successfully updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Soft delete a category----------------------
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await prisma.entity.update({
      where: { id: parseInt(id) },
      data: { isActive: false, deletedAt: new Date() },
    });

    res.json({ supplier, message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(error);
    console.log(error);

    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------------------

export default router;

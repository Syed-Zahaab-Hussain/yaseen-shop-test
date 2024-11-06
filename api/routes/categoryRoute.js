import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ------------------------------------------------------------------------------
// --------------------------Category MANAGEMENT----------------------------------
// ------------------------------------------------------------------------------

// --------------------------Get all active categories----------------------
router.get("/get/all", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: true,
      },
    });
    // console.log(categories);

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Add category of product----------------------
router.post("/add", async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Update a category----------------------
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;

  const { name } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id: parseInt(id),
        isActive: true,
      },
      data: {
        name,
      },
    });

    if (!updatedCategory)
      return res.status(200).json({ message: "Category not updated found" });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Soft delete a category----------------------
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    const products = await prisma.product.updateMany({
      where: { categoryId: parseInt(id) },
      data: { isActive: false },
    });

    res.json({
      category,
      products,
      message: "Category and related products deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------------------
export default router;

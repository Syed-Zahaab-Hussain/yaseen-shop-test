import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
// -----------------------------------------------------------------------------

const dateObject = new Date();
let date = dateObject.toISOString();

// ------------------------------------------------------------------------------
// --------------------------PRODUCT MANAGEMENT----------------------------------
// ------------------------------------------------------------------------------

// --------------------------Get all active Products----------------------
router.get("/get/all", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        AND: [
          {
            purchaseItems: {
              some: {
                purchase: {
                  createdAt: {
                    gte: parseISO(startDate),
                    lte: parseISO(endDate),
                  },
                },
                isActive: true,
              },
            },
          },
        ],
      };
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...dateFilter,
      },
      include: {
        category: true,
        purchaseItems: {
          where: {
            isActive: true,
            purchase:
              startDate && endDate
                ? {
                    createdAt: {
                      gte: parseISO(startDate),
                      lte: parseISO(endDate),
                    },
                  }
                : undefined,
          },
          include: {
            purchase: {
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Retrieve details of a specific product by its ID.--------------------

router.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const productFound = await prisma.product.findUnique({
      where: {
        id,
        isActive: true,
      },
    });
    if (!productFound)
      return res.status(200).json({ message: "Products not found" });

    res.status(200).json({ productFound, message: "Product found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// --------------------------Add a new product to the inventory----------------------------------

router.post("/add", async (req, res) => {
  const { name, model, category, ampereHours, brand } = req.body;
  // console.log(name, type, model, ampereHours, brand);

  try {
    const productExist = await prisma.product.findFirst({
      where: {
        name,
        model,
        isActive: true,
      },
    });

    if (productExist) {
      return res.status(409).json({ error: "Product already exists" });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        model,
        categoryId: parseInt(category),
        ampereHours: parseInt(ampereHours),
        brand,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Update details of a specific product by its ID----------------------
router.put("/update/:id", async (req, res) => {
  console.log(req.body);

  const { id } = req.params;
  const { name, model, ampereHours, brand, categoryId } = req.body;
  // console.log("id", id);
  // console.log("ampereHours", ampereHours);

  try {
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id),
        isActive: true,
      },
      data: {
        name,
        model,
        ampereHours: parseFloat(ampereHours),
        brand,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    if (!updatedProduct)
      return res.status(200).json({ message: "Product not updated found" });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Remove a product from the inventory by its ID----------------------
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------------------
export default router;

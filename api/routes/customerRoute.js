import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
// -----------------------------------------------------------------------------

const dateObject = new Date();
let date = dateObject.toISOString();

// ------------------------------------------------------------------------------
// --------------------------CUSTOMER MANAGEMENT----------------------------------
// ------------------------------------------------------------------------------

// --------------------------Get all active Customers----------------------
router.get("/get/all", async (req, res) => {
  try {
    const customers = await prisma.entity.findMany({
      where: { isActive: true, type: "CUSTOMER" },
      include: {
        sales: true,
      },
    });

    res.json(customers ? customers : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Retrieve details of a specific customer by its data.--------------------

router.get("/get", async (req, res) => {
  const { name, email, contact, address } = req.query;
  //   console.log(req.body);

  //   console.log(name);

  try {
    const customersFound = await prisma.entity.findMany({
      where: {
        isActive: true,
        type: "CUSTOMER",
        OR: [
          { name: { contains: name, mode: "insensitive" } },
          { email: { contains: email, mode: "insensitive" } },
          { contact: { contains: contact, mode: "insensitive" } },
          { address: { contains: address, mode: "insensitive" } },
        ],
      },
    });
    // console.log(customersFound);

    if (customersFound.length === 0)
      return res.status(200).json({ message: "Customers not found" });

    res.status(200).json(customersFound ? customersFound : {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Add a new customer----------------------------------

router.post("/add", async (req, res) => {
  const { name, type, contact, email, address } = req.body;
  // console.log(name, type, contact, email, address );

  try {
    const newCustomer = await prisma.entity.create({
      data: {
        name,
        customerType: type,
        contact,
        email,
        address,
        type: "CUSTOMER",
      },
      include: {
        sales: true,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------Update details of a specific customer by its ID----------------------
router.put("/update/:id", async (req, res) => {
  console.log(req.body);

  const { id } = req.params;
  const { name, type, contact, email, address } = req.body;
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
        customerType: type,
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

// --------------------------Remove a customer from the inventory by its ID----------------------
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.entity.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------------------
export default router;

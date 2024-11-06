import express from "express";
import { PrismaClient } from "@prisma/client";
import { parseISO } from "date-fns";

const router = express.Router();
const prisma = new PrismaClient();
// -----------------------------------------------------------------------------

const dateObject = new Date();
let date = dateObject.toISOString();

// -----------------------------------------------------------------------------------------
// -----------------------------WARRANTY MANAGEMENT------------------------------------------
// -----------------------------------------------------------------------------------------

// --------------------------Retrieve all warranty claims-----------------------------------
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
    const ClaimWarranties = await prisma.warranty.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        claims: {
          some: {}, // Ensures only warranties with at least one claim are included
        },
        ...dateFilter,
      },
      include: {
        claims: true,
        saleItem: {
          include: {
            product: true,
          },
        },
        purchaseItem: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(ClaimWarranties || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Warranties" });
  }
});

// ---------------------Retrieve warranty details for a specific product--------------------
router.get("/warranty/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const warranty = await prisma.warranty.findMany({
      where: { id },
      include: { product: true, customer: true },
    });
    res.json({
      warranty,
      message: "Successfully Got the warranty",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve warranty" });
  }
});

// -----------Record a new warranty claim (either from a customer or for a supplier)-------------

router.post("/add/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  console.log(req.body);
  const { claimDate, claimQuantity, claimDetails, claimType } = req.body;

  try {
    // Validate the incoming data
    if (!claimDate || !claimQuantity || !claimDetails || !claimType) {
      return res.status(400).json({
        error:
          "All fields (claimDate, claimQuantity, claimDetails, claimType) are required",
      });
    }

    // Validate that the claimQuantity is a number
    const parsedClaimQuantity = parseInt(claimQuantity);
    if (isNaN(parsedClaimQuantity) || parsedClaimQuantity <= 0) {
      return res.status(400).json({
        error: "claimQuantity must be a valid positive number",
      });
    }

    // Ensure ID is a valid integer
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check if the warranty exists and is active
    const warranty = await prisma.warranty.findFirst({
      where: {
        id: parsedId,
        isActive: true,
        status: "ACTIVE",
      },
    });

    if (!warranty) {
      return res.status(404).json({ error: "Active warranty not found" });
    }

    // Create a new claim
    const newClaim = await prisma.claim.create({
      data: {
        warrantyId: parsedId,
        claimDate: new Date(claimDate),
        claimQuantity: parsedClaimQuantity,
        claimDetails,
        claimType,
        claimStatus: "PENDING",
      },
    });

    res.status(201).json(newClaim);
  } catch (error) {
    console.error("Error creating warranty claim:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Warranty not found" });
    }
    res.status(500).json({
      error: "Internal server error. Failed to create warranty claim",
    });
  }
});
// -------------------Claim warranty for a customer-----------------------------

router.put("/claim/resolve/:id", async (req, res) => {
  const { id } = req.params;
  const { claimResolveDate, claimResolveDetail } = req.body;

  if (!claimResolveDate || !claimResolveDetail) {
    return res.status(400).json({
      error:
        "Missing required fields: claimResolveDate and claimResolveDetail are required",
    });
  }

  try {
    const claimId = parseInt(id);

    // Fetch the claim and related entities within a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
      });

      if (!claim) throw new Error("Claim not found");
      if (claim.claimStatus !== "PENDING")
        throw new Error(
          `Cannot resolve claim that is already ${claim.claimStatus.toLowerCase()}`
        );

      // Update the claim's resolve details and status
      const updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: {
          claimStatus: "RESOLVED",
          claimResolveDate: new Date(claimResolveDate),
          claimResolveDetail,
          updatedAt: new Date(),
        },
      });

      return updatedClaim;
    });

    res.status(200).json({
      message: "Warranty claim resolved successfully",
      claim: result,
    });
  } catch (error) {
    console.error("Error resolving warranty claim:", error);
    res.status(500).json({
      error: "Failed to resolve warranty claim",
      details: error.message,
    });
  }
});

router.put("/claim/reject/:id", async (req, res) => {
  const { id } = req.params;
  const { claimRejectDate, claimRejectDetail } = req.body;

  try {
    const updatedClaim = await prisma.claim.update({
      where: {
        id: parseInt(id),
      },
      data: {
        claimStatus: "REJECTED",
        claimRejectDate: new Date(claimRejectDate),
        claimRejectDetail,
        updatedAt: new Date(),
      },
    });

    res.json(updatedClaim);
  } catch (error) {
    console.error("Error rejecting warranty claim:", error);
    res.status(500).json({
      message: "Failed to reject warranty claim",
      error: error.message,
    });
  }
});

// ---------------------Update the status of a warranty claim.--------------------
router.put("/warranty/:id", async (req, res) => {
  const { id } = req.params;
  const { status, claimDetails } = req.body;
  //   console.log(id, { status, claimDate: date, claimDetails });

  try {
    const updatedWarranty = await prisma.warranty.update({
      where: { id },
      data: { status, claimDate: date, claimDetails },
    });
    res
      .status(200)
      .json({ updatedWarranty, message: "Successfully claimed the warranty" });
  } catch (error) {
    // console.error(error);

    res.status(500).json({ error: "Failed to update warranty claim" });
  }
});

// ---------------------Soft Delete a warranty claim.--------------------

router.put("/claim/update/:id", async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { claimDate, claimQuantity, claimDetails } = req.body;

    // First, fetch the existing claim with warranty and related items
    const existingClaim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        warranty: {
          include: {
            purchaseItem: true,
            saleItem: true,
          },
        },
      },
    });

    if (!existingClaim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    // Validate claim date
    const purchaseDate = existingClaim.warranty.purchaseItem?.createdAt;
    const saleDate = existingClaim.warranty.saleItem?.createdAt;

    if (new Date(claimDate) < new Date(purchaseDate)) {
      return res.status(400).json({
        error: "Claim date cannot be before purchase date",
      });
    }

    if (
      existingClaim.warranty.saleItem &&
      new Date(claimDate) < new Date(saleDate)
    ) {
      return res.status(400).json({
        error: "Claim date cannot be before sale date",
      });
    }

    // Validate quantity
    const maxQuantity = existingClaim.warranty.saleItem
      ? existingClaim.warranty.saleItem.quantity
      : existingClaim.warranty.purchaseItem.initialQuantity;

    if (claimQuantity > maxQuantity) {
      return res.status(400).json({
        error: `Claim quantity cannot exceed ${maxQuantity}`,
      });
    }

    // Update the claim
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        claimDate: new Date(claimDate),
        claimQuantity: parseInt(claimQuantity),
        claimDetails,
        updatedAt: new Date(),
      },
    });

    res.json(updatedClaim);
  } catch (error) {
    console.error("Error updating claim:", error);
    res.status(500).json({ error: "Failed to update claim" });
  }
});

// ---------------------Soft Delete a warranty claim.--------------------
router.delete("/warranty/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.warranty.update({
      where: { id },
      data: { isActive: false, deletedAt: date },
    });
    res.status(204).json({ message: "Successful deleted the warranty" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete warranty claim" });
  }
});

// -----------------------------------------------------------------------------------------

export default router;

import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import upload from "../middleware/upload.js";
import {
  createQuotation,
  getUserQuotations,
  getQuotation,
  updateQuotation,
  requestRevision,
  // Admin Controller Functions
  getAllQuotations,
  adminGetQuotation,
  adminUpdateQuotationStatus,
  adminUploadQuotationPdf,
} from "../controllers/quotationController.js";

const router = express.Router();

// --- CLIENT (USER) ROUTES ---
// Protected by requireUser: Only logged-in travelers can access these
router.post("/create-quotation", requireUser, createQuotation);
router.get("/my-quotations", requireUser, getUserQuotations);
router.get("/get-quotation/:id", requireUser, getQuotation);
router.put("/:id", requireUser, updateQuotation); // For general updates
router.post("/:id/request-revision", requireUser, requestRevision);

// --- ADMIN (AGENCY) ROUTES ---
// Protected by requireAdmin: Only staff can access these
router.get("/all-quotations", requireAdmin, getAllQuotations);
router.get("/admin/:id", requireAdmin, adminGetQuotation);
router.put("/admin/:id/status", requireAdmin, adminUpdateQuotationStatus);

// PDF Upload for Revisions (Handled by Admin/Agents)
router.post(
  "/admin/:id/upload-pdf", 
  requireAdmin, 
  upload.single("pdf"), 
  adminUploadQuotationPdf
);

export default router;
import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import upload from "../middleware/upload.js";
import {
  adminGetQuotation,
  adminUpdateQuotationStatus,
  adminUploadQuotationPdf,
  createQuotation,
  getAllQuotations,
  getQuotation,
  getUserQuotations,
  requestRevision,
  updateQuotation,
} from "../controllers/quotationController.js";

const router = express.Router();

router.post("/create-quotation", requireUser, createQuotation);
router.get("/my-quotations", requireUser, getUserQuotations);
router.get("/all-quotations", getAllQuotations);
router.get("/admin/:id", adminGetQuotation);
router.get("/get-quotation/:id", requireUser, getQuotation);
router.put("/:id", requireUser, updateQuotation);
router.post("/:id/request-revision", requireUser, requestRevision);
router.put("/admin/:id/status", adminUpdateQuotationStatus);
router.post("/admin/:id/upload-pdf", upload.single("pdf"), adminUploadQuotationPdf);

export default router;

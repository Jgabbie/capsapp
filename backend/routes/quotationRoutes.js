import express from "express";
import requireUser from "../middleware/requireUser.js";
import upload from "../middleware/upload.js";
import {
  createQuotation,
  getUserQuotations,
  getQuotation,
  updateQuotation,
  requestRevision,
} from "../controllers/quotationController.js";

const router = express.Router();

// --- CLIENT (USER) ROUTES ---
// Protected by requireUser: Only logged-in customers can access these
router.post("/create-quotation", requireUser, createQuotation);
router.get("/my-quotations", requireUser, getUserQuotations);
router.get("/get-quotation/:id", requireUser, getQuotation);
router.put("/:id", requireUser, updateQuotation);
router.post("/:id/request-revision", requireUser, requestRevision);

export default router;
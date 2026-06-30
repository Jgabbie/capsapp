import express from "express";
import requireUser from "../middleware/requireUser.js";
import upload from "../middleware/upload.js";
import * as quotationController from "../controllers/quotationController.js";

const router = express.Router();

// --- CLIENT (USER) ROUTES ---
// Protected by requireUser: Only logged-in customers can access these
router.post("/create-quotation", requireUser, quotationController.createQuotation);
router.get("/my-quotations", requireUser, quotationController.getUserQuotations);
router.get("/get-quotation/:id", requireUser, quotationController.getQuotation);
router.put("/:id", requireUser, quotationController.updateQuotation);
router.post("/:id/request-revision", requireUser, quotationController.requestRevision);

export default router;
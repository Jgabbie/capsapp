import express from "express";
import multer from "multer";
import * as paymentmethodController from "../controllers/paymentmethodController.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/payment-methods",
});

router.get("/get-methods", paymentmethodController.getMethods);
router.post("/create-methods", upload.single("image"), paymentmethodController.createMethod);
router.put("/:id/update-methods", upload.single("image"), paymentmethodController.updateMethod);
router.delete("/:id/delete-methods", paymentmethodController.deleteMethod);

export default router;
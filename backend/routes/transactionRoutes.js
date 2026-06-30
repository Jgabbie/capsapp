import express from "express";
import * as transactionController from "../controllers/transactionController.js"; // Standard ESM Import
import requireUser from "../middleware/requireUser.js"; // Standard ESM Middleware

const router = express.Router();


router.post("/create-transaction", requireUser, transactionController.createTransaction);
router.get("/my-transactions", requireUser, transactionController.getUserTransactions);
router.get('/application/:applicationId', requireUser, transactionController.getTransactionsForApplication);


export default router;
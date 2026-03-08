import express from "express";
import requireUser from "../middleware/requireUser.js";
import { createTransaction, getUserTransactions } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/create-transaction", requireUser, createTransaction);
router.get("/my-transactions", requireUser, getUserTransactions);

export default router;

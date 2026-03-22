import express from "express";
import { 
    createTransaction, 
    getUserTransactions, 
    getAllTransactions, 
    updateTransaction, 
    deleteTransaction 
} from "../controllers/transactionController.js";
import requireUser from "../middleware/requireUser.js"; // Standard ESM Middleware

const router = express.Router();

// --- CREATE ---
// Both Web and Mobile hit this endpoint
router.post("/create-transaction", requireUser, createTransaction);

// --- READ (Client History) ---
// Mobile expects /my-transactions
router.get("/my-transactions", requireUser, getUserTransactions);

// Web expects /user-transactions (Legacy support so Web doesn't break)
router.get("/user-transactions", requireUser, getUserTransactions);

// --- READ (Admin) ---
router.get("/all-transactions", requireUser, getAllTransactions);

// --- UPDATE & DELETE (Admin/System) ---
router.put("/:id", requireUser, updateTransaction);
router.delete("/:id", requireUser, deleteTransaction);

export default router;
import Transaction from "../models/transaction.js";
import Booking from "../models/booking.js"; // 🔥 THIS IS THE FIX! Mongoose now knows what a Booking is.
import logAction from "../utils/logger.js"; // Assuming you have this utility

// --- Utility: Generate TX- Reference Number ---
const generateTransactionReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${timestamp}${random}`;
};

// --- CREATE: Supports both Web & Mobile ---
export const createTransaction = async (req, res) => {
    const userId = req.userId;
    // Mobile sends packageName; Web often sends packageId
    const { bookingId, packageId, amount, method, status, packageName } = req.body;

    try {
        // Validation check
        if (!bookingId || !amount || !method || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Safety: Prevent duplicate transactions for the same booking
        const existingTransaction = await Transaction.findOne({ bookingId, userId });
        if (existingTransaction) {
            return res.status(200).json(existingTransaction);
        }

        const transaction = await Transaction.create({
            reference: generateTransactionReference(),
            bookingId,
            packageId: packageId || null,
            userId,
            amount: Number(amount),
            method,
            status,
            packageName: packageName || "Custom Package", // Fallback if mobile doesn't send it
        });

        // Log the action for security auditing
        if (typeof logAction === 'function') {
            logAction('TRANSACTION_CREATED', userId, { transactionId: transaction._id });
        }

        return res.status(201).json(transaction);
    } catch (error) {
        console.error("Create Transaction Error:", error);
        return res.status(500).json({ message: "Error creating transaction", error: error.message });
    }
};


// --- CLIENT: Get User's Own History ---
export const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            // 🔥 THE JEDI MIND TRICK 🔥
            // By passing 'model: Booking', we bypass the string name check entirely!
            .populate({
                path: "bookingId",
                model: Booking, 
                select: "reference bookingDetails packageName packageId status"
            });

        return res.status(200).json(transactions);
    } catch (error) {
        console.log("TRANSACTION CRASH REASON:", error.message);
        return res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};

// --- ADMIN: Get All Global Transactions ---
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('userId', 'username email')
            .populate('packageId', 'packageName')
            .sort({ createdAt: -1 });

        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
    }
};

// --- ADMIN/SYSTEM: Update Transaction Details ---
export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { status, method, amount, packageName } = req.body;

    try {
        const updateFields = {
            ...(status && { status }),
            ...(method && { method }),
            ...(typeof amount === 'number' && { amount }),
            ...(packageName && { packageName })
        };

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (typeof logAction === 'function') {
            logAction('TRANSACTION_UPDATED', req.userId, { transactionId: id, status });
        }

        return res.status(200).json(updatedTransaction);
    } catch (error) {
        return res.status(500).json({ message: "Failed to update transaction", error: error.message });
    }
};

// --- ADMIN: Delete Transaction ---
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (typeof logAction === 'function') {
            logAction('TRANSACTION_DELETED', req.userId, { transactionId: id });
        }

        return res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete transaction", error: error.message });
    }
};
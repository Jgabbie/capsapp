import Transaction from "../models/transaction.js";
import Booking from "../models/booking.js";
import Package from "../models/package.js";
import logAction from "../utils/logger.js";


//generate unique transaction reference function
const generateTransactionReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${timestamp}${random}`;
};


//create transaction function
export const createTransaction = async (req, res) => {
    const userId = req.userId;
    const { bookingId, packageId, amount, method, status, packageName } = req.body;
    try {
        if (!bookingId || !amount || !method || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }
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
            packageName: packageName || "Custom Package",
        });

        logAction('TRANSACTION_CREATED', userId, { transactionId: transaction._id });

        return res.status(201).json(transaction);
    } catch (error) {
        console.error("Create Transaction Error:", error);
        return res.status(500).json({ message: "Error creating transaction", error: error.message });
    }
};


//get user transactions function
export const getUserTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            // THE JEDI MIND TRICK 2.0 (Nested Populate)
            // This is how we get the nested Package Name from inside Booking!
            .populate({
                path: "bookingId",
                model: Booking,
                select: "reference bookingDetails packageName packageId status",
                populate: { // Add this nested fill!
                    path: "packageId",
                    model: Package,
                    select: "packageName"
                }
            });
        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Transaction Fetch Error:", error.message);
        return res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};


//get transactions for a specific application function
export const getTransactionsForApplication = async (req, res) => {
    const userId = req.userId
    const { applicationId } = req.params
    try {
        const transactions = await Transaction.find({ userId, applicationId }).sort({ createdAt: -1 })
        res.status(200).json(transactions)
    } catch (error) {
        console.error("Transaction Fetch Error:", error.message);
        res.status(500).json({ message: "Failed to fetch transactions", error: error.message })
    }
}

export {
    createTransaction,
    getUserTransactions,
    getTransactionsForApplication
}


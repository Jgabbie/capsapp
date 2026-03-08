import Transaction from "../models/transaction.js";

const generateTransactionReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TR-${timestamp}${random}`;
};

export const createTransaction = async (req, res) => {
  const userId = req.userId;
  const { bookingId, amount, method, status, packageName } = req.body;

  try {
    if (!bookingId || !amount || !method || !status || !packageName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingTransaction = await Transaction.findOne({ bookingId, userId });
    if (existingTransaction) {
      return res.status(200).json(existingTransaction);
    }

    const transaction = await Transaction.create({
      reference: generateTransactionReference(),
      bookingId,
      userId,
      amount: Number(amount),
      method,
      status,
      packageName,
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).json({ message: "Error creating transaction", error: error.message });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate("bookingId", "reference bookingDetails");

    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

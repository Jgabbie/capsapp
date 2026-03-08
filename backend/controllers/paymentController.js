import { randomUUID } from "crypto";
import TokenCheckout from "../models/tokenCheckout.js";

export const createCheckoutToken = async (req, res) => {
  const userId = req.userId;
  const { totalPrice } = req.body;

  try {
    const numericTotal = Number(totalPrice || 0);
    if (!numericTotal || Number.isNaN(numericTotal)) {
      return res.status(400).json({ message: "Valid totalPrice is required" });
    }

    const token = randomUUID();

    await TokenCheckout.create({
      token,
      userId,
      totalPrice: numericTotal,
      createdAt: new Date(),
    });

    return res.status(201).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Error creating checkout token", error: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  const { checkoutToken, totalPrice, packageName, successUrl, cancelUrl } = req.body;

  try {
    if (!checkoutToken || !totalPrice) {
      return res.status(400).json({ message: "checkoutToken and totalPrice are required" });
    }

    const tokenRecord = await TokenCheckout.findOne({ token: checkoutToken });
    if (!tokenRecord) {
      return res.status(404).json({ message: "Invalid or expired checkout token" });
    }

    const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
    if (!payMongoSecret) {
      return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
    }

    const payload = {
      data: {
        attributes: {
          billing: {
            name: "CapsApp User",
            email: "capsapp@example.com",
          },
          line_items: [
            {
              name: packageName || "Tour Package",
              quantity: 1,
              amount: Number(totalPrice) * 100,
              currency: "PHP",
            },
          ],
          payment_method_types: ["card", "gcash", "grab_pay", "paymaya"],
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      },
    };

    const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${payMongoSecret}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ message: "PayMongo error", error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error creating checkout session", error: error.message });
  }
};

import crypto from "crypto";
import axios from "axios";
import dayjs from "dayjs";
import TokenCheckout from "../models/tokenCheckout.js";
import TokenCheckoutVisaModel from "../models/tokencheckoutvisa.js";
import TokenCheckoutPassportModel from "../models/tokencheckoutpassport.js";
import BookingModel from "../models/booking.js";
import TransactionModel from "../models/transaction.js";
import PackageModel from "../models/package.js";
import logAction from "../utils/logger.js";

const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BK-${timestamp}${random}`;
};

const generateTransactionReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${timestamp}${random}`;
};



export const createManualPaymentPassport = async (req, res) => {
    const userId = req.userId;
    try {
        const { packageId, travelDate, travelerTotal, amount, paymentType, proofImage, proofImageType, proofFileName, bookingDetails, bookingId } = req.body;

        let finalBookingId = bookingId;
        let bookingRef = "";

        // Handles creating the booking on the fly (Web compatibility) OR updating an existing one (Mobile)
        if (!bookingId && bookingDetails) {
            const booking = await BookingModel.create({
                packageId, userId, travelDate,
                bookingDate: new Date().toISOString(),
                travelers: travelerTotal ? Number(travelerTotal) : 1,
                reference: generateBookingReference(),
                status: 'Not Paid',
                bookingDetails
            });
            finalBookingId = booking._id;
            bookingRef = booking.reference;
        } else if (bookingId) {
            const booking = await BookingModel.findById(bookingId);
            if (booking) {
                booking.status = 'Not Paid';
                if (!booking.statusHistory) booking.statusHistory = [];
                booking.statusHistory.push({ status: 'Not Paid', changedAt: new Date() });
                await booking.save();
                bookingRef = booking.reference;
            }
        }

        if (!finalBookingId) {
            return res.status(400).json({ error: "Booking ID is required to process payment." });
        }

        const token = crypto.randomUUID();
        await TokenCheckoutPassportModel.create({
            token,
            userId,
            bookingId: finalBookingId,
            amount: Number(amount),
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        const transaction = await TransactionModel.create({
            bookingId: finalBookingId,
            packageId,
            userId,
            reference: generateTransactionReference(),
            amount: Number(amount),
            paymentType: paymentType || 'Full Payment',
            paymentMethod: 'Manual',
            proofOfPayment: proofImage, // Accommodating both naming conventions
            proofImage: proofImage,
            proofImageType,
            proofFileName,
            status: 'Pending',
        });

        if (typeof logAction === 'function') {
            logAction('CREATE_MANUAL_PAYMENT', userId, { "Payment Uploaded": `Amount: ₱${amount} for Booking: ${bookingRef}` });
        }

        return res.status(201).json({
            message: 'Manual payment submitted successfully',
            transaction,
            bookingId: bookingRef,
            reference: bookingRef,
            redirectUrl: `/booking-payment/success?token=${token}`
        });
    } catch (error) {
        console.error('Manual payment error:', error.message);
        return res.status(500).json({ error: error.message, message: "Error processing manual payment" });
    }
};


export const createManualPaymentVisa = async (req, res) => {
    const userId = req.userId;

    try {
        const {
            applicationId,
            applicationNumber,
            amount,
            proofImage,
        } = req.body;
        if (!proofImage) {
            return res.status(400).json({ error: "Proof of payment image is required." });
        }

        const token = crypto.randomUUID();

        const tokenCheckout = await TokenCheckoutVisaModel.create({
            token,
            userId,
            applicationId,
            amount,
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });


        const reference = generateTransactionReference();
        const transaction = await TransactionModel.create({
            applicationId,
            applicationType: "Visa Application",
            userId,
            reference,
            amount,
            method: 'Manual',
            status: 'Pending',
            proofImage,
        });


        const visaApp = await VisaModel.findById(applicationId);
        const user = await UserModel.findById(userId).select('email username');

        await NotificationModel.create({
            userId,
            title: "Manual Payment Submitted",
            message: `Your manual payment for visa application ${visaApp.applicationNumber} has been submitted and is pending review.`,
            link: `/user-transactions`,
        });

        try {
            await transporter.sendMail({
                from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                to: user.email,
                subject: `Visa Payment Submitted`,
                html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Visa Payment Submitted!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your visa payment has been successfully submitted and is currently pending verification by our team. We will notify you once the verification is complete. This will take 1-2 business days. Thank you for your patience!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">

                                <b>Transaction Reference:</b> ${reference} <br/>
                                <b>Application Number:</b> ${applicationNumber} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not make this payment, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
            });
        } catch (emailError) {
            console.error('Failed to send visa email:', emailError);
        }

        logAction('MANUAL_PAYMENT', userId, { "Manual Payment Submitted": `Transaction Reference: ${transaction.reference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Visa Application` });

        return res.status(200).json({
            redirectUrl: `/user-applications/success/visa?token=${token}`
        });
    } catch (error) {
        console.error('Manual payment for visa application error:', error.message);
        return res.status(500).json({ error: 'Failed to submit manual payment for visa application.' });
    }
};




export const createManualPayment = async (req, res) => {
    const userId = req.userId;
    try {
        const { packageId, travelDate, travelerTotal, amount, paymentType, proofImage, proofImageType, proofFileName, bookingDetails, bookingId } = req.body;

        let finalBookingId = bookingId;
        let bookingRef = "";

        // Handles creating the booking on the fly (Web compatibility) OR updating an existing one (Mobile)
        if (!bookingId && bookingDetails) {
            const booking = await BookingModel.create({
                packageId, userId, travelDate,
                bookingDate: new Date().toISOString(),
                travelers: travelerTotal ? Number(travelerTotal) : 1,
                reference: generateBookingReference(),
                status: 'Not Paid',
                bookingDetails
            });
            finalBookingId = booking._id;
            bookingRef = booking.reference;
        } else if (bookingId) {
            const booking = await BookingModel.findById(bookingId);
            if (booking) {
                booking.status = 'Not Paid';
                if (!booking.statusHistory) booking.statusHistory = [];
                booking.statusHistory.push({ status: 'Not Paid', changedAt: new Date() });
                await booking.save();
                bookingRef = booking.reference;
            }
        }

        if (!finalBookingId) {
            return res.status(400).json({ error: "Booking ID is required to process payment." });
        }

        const token = crypto.randomUUID();
        await TokenCheckout.create({
            token,
            userId,
            bookingId: finalBookingId,
            amount: Number(amount),
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        const transaction = await TransactionModel.create({
            bookingId: finalBookingId,
            packageId,
            userId,
            reference: generateTransactionReference(),
            amount: Number(amount),
            paymentType: paymentType || 'Full Payment',
            paymentMethod: 'Manual',
            proofOfPayment: proofImage, // Accommodating both naming conventions
            proofImage: proofImage,
            proofImageType,
            proofFileName,
            status: 'Pending',
        });

        if (typeof logAction === 'function') {
            logAction('CREATE_MANUAL_PAYMENT', userId, { "Payment Uploaded": `Amount: ₱${amount} for Booking: ${bookingRef}` });
        }

        return res.status(201).json({
            message: 'Manual payment submitted successfully',
            transaction,
            bookingId: bookingRef,
            reference: bookingRef,
            redirectUrl: `/booking-payment/success?token=${token}`
        });
    } catch (error) {
        console.error('Manual payment error:', error.message);
        return res.status(500).json({ error: error.message, message: "Error processing manual payment" });
    }
};


export const createCheckoutSession = async (req, res) => {
    const { checkoutToken, totalPrice, packageName, successUrl, cancelUrl, paymentPayload } = req.body;

    // Safely handle both flat payloads and nested { paymentPayload } structures
    const actualPayload = paymentPayload || req.body;

    try {
        const tokenToUse = actualPayload.checkoutToken || checkoutToken;
        const priceToUse = actualPayload.totalPrice || totalPrice;

        if (!tokenToUse || !priceToUse) {
            return res.status(400).json({ message: "checkoutToken and totalPrice are required" });
        }

        const tokenRecord = await TokenCheckout.findOne({ token: tokenToUse });
        if (!tokenRecord) {
            return res.status(404).json({ message: "Invalid or expired checkout token" });
        }

        const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (!payMongoSecret) {
            return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
        }

        let pkgName = packageName || actualPayload.packageName || "Tour Package";
        if (actualPayload.packageId && pkgName === "Tour Package") {
            const pkg = await PackageModel.findById(actualPayload.packageId);
            if (pkg) pkgName = pkg.packageName;
        }

        // Web Synced Computation: 3.5% + ₱15 Fee
        const baseAmountCents = Math.round(Number(priceToUse) * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);
        const finalTotalCents = baseAmountCents + convenienceFeeCents;

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: actualPayload.leadEmail ? "User" : "CapsApp User",
                        email: actualPayload.leadEmail || "capsapp@example.com",
                    },
                    line_items: [
                        { name: pkgName, quantity: 1, amount: baseAmountCents, currency: "PHP" },
                        { name: "Convenience Fee", description: "Payment processing and service fee", quantity: 1, amount: convenienceFeeCents, currency: "PHP" }
                    ],
                    payment_method_types: ["card", "gcash", "grab_pay", "paymaya", "qrph"],
                    success_url: actualPayload.successUrl || successUrl,
                    cancel_url: actualPayload.cancelUrl || cancelUrl,
                    metadata: {
                        userId: req.userId,
                        token: tokenToUse,
                        packageId: actualPayload.packageId,
                        bookingId: actualPayload.bookingId,
                        bookingReference: actualPayload.bookingReference,
                        transactionType: "Booking Payment",
                        baseAmountCents,
                        convenienceFeeCents,
                        totalAmountCents: finalTotalCents
                    }
                },
            },
        };

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", payload, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${payMongoSecret}:`).toString("base64")}`,
                "Content-Type": "application/json",
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout session", error: error.response?.data || error.message });
    }
};




export const createCheckoutSessionPassport = async (req, res) => {
    const { checkoutToken, totalPrice, packageName, successUrl, cancelUrl, paymentPayload, applicationId, applicationNumber } = req.body;

    // Safely handle both flat payloads and nested { paymentPayload } structures
    const actualPayload = paymentPayload || req.body;

    try {
        const tokenToUse = actualPayload.checkoutToken || checkoutToken;
        const priceToUse = actualPayload.totalPrice || totalPrice;
        const applicationIdToUse = actualPayload.applicationId || applicationId;
        const applicationNumberToUse = actualPayload.applicationNumber || applicationNumber;

        if (!tokenToUse || !priceToUse || !applicationIdToUse) {
            return res.status(400).json({ message: "checkoutToken, totalPrice, and applicationId are required" });
        }

        const tokenRecord = await TokenCheckoutPassportModel.findOne({ token: tokenToUse });
        if (!tokenRecord) {
            return res.status(404).json({ message: "Invalid or expired checkout token" });
        }

        const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (!payMongoSecret) {
            return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
        }

        let pkgName = packageName || actualPayload.packageName || "Passport Application";
        if (actualPayload.packageId && pkgName === "Tour Package") {
            const pkg = await PackageModel.findById(actualPayload.packageId);
            if (pkg) pkgName = pkg.packageName;
        }

        // Web Synced Computation: 3.5% + ₱15 Fee
        const baseAmountCents = Math.round(Number(priceToUse) * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);
        const finalTotalCents = baseAmountCents + convenienceFeeCents;

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: actualPayload.leadEmail ? "User" : "CapsApp User",
                        email: actualPayload.leadEmail || "capsapp@example.com",
                    },
                    line_items: [
                        { name: pkgName, quantity: 1, amount: baseAmountCents, currency: "PHP" },
                        { name: "Convenience Fee", description: "Payment processing and service fee", quantity: 1, amount: convenienceFeeCents, currency: "PHP" }
                    ],
                    payment_method_types: ["card", "gcash", "grab_pay", "paymaya", "qrph"],
                    success_url: actualPayload.successUrl || successUrl,
                    cancel_url: actualPayload.cancelUrl || cancelUrl,
                    metadata: {
                        userId: req.userId,
                        token: tokenToUse,
                        applicationId: applicationIdToUse,
                        applicationNumber: applicationNumberToUse,
                        applicationType: "Passport Application",
                        packageId: actualPayload.packageId,
                        bookingId: actualPayload.bookingId,
                        bookingReference: actualPayload.bookingReference,
                        transactionType: "Passport Payment",
                        baseAmountCents,
                        convenienceFeeCents,
                        totalAmountCents: finalTotalCents
                    }
                },
            },
        };

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", payload, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${payMongoSecret}:`).toString("base64")}`,
                "Content-Type": "application/json",
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout session", error: error.response?.data || error.message });
    }
};



export const createCheckoutSessionVisa = async (req, res) => {
    const { applicationId, applicationNumber, totalPrice } = req.body;
    const userId = req.userId;

    try {
        if (!applicationId || !applicationNumber || !totalPrice) {
            return res.status(400).json({ message: "applicationId, applicationNumber, and totalPrice are required" });
        }

        const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (!payMongoSecret) {
            return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
        }

        const parsedAmount = Number(totalPrice);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "totalPrice must be a valid positive number" });
        }

        const token = crypto.randomUUID();
        const expiresAt = dayjs().add(5, 'minutes').toDate();

        await TokenCheckoutVisaModel.create({
            token,
            userId,
            applicationId,
            amount: parsedAmount,
            expiresAt,
        });

        const pkgName = "Visa Application";

        const successUrl = 'myapp://payment-success';
        const cancelUrl = 'myapp://payment-cancel';

        const baseAmountCents = Math.round(parsedAmount * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);
        const finalTotalCents = baseAmountCents + convenienceFeeCents;

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: "CapsApp User",
                        email: "capsapp@example.com",
                    },
                    line_items: [
                        { name: pkgName, quantity: 1, amount: baseAmountCents, currency: "PHP" },
                        { name: "Convenience Fee", description: "Payment processing and service fee", quantity: 1, amount: convenienceFeeCents, currency: "PHP" }
                    ],
                    payment_method_types: ["card", "gcash", "grab_pay", "paymaya", "qrph"],
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: {
                        userId: req.userId,
                        token,
                        applicationId,
                        applicationNumber,
                        applicationType: "Visa Application",
                        transactionType: "Visa Payment",
                        baseAmountCents,
                        convenienceFeeCents,
                        totalAmountCents: finalTotalCents
                    }
                },
            },
        };

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", payload, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${payMongoSecret}:`).toString("base64")}`,
                "Content-Type": "application/json",
            }
        });

        console.log('PAYMONGO RESPONSE:', JSON.stringify(response.data, null, 2)); // 👈 ADD THIS

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout session", error: error.response?.data || error.message });
    }
};
































//paymongo webhook handler
export const handlePayMongoWebhook = async (req, res) => {
    console.log('🚀 Webhook HIT!');
    res.status(200).send('OK'); // respond instantly
    console.log('✅ RESPONSE SENT');


    //check if secret key exists
    if (!process.env.PAYMONGO_WEBHOOK_SECRET) {
        console.log('Webhook secret not configured');
        return
    }

    //if the request body is a buffer, convert it to string for signature verification
    // const rawBody = Buffer.isBuffer(req.body)
    //     ? req.body.toString('utf8')
    //     : JSON.stringify(req.body || {});

    if (!req.rawBody) {
        console.log('Raw body not captured. Check middleware.');
        return
    }

    try {
        const rawBodyString = req.rawBody.toString('utf8');

        //webhooks of paymongo will have a signature in the header that we need to parse and verify to ensure the request is really from paymongo
        const signatureHeader = req.headers['paymongo-signature'];
        const parsedSignature = parsePayMongoSignature(signatureHeader);

        if (!parsedSignature) {
            console.log('Invalid signature header format');
            return
        }

        console.log('STEP 2: SIGNATURE OK');

        const signedPayload = `${parsedSignature.timestamp}.${rawBodyString}`; //time paymongo sent the webhook and the payload (rawBody)
        const expectedSignature = crypto //create a hash using the webhook secret and the signed payload, then compare it to the signature sent by paymongo to verify authenticity
            .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
            .update(signedPayload)
            .digest('hex');

        //compares two buffers in constant time to prevent timing attacks. If the signatures don't match, we reject the request
        if (
            !crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'utf8'),
                Buffer.from(parsedSignature.signature, 'utf8')
            )
        ) {
            console.log('Invalid signature');
            return
        }

        // At this point, we have verified that the webhook is legitimately from PayMongo. Now we can safely parse the payload and handle the event.

        console.log('STEP 3: RESPONSE SENT');

        //const payload = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;
        const payload = JSON.parse(rawBodyString);
        const eventType = payload?.data?.attributes?.type;
        if (!eventType) {
            console.log('Invalid webhook payload');
            return res.status(400).send('Invalid payload');
        }

        console.log('📦 Parsed Payload:', JSON.stringify(payload, null, 2));
        console.log('STEP 4: PROCESSING EVENT');

        //paymongo can send different types of events, but we're mainly interested in the checkout_session.payment.paid event which indicates a successful payment. We will extract the metadata from the event to know which user and booking this payment is for, then we can update our database accordingly.
        const sessionId =
            payload?.data?.attributes?.data?.id ||
            payload?.data?.attributes?.data?.attributes?.checkout_session_id ||
            payload?.data?.attributes?.id ||
            null;

        let sessionAttributes = null;
        let metadata = {};

        // If we have a session ID, we can make an API call to PayMongo to retrieve the full session details, which should include the metadata we set when creating the checkout session. This is important because sometimes the metadata in the webhook event might be incomplete or missing, so fetching the session details ensures we have all the information we need to process the payment correctly.
        if (sessionId) {
            try {
                const sessionResponse = await apiFetch.get(
                    `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Basic ${Buffer.from(
                                process.env.PAYMONGO_SECRET_KEY + ':'
                            ).toString('base64')}`,
                        },
                    }
                );
                sessionAttributes = sessionResponse?.data?.attributes;
                metadata = sessionAttributes?.metadata || {};
                console.log('✅ Session metadata:', metadata);
            } catch (err) {
                console.log('❌ Failed to fetch session:', err.data || err.message);
            }
        }

        // checks if the metadata contains the necessary identifiers to link this payment to a user and a booking/application. If not, we log a warning and exit gracefully since we can't process this payment without that information. This is a safeguard against processing incomplete or malformed webhook events.
        if (!metadata.userId && !metadata.applicationId && !metadata.packageId) {
            console.warn('Missing metadata; cannot process');
            return console.log('missing metadata:', metadata);
        }

        const user = await UserModel.findById(metadata.userId);
        if (!user) return console.log('user not found for metadata userId:', metadata.userId);

        console.log('metadata:', metadata);

        if (metadata.applicationId && metadata.applicationType === "Visa Application") {
            console.log('🛂 Visa payment detected');
            const grossAmount =
                Number(metadata.totalAmountCents || 0) / 100 ||
                Number(sessionAttributes?.amount_total || 0) / 100;
            const net = grossAmount - ((grossAmount * 0.035) + 15);
            const amount = Math.round(net / 100) * 100;

            const transactionReference = generateTransactionReference();

            await TransactionModel.create({
                userId: user._id,
                applicationId: metadata.applicationId,
                applicationType: "Visa Application",
                reference: transactionReference,
                amount: Math.round(metadata.baseAmountCents / 100),
                method: 'Paymongo',
                status: 'Successful',
            });

            logAction('PAYMONGO_PAYMENT', user._id, { "Visa Application Paid": `Transaction Reference: ${transactionReference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Visa Application` });

            console.log('Created transaction for visa application:', metadata.applicationId);

            const updatedVisa = await VisaModel.findOneAndUpdate(
                { _id: metadata.applicationId }, // filter object
                {
                    $set: { status: ["Payment Complete"], currentStepIndex: 1 } // replace array & update progress
                },
                { new: true } // return the updated document
            );

            if (!updatedVisa) {
                console.warn(`No visa application found with applicationId ${metadata.applicationId}`);
            } else {
                console.log("Visa payment status updated:", updatedVisa.status);
            }

            await NotificationModel.create({
                userId: user._id,
                title: 'Visa Payment Successful',
                message: `Your visa application ${metadata.applicationNumber} was successful.`,
                type: 'visa',
                link: '/user-transactions',
            });

            try {
                await transporter.sendMail({
                    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `Visa Payment Successful`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Visa Payment Successful!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your visa payment has been successfully processed!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">

                                <b>Transaction Reference:</b> ${transactionReference} <br/>
                                <b>Application Number:</b> ${metadata.applicationNumber} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not make this payment, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send visa email:', emailError);
            }

            console.log('Visa payment processed successfully');
            return
        }

        // if applicationId exists in metadata, we know this payment is for a passport application, so we create a transaction record linked to that application and send a notification to the user. We also send a confirmation email to the user about their passport payment. After handling the passport payment, we return early since we don't want to accidentally process it as a booking payment as well.
        if (metadata.applicationId && metadata.applicationType === "Passport Application") {
            console.log('🛂 Passport payment detected');
            const grossAmount =
                Number(metadata.totalAmountCents || 0) / 100 ||
                Number(sessionAttributes?.amount_total || 0) / 100;
            const net = grossAmount - ((grossAmount * 0.035) + 15);
            const amount = Math.round(net / 100) * 100;

            const transactionReference = generateTransactionReference();

            const transaction = await TransactionModel.create({
                userId: user._id,
                applicationId: metadata.applicationId,
                applicationType: "Passport Application",
                reference: transactionReference,
                amount: Math.round(metadata.baseAmountCents / 100),
                method: 'Paymongo',
                status: 'Successful',
            });

            console.log('Created transaction for passport application:', metadata.applicationId);

            const updatedApp = await PassportModel.findOneAndUpdate(
                { _id: metadata.applicationId },
                { status: "Payment Complete" },
                { new: true }
            );

            if (!updatedApp) {
                console.warn(`No passport application found with applicationId ${metadata.applicationId}`);
            } else {
                console.log("Updated status:", updatedApp.status);
            }
            console.log("Updated status:", updatedApp.status);

            await NotificationModel.create({
                userId: user._id,
                title: 'Passport Payment Successful',
                message: `Your passport application ${metadata.applicationNumber} was successful.`,
                type: 'passport',
                link: '/user-transactions',
            });

            try {
                await transporter.sendMail({
                    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `Passport Payment Successful`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Passport Payment Successful!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your passport payment has been successfully processed!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">

                                <b>Transaction Reference:</b> ${transactionReference} <br/>
                                <b>Application Number:</b> ${metadata.applicationNumber} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not make this payment, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send passport email:', emailError);
            }

            logAction('PAYMONGO_PAYMENT', user._id, { "Passport Application Paid": `Transaction Reference: ${transactionReference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Passport Application` });

            console.log('Passport payment processed successfully');
            return
        }

        //INSTALLMENT PAYMENT --------------------------------------------------------------------------
        if (metadata.transactionType === "Installment Payment") {
            console.log('💰 Installment payment detected');

            console.log('Installment payment metadata:', metadata);

            const booking = await BookingModel.findById(metadata.bookingId)
            const packageDoc = await PackageModel.findById(metadata.packageId);

            const bookingStart = dayjs(booking.travelDate.startDate).format('YYYY-MM-DD');
            const bookingEnd = dayjs(booking.travelDate.endDate).format('YYYY-MM-DD');

            const amount = metadata.baseAmountCents
                ? Number(metadata.baseAmountCents || 0) / 100
                : normalizePaymongoAmount(
                    Number(metadata.totalAmountCents || 0) / 100 ||
                    Number(sessionAttributes?.amount_total || 0) / 100
                );

            const transactionReference = generateTransactionReference();

            await TransactionModel.create({
                bookingId: metadata.bookingId,
                packageId: metadata.packageId,
                userId: user._id,
                reference: transactionReference,
                amount,
                method: 'Paymongo',
                status: 'Successful',
            });

            await updateBookingPaymentStatus(metadata.bookingId);

            await NotificationModel.create({
                userId: user._id,
                title: 'Installment Payment Successful',
                message: `Your installment payment for booking ${metadata.bookingReference} was successful.`,
                type: 'payment',
                link: '/user-transactions',
            });

            try {
                await transporter.sendMail({
                    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `Installment Payment ${transactionReference} Successful`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Installment Payment Successful!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your installment payment has been successfully processed!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">

                                <b>Transaction Reference:</b> ${transactionReference} <br/>
                                <b>Package:</b> ${packageDoc.packageName} <br/>
                                <b>Travel Dates:</b> ${bookingStart} to ${bookingEnd} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not make this payment, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send booking email:', emailError);
            }

            logAction('PAYMONGO_PAYMENT', user._id, { "Installment Payment": `Transaction Reference: ${transactionReference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Installment Payment` });

            console.log('Installment payment processed successfully');
            return
        }

        //BOOKING PAYMENT ----------------------------------------------------------------------------------------
        // if packageId exists in metadata, we know this payment is for a tour package booking, so we either update an existing booking to "Successful" status or create a new booking if it doesn't exist. We also create a transaction record for this booking payment and send a notification to the user about their confirmed booking. Finally, we send a confirmation email to the user with the booking reference. After handling the booking payment, we return early since we've completed all necessary processing for this event.
        if (metadata.bookingId && metadata.transactionType === "Booking Payment") {
            console.log('🛫 Booking payment detected');
            console.log('PackageId in metadata:', metadata.packageId);
            let booking = await BookingModel.findById(metadata.bookingId);

            if (!booking) {
                console.warn('Booking not found for ID:', metadata.bookingId);
                return console.log('Booking not found for ID:', metadata.bookingId);
            }

            const bookingStart = dayjs(booking.travelDate.startDate).format('YYYY-MM-DD');
            const bookingEnd = dayjs(booking.travelDate.endDate).format('YYYY-MM-DD');
            const packageId = booking.packageId.toString();


            const packageDoc = await PackageModel.findById(packageId);

            const updateResult = await PackageModel.updateOne(
                {
                    _id: packageDoc._id,
                    packageSpecificDate: {
                        $elemMatch: {
                            startdaterange: bookingStart,
                            enddaterange: bookingEnd,
                            slots: { $gt: 0 }
                        }
                    }
                },
                {
                    $inc: { 'packageSpecificDate.$.slots': -1 }
                }
            );

            if (updateResult.matchedCount === 0) {
                console.log('No matching date range found or no slots remaining.');
            } else if (updateResult.modifiedCount === 1) {
                console.log('Slot successfully decremented.');
                if (!booking.slotDecremented) {
                    booking.slotDecremented = true;
                    await booking.save();
                }
            }

            const amount = metadata.baseAmountCents
                ? Number(metadata.baseAmountCents || 0) / 100
                : normalizePaymongoAmount(
                    Number(metadata.totalAmountCents || 0) / 100 ||
                    Number(sessionAttributes?.amount_total || 0) / 100
                );

            await TransactionModel.create({
                bookingId: booking._id,
                packageId: booking.packageId,
                userId: user._id,
                reference: generateTransactionReference(),
                amount,
                method: 'Paymongo',
                status: 'Successful',
            });

            const paymentType = booking?.bookingDetails?.paymentDetails?.paymentType || null;
            if (paymentType === 'deposit') {
                if (booking.status !== 'Pending') {
                    booking.status = 'Pending';
                    if (!Array.isArray(booking.statusHistory)) {
                        booking.statusHistory = [];
                    }
                    booking.statusHistory.push({ status: 'Pending', changedAt: new Date() });
                    await booking.save();
                }
            } else {
                await updateBookingPaymentStatus(booking._id);
            }

            await NotificationModel.create({
                userId: user._id,
                title: 'Booking Confirmed',
                message: `Your booking ${booking.reference} has been confirmed.`,
                type: 'booking',
                link: '/user-bookings',
                metadata: { bookingId: booking._id },
            });

            // Send booking confirmation email
            try {
                await transporter.sendMail({
                    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `Booking ${booking.reference} Confirmed`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Booking Confirmed!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your booking has been successfully confirmed!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                <b>Booking Reference:</b> ${booking.reference} <br/>
                                <b>Package:</b> ${packageDoc.packageName} <br/>
                                <b>Travel Dates:</b> ${bookingStart} to ${bookingEnd} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not book this trip, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send booking email:', emailError);
            }

            logAction('PAYMONGO_PAYMENT', user._id, { "Booking Payment": `Transaction Reference: ${metadata.bookingReference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Booking Payment` });

            console.log('Booking payment processed successfully');
            return
        }


        //QUOTATION PAYMENT -----------------------------------------------------------------------------
        if (metadata.bookingId && metadata.transactionType === "Quotation Payment") {
            console.log('🛫 Quotation Booking payment detected');
            console.log('PackageId in metadata:', metadata.packageId);
            let booking = await BookingModel.findById(metadata.bookingId);

            if (!booking) {
                console.warn('Booking not found for ID:', metadata.bookingId);
                return console.log('Booking not found for ID:', metadata.bookingId);
            }

            const bookingStart = dayjs(booking.travelDate.startDate).format('YYYY-MM-DD');
            const bookingEnd = dayjs(booking.travelDate.endDate).format('YYYY-MM-DD');
            const packageId = booking.packageId.toString();


            const packageDoc = await PackageModel.findById(packageId);


            const updateResult = await PackageModel.updateOne(
                {
                    _id: booking.packageId,
                    packageSpecificDate: {
                        $elemMatch: {
                            startdaterange: bookingStart,
                            enddaterange: bookingEnd,
                            slots: { $gt: 0 }
                        }
                    }
                },
                {
                    $inc: { 'packageSpecificDate.$.slots': -1 }
                }
            )

            if (updateResult.matchedCount === 0) {
                console.log('No matching date range found or no slots remaining.');
            } else if (updateResult.modifiedCount === 1) {
                console.log('Slot successfully decremented.');
                if (!booking.slotDecremented) {
                    booking.slotDecremented = true;
                    await booking.save();
                }
            }

            const amount = metadata.baseAmountCents
                ? Number(metadata.baseAmountCents || 0) / 100
                : normalizePaymongoAmount(
                    Number(metadata.totalAmountCents || 0) / 100 ||
                    Number(sessionAttributes?.amount_total || 0) / 100
                );

            await TransactionModel.create({
                bookingId: booking._id,
                packageId: booking.packageId,
                userId: user._id,
                reference: generateTransactionReference(),
                amount,
                method: 'Paymongo',
                status: 'Successful',
            });

            console.log('Created transaction for Quotation:', metadata.quotationId);

            const quotation = await QuotationModel.findById(metadata.quotationId);
            console.log("Quotation found:", quotation);
            quotation.status = 'Booked';
            await quotation.save();

            const paymentType = booking?.bookingDetails?.paymentDetails?.paymentType || null;
            if (paymentType === 'deposit') {
                if (booking.status !== 'Pending') {
                    booking.status = 'Pending';
                    if (!Array.isArray(booking.statusHistory)) {
                        booking.statusHistory = [];
                    }
                    booking.statusHistory.push({ status: 'Pending', changedAt: new Date() });
                    await booking.save();
                }
            } else {
                await updateBookingPaymentStatus(booking._id);
            }

            await NotificationModel.create({
                userId: user._id,
                title: 'Booking Quotation Confirmed',
                message: `Your booking Quotation ${booking.reference} has been confirmed.`,
                type: 'booking',
                link: '/user-bookings',
                metadata: { bookingId: booking._id },
            });

            // Send booking confirmation email
            try {
                await transporter.sendMail({
                    from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `Booking Quotation ${booking.reference} Confirmed`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
                        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                            <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                            <h2 style="color:#305797; margin-bottom:10px;">
                                Booking Quotation Confirmed!
                            </h2>

                            <p style="color:#555; font-size:16px;">
                                Hello <b>${user.username}</b>,
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                Your booking for your quotation has been successfully confirmed!
                            </p>

                            <p style="color:#555; font-size:15px; line-height:1.6;">
                                <b>Booking Reference:</b> ${booking.reference} <br/>
                                <b>Package:</b> ${packageDoc.packageName} <br/>
                                <b>Travel Dates:</b> ${bookingStart} to ${bookingEnd} <br/>
                                <b>Total Paid:</b> ₱${amount.toFixed(2)}

                                <p> Enjoy your trip and thank you for choosing M&RC Travel and Tours! </p>
                            </p>

                            <p style="color:#777; font-size:13px; margin-top:30px;">
                                If you did not book this trip, please ignore this email.
                            </p>

                            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                            <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                                <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                                <p>M&RC Travel and Tours</p>
                                <p>info1@mrctravels.com</p>
                                <p>&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                            </div>

                        </div>
                    </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send booking email:', emailError);
            }

            logAction('PAYMONGO_PAYMENT', user._id, { "Quotation Booking Payment": `Transaction Reference: ${metadata.bookingReference} | Amount: ₱${amount.toFixed(2)} | Payment Purpose: Quotation Booking Payment` });

            console.log('Booking payment processed successfully');
            return
        }

        // if we reach this point, it means we received a valid webhook with correct signature and metadata, but it doesn't match our expected structure for either passport or booking payments. We log this as a warning for further investigation but still return a 200 response to acknowledge receipt of the webhook. This way we avoid unnecessary retries from PayMongo while we investigate the unexpected payload structure.
        console.warn('Received unhandled webhook event with valid signature but missing expected metadata:', metadata);
    } catch (error) {
        console.log('Webhook Error:', error);
    }
};

export const createCheckoutToken = async (req, res) => {
    const userId = req.userId;
    const { totalPrice, amount, bookingId } = req.body;

    const token = crypto.randomUUID();

    if (!bookingId) {
        return res.status(400).json({ message: 'bookingId is required' });
    }

    const parsedAmount = Number(amount ?? totalPrice);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'A valid amount is required' });
    }

    await TokenCheckout.create({
        token,
        userId,
        bookingId,
        amount: parsedAmount,
        expiresAt: dayjs().add(5, 'minutes').toDate(),
    });

    res.status(201).json({ token });
};

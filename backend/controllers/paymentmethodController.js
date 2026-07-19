
import PaymentMethod from '../models/paymentmethods.js';

const createMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.create({
            paymentType: req.body.paymentType,
            number: req.body.number,
            accountName: req.body.accountName,
            additionalInfo: req.body.additionalInfo,
            image: req.file?.path || "",
        });

        res.status(201).json(method);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find()
            .sort({ createdAt: -1 });

        res.json(methods);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const updateMethod = async (req, res) => {
    try {
        const updateData = {
            paymentType: req.body.paymentType,
            number: req.body.number,
            accountName: req.body.accountName,
            additionalInfo: req.body.additionalInfo,
        };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const method = await PaymentMethod.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(method);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const deleteMethod = async (req, res) => {
    try {
        await PaymentMethod.findByIdAndDelete(req.params.id);

        res.json({
            message: "Payment method deleted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


export {
    createMethod,
    getMethods,
    updateMethod,
    deleteMethod,
};
import FAQ from "../models/faqs.js";

// GET ALL
const getFAQs = async (req, res) => {
    try {

        const faqs = await FAQ.find().sort({
            category: 1,
            question: 1
        });

        return res.status(200).json(faqs);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Unable to fetch FAQs."
        });

    }
};

export {
    getFAQs,
};
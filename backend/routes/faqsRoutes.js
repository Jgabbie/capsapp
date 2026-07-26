import express from "express";
import * as faqsController from "../controllers/faqsController.js";

const router = express.Router();

router.get("/get-faqs", faqsController.getFAQs);

export default router;
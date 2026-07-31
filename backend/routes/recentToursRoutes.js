import express from "express";
import * as recentToursController from "../controllers/recentToursController.js";

const router = express.Router();

router.get("/get-recent-tours", recentToursController.getRecentTours);

export default router;
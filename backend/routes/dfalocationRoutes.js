import express from "express";
import * as dfalocationController from "../controllers/dfalocationController.js";

const router = express.Router();

router.get("/get-dfalocation", dfalocationController.getLocations);
router.post("/create-dfalocation", dfalocationController.createLocation);
router.put("/:id/update-dfalocation", dfalocationController.updateLocation);
router.delete("/:id/delete-dfalocation", dfalocationController.deleteLocation);

export default router;
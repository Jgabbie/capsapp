import express from "express";
import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation
} from "../controllers/dfaLocationController.js";

const router = express.Router();

router.get("/get-dfalocation", getLocations);
router.post("/create-dfalocation", createLocation);
router.put("/:id/update-dfalocation", updateLocation);
router.delete("/:id/delete-dfalocation", deleteLocation);

export default router;
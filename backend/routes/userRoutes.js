import express from "express";
import { createUser, getUsers, loginUser } from "../controllers/userController.js"; // ES module import

const router = express.Router();

// Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);


export default router;
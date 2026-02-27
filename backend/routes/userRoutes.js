import express from "express";
import { createUser, deleteUser, getUsers, loginUser } from "../controllers/userController.js"; // ES module import

const router = express.Router();

// Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);
router.delete("/delete-user/:id", deleteUser);


export default router;
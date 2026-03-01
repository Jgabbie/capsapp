import express from "express";
import { createUser, deleteUser, getUsers, loginUser, updateUser } from "../controllers/userController.js"; // ES module import

const router = express.Router();

// Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);
router.delete("/delete-user/:id", deleteUser);
router.put("/update-user/:id", updateUser);

export default router;
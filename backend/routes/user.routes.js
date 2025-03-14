import { loginUser,registerUser,getUser } from "../controllers/user.controller.js"
import express from "express";

const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);
router.get("/users",getUser);

export default router;
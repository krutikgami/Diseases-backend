import { loginUser,registerUser,getUser,districtHeadDelete } from "../controllers/user.controller.js"
import express from "express";

const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);
router.get("/users",getUser);
router.delete("/district-head/delete",districtHeadDelete);

export default router;
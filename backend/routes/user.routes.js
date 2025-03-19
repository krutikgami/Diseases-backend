import { loginUser,registerUser,getUser,districtHeadDelete } from "../controllers/user.controller.js"
import express from "express";
import { protectStateHead } from "../middleware/state_head.middleware.js";

const router = express.Router();

router.post("/signup",registerUser);
router.post("/login",loginUser);
router.post("/users",protectStateHead,getUser);
router.delete("/district-head/delete",districtHeadDelete);

export default router;
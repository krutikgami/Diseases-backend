import { userDashboard } from "../controllers/user-dashboard.controller.js";
import express from "express";

const router = express.Router();
router.post("/disease-records",userDashboard);

export default router;
